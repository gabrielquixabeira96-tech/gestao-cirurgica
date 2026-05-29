/**
 * GET /api/pacientes/[id]
 * Busca um paciente pelo ID (UUID), incluindo respostas e rastreamentos.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const paciente = await prisma.pacientes.findUnique({
      where: { id },
      include: {
        respostas: {
          select: {
            id: true,
            chave_pergunta: true,
            valor_resposta: true,
          },
        },
        rastreamentos: {
          orderBy: { data_geracao: 'desc' },
          select: {
            id: true,
            tipo_cancer: true,
            criterio_clinico: true,
            data_geracao: true,
          },
        },
      },
    })

    if (!paciente) {
      return NextResponse.json(
        { error: 'Paciente não encontrado.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: paciente.id,
      idade: paciente.idade,
      sexo_biologico: paciente.sexo_biologico,
      data_cadastro: paciente.data_cadastro,
      total_respostas: paciente.respostas.length,
      total_rastreamentos: paciente.rastreamentos.length,
      rastreamentos: paciente.rastreamentos,
    })
  } catch (error) {
    console.error('[GET /api/pacientes/[id]]', error)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
