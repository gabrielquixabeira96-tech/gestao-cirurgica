'use client'

/**
 * app/dashboard/page.tsx
 * Painel administrativo com métricas em tempo real do sistema de rastreamento.
 * Consome o endpoint GET /api/stats e atualiza automaticamente a cada 30s.
 */

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Stats {
  total_pacientes: number
  total_rastreamentos: number
  taxa_deteccao_percent: string
  alertas_urgentes: number
  cadastros_hoje: number
  por_tipo_cancer: { tipo: string; total: number }[]
  timestamp: string
}

// Configuração visual por tipo de câncer
const tipoConfig: Record<string, { cor: string; icone: string; label: string }> = {
  PULMONAR:   { cor: '#0ed2f7', icone: '🫁', label: 'Pulmonar' },
  COLORRETAL: { cor: '#10b981', icone: '🩺', label: 'Colorretal' },
  MAMA:       { cor: '#f472b6', icone: '🎗️', label: 'Mama' },
  CERVICAL:   { cor: '#a855f7', icone: '🔭', label: 'Cervical' },
  PROSTATA:   { cor: '#f97316', icone: '⚕️', label: 'Próstata' },
  MELANOMA:   { cor: '#fbbf24', icone: '☀️', label: 'Melanoma' },
}

function formatNum(n: number): string {
  return n.toLocaleString('pt-BR')
}

// ============================================================
// Componentes
// ============================================================

function MetricCard({
  id,
  label,
  value,
  sub,
  icon,
  gradient,
  delay,
}: {
  id: string
  label: string
  value: string | number
  sub?: string
  icon: string
  gradient: string
  delay: number
}) {
  return (
    <div
      id={id}
      className="glass-card p-6 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: gradient, boxShadow: `0 4px 20px ${gradient.includes('0ed2f7') ? 'rgba(14,210,247,0.25)' : 'rgba(168,85,247,0.25)'}` }}
        >
          {icon}
        </div>
      </div>
      <p className="text-3xl font-black text-slate-100 mb-1 font-mono">{value}</p>
      <p className="text-sm font-semibold text-slate-300 mb-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

// ============================================================
// Página
// ============================================================

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats', { cache: 'no-store' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || `HTTP ${res.status}`)
      }
      const data: Stats = await res.json()
      setStats(data)
      setLastUpdate(new Date())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar métricas.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    // Atualiza a cada 30 segundos
    const interval = setInterval(fetchStats, 30_000)
    return () => clearInterval(interval)
  }, [fetchStats])

  // Calcula max para barra de progresso
  const maxTipoCancer = stats?.por_tipo_cancer.reduce((m, t) => Math.max(m, t.total), 0) ?? 1

  return (
    <main className="min-h-screen" style={{ background: 'var(--gradient-hero)' }}>

      {/* Fundo decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'var(--gradient-teal)' }} />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full opacity-8 blur-3xl"
          style={{ background: 'var(--gradient-purple)' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="flex items-center justify-between mb-10 animate-fade-in-up">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">📊</span>
              <h1 className="text-2xl font-black text-slate-100">Dashboard</h1>
            </div>
            <p className="text-sm text-slate-500">
              {lastUpdate
                ? `Atualizado às ${lastUpdate.toLocaleTimeString('pt-BR')} · atualiza a cada 30s`
                : 'Carregando métricas...'}
            </p>
          </div>
          <nav className="flex items-center gap-3">
            <button
              id="btn-refresh"
              onClick={fetchStats}
              className="btn-secondary text-sm"
              type="button"
              aria-label="Atualizar métricas"
            >
              🔄 Atualizar
            </button>
            <Link id="link-rastrear" href="/rastrear" className="btn-primary text-sm">
              + Novo Rastreamento
            </Link>
          </nav>
        </header>

        {/* Estado de erro */}
        {error && (
          <div
            className="glass-card p-5 mb-8 text-sm animate-fade-in-up"
            style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#f87171', background: 'rgba(239,68,68,0.08)' }}
          >
            <strong>⚠️ Erro ao carregar métricas:</strong> {error}
            <br />
            <span className="text-slate-500 text-xs mt-1 block">
              Verifique se o banco de dados está configurado em .env.local
            </span>
          </div>
        )}

        {/* Skeleton / Loading */}
        {loading && !error && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass-card p-6 animate-pulse"
                style={{ height: 160, animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        )}

        {/* Métricas principais */}
        {stats && !loading && (
          <>
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10" aria-label="Métricas principais">
              <MetricCard
                id="metric-pacientes"
                label="Total de Pacientes"
                value={formatNum(stats.total_pacientes)}
                sub="cadastrados na base"
                icon="👥"
                gradient="linear-gradient(135deg, #0ed2f7, #00b4d8)"
                delay={0}
              />
              <MetricCard
                id="metric-rastreamentos"
                label="Rastreamentos Gerados"
                value={formatNum(stats.total_rastreamentos)}
                sub="protocolos emitidos"
                icon="🔬"
                gradient="linear-gradient(135deg, #a855f7, #7c3aed)"
                delay={80}
              />
              <MetricCard
                id="metric-taxa"
                label="Taxa de Detecção"
                value={`${stats.taxa_deteccao_percent}%`}
                sub="pacientes com rastreamento"
                icon="📊"
                gradient="linear-gradient(135deg, #f97316, #ef4444)"
                delay={160}
              />
              <MetricCard
                id="metric-urgentes"
                label="Alertas Urgentes"
                value={formatNum(stats.alertas_urgentes)}
                sub="requerem atenção imediata"
                icon="🚨"
                gradient="linear-gradient(135deg, #22d3ee, #10b981)"
                delay={240}
              />
            </section>

            {/* Sub-métrica: hoje */}
            <div
              className="glass-card p-4 mb-10 flex items-center gap-4 animate-fade-in-up-delay-2"
              style={{ borderColor: 'rgba(14,210,247,0.15)' }}
            >
              <div className="text-2xl">📅</div>
              <div>
                <span className="text-sm font-bold text-cyan-400">{stats.cadastros_hoje}</span>
                <span className="text-sm text-slate-400"> novos cadastros hoje</span>
              </div>
              <div className="ml-auto">
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: 'rgba(14,210,247,0.1)', color: '#0ed2f7', border: '1px solid rgba(14,210,247,0.2)' }}
                >
                  Hoje
                </span>
              </div>
            </div>

            {/* Distribuição por tipo de câncer */}
            {stats.por_tipo_cancer.length > 0 && (
              <section className="mb-10" aria-label="Distribuição por tipo de câncer">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-5 animate-fade-in-up-delay-2">
                  🎗️ Distribuição por Tipo de Câncer
                </h2>
                <div className="glass-card p-6 space-y-4 animate-fade-in-up-delay-3">
                  {stats.por_tipo_cancer.map((item, i) => {
                    const cfg = tipoConfig[item.tipo] ?? { cor: '#94a3b8', icone: '🔬', label: item.tipo }
                    const pct = maxTipoCancer > 0 ? (item.total / maxTipoCancer) * 100 : 0

                    return (
                      <div key={item.tipo} id={`bar-${item.tipo.toLowerCase()}`} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span>{cfg.icone}</span>
                            <span className="text-sm font-semibold text-slate-300">{cfg.label}</span>
                          </div>
                          <span className="text-sm font-mono font-bold" style={{ color: cfg.cor }}>
                            {formatNum(item.total)}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              background: `linear-gradient(90deg, ${cfg.cor}aa, ${cfg.cor})`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Mensagem quando banco está vazio */}
            {stats.total_pacientes === 0 && (
              <div className="glass-card p-8 text-center animate-fade-in-up-delay-3">
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-lg font-bold text-slate-300 mb-2">Base de dados vazia</h3>
                <p className="text-sm text-slate-500 mb-5">
                  Nenhum paciente cadastrado ainda. Inicie um rastreamento para ver os dados aqui.
                </p>
                <Link id="link-iniciar-rastreamento" href="/rastrear" className="btn-primary">
                  🔬 Iniciar primeiro rastreamento
                </Link>
              </div>
            )}
          </>
        )}

        {/* Links para outras rotas */}
        <nav className="glass-card p-5 animate-fade-in-up-delay-4" aria-label="Navegação rápida">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            🔗 Acesso Rápido
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { id: 'link-home', href: '/', label: '🏠 Início', sub: 'Página principal' },
              { id: 'link-rastrear-nav', href: '/rastrear', label: '🔬 Rastrear', sub: 'Novo questionário' },
              { id: 'link-api-health', href: '/api/health', label: '💚 API Health', sub: 'Status do sistema' },
              { id: 'link-api-stats', href: '/api/stats', label: '📊 API Stats', sub: 'JSON das métricas' },
              { id: 'link-api-pacientes', href: '/api/pacientes', label: '👥 API Pacientes', sub: 'POST para cadastrar' },
            ].map((link) => (
              <Link
                key={link.id}
                id={link.id}
                href={link.href}
                className="glass-card p-3 text-left hover:border-cyan-800 transition-all block"
                target={link.href.startsWith('/api') ? '_blank' : undefined}
              >
                <p className="text-sm font-semibold text-slate-200">{link.label}</p>
                <p className="text-xs text-slate-500">{link.sub}</p>
              </Link>
            ))}
          </div>
        </nav>

        <footer className="text-center mt-8 animate-fade-in-up-delay-4">
          <p className="text-xs text-slate-700">
            Rastreamento Oncológico em Massa · Next.js {' '} + Prisma + PostgreSQL
          </p>
        </footer>

      </div>
    </main>
  )
}
