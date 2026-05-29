import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/health
 * Health-check endpoint para verificar status da API e conexão com banco de dados.
 * Usado pelo Netlify e monitoramentos externos.
 */
export async function GET() {
  try {
    // Tenta fazer uma query simples para verificar a conexão com o banco
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'rastreamento-oncologico',
        database: 'connected',
        version: process.env.npm_package_version ?? '1.0.0',
      },
      { status: 200 }
    )
  } catch (error) {
    // Banco não disponível — retorna 503 com detalhes do erro
    const message = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        service: 'rastreamento-oncologico',
        database: 'disconnected',
        error: message,
      },
      { status: 503 }
    )
  }
}
