import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { migrations, metrics, recentActivity, type MigrationStatus } from '@/lib/mock-data';
import {
  ArrowRightLeft, Database, CheckCircle2, TrendingUp,
  Clock, Zap, Plus, ChevronRight, AlertCircle,
} from 'lucide-react';

function MetricCard({ label, value, sub, icon: Icon, accent = false }: {
  label: string; value: string; sub: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent?: boolean;
}) {
  return (
    <div className={accent
      ? 'bg-ava-master rounded-ava-sm p-6 shadow-ava-brand text-white'
      : 'ava-card p-6'}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm font-medium ${accent ? 'text-white/70' : 'text-ava-grey-50'}`}>{label}</span>
        <div className={`w-9 h-9 rounded-ava-sm flex items-center justify-center
          ${accent ? 'bg-white/15' : 'bg-ava-orange/10'}`}>
          <Icon size={17} className={accent ? 'text-white' : 'text-ava-orange'} />
        </div>
      </div>
      <p className={`text-3xl font-bold mb-1 ${accent ? 'text-white' : 'text-ava-grey-80'}`}>{value}</p>
      <p className={`text-xs ${accent ? 'text-white/60' : 'text-ava-grey-40'}`}>{sub}</p>
    </div>
  );
}

const statusConfig: Record<MigrationStatus, { label: string; badge: 'success' | 'info' | 'error' | 'warning' | 'grey' }> = {
  completed:  { label: 'Concluído',  badge: 'success' },
  running:    { label: 'Executando', badge: 'info'    },
  validating: { label: 'Validando',  badge: 'warning' },
  failed:     { label: 'Falhou',     badge: 'error'   },
  pending:    { label: 'Pendente',   badge: 'grey'    },
};

const sourceIcon: Record<string, string> = {
  sqlserver:  '🔷',
  postgresql: '🐘',
  mysql:      '🐬',
};

const targetIcon: Record<string, string> = {
  databricks: '⚡',
  fabric:     '◈',
};

export default function DashboardPage() {
  const active = migrations.filter((m) => m.status === 'running' || m.status === 'validating');

  return (
    <>
      <Header title="Dashboard" />
      <main className="pt-16 p-8 space-y-8">

        {/* Active alert */}
        {active.length > 0 && (
          <div className="flex items-center gap-3 bg-ava-info/10 border border-ava-info/20 rounded-ava-sm p-4">
            <div className="w-2 h-2 rounded-full bg-ava-info animate-pulse-slow" />
            <span className="text-sm text-ava-info font-medium">
              {active.length} migração{active.length > 1 ? 'ões' : ''} ativa{active.length > 1 ? 's' : ''} agora
            </span>
            <Link href="/app/migrations" className="ml-auto text-xs text-ava-info font-semibold hover:underline flex items-center gap-1">
              Ver detalhes <ChevronRight size={12} />
            </Link>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Migrações este mês"  value="38"             sub="+12 vs mês anterior"          icon={ArrowRightLeft} accent />
          <MetricCard label="Linhas migradas"      value="38.2M"          sub="de 50M do plano Pro"           icon={Database}       />
          <MetricCard label="Taxa de sucesso"      value={`${metrics.successRate}%`} sub="últimos 30 dias"   icon={CheckCircle2}   />
          <MetricCard label="Economia vs. manual"  value={`${metrics.savedVsTraditional}%`} sub="de tempo operacional" icon={TrendingUp} />
        </div>

        {/* Two columns: migrations + activity */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Migrations table */}
          <div className="lg:col-span-2 ava-card p-0 overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-ava-grey-10">
              <h2 className="font-semibold text-ava-grey-80">Migrações recentes</h2>
              <Link href="/app/migrations">
                <Button size="sm" variant="secondary">Ver todas</Button>
              </Link>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-ava-grey-10 text-xs font-semibold text-ava-grey-50 uppercase tracking-wider">
                  <th className="px-6 py-3 text-left">Migração</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Progresso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ava-grey-10">
                {migrations.slice(0, 4).map((m) => {
                  const { label, badge } = statusConfig[m.status];
                  const pct = m.totalRows > 0 ? Math.round((m.rowsMigrated / m.totalRows) * 100) : 0;
                  return (
                    <tr key={m.id} className="hover:bg-ava-grey-10/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span>{sourceIcon[m.source.type]}</span>
                          <span className="text-xs text-ava-grey-40">→</span>
                          <span>{targetIcon[m.target.type]}</span>
                          <span className="text-sm font-medium text-ava-grey-80 ml-1 truncate max-w-[180px]">{m.name}</span>
                        </div>
                        <div className="flex items-center gap-2 ml-7">
                          <Clock size={11} className="text-ava-grey-40" />
                          <span className="text-xs text-ava-grey-40">{m.source.database}</span>
                          <Badge variant="grey" className="text-[9px]">{m.layer}</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={badge}>{label}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="text-xs text-ava-grey-60 mb-1">
                          {(m.rowsMigrated / 1_000_000).toFixed(1)}M / {(m.totalRows / 1_000_000).toFixed(1)}M
                        </div>
                        <div className="w-24 h-1.5 bg-ava-grey-10 rounded-full ml-auto">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              m.status === 'failed' ? 'bg-ava-thermal' :
                              m.status === 'completed' ? 'bg-ava-success' : 'bg-ava-orange'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-ava-grey-40 mt-0.5 block">{pct}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Activity feed */}
          <div className="ava-card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-ava-grey-10">
              <h2 className="font-semibold text-ava-grey-80">Atividade recente</h2>
            </div>
            <div className="divide-y divide-ava-grey-10">
              {recentActivity.map((a, i) => (
                <div key={i} className="px-6 py-3.5 flex gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    a.type === 'success' ? 'bg-ava-success/10' :
                    a.type === 'error'   ? 'bg-ava-thermal/10' : 'bg-ava-info/10'
                  }`}>
                    {a.type === 'success'
                      ? <CheckCircle2 size={12} className="text-ava-success" />
                      : a.type === 'error'
                      ? <AlertCircle  size={12} className="text-ava-thermal" />
                      : <Zap          size={12} className="text-ava-info" />}
                  </div>
                  <div>
                    <p className="text-xs text-ava-grey-70 leading-relaxed">{a.event}</p>
                    <p className="text-[10px] text-ava-grey-40 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: 'Nova Migração',   desc: 'Configure e execute uma nova migração', icon: Plus,           href: '/app/migrations', primary: true  },
            { title: 'Adicionar Fonte', desc: 'Conecte um novo banco SQL',              icon: Database,       href: '/app/connections', primary: false },
            { title: 'Ver Monitor',     desc: 'Acompanhe execuções em tempo real',      icon: TrendingUp,     href: '/app/monitor',     primary: false },
          ].map(({ title, desc, icon: Icon, href, primary }) => (
            <Link key={title} href={href}>
              <div className={`ava-card p-5 flex items-center gap-4 group ${primary ? 'border-t-ava-orange' : ''}`}>
                <div className={`w-10 h-10 rounded-ava-sm flex items-center justify-center transition-all
                  ${primary ? 'bg-ava-orange group-hover:bg-ava-dark-orange' : 'bg-ava-grey-10 group-hover:bg-ava-orange'}`}>
                  <Icon size={18} className={primary ? 'text-white' : 'text-ava-grey-60 group-hover:text-white'} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-ava-grey-80">{title}</p>
                  <p className="text-xs text-ava-grey-50 mt-0.5">{desc}</p>
                </div>
                <ChevronRight size={16} className="ml-auto text-ava-grey-30 group-hover:text-ava-orange transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
