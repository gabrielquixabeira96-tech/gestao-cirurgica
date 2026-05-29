/**
 * app/resultado/[id]/page.tsx
 * Página de resultados do rastreamento oncológico para o paciente.
 * Exibe os rastreamentos gerados com prioridade e protocolos recomendados.
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Seu Resultado — Rastreamento Oncológico',
  description: 'Resultado personalizado do seu rastreamento oncológico.',
  robots: 'noindex, nofollow',
}

// Cores e ícones por tipo de câncer
const tipoConfig: Record<string, { cor: string; icone: string }> = {
  PULMONAR:  { cor: '#0ed2f7', icone: '🫁' },
  COLORRETAL: { cor: '#10b981', icone: '🩺' },
  MAMA:      { cor: '#f472b6', icone: '🎗️' },
  CERVICAL:  { cor: '#a855f7', icone: '🔭' },
  PROSTATA:  { cor: '#f97316', icone: '⚕️' },
  MELANOMA:  { cor: '#fbbf24', icone: '☀️' },
}

// Extrai prioridade do critério clínico (formato: [URGENTE] texto...)
function extrairPrioridade(criterio: string): 'URGENTE' | 'ALTA' | 'NORMAL' {
  if (criterio.startsWith('[URGENTE]')) return 'URGENTE'
  if (criterio.startsWith('[ALTA]')) return 'ALTA'
  return 'NORMAL'
}

// Limpa o prefixo de prioridade do texto para exibição
function limparCriterio(criterio: string): string {
  return criterio
    .replace(/^\[(URGENTE|ALTA|NORMAL)\]\s*/, '')
}

// Componente de badge de prioridade
function PrioridadeBadge({ prioridade }: { prioridade: string }) {
  const config = {
    URGENTE: { bg: 'rgba(239,68,68,0.15)', cor: '#f87171', borda: 'rgba(239,68,68,0.3)', label: '🚨 URGENTE' },
    ALTA:    { bg: 'rgba(249,115,22,0.15)', cor: '#fb923c', borda: 'rgba(249,115,22,0.3)', label: '⚠️ ALTA PRIORIDADE' },
    NORMAL:  { bg: 'rgba(16,185,129,0.15)', cor: '#34d399', borda: 'rgba(16,185,129,0.3)', label: '✅ RASTREAMENTO INDICADO' },
  }[prioridade] ?? { bg: 'rgba(255,255,255,0.05)', cor: '#94a3b8', borda: 'rgba(255,255,255,0.1)', label: prioridade }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
      style={{ background: config.bg, color: config.cor, border: `1px solid ${config.borda}` }}
    >
      {config.label}
    </span>
  )
}

export default async function ResultadoPage({ params }: PageProps) {
  const { id } = await params

  const paciente = await prisma.pacientes.findUnique({
    where: { id },
    include: {
      rastreamentos: { orderBy: { data_geracao: 'desc' } },
    },
  })

  if (!paciente) notFound()

  const temRastreamentos = paciente.rastreamentos.length > 0
  const temUrgente = paciente.rastreamentos.some(r => r.criterio_clinico.startsWith('[URGENTE]'))
  const temAlta = paciente.rastreamentos.some(r => r.criterio_clinico.startsWith('[ALTA]'))

  return (
    <main
      className="min-h-screen py-12 px-4"
      style={{ background: 'var(--gradient-hero)' }}
    >
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="text-5xl mb-4 animate-float">
            {temUrgente ? '🚨' : temRastreamentos ? '🔬' : '✅'}
          </div>
          <h1 className="text-3xl font-black text-slate-100 mb-3">
            {temRastreamentos ? 'Rastreamentos Indicados' : 'Nenhum rastreamento indicado'}
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            {temRastreamentos
              ? 'Com base no seu perfil, identificamos os seguintes rastreamentos oncológicos recomendados.'
              : 'Seu perfil atual não indica nenhum rastreamento oncológico específico no momento. Continue com acompanhamento médico regular.'}
          </p>

          {/* Alerta de urgência */}
          {temUrgente && (
            <div
              className="mt-5 p-4 rounded-xl text-sm font-medium animate-pulse-glow"
              style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171',
              }}
            >
              ⚠️ <strong>ATENÇÃO:</strong> Você tem rastreamentos marcados como URGENTE. Procure um médico o mais breve possível.
            </div>
          )}
          {!temUrgente && temAlta && (
            <div
              className="mt-5 p-4 rounded-xl text-sm font-medium"
              style={{
                background: 'rgba(249,115,22,0.12)',
                border: '1px solid rgba(249,115,22,0.3)',
                color: '#fb923c',
              }}
            >
              📋 Você tem rastreamentos de alta prioridade. Agende uma consulta médica em breve.
            </div>
          )}
        </div>

        {/* Cards de rastreamento */}
        {temRastreamentos && (
          <div className="space-y-4 mb-10">
            {paciente.rastreamentos.map((r, i) => {
              const cfg = tipoConfig[r.tipo_cancer] ?? { cor: '#94a3b8', icone: '🔬' }
              const prioridade = extrairPrioridade(r.criterio_clinico)
              const [criterio, protocolo] = limparCriterio(r.criterio_clinico).split(' | Protocolo: ')

              return (
                <div
                  key={r.id}
                  className="glass-card p-6 animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms`, borderColor: `${cfg.cor}25` }}
                >
                  {/* Header do card */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: `${cfg.cor}20`, border: `1px solid ${cfg.cor}40` }}
                      >
                        {cfg.icone}
                      </div>
                      <div>
                        <h2
                          className="text-base font-bold"
                          style={{ color: cfg.cor }}
                        >
                          Câncer {r.tipo_cancer.charAt(0) + r.tipo_cancer.slice(1).toLowerCase()}
                        </h2>
                        <p className="text-xs text-slate-500">
                          {new Date(r.data_geracao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <PrioridadeBadge prioridade={prioridade} />
                  </div>

                  {/* Critério clínico */}
                  <div
                    className="p-3 rounded-lg mb-3 text-sm text-slate-300"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Critério clínico:
                    </span>
                    {criterio}
                  </div>

                  {/* Protocolo recomendado */}
                  {protocolo && (
                    <div
                      className="px-3 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2"
                      style={{
                        background: `${cfg.cor}12`,
                        color: cfg.cor,
                        border: `1px solid ${cfg.cor}30`,
                      }}
                    >
                      📋 {protocolo}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Rodapé com aviso legal e ações */}
        <div className="glass-card p-5 text-center animate-fade-in-up-delay-3">
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            ⚠️ <strong className="text-slate-400">Aviso Médico:</strong> Este rastreamento é uma ferramenta de apoio à decisão clínica, não um diagnóstico. Os resultados devem ser discutidos com um médico qualificado. Não substitui consulta médica presencial.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              id="link-novo-rastreamento"
              href="/rastrear"
              className="btn-secondary text-sm justify-center"
            >
              ↩ Novo rastreamento
            </Link>
            <Link
              id="link-inicio"
              href="/"
              className="btn-primary text-sm justify-center"
            >
              🏠 Página inicial
            </Link>
          </div>
        </div>

      </div>
    </main>
  )
}
