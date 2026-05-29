/**
 * POST /api/pacientes
 * Cadastra um novo paciente (anonimizado via hash do WhatsApp).
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashWhatsApp } from '@/lib/hash'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { whatsapp, idade, sexo_biologico } = body

    // Validação básica
    if (!whatsapp || typeof whatsapp !== 'string') {
      return NextResponse.json(
        { error: 'Campo "whatsapp" é obrigatório.' },
        { status: 400 }
      )
    }
    if (!idade || typeof idade !== 'number' || idade < 1 || idade > 120) {
      return NextResponse.json(
        { error: 'Campo "idade" deve ser um número entre 1 e 120.' },
        { status: 400 }
      )
    }
    if (!['MASCULINO', 'FEMININO'].includes(sexo_biologico)) {
      return NextResponse.json(
        { error: 'Campo "sexo_biologico" deve ser "MASCULINO" ou "FEMININO".' },
        { status: 400 }
      )
    }

    const whatsapp_hash = hashWhatsApp(whatsapp)

    // Upsert: se já existe, retorna o existente
    const paciente = await prisma.pacientes.upsert({
      where: { whatsapp_hash },
      update: { idade, sexo_biologico },
      create: { whatsapp_hash, idade, sexo_biologico },
    })

    return NextResponse.json(
      {
        id: paciente.id,
        idade: paciente.idade,
        sexo_biologico: paciente.sexo_biologico,
        data_cadastro: paciente.data_cadastro,
        novo: paciente.data_cadastro.getTime() === paciente.data_cadastro.getTime(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/pacientes]', error)
    const message = error instanceof Error ? error.message : 'Erro interno.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
