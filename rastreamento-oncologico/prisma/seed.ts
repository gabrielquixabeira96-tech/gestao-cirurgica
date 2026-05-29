/**
 * prisma/seed.ts
 * Script para injetar pacientes e rastreamentos de teste no banco de dados.
 */

import { config } from 'dotenv'
import { join } from 'path'
config({ path: join(process.cwd(), '.env.local') })

import { prisma } from '../lib/prisma'
import { hashWhatsApp } from '../lib/hash'
import { executarRastreamento } from '../lib/rastreamento-engine'

async function main() {
  console.log('🌱 Iniciando injeção de dados de teste (Seed)...')

  // Limpar banco antes de injetar
  await prisma.rastreamentos_gerados.deleteMany()
  await prisma.respostas_questionario.deleteMany()
  await prisma.pacientes.deleteMany()

  // Gerar 10 pacientes variados
  const pacientesSeed = [
    // 1. Homem, 55 anos, fumante (Risco Pulmão)
    {
      whatsapp: '+5511999990001',
      idade: 55,
      sexo_biologico: 'MASCULINO',
      respostas: [
        { chave_pergunta: 'fumante', valor_resposta: 'sim' },
        { chave_pergunta: 'anos_tabagismo', valor_resposta: '30' },
        { chave_pergunta: 'macos_dia', valor_resposta: '1.5' },
      ],
    },
    // 2. Mulher, 48 anos, histórico familiar mama (Risco Mama)
    {
      whatsapp: '+5511999990002',
      idade: 48,
      sexo_biologico: 'FEMININO',
      respostas: [
        { chave_pergunta: 'historico_familiar_cancer', valor_resposta: 'sim' },
        { chave_pergunta: 'tipo_cancer_familiar', valor_resposta: 'mama' },
        { chave_pergunta: 'ultima_mamografia', valor_resposta: 'mais_3_anos' },
      ],
    },
    // 3. Homem, 60 anos, negro, histórico prostata (Risco Próstata ALTO)
    {
      whatsapp: '+5511999990003',
      idade: 60,
      sexo_biologico: 'MASCULINO',
      respostas: [
        { chave_pergunta: 'raca_negra', valor_resposta: 'sim' },
        { chave_pergunta: 'historico_familiar_cancer', valor_resposta: 'sim' },
        { chave_pergunta: 'tipo_cancer_familiar', valor_resposta: 'próstata' },
        { chave_pergunta: 'ultimo_psa', valor_resposta: 'nunca' },
      ],
    },
    // 4. Mulher, 35 anos, HPV+ (Risco Cervical URGENTE)
    {
      whatsapp: '+5511999990004',
      idade: 35,
      sexo_biologico: 'FEMININO',
      respostas: [
        { chave_pergunta: 'hpv_positivo', valor_resposta: 'sim' },
        { chave_pergunta: 'ultimo_papanicolaou', valor_resposta: 'nunca' },
      ],
    },
    // 5. Homem, 50 anos, sangramento retal (Risco Colorretal URGENTE)
    {
      whatsapp: '+5511999990005',
      idade: 50,
      sexo_biologico: 'MASCULINO',
      respostas: [
        { chave_pergunta: 'sangramento_retal', valor_resposta: 'sim' },
        { chave_pergunta: 'ultima_colonoscopia', valor_resposta: 'nunca' },
      ],
    },
    // 6. Mulher, 30 anos, Exposição Solar (Risco Melanoma)
    {
      whatsapp: '+5511999990006',
      idade: 30,
      sexo_biologico: 'FEMININO',
      respostas: [
        { chave_pergunta: 'exposicao_solar_cronica', valor_resposta: 'sim' },
        { chave_pergunta: 'nevos_atipicos', valor_resposta: 'sim' },
      ],
    },
    // 7. Homem, 25 anos, saudável (Sem Risco)
    {
      whatsapp: '+5511999990007',
      idade: 25,
      sexo_biologico: 'MASCULINO',
      respostas: [
        { chave_pergunta: 'fumante', valor_resposta: 'nao' },
        { chave_pergunta: 'historico_familiar_cancer', valor_resposta: 'nao' },
      ],
    },
    // 8. Mulher, 65 anos, ex-fumante (Risco Pulmão + Colorretal)
    {
      whatsapp: '+5511999990008',
      idade: 65,
      sexo_biologico: 'FEMININO',
      respostas: [
        { chave_pergunta: 'fumante', valor_resposta: 'ex_fumante' },
        { chave_pergunta: 'anos_tabagismo', valor_resposta: '40' },
        { chave_pergunta: 'macos_dia', valor_resposta: '1' },
        { chave_pergunta: 'anos_parou_de_fumar', valor_resposta: '10' },
        { chave_pergunta: 'ultima_colonoscopia', valor_resposta: 'mais_10_anos' },
      ],
    },
    // 9. Homem, 42 anos, histórico pólipos (Risco Colorretal ALTO)
    {
      whatsapp: '+5511999990009',
      idade: 42,
      sexo_biologico: 'MASCULINO',
      respostas: [
        { chave_pergunta: 'historico_polipos', valor_resposta: 'sim' },
        { chave_pergunta: 'ultima_colonoscopia', valor_resposta: 'mais_5_anos' },
      ],
    },
    // 10. Mulher, 52 anos, checkup pendente (Risco Mama e Cervical NORMAL)
    {
      whatsapp: '+5511999990010',
      idade: 52,
      sexo_biologico: 'FEMININO',
      respostas: [
        { chave_pergunta: 'ultima_mamografia', valor_resposta: 'mais_3_anos' },
        { chave_pergunta: 'ultimo_papanicolaou', valor_resposta: 'mais_3_anos' },
      ],
    },
  ]

  let countRastreamentos = 0

  for (const p of pacientesSeed) {
    const whatsapp_hash = hashWhatsApp(p.whatsapp)
    
    // Cadastra paciente
    const paciente = await prisma.pacientes.create({
      data: {
        whatsapp_hash,
        idade: p.idade,
        // @ts-ignore
        sexo_biologico: p.sexo_biologico,
      },
    })

    // Cadastra respostas
    await prisma.respostas_questionario.createMany({
      data: p.respostas.map((r) => ({
        paciente_id: paciente.id,
        chave_pergunta: r.chave_pergunta,
        valor_resposta: r.valor_resposta,
      })),
    })

    // Monta objeto para o motor
    const respostasObj: Record<string, any> = {}
    for (const r of p.respostas) {
      if (['anos_tabagismo', 'macos_dia', 'anos_parou_de_fumar', 'imc'].includes(r.chave_pergunta)) {
        respostasObj[r.chave_pergunta] = parseFloat(r.valor_resposta)
      } else {
        respostasObj[r.chave_pergunta] = r.valor_resposta
      }
    }

    // Executa motor
    const resultados = executarRastreamento(
      // @ts-ignore
      { idade: p.idade, sexo_biologico: p.sexo_biologico },
      respostasObj
    )

    // Insere rastreamentos
    if (resultados.length > 0) {
      await prisma.rastreamentos_gerados.createMany({
        data: resultados.map((r) => ({
          paciente_id: paciente.id,
          tipo_cancer: r.tipo_cancer,
          criterio_clinico: `[${r.prioridade}] ${r.criterio_clinico} | Protocolo: ${r.protocolo_recomendado}`,
        })),
      })
      countRastreamentos += resultados.length
    }
  }

  console.log(`✅ Seed concluído! Foram criados 10 pacientes e ${countRastreamentos} rastreamentos de teste.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
