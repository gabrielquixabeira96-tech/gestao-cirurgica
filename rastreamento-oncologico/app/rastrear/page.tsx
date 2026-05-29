'use client'

/**
 * app/rastrear/page.tsx
 * Formulário público multi-step de cadastro e questionário oncológico.
 * Acessado pelo paciente via link compartilhado (WhatsApp, SMS, etc.)
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// ============================================================
// Tipos
// ============================================================

type Step = 'identificacao' | 'questionario' | 'enviando' | 'erro'

interface FormData {
  whatsapp: string
  idade: string
  sexo_biologico: 'MASCULINO' | 'FEMININO' | ''
  fumante: string
  anos_tabagismo: string
  macos_dia: string
  anos_parou_de_fumar: string
  historico_familiar_cancer: string
  tipo_cancer_familiar: string
  ultima_mamografia: string
  ultimo_papanicolaou: string
  ultima_colonoscopia: string
  ultimo_psa: string
  exposicao_solar_cronica: string
  nevos_atipicos: string
  sangramento_retal: string
  historico_polipos: string
  raca_negra: string
  hpv_positivo: string
}

// ============================================================
// Componente de campo de formulário
// ============================================================

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-slate-300 mb-2">
        {label}
      </label>
      {hint && <p className="text-xs text-slate-500 mb-2">{hint}</p>}
      {children}
    </div>
  )
}

function Select({
  id,
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
}: {
  id: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: value ? '#f1f5f9' : '#64748b',
      }}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value} style={{ background: '#0d1b2a' }}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

function Input({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
}: {
  id: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl text-sm font-medium"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#f1f5f9',
      }}
    />
  )
}

// ============================================================
// Página principal
// ============================================================

export default function RastrearPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('identificacao')
  const [erroMsg, setErroMsg] = useState('')
  const [form, setForm] = useState<FormData>({
    whatsapp: '',
    idade: '',
    sexo_biologico: '',
    fumante: '',
    anos_tabagismo: '',
    macos_dia: '',
    anos_parou_de_fumar: '',
    historico_familiar_cancer: '',
    tipo_cancer_familiar: '',
    ultima_mamografia: '',
    ultimo_papanicolaou: '',
    ultima_colonoscopia: '',
    ultimo_psa: '',
    exposicao_solar_cronica: '',
    nevos_atipicos: '',
    sangramento_retal: '',
    historico_polipos: '',
    raca_negra: '',
    hpv_positivo: '',
  })

  const set = (key: keyof FormData) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  // Constrói array de respostas para a API
  function buildRespostas() {
    const respostas: { chave_pergunta: string; valor_resposta: string }[] = []
    const fields: (keyof FormData)[] = [
      'fumante', 'anos_tabagismo', 'macos_dia', 'anos_parou_de_fumar',
      'historico_familiar_cancer', 'tipo_cancer_familiar',
      'ultima_mamografia', 'ultimo_papanicolaou', 'ultima_colonoscopia', 'ultimo_psa',
      'exposicao_solar_cronica', 'nevos_atipicos', 'sangramento_retal',
      'historico_polipos', 'raca_negra', 'hpv_positivo',
    ]
    for (const f of fields) {
      if (form[f]) {
        respostas.push({ chave_pergunta: f, valor_resposta: form[f] })
      }
    }
    return respostas
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStep('enviando')

    try {
      // 1. Cadastrar paciente
      const resCadastro = await fetch('/api/pacientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp: form.whatsapp,
          idade: parseInt(form.idade),
          sexo_biologico: form.sexo_biologico,
        }),
      })
      if (!resCadastro.ok) {
        const err = await resCadastro.json()
        throw new Error(err.error || 'Erro ao cadastrar paciente.')
      }
      const { id: pacienteId } = await resCadastro.json()

      // 2. Salvar respostas
      const resRespostas = await fetch(`/api/pacientes/${pacienteId}/respostas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respostas: buildRespostas() }),
      })
      if (!resRespostas.ok) {
        const err = await resRespostas.json()
        throw new Error(err.error || 'Erro ao salvar respostas.')
      }

      // 3. Executar rastreamento
      const resRastrear = await fetch(`/api/pacientes/${pacienteId}/rastrear`, {
        method: 'POST',
      })
      if (!resRastrear.ok) {
        const err = await resRastrear.json()
        throw new Error(err.error || 'Erro ao executar rastreamento.')
      }

      // 4. Redirecionar para página de resultado
      router.push(`/resultado/${pacienteId}`)
    } catch (err) {
      setErroMsg(err instanceof Error ? err.message : 'Erro desconhecido.')
      setStep('erro')
    }
  }

  const simNaoOpts = [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' },
  ]

  // ============================================================
  // Renders por step
  // ============================================================

  if (step === 'enviando') {
    return (
      <PageWrapper>
        <div className="text-center py-20">
          <div className="text-5xl mb-6 animate-float">🔬</div>
          <h2 className="text-2xl font-bold text-slate-100 mb-3">Analisando seu perfil...</h2>
          <p className="text-slate-400 text-sm">
            Aplicando critérios clínicos INCA 2024 e USPSTF
          </p>
          <div className="mt-8 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-cyan-400"
                style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (step === 'erro') {
    return (
      <PageWrapper>
        <div className="text-center py-16">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-400 mb-3">Ocorreu um erro</h2>
          <p className="text-slate-400 text-sm mb-6">{erroMsg}</p>
          <button
            id="btn-tentar-novamente"
            onClick={() => { setStep('identificacao'); setErroMsg('') }}
            className="btn-primary"
            type="button"
          >
            Tentar novamente
          </button>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <form onSubmit={handleSubmit}>

        {/* ===== STEP 1: Identificação ===== */}
        {step === 'identificacao' && (
          <div className="animate-fade-in-up">
            <StepHeader
              step={1}
              total={2}
              title="Identificação"
              subtitle="Seus dados são anonimizados automaticamente. Não armazenamos seu número."
            />

            <Field label="Número de WhatsApp" hint="Formato: +55 11 99999-0001">
              <Input
                id="input-whatsapp"
                type="tel"
                value={form.whatsapp}
                onChange={set('whatsapp')}
                placeholder="+55 11 99999-0001"
              />
            </Field>

            <Field label="Sua idade">
              <Input
                id="input-idade"
                type="number"
                value={form.idade}
                onChange={set('idade')}
                placeholder="Ex: 45"
              />
            </Field>

            <Field label="Sexo biológico">
              <div className="flex gap-3">
                {(['MASCULINO', 'FEMININO'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    id={`btn-sexo-${s.toLowerCase()}`}
                    onClick={() => set('sexo_biologico')(s)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: form.sexo_biologico === s
                        ? 'var(--gradient-teal)'
                        : 'rgba(255,255,255,0.05)',
                      color: form.sexo_biologico === s ? '#0a0f1e' : '#94a3b8',
                      border: form.sexo_biologico === s
                        ? 'none'
                        : '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {s === 'MASCULINO' ? '♂ Masculino' : '♀ Feminino'}
                  </button>
                ))}
              </div>
            </Field>

            <button
              id="btn-proxima-etapa"
              type="button"
              className="btn-primary w-full justify-center mt-4"
              disabled={!form.whatsapp || !form.idade || !form.sexo_biologico}
              onClick={() => setStep('questionario')}
              style={{
                opacity: (!form.whatsapp || !form.idade || !form.sexo_biologico) ? 0.4 : 1,
                cursor: (!form.whatsapp || !form.idade || !form.sexo_biologico) ? 'not-allowed' : 'pointer',
              }}
            >
              Próxima etapa →
            </button>
          </div>
        )}

        {/* ===== STEP 2: Questionário ===== */}
        {step === 'questionario' && (
          <div className="animate-fade-in-up">
            <StepHeader
              step={2}
              total={2}
              title="Questionário de Risco"
              subtitle="Responda com honestidade para obter o rastreamento mais preciso."
            />

            {/* Tabagismo */}
            <SectionTitle>🚬 Tabagismo</SectionTitle>

            <Field label="Você fuma ou fumou?">
              <Select
                id="sel-fumante"
                value={form.fumante}
                onChange={set('fumante')}
                options={[
                  { value: 'nao', label: 'Nunca fumei' },
                  { value: 'sim', label: 'Fumo atualmente' },
                  { value: 'ex_fumante', label: 'Ex-fumante (parei)' },
                ]}
              />
            </Field>

            {(form.fumante === 'sim' || form.fumante === 'ex_fumante') && (
              <>
                <Field label="Quantos anos fumou/fuma?">
                  <Input id="inp-anos-tab" type="number" value={form.anos_tabagismo} onChange={set('anos_tabagismo')} placeholder="Ex: 20" />
                </Field>
                <Field label="Quantos maços por dia (em média)?">
                  <Input id="inp-macos" type="number" value={form.macos_dia} onChange={set('macos_dia')} placeholder="Ex: 1" />
                </Field>
                {form.fumante === 'ex_fumante' && (
                  <Field label="Há quantos anos parou?">
                    <Input id="inp-parou" type="number" value={form.anos_parou_de_fumar} onChange={set('anos_parou_de_fumar')} placeholder="Ex: 5" />
                  </Field>
                )}
              </>
            )}

            {/* Histórico familiar */}
            <SectionTitle>👨‍👩‍👧 Histórico Familiar</SectionTitle>

            <Field label="Algum familiar próximo (pais, irmãos) teve câncer?">
              <Select id="sel-hist-familiar" value={form.historico_familiar_cancer} onChange={set('historico_familiar_cancer')} options={simNaoOpts} />
            </Field>
            {form.historico_familiar_cancer === 'sim' && (
              <Field label="Qual tipo de câncer?" hint="Ex: mama, colorretal, próstata, pulmão...">
                <Input id="inp-tipo-cancer-familiar" value={form.tipo_cancer_familiar} onChange={set('tipo_cancer_familiar')} placeholder="Ex: mama" />
              </Field>
            )}

            {/* Exames anteriores */}
            <SectionTitle>🩺 Exames Anteriores</SectionTitle>

            <Field label="Quando foi seu último exame de sangue oculto nas fezes / colonoscopia?">
              <Select id="sel-colonoscopia" value={form.ultima_colonoscopia} onChange={set('ultima_colonoscopia')} options={[
                { value: 'menos_5_anos', label: 'Há menos de 5 anos' },
                { value: '5_10_anos', label: 'Entre 5 e 10 anos atrás' },
                { value: 'mais_10_anos', label: 'Há mais de 10 anos' },
                { value: 'nunca', label: 'Nunca fiz' },
              ]} />
            </Field>

            {form.sexo_biologico === 'FEMININO' && (
              <>
                <Field label="Quando foi sua última mamografia?">
                  <Select id="sel-mamografia" value={form.ultima_mamografia} onChange={set('ultima_mamografia')} options={[
                    { value: 'menos_1_ano', label: 'Há menos de 1 ano' },
                    { value: '1_3_anos', label: 'Entre 1 e 3 anos atrás' },
                    { value: 'mais_3_anos', label: 'Há mais de 3 anos' },
                    { value: 'nunca', label: 'Nunca fiz' },
                  ]} />
                </Field>
                <Field label="Quando foi seu último Papanicolaou?">
                  <Select id="sel-pap" value={form.ultimo_papanicolaou} onChange={set('ultimo_papanicolaou')} options={[
                    { value: 'menos_1_ano', label: 'Há menos de 1 ano' },
                    { value: '1_3_anos', label: 'Entre 1 e 3 anos atrás' },
                    { value: 'mais_3_anos', label: 'Há mais de 3 anos' },
                    { value: 'nunca', label: 'Nunca fiz' },
                  ]} />
                </Field>
                <Field label="Você tem resultado de HPV positivo?">
                  <Select id="sel-hpv" value={form.hpv_positivo} onChange={set('hpv_positivo')} options={simNaoOpts} />
                </Field>
              </>
            )}

            {form.sexo_biologico === 'MASCULINO' && (
              <Field label="Quando foi seu último exame de PSA (antígeno prostático)?">
                <Select id="sel-psa" value={form.ultimo_psa} onChange={set('ultimo_psa')} options={[
                  { value: 'menos_1_ano', label: 'Há menos de 1 ano' },
                  { value: '1_3_anos', label: 'Entre 1 e 3 anos atrás' },
                  { value: 'mais_3_anos', label: 'Há mais de 3 anos' },
                  { value: 'nunca', label: 'Nunca fiz' },
                ]} />
              </Field>
            )}

            {/* Outros fatores */}
            <SectionTitle>☀️ Outros Fatores de Risco</SectionTitle>

            <Field label="Tem exposição solar intensa e frequente (trabalho ao ar livre, etc.)?">
              <Select id="sel-solar" value={form.exposicao_solar_cronica} onChange={set('exposicao_solar_cronica')} options={simNaoOpts} />
            </Field>
            <Field label="Tem manchas, pintas ou nevos que mudaram de aparência?">
              <Select id="sel-nevos" value={form.nevos_atipicos} onChange={set('nevos_atipicos')} options={simNaoOpts} />
            </Field>
            <Field label="Já teve sangramento retal ou nas fezes?">
              <Select id="sel-sangramento" value={form.sangramento_retal} onChange={set('sangramento_retal')} options={simNaoOpts} />
            </Field>
            <Field label="Já teve pólipos no intestino?">
              <Select id="sel-polipos" value={form.historico_polipos} onChange={set('historico_polipos')} options={simNaoOpts} />
            </Field>
            <Field label="Você se identifica como preto(a) / parda / afrodescendente?">
              <Select id="sel-raca" value={form.raca_negra} onChange={set('raca_negra')} options={simNaoOpts} />
            </Field>

            <div className="flex gap-3 mt-6">
              <button
                id="btn-voltar"
                type="button"
                className="btn-secondary flex-1 justify-center"
                onClick={() => setStep('identificacao')}
              >
                ← Voltar
              </button>
              <button
                id="btn-enviar-questionario"
                type="submit"
                className="btn-primary flex-1 justify-center"
              >
                🔬 Ver meu rastreamento
              </button>
            </div>
          </div>
        )}
      </form>
    </PageWrapper>
  )
}

// ============================================================
// Sub-componentes de layout
// ============================================================

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="min-h-screen flex items-start justify-center py-12 px-4"
      style={{ background: 'var(--gradient-hero)' }}
    >
      <div
        className="w-full max-w-lg glass-card p-8 mt-4"
        style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.5)' }}
      >
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl">🎯</span>
          <span className="text-sm font-bold text-cyan-400 uppercase tracking-widest">
            Rastreamento Oncológico
          </span>
        </div>
        {children}
      </div>
    </main>
  )
}

function StepHeader({ step, total, title, subtitle }: {
  step: number; total: number; title: string; subtitle: string
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all"
            style={{
              background: i < step
                ? 'var(--gradient-teal)'
                : 'rgba(255,255,255,0.1)',
            }}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500 mb-2">Etapa {step} de {total}</p>
      <h1 className="text-2xl font-bold text-slate-100 mb-1">{title}</h1>
      <p className="text-sm text-slate-400">{subtitle}</p>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-7 mb-4 border-t border-slate-800 pt-5">
      {children}
    </p>
  )
}
