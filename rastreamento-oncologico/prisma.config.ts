// prisma.config.ts — Configuração do Prisma 7+
// No Prisma 7, a URL do datasource foi movida para cá
// Referência: https://pris.ly/d/config-datasource
//
// NOTA: Usamos process.env diretamente (não env()) para permitir
// que `prisma generate` rode sem DATABASE_URL definida.

import { config } from 'dotenv'
import { join } from 'path'
import { defineConfig } from 'prisma/config'

// Load .env.local explicitly since Prisma CLI defaults to .env
config({ path: join(process.cwd(), '.env.local') })

export default defineConfig({
  // Caminho para o schema Prisma
  schema: 'prisma/schema.prisma',

  // Configuração do datasource — DATABASE_URL pode ser undefined em generate
  // O erro de conexão só ocorre em migrate/push (quando o banco é necessário)
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },

  // Diretório de migrações
  migrations: {
    path: 'prisma/migrations',
  },
})
