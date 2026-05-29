/**
 * POST /api/pacientes/[id]/respostas
 * Salva as respostas do questionário de rastreamento de um paciente.
 * Limpa respostas anteriores antes de inserir as novas (re-questionário).
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: paciente_id } = await params
    const body = await req.json()
    const { respostas } = body

    // Valida existência do paciente
    const paciente = await prisma.pacientes.findUnique({ where: { id: paciente_id } })
    if (!paciente) {
      return NextResponse.json({ error: 'Paciente não encontrado.' }, { status: 404 })
    }

    // Valida formato das respostas
    if (!Array.isArray(respostas) || respostas.length === 0) {
      return NextResponse.json(
        { error: 'Campo "respostas" deve ser um array não vazio de {chave_pergunta, valor_resposta}.' },
        { status: 400 }
      )
    }

    for (const r of respostas) {
      if (!r.chave_pergunta || !r.valor_resposta) {
        return NextResponse.json(
          { error: 'Cada resposta deve ter "chave_pergunta" e "valor_resposta".' },
          { status: 400 }
        )
      }
    }

    // Substitui respostas anteriores (transação atômica)
    await prisma.$transaction([
      // Remove respostas antigas
      prisma.respostas_questionario.deleteMany({ where: { paciente_id } }),
      // Insere novas
      prisma.respostas_questionario.createMany({
        data: respostas.map((r: { chave_pergunta: string; valor_resposta: string }) => ({
          paciente_id,
          chave_pergunta: r.chave_pergunta,
          valor_resposta: String(r.valor_resposta),
        })),
      }),
    ])

    const total = await prisma.respostas_questionario.count({ where: { paciente_id } })

    return NextResponse.json(
      { sucesso: true, total_respostas: total },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/pacientes/[id]/respostas]', error)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
