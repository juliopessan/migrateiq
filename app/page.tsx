import Link from 'next/link';
import {
  Zap, Database, ArrowRightLeft, Shield, Cpu, Clock,
  CheckCircle, BarChart2, GitBranch, ChevronRight,
  Globe, Building2, ShieldCheck, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

/* ─── Nav ─────────────────────────────────────────────────────────── */
function Nav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-b border-ava-grey-10">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-ava-sm bg-ava-master flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-ava-grey-80 text-xl tracking-tight">MigrateIQ</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-ava-grey-60 font-medium">
          {['Produto', 'Preços', 'Docs', 'Blog'].map((item) => (
            <a key={item} href="#" className="hover:text-ava-orange transition-colors">{item}</a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/app/dashboard" className="text-sm font-semibold text-ava-grey-80 hover:text-ava-orange transition-colors hidden md:block">
            Entrar
          </Link>
          <Link href="/app/dashboard">
            <Button size="sm">Começar grátis</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero ─────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 bg-ava-grey-80">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-20"
        style={{ background: 'radial-gradient(ellipse, #FF5800 0%, transparent 65%)' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 opacity-10"
        style={{ background: 'radial-gradient(ellipse, #890078 0%, transparent 65%)' }} />

      <div className="relative max-w-7xl mx-auto px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-ava-success animate-pulse-slow" />
          <span className="text-xs text-ava-grey-30 font-medium">Plataforma AI-Native · Orquestração Multi-Agente</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-light text-white leading-tight tracking-tight mb-6">
          Migração de dados{' '}
          <span className="ava-gradient-text font-bold">sem fricção</span>
          <br />para a nuvem
        </h1>

        <p className="text-lg md:text-xl text-ava-grey-30 max-w-3xl mx-auto mb-10 font-light leading-relaxed">
          Do SQL Server, PostgreSQL e MySQL para Databricks e Microsoft Fabric —
          orquestrado por agentes de IA. Schema mapping automático. Incrementais com watermark.
          Validação em tempo real.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/app/dashboard">
            <Button size="lg" variant="gradient">
              Começar grátis <ChevronRight size={18} />
            </Button>
          </Link>
          <Button size="lg" variant="ghost">
            Ver demo ao vivo
          </Button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-ava-lg overflow-hidden border border-white/10">
          {[
            { value: '4.8B+', label: 'Linhas migradas' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '12×',   label: 'Mais rápido que ETL manual' },
            { value: '97.4%', label: 'Taxa de sucesso' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white/5 py-6 px-4">
              <p className="text-3xl font-bold text-white mb-1">{value}</p>
              <p className="text-xs text-ava-grey-40 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─────────────────────────────────────────────────────── */
const features = [
  {
    icon: Cpu,
    title: 'AI Schema Mapper',
    desc: 'Detecta e mapeia automaticamente colunas equivalentes entre sistemas. Aprende com cada migração via feedback loop.',
    tag: 'AI-Native',
  },
  {
    icon: GitBranch,
    title: 'Incremental com Watermark',
    desc: 'Detecta automaticamente colunas de timestamp para cargas incrementais. Checkpoint automático em caso de falha.',
    tag: 'Delta Load',
  },
  {
    icon: BarChart2,
    title: 'Validação em Tempo Real',
    desc: 'Row count parity, unicidade de PKs, null rates — gated automaticamente antes de cada batch ser confirmado.',
    tag: 'Quality Gates',
  },
  {
    icon: Database,
    title: 'Medallion Architecture',
    desc: 'Bronze → Silver → Gold gerado automaticamente com colunas de auditoria, lineage e metadados de migração.',
    tag: 'Lakehouse',
  },
  {
    icon: ArrowRightLeft,
    title: 'Multi-Source & Target',
    desc: 'SQL Server, PostgreSQL, MySQL → Databricks Delta Lake ou Microsoft Fabric. Conexões simultâneas, isoladas.',
    tag: 'Conectores',
  },
  {
    icon: Shield,
    title: 'Mascaramento & Compliance',
    desc: 'PII masking em nível de coluna, regras por tabela via YAML. Logs de auditoria completos para LGPD e SOX.',
    tag: 'Segurança',
  },
];

function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <div className="ava-accent-bar--gradient mx-auto mb-5" />
          <h2 className="text-4xl font-light text-ava-grey-80 mb-4">
            Construído para <span className="font-semibold text-ava-orange">engenharia de dados</span> real
          </h2>
          <p className="text-lg text-ava-grey-60 max-w-2xl mx-auto font-light">
            Não é mais um wrapper de ETL. É uma plataforma AI-native onde cada decisão de migração
            é tomada, monitorada e aprendida por agentes especializados.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, tag }, i) => (
            <div
              key={title}
              className={`group ${i === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}
            >
              {i === 0 ? (
                /* Feature principal — destaque com gradiente */
                <div className="ava-card-gradient-border h-full p-6 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-ava-orange/5 to-ava-aurora/5 pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-ava-sm bg-ava-master flex items-center justify-center shadow-ava-brand">
                        <Icon size={22} className="text-white" />
                      </div>
                      <Badge variant="orange">{tag}</Badge>
                    </div>
                    <h3 className="font-bold text-ava-grey-80 text-lg mb-2">{title}</h3>
                    <p className="text-sm text-ava-grey-60 leading-relaxed">{desc}</p>
                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-ava-orange">
                      Saiba mais <ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="ava-card p-6 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-ava-sm bg-ava-orange/10 flex items-center justify-center
                                    group-hover:bg-ava-orange group-hover:shadow-ava-brand transition-all">
                      <Icon size={20} className="text-ava-orange group-hover:text-white transition-colors" />
                    </div>
                    <Badge variant="grey">{tag}</Badge>
                  </div>
                  <h3 className="font-semibold text-ava-grey-80 mb-2">{title}</h3>
                  <p className="text-sm text-ava-grey-60 leading-relaxed">{desc}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How it works ─────────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Conecte a fonte',
      desc: 'SQL Server, PostgreSQL ou MySQL. O inspetor de fontes mapeia automaticamente todo o schema em segundos — sem configuração manual.',
    },
    {
      n: '02',
      title: 'Configure o manifesto',
      desc: 'YAML simples com fonte, destino, estratégia e regras de transformação. O AI Schema Mapper sugere mapeamentos de tipos automaticamente.',
    },
    {
      n: '03',
      title: 'Execute e monitore',
      desc: 'MigrateIQ orquestra a migração em paralelo com múltiplos agentes especializados. Checkpoints automáticos garantem retomada em caso de falha.',
    },
  ];

  return (
    <section className="py-24 bg-ava-grey-10">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <div className="ava-accent-bar--gradient mx-auto mb-5" />
          <h2 className="text-4xl font-light text-ava-grey-80 mb-4">
            Migrate em <span className="font-semibold">3 passos</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-0 items-start">
          {steps.map(({ n, title, desc }, i) => (
            <div key={n} className="relative flex items-start">
              {/* Step card */}
              <div className="flex-1 relative">
                <div className="text-7xl font-bold text-ava-orange/10 absolute -top-4 -left-2 select-none">{n}</div>
                <div className="ava-card p-6 relative mx-4">
                  <span className="inline-block text-xs font-bold text-ava-orange mb-3 tracking-widest">{n}</span>
                  <h3 className="font-semibold text-ava-grey-80 text-lg mb-2">{title}</h3>
                  <p className="text-sm text-ava-grey-60 leading-relaxed">{desc}</p>
                </div>
              </div>
              {/* Connector arrow between steps */}
              {i < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center w-0 mt-12 relative z-10">
                  <ChevronRight size={20} className="text-ava-orange/40 -mx-2.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ──────────────────────────────────────────────────────── */
const plans = [
  {
    name: 'Starter',
    highlight: false,
    desc: 'Para explorar e provar o conceito.',
    features: ['1M linhas / mês', '1 fonte + 1 destino', 'Full load', 'Suporte comunidade'],
  },
  {
    name: 'Pro',
    highlight: true,
    desc: 'Para times de dados em produção.',
    features: ['50M linhas / mês', '5 conexões', 'Incremental + Watermark', 'AI Schema Mapper', 'Validação automática', 'Suporte prioritário'],
  },
  {
    name: 'Enterprise',
    highlight: false,
    desc: 'Para migrações de grande escala.',
    features: ['Linhas ilimitadas', 'Conexões ilimitadas', 'RBAC + Audit logs', 'SLA 99.9%', 'Suporte dedicado', 'Deploy on-prem'],
  },
];

function Pricing() {
  return (
    <section id="precos" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <div className="ava-accent-bar--gradient mx-auto mb-5" />
          <h2 className="text-4xl font-light text-ava-grey-80 mb-4">
            Preço <span className="font-semibold text-ava-orange">previsível</span>
          </h2>
          <p className="text-ava-grey-60 font-light">Sem surpresas. Sem cobrança por tabela ou conector.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map(({ name, highlight, desc, features }) => (
            <div
              key={name}
              className={highlight
                ? 'bg-ava-grey-80 rounded-ava-sm p-8 relative shadow-ava-lg ring-2 ring-ava-orange'
                : 'ava-card p-8'}
            >
              {highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="orange">Mais popular</Badge>
                </div>
              )}
              <h3 className={`font-semibold text-xl mb-1 ${highlight ? 'text-white' : 'text-ava-grey-80'}`}>{name}</h3>
              <p className={`text-sm mb-6 ${highlight ? 'text-ava-grey-30' : 'text-ava-grey-60'}`}>{desc}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className={`text-xl font-semibold ${highlight ? 'text-ava-grey-30' : 'text-ava-grey-50'}`}>Sob consulta</span>
              </div>
              <Button
                variant={highlight ? 'gradient' : 'secondary'}
                className="w-full mb-6"
              >
                Falar com vendas
              </Button>
              <ul className="space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle size={15} className={highlight ? 'text-ava-luminous' : 'text-ava-success'} />
                    <span className={highlight ? 'text-ava-grey-20' : 'text-ava-grey-60'}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Section ──────────────────────────────────────────────────── */
function CTA() {
  return (
    <section className="py-24 bg-ava-master relative overflow-hidden">
      <div className="absolute inset-0 opacity-10"
        style={{ background: 'radial-gradient(ellipse at 80% 50%, #FFD700 0%, transparent 60%)' }} />
      <div className="relative max-w-4xl mx-auto px-8 text-center">
        <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
          Migre com confiança.<br />Escale com dados.
        </h2>
        <p className="text-xl text-white/80 mb-10 font-light max-w-2xl mx-auto">
          Pare de gastar semanas com scripts ETL manuais. Migre seu primeiro banco em minutos.
        </p>
        <div className="flex flex-row gap-4 justify-center">
          <Link href="/app/dashboard">
            <Button size="lg" variant="gradient">
              Começar grátis <ChevronRight size={18} />
            </Button>
          </Link>
          <Button size="lg" variant="ghost">Ver documentação</Button>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-ava-grey-80 text-ava-grey-40 py-16">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-ava-sm bg-ava-master flex items-center justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <span className="font-bold text-white">MigrateIQ</span>
            </div>
            <p className="text-sm leading-relaxed">AI-powered data migration para Databricks e Microsoft Fabric.</p>
          </div>
          {[
            { title: 'Produto', links: ['Dashboard', 'Migrações', 'Conexões', 'Monitor', 'API'] },
            { title: 'Empresa', links: ['Sobre', 'Blog', 'Parceiros', 'Carreiras'] },
            { title: 'Legal', links: ['Privacidade', 'Termos', 'LGPD', 'Segurança'] },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="font-semibold text-white mb-4 text-sm">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm hover:text-ava-orange transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs">© 2026 MigrateIQ. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6 text-xs">
            <span className="flex items-center gap-1.5">
              <Globe size={12} /> São Paulo, Brasil
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 size={12} /> Parceiro Microsoft
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={12} /> SOC 2 · LGPD
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
