import Link from 'next/link'

// ============================================================
// Dados para os cards de estatísticas e tipos de câncer
// ============================================================

const stats = [
  {
    id: 'stat-pacientes',
    label: 'Pacientes Cadastrados',
    value: '—',
    icon: '👥',
    gradient: 'var(--gradient-teal)',
    description: 'Total na base de dados',
  },
  {
    id: 'stat-rastreamentos',
    label: 'Rastreamentos Gerados',
    value: '—',
    icon: '🔬',
    gradient: 'var(--gradient-purple)',
    description: 'Protocolos emitidos',
  },
  {
    id: 'stat-taxa',
    label: 'Taxa de Detecção',
    value: '—',
    icon: '📊',
    gradient: 'var(--gradient-coral)',
    description: 'Pacientes em risco identificados',
  },
  {
    id: 'stat-alertas',
    label: 'Alertas Prioritários',
    value: '—',
    icon: '⚠️',
    gradient: 'var(--gradient-green)',
    description: 'Requerem atenção imediata',
  },
]

const cancerTypes = [
  {
    id: 'cancer-pulmonar',
    tipo: 'PULMONAR',
    icon: '🫁',
    criterio: 'Tabagismo ≥ 20 maços-ano, idade 50–80 anos',
    protocolo: 'TC de baixa dose anual',
    color: '#0ed2f7',
  },
  {
    id: 'cancer-colorretal',
    tipo: 'COLORRETAL',
    icon: '🩺',
    criterio: 'Idade ≥ 45 anos, histórico familiar ou pólipos',
    protocolo: 'Colonoscopia a cada 10 anos',
    color: '#10b981',
  },
  {
    id: 'cancer-mama',
    tipo: 'MAMA',
    icon: '🎗️',
    criterio: 'Sexo feminino, idade 50–74 anos',
    protocolo: 'Mamografia bienal',
    color: '#f472b6',
  },
  {
    id: 'cancer-cervical',
    tipo: 'CERVICAL',
    icon: '🔭',
    criterio: 'Sexo feminino, 21–65 anos, sexualmente ativa',
    protocolo: 'Papanicolaou a cada 3 anos',
    color: '#a855f7',
  },
  {
    id: 'cancer-prostata',
    tipo: 'PRÓSTATA',
    icon: '⚕️',
    criterio: 'Sexo masculino, idade ≥ 50 anos, raça negra ou familiar',
    protocolo: 'PSA + toque retal anual',
    color: '#f97316',
  },
  {
    id: 'cancer-pele',
    tipo: 'PELE (MELANOMA)',
    icon: '☀️',
    criterio: 'Exposição solar crônica, nevos atípicos, pele clara',
    protocolo: 'Dermatoscopia anual',
    color: '#fbbf24',
  },
]

// ============================================================
// Componentes internos da página
// ============================================================

function StatCard({
  id,
  label,
  value,
  icon,
  gradient,
  description,
  delay,
}: (typeof stats)[0] & { delay: number }) {
  return (
    <div
      id={id}
      className="glass-card p-6 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: gradient, boxShadow: `0 4px 20px ${gradient.includes('0ed2f7') ? 'rgba(14,210,247,0.3)' : 'rgba(168,85,247,0.3)'}` }}
        >
          {icon}
        </div>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Live</span>
      </div>
      <p className="text-3xl font-bold text-slate-100 mb-1 font-mono">{value}</p>
      <p className="text-sm font-semibold text-slate-300 mb-1">{label}</p>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  )
}

function CancerCard({
  id,
  tipo,
  icon,
  criterio,
  protocolo,
  color,
  delay,
}: (typeof cancerTypes)[0] & { delay: number }) {
  return (
    <div
      id={id}
      className="glass-card p-5 animate-fade-in-up group cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `${color}20`, border: `1px solid ${color}40` }}
        >
          {icon}
        </div>
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color }}
        >
          {tipo}
        </span>
      </div>
      <p className="text-sm text-slate-400 mb-2 leading-relaxed">
        <span className="text-slate-500 text-xs">Critério: </span>{criterio}
      </p>
      <div
        className="text-xs font-medium px-3 py-1.5 rounded-lg inline-block"
        style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
      >
        📋 {protocolo}
      </div>
    </div>
  )
}

// ============================================================
// Página Principal
// ============================================================

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--gradient-hero)' }}>

      {/* Fundo decorativo com círculos de gradiente */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'var(--gradient-teal)' }}
        />
        <div
          className="absolute top-1/3 -left-32 w-80 h-80 rounded-full opacity-8 blur-3xl"
          style={{ background: 'var(--gradient-purple)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full opacity-8 blur-3xl"
          style={{ background: 'var(--gradient-coral)' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">

        {/* ========== Header / Navbar ========== */}
        <header className="flex items-center justify-between mb-16 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl animate-pulse-glow"
              style={{ background: 'var(--gradient-teal)' }}
            >
              🎯
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100 leading-tight">
                Rastreamento Oncológico
              </h1>
              <p className="text-xs text-slate-500 font-medium">em Massa · v1.0.0</p>
            </div>
          </div>

          <nav className="flex items-center gap-3" aria-label="Navegação principal">
            <Link
              id="nav-dashboard"
              href="/dashboard"
              className="btn-secondary text-sm"
            >
              <span>📊 Dashboard</span>
            </Link>
            <Link
              id="nav-novo-paciente"
              href="/rastrear"
              className="btn-primary text-sm"
              aria-label="Iniciar rastreamento"
            >
              🔬 Iniciar Rastreamento
            </Link>
          </nav>
        </header>

        {/* ========== Hero Section ========== */}
        <section className="text-center mb-16 animate-fade-in-up-delay-1" aria-labelledby="hero-title">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: 'rgba(14, 210, 247, 0.1)', border: '1px solid rgba(14, 210, 247, 0.25)' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
              Sistema Operacional
            </span>
          </div>

          <h2 id="hero-title" className="text-5xl font-black mb-4 leading-tight tracking-tight">
            <span className="text-gradient-hero">Detecção Precoce</span>
            <br />
            <span className="text-slate-300 text-4xl font-bold">de Câncer via WhatsApp</span>
          </h2>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Plataforma inteligente de rastreamento oncológico em escala populacional.
            Identifica pacientes em risco com base em critérios clínicos validados e
            gera protocolos de rastreamento personalizados automaticamente.
          </p>

          <div className="flex items-center justify-center gap-4 mt-8">
            <Link
              id="cta-iniciar-rastreamento"
              href="/rastrear"
              className="btn-primary"
              aria-label="Iniciar rastreamento oncológico"
            >
              🔬 Iniciar Rastreamento
            </Link>
            <Link
              id="cta-ver-relatorios"
              href="/dashboard"
              className="btn-secondary"
              aria-label="Ver painel administrativo"
            >
              📊 Ver Dashboard
            </Link>
          </div>
        </section>

        {/* ========== Cards de Estatísticas ========== */}
        <section className="mb-16" aria-label="Estatísticas do sistema">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 animate-fade-in-up-delay-2">
            📈 Métricas em Tempo Real
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <StatCard key={stat.id} {...stat} delay={200 + i * 80} />
            ))}
          </div>
        </section>

        {/* ========== Protocolos de Rastreamento ========== */}
        <section className="mb-16" aria-label="Tipos de câncer monitorados">
          <div className="flex items-center justify-between mb-6 animate-fade-in-up-delay-3">
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                🎗️ Protocolos Clínicos Ativos
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Baseados nas diretrizes INCA 2024 e USPSTF
              </p>
            </div>
            <span className="text-xs font-semibold text-cyan-400 bg-cyan-950 px-3 py-1 rounded-full border border-cyan-900">
              {cancerTypes.length} protocolos
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cancerTypes.map((cancer, i) => (
              <CancerCard key={cancer.id} {...cancer} delay={300 + i * 70} />
            ))}
          </div>
        </section>

        {/* ========== Schema do Banco de Dados ========== */}
        <section className="mb-16 animate-fade-in-up-delay-4" aria-label="Estrutura do banco de dados">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">
            🗄️ Estrutura do Banco de Dados
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tabela pacientes */}
            <div id="db-pacientes" className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-cyan-400 font-mono text-sm font-bold">pacientes</span>
                <span className="text-xs text-slate-600 font-mono">(tabela)</span>
              </div>
              <ul className="space-y-2">
                {[
                  { col: 'id', type: 'UUID', pk: true },
                  { col: 'whatsapp_hash', type: 'String', pk: false },
                  { col: 'idade', type: 'Int', pk: false },
                  { col: 'sexo_biologico', type: 'Enum', pk: false },
                  { col: 'data_cadastro', type: 'DateTime', pk: false },
                ].map(({ col, type, pk }) => (
                  <li key={col} className="flex items-center gap-2 text-xs font-mono">
                    {pk && <span className="text-yellow-400 text-xs" title="Primary Key">🔑</span>}
                    {!pk && <span className="w-4" />}
                    <span className="text-slate-300">{col}</span>
                    <span className="text-slate-600 ml-auto">{type}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tabela respostas_questionario */}
            <div id="db-respostas" className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-purple-400 font-mono text-sm font-bold">respostas_questionario</span>
                <span className="text-xs text-slate-600 font-mono">(tabela)</span>
              </div>
              <ul className="space-y-2">
                {[
                  { col: 'id', type: 'UUID', pk: true },
                  { col: 'paciente_id', type: 'UUID', fk: true },
                  { col: 'chave_pergunta', type: 'String', pk: false },
                  { col: 'valor_resposta', type: 'String', pk: false },
                ].map(({ col, type, pk, fk }) => (
                  <li key={col} className="flex items-center gap-2 text-xs font-mono">
                    {pk && <span className="text-yellow-400 text-xs" title="Primary Key">🔑</span>}
                    {fk && <span className="text-blue-400 text-xs" title="Foreign Key">🔗</span>}
                    {!pk && !fk && <span className="w-4" />}
                    <span className="text-slate-300">{col}</span>
                    <span className="text-slate-600 ml-auto">{type}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tabela rastreamentos_gerados */}
            <div id="db-rastreamentos" className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-emerald-400 font-mono text-sm font-bold">rastreamentos_gerados</span>
                <span className="text-xs text-slate-600 font-mono">(tabela)</span>
              </div>
              <ul className="space-y-2">
                {[
                  { col: 'id', type: 'UUID', pk: true },
                  { col: 'paciente_id', type: 'UUID', fk: true },
                  { col: 'tipo_cancer', type: 'String', pk: false },
                  { col: 'criterio_clinico', type: 'String', pk: false },
                  { col: 'data_geracao', type: 'DateTime', pk: false },
                ].map(({ col, type, pk, fk }) => (
                  <li key={col} className="flex items-center gap-2 text-xs font-mono">
                    {pk && <span className="text-yellow-400 text-xs" title="Primary Key">🔑</span>}
                    {fk && <span className="text-blue-400 text-xs" title="Foreign Key">🔗</span>}
                    {!pk && !fk && <span className="w-4" />}
                    <span className="text-slate-300">{col}</span>
                    <span className="text-slate-600 ml-auto">{type}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ========== Footer ========== */}
        <footer className="text-center border-t border-slate-800 pt-8 animate-fade-in-up-delay-4">
          <p className="text-xs text-slate-600">
            Rastreamento Oncológico em Massa · Powered by{' '}
            <span className="text-cyan-500">Next.js</span> +{' '}
            <span className="text-purple-400">Prisma ORM</span> +{' '}
            <span className="text-emerald-400">PostgreSQL</span> · Deploy via{' '}
            <span className="text-teal-400">Netlify</span>
          </p>
          <p className="text-xs text-slate-700 mt-2">
            ⚠️ Uso restrito a profissionais de saúde autorizados. Dados protegidos por LGPD.
          </p>
        </footer>

      </div>
    </main>
  )
}
