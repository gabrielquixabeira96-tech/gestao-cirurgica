/**
 * lib/rastreamento-engine.ts
 * Motor de rastreamento oncológico baseado em critérios clínicos.
 *
 * Protocolos baseados em:
 * - INCA (Instituto Nacional de Câncer) — Diretrizes 2024
 * - USPSTF (US Preventive Services Task Force)
 * - Sociedade Brasileira de Oncologia Clínica (SBOC)
 *
 * AVISO: Este sistema é de suporte à decisão clínica.
 * O resultado final deve sempre ser validado por um médico.
 */

// ============================================================
// Tipos
// ============================================================

export type SexoBiologico = 'MASCULINO' | 'FEMININO'

export interface DadosPaciente {
  idade: number
  sexo_biologico: SexoBiologico
}

export interface RespostasQuestionario {
  // Tabagismo
  fumante?: 'sim' | 'nao' | 'ex_fumante'
  anos_tabagismo?: number        // anos fumando
  macos_dia?: number             // maços por dia
  anos_parou_de_fumar?: number   // se ex-fumante, há quantos anos parou

  // Histórico familiar
  historico_familiar_cancer?: 'sim' | 'nao'
  tipo_cancer_familiar?: string  // qual tipo de câncer na família

  // Exames anteriores
  ultima_mamografia?: 'menos_1_ano' | '1_3_anos' | 'mais_3_anos' | 'nunca'
  ultimo_papanicolaou?: 'menos_1_ano' | '1_3_anos' | 'mais_3_anos' | 'nunca'
  ultima_colonoscopia?: 'menos_5_anos' | '5_10_anos' | 'mais_10_anos' | 'nunca'
  ultimo_psa?: 'menos_1_ano' | '1_3_anos' | 'mais_3_anos' | 'nunca'

  // Fatores de risco
  exposicao_solar_cronica?: 'sim' | 'nao'
  nevos_atipicos?: 'sim' | 'nao'
  sangramento_retal?: 'sim' | 'nao'
  perda_peso_involuntaria?: 'sim' | 'nao'
  historico_polipos?: 'sim' | 'nao'
  raca_negra?: 'sim' | 'nao'
  hpv_positivo?: 'sim' | 'nao'
  imc?: number                   // kg/m²
  alcool_frequente?: 'sim' | 'nao'
}

export interface ResultadoRastreamento {
  tipo_cancer: string
  criterio_clinico: string
  prioridade: 'URGENTE' | 'ALTA' | 'NORMAL'
  protocolo_recomendado: string
}

// ============================================================
// Critérios clínicos por tipo de câncer
// ============================================================

/**
 * Rastreamento de Câncer de Pulmão
 * USPSTF: TC de baixa dose anual para fumantes de alto risco
 */
function avaliarPulmao(
  paciente: DadosPaciente,
  respostas: RespostasQuestionario
): ResultadoRastreamento | null {
  const { idade } = paciente
  const { fumante, anos_tabagismo = 0, macos_dia = 0, anos_parou_de_fumar = 0 } = respostas

  // Maços-ano = maços/dia × anos fumando
  const macosAno = macos_dia * anos_tabagismo

  const eExFumante = fumante === 'ex_fumante' && anos_parou_de_fumar <= 15
  const eFumante = fumante === 'sim'
  const altoRiscoTabagismo = (eFumante || eExFumante) && macosAno >= 20

  if (idade >= 50 && idade <= 80 && altoRiscoTabagismo) {
    return {
      tipo_cancer: 'PULMONAR',
      criterio_clinico: `Idade ${idade} anos + tabagismo de ${macosAno.toFixed(0)} maços-ano ${eExFumante ? `(parou há ${anos_parou_de_fumar} anos)` : ''}. Faixa 50-80 anos com ≥20 maços-ano.`,
      prioridade: macosAno >= 40 ? 'ALTA' : 'NORMAL',
      protocolo_recomendado: 'TC de tórax de baixa dose (LDCT) — anual',
    }
  }
  return null
}

/**
 * Rastreamento de Câncer Colorretal
 * INCA/USPSTF: Colonoscopia a partir dos 45 anos
 */
function avaliarColorretal(
  paciente: DadosPaciente,
  respostas: RespostasQuestionario
): ResultadoRastreamento | null {
  const { idade } = paciente
  const {
    historico_familiar_cancer,
    tipo_cancer_familiar = '',
    historico_polipos,
    sangramento_retal,
    ultima_colonoscopia,
  } = respostas

  const familiarColorretal = historico_familiar_cancer === 'sim' &&
    tipo_cancer_familiar.toLowerCase().includes('colorretal')

  const semColonoscopia = !ultima_colonoscopia || ultima_colonoscopia === 'nunca' ||
    ultima_colonoscopia === 'mais_10_anos'

  if (idade >= 45 && semColonoscopia) {
    const urgente = sangramento_retal === 'sim'
    const altaRisco = historico_polipos === 'sim' || familiarColorretal

    return {
      tipo_cancer: 'COLORRETAL',
      criterio_clinico: `Idade ${idade} anos, sem colonoscopia recente${altaRisco ? ', histórico de alto risco' : ''}${sangramento_retal === 'sim' ? ', sangramento retal relatado' : ''}.`,
      prioridade: urgente ? 'URGENTE' : altaRisco ? 'ALTA' : 'NORMAL',
      protocolo_recomendado: urgente
        ? 'Colonoscopia URGENTE (sangramento retal)'
        : historico_polipos === 'sim'
          ? 'Colonoscopia — a cada 3-5 anos (histórico de pólipos)'
          : 'Colonoscopia — a cada 10 anos ou sangue oculto nas fezes anual',
    }
  }
  return null
}

/**
 * Rastreamento de Câncer de Mama
 * INCA: Mamografia bienal 50-69 anos; USPSTF: 40-74 anos
 */
function avaliarMama(
  paciente: DadosPaciente,
  respostas: RespostasQuestionario
): ResultadoRastreamento | null {
  if (paciente.sexo_biologico !== 'FEMININO') return null

  const { idade } = paciente
  const { historico_familiar_cancer, tipo_cancer_familiar = '', ultima_mamografia } = respostas

  const familiarMama = historico_familiar_cancer === 'sim' &&
    (tipo_cancer_familiar.toLowerCase().includes('mama') || tipo_cancer_familiar.toLowerCase().includes('brca'))

  const semMamografia = !ultima_mamografia || ultima_mamografia === 'nunca' ||
    ultima_mamografia === 'mais_3_anos'

  // Rastreamento padrão: 50-74 anos
  if (idade >= 50 && idade <= 74 && semMamografia) {
    return {
      tipo_cancer: 'MAMA',
      criterio_clinico: `Sexo feminino, ${idade} anos, faixa etária de rastreamento (50-74 anos), sem mamografia recente${familiarMama ? ', histórico familiar de câncer de mama' : ''}.`,
      prioridade: familiarMama ? 'ALTA' : 'NORMAL',
      protocolo_recomendado: familiarMama
        ? 'Mamografia bilateral — anual + avaliação de risco BRCA'
        : 'Mamografia bilateral — bienal (a cada 2 anos)',
    }
  }

  // Rastreamento precoce: 40-49 ou histórico familiar
  if (idade >= 40 && idade < 50 && familiarMama && semMamografia) {
    return {
      tipo_cancer: 'MAMA',
      criterio_clinico: `Sexo feminino, ${idade} anos, histórico familiar de câncer de mama — rastreamento antecipado recomendado.`,
      prioridade: 'ALTA',
      protocolo_recomendado: 'Mamografia bilateral — anual (rastreamento precoce por risco familiar)',
    }
  }

  return null
}

/**
 * Rastreamento de Câncer do Colo do Útero (Cervical)
 * INCA: Papanicolaou a cada 3 anos (25-64 anos)
 */
function avaliarCervical(
  paciente: DadosPaciente,
  respostas: RespostasQuestionario
): ResultadoRastreamento | null {
  if (paciente.sexo_biologico !== 'FEMININO') return null

  const { idade } = paciente
  const { ultimo_papanicolaou, hpv_positivo } = respostas

  const semPapanicolaou = !ultimo_papanicolaou || ultimo_papanicolaou === 'nunca' ||
    ultimo_papanicolaou === 'mais_3_anos'

  if (idade >= 25 && idade <= 64 && semPapanicolaou) {
    const urgente = hpv_positivo === 'sim'
    return {
      tipo_cancer: 'CERVICAL',
      criterio_clinico: `Sexo feminino, ${idade} anos, sem Papanicolaou recente${hpv_positivo === 'sim' ? ', HPV positivo relatado' : ''}.`,
      prioridade: urgente ? 'URGENTE' : 'NORMAL',
      protocolo_recomendado: hpv_positivo === 'sim'
        ? 'Colposcopia + Papanicolaou — URGENTE (HPV positivo)'
        : 'Papanicolaou — a cada 3 anos (ou co-teste HPV+Pap a cada 5 anos)',
    }
  }
  return null
}

/**
 * Rastreamento de Câncer de Próstata
 * SBOC: PSA + toque retal a partir dos 50 anos (ou 40 para negros)
 */
function avaliarProstata(
  paciente: DadosPaciente,
  respostas: RespostasQuestionario
): ResultadoRastreamento | null {
  if (paciente.sexo_biologico !== 'MASCULINO') return null

  const { idade } = paciente
  const { historico_familiar_cancer, tipo_cancer_familiar = '', raca_negra, ultimo_psa } = respostas

  const familiarProstata = historico_familiar_cancer === 'sim' &&
    tipo_cancer_familiar.toLowerCase().includes('próstata')
  const semPsa = !ultimo_psa || ultimo_psa === 'nunca' || ultimo_psa === 'mais_3_anos'

  const idadeMinima = raca_negra === 'sim' || familiarProstata ? 40 : 50

  if (idade >= idadeMinima && idade <= 75 && semPsa) {
    return {
      tipo_cancer: 'PROSTATA',
      criterio_clinico: `Sexo masculino, ${idade} anos${raca_negra === 'sim' ? ', raça negra (risco aumentado)' : ''}${familiarProstata ? ', histórico familiar de câncer de próstata' : ''}, sem PSA recente.`,
      prioridade: raca_negra === 'sim' || familiarProstata ? 'ALTA' : 'NORMAL',
      protocolo_recomendado: 'PSA sérico + exame de toque retal — anual (decisão compartilhada com médico)',
    }
  }
  return null
}

/**
 * Rastreamento de Câncer de Pele (Melanoma)
 * SBD: Dermatoscopia anual para grupos de risco
 */
function avaliarPele(
  paciente: DadosPaciente,
  respostas: RespostasQuestionario
): ResultadoRastreamento | null {
  const { exposicao_solar_cronica, nevos_atipicos, historico_familiar_cancer, tipo_cancer_familiar = '' } = respostas

  const familiarMelanoma = historico_familiar_cancer === 'sim' &&
    (tipo_cancer_familiar.toLowerCase().includes('melanoma') || tipo_cancer_familiar.toLowerCase().includes('pele'))

  const temFatorRisco = exposicao_solar_cronica === 'sim' || nevos_atipicos === 'sim' || familiarMelanoma

  if (temFatorRisco && paciente.idade >= 18) {
    const urgente = nevos_atipicos === 'sim' && familiarMelanoma
    return {
      tipo_cancer: 'MELANOMA',
      criterio_clinico: [
        exposicao_solar_cronica === 'sim' && 'exposição solar crônica',
        nevos_atipicos === 'sim' && 'nevos/manchas atípicas',
        familiarMelanoma && 'histórico familiar de melanoma',
      ].filter(Boolean).join(', ') + `. Paciente de ${paciente.idade} anos.`,
      prioridade: urgente ? 'URGENTE' : 'ALTA',
      protocolo_recomendado: urgente
        ? 'Dermoscopia URGENTE + mapeamento corporal total'
        : 'Dermoscopia — anual + autoexame de pele mensal',
    }
  }
  return null
}

// ============================================================
// Função principal do motor
// ============================================================

/**
 * Executa todos os algoritmos de rastreamento e retorna
 * a lista de rastreamentos indicados para o paciente.
 */
export function executarRastreamento(
  paciente: DadosPaciente,
  respostas: RespostasQuestionario
): ResultadoRastreamento[] {
  const avaliadores = [
    avaliarPulmao,
    avaliarColorretal,
    avaliarMama,
    avaliarCervical,
    avaliarProstata,
    avaliarPele,
  ]

  const resultados: ResultadoRastreamento[] = []

  for (const avaliar of avaliadores) {
    const resultado = avaliar(paciente, respostas)
    if (resultado) {
      resultados.push(resultado)
    }
  }

  // Ordena por prioridade: URGENTE > ALTA > NORMAL
  const ordemPrioridade = { URGENTE: 0, ALTA: 1, NORMAL: 2 }
  return resultados.sort((a, b) => ordemPrioridade[a.prioridade] - ordemPrioridade[b.prioridade])
}
