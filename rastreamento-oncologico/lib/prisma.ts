// lib/prisma.ts — Singleton PrismaClient para Next.js (Prisma 7)
//
// Prisma 7 requer um driver adapter para conexão direta com PostgreSQL.
// Usamos @prisma/adapter-pg com o driver `pg`.
//
// Referências:
//   https://pris.ly/d/prisma7-client-config
//   https://www.prisma.io/docs/guides/other/troubleshooting-orm/nextjs-prisma-client-dev-practices

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Variável global para preservar a instância entre hot-reloads em dev
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error(
      '[Prisma] DATABASE_URL não está definida. ' +
      'Configure a variável de ambiente no arquivo .env.local ou no painel do Netlify.'
    )
  }

  const adapter = new PrismaPg({ connectionString })

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
