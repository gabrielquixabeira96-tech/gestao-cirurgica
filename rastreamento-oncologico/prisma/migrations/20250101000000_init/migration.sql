-- =============================================================
-- Migração Inicial — Rastreamento Oncológico em Massa
-- Criado em: 2025-01-01
-- Gerenciado por: Prisma ORM v7+
-- =============================================================
-- Para aplicar esta migração com banco conectado:
--   npx prisma migrate dev --name init
--
-- Para produção:
--   npx prisma migrate deploy
-- =============================================================

-- Extensão para suporte nativo a UUID no PostgreSQL
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------
-- Tipo ENUM: SexoBiologico
-- -------------------------------------------------------------
CREATE TYPE "SexoBiologico" AS ENUM ('MASCULINO', 'FEMININO');

-- -------------------------------------------------------------
-- Tabela: pacientes
-- Armazena dados anonimizados dos pacientes cadastrados via WhatsApp
-- -------------------------------------------------------------
CREATE TABLE "pacientes" (
    "id"             UUID         NOT NULL DEFAULT gen_random_uuid(),
    "whatsapp_hash"  TEXT         NOT NULL,
    "idade"          INTEGER      NOT NULL,
    "sexo_biologico" "SexoBiologico" NOT NULL,
    "data_cadastro"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- Índice único para garantir que cada número de WhatsApp seja cadastrado uma vez
CREATE UNIQUE INDEX "pacientes_whatsapp_hash_key" ON "pacientes"("whatsapp_hash");

-- -------------------------------------------------------------
-- Tabela: respostas_questionario
-- Armazena as respostas individuais do questionário de rastreamento
-- -------------------------------------------------------------
CREATE TABLE "respostas_questionario" (
    "id"             UUID    NOT NULL DEFAULT gen_random_uuid(),
    "paciente_id"    UUID    NOT NULL,
    "chave_pergunta" TEXT    NOT NULL,
    "valor_resposta" TEXT    NOT NULL,

    CONSTRAINT "respostas_questionario_pkey" PRIMARY KEY ("id")
);

-- Índice para consultas por paciente
CREATE INDEX "respostas_questionario_paciente_id_idx" ON "respostas_questionario"("paciente_id");

-- Chave estrangeira com cascade delete
ALTER TABLE "respostas_questionario"
    ADD CONSTRAINT "respostas_questionario_paciente_id_fkey"
    FOREIGN KEY ("paciente_id")
    REFERENCES "pacientes"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- -------------------------------------------------------------
-- Tabela: rastreamentos_gerados
-- Armazena os rastreamentos oncológicos gerados por critérios clínicos
-- -------------------------------------------------------------
CREATE TABLE "rastreamentos_gerados" (
    "id"               UUID         NOT NULL DEFAULT gen_random_uuid(),
    "paciente_id"      UUID         NOT NULL,
    "tipo_cancer"      TEXT         NOT NULL,
    "criterio_clinico" TEXT         NOT NULL,
    "data_geracao"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rastreamentos_gerados_pkey" PRIMARY KEY ("id")
);

-- Índices para consultas frequentes
CREATE INDEX "rastreamentos_gerados_paciente_id_idx" ON "rastreamentos_gerados"("paciente_id");
CREATE INDEX "rastreamentos_gerados_tipo_cancer_idx"  ON "rastreamentos_gerados"("tipo_cancer");

-- Chave estrangeira com cascade delete
ALTER TABLE "rastreamentos_gerados"
    ADD CONSTRAINT "rastreamentos_gerados_paciente_id_fkey"
    FOREIGN KEY ("paciente_id")
    REFERENCES "pacientes"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- =============================================================
-- FIM DA MIGRAÇÃO
-- =============================================================
