/**
 * POST /api/pacientes/[id]/rastrear
 * Executa o motor de rastreamento oncológico para um paciente
 * e persiste os rastreamentos gerados no banco de dados.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  executarRastreamento,
  type RespostasQuestionario,
} from '@/lib/rastreamento-engine'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id: paciente_id } = await params

    // Busca paciente + respostas do banco
    const paciente = await prisma.pacientes.findUnique({
      where: { id: paciente_id },
      include: { respostas: true },
    })

    if (!paciente) {
      return NextResponse.json({ error: 'Paciente não encontrado.' }, { status: 404 })
    }

    if (paciente.respostas.length === 0) {
      return NextResponse.json(
        { error: 'O paciente não possui respostas do questionário. Chame POST /respostas primeiro.' },
        { status: 422 }
      )
    }

    // Converte array de respostas em objeto para o motor
    const respostasObj: RespostasQuestionario = {}
    for (const r of paciente.respostas) {
      const chave = r.chave_pergunta as keyof RespostasQuestionario
      // Converte números armazenados como string de volta para number
      const numericos = ['anos_tabagismo', 'macos_dia', 'anos_parou_de_fumar', 'imc']
      if (numericos.includes(r.chave_pergunta)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(respostasObj as any)[chave] = parseFloat(r.valor_resposta)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(respostasObj as any)[chave] = r.valor_resposta
      }
    }

    // Executa o motor clínico
    const resultados = executarRastreamento(
      { idade: paciente.idade, sexo_biologico: paciente.sexo_biologico },
      respostasObj
    )

    // Persiste os rastreamentos (remove os anteriores, insere novos)
    await prisma.$transaction([
      prisma.rastreamentos_gerados.deleteMany({ where: { paciente_id } }),
      prisma.rastreamentos_gerados.createMany({
        data: resultados.map((r) => ({
          paciente_id,
          tipo_cancer: r.tipo_cancer,
          criterio_clinico: `[${r.prioridade}] ${r.criterio_clinico} | Protocolo: ${r.protocolo_recomendado}`,
        })),
      }),
    ])

    return NextResponse.json({
      paciente_id,
      total_rastreamentos: resultados.length,
      rastreamentos: resultados,
    })
  } catch (error) {
    console.error('[POST /api/pacientes/[id]/rastrear]', error)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
