import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { migrations, type MigrationStatus } from '@/lib/mock-data';
import { Plus, Filter, RefreshCw, Play, RotateCcw, Eye } from 'lucide-react';

const statusConfig: Record<MigrationStatus, { label: string; badge: 'success'|'info'|'error'|'warning'|'grey' }> = {
  completed:  { label: 'Concluído',  badge: 'success' },
  running:    { label: 'Executando', badge: 'info'    },
  validating: { label: 'Validando',  badge: 'warning' },
  failed:     { label: 'Falhou',     badge: 'error'   },
  pending:    { label: 'Pendente',   badge: 'grey'    },
};

const sourceLabel: Record<string, string> = {
  sqlserver: 'SQL Server', postgresql: 'PostgreSQL', mysql: 'MySQL',
};

const targetLabel: Record<string, string> = {
  databricks: 'Databricks', fabric: 'Microsoft Fabric',
};

const layerColor: Record<string, string> = {
  bronze: 'bg-ava-flame/10 text-ava-flame',
  silver: 'bg-ava-grey-30/30 text-ava-grey-60',
  gold:   'bg-ava-solar/20 text-ava-luminous',
};

export default function MigrationsPage() {
  const total  = migrations.length;
  const done   = migrations.filter((m) => m.status === 'completed').length;
  const running = migrations.filter((m) => m.status === 'running' || m.status === 'validating').length;
  const failed  = migrations.filter((m) => m.status === 'failed').length;

  return (
    <>
      <Header title="Migrações" />
      <main className="pt-16 p-8 space-y-6">

        {/* Summary row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total', value: total,   color: 'text-ava-grey-80' },
            { label: 'Concluídas', value: done, color: 'text-ava-success' },
            { label: 'Em execução', value: running, color: 'text-ava-info' },
            { label: 'Falharam', value: failed, color: 'text-ava-thermal' },
          ].map(({ label, value, color }) => (
            <div key={label} className="ava-card p-4 text-center">
              <p className={`text-3xl font-bold mb-1 ${color}`}>{value}</p>
              <p className="text-xs text-ava-grey-50">{label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="ava-card p-0 overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b border-ava-grey-10">
            <h2 className="font-semibold text-ava-grey-80">Todas as migrações</h2>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 text-xs text-ava-grey-60 hover:text-ava-orange transition-colors">
                <Filter size={13} /> Filtrar
              </button>
              <button className="flex items-center gap-1.5 text-xs text-ava-grey-60 hover:text-ava-orange transition-colors">
                <RefreshCw size={13} /> Atualizar
              </button>
              <Button size="sm">
                <Plus size={14} /> Nova migração
              </Button>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="bg-ava-grey-10 text-[11px] font-semibold text-ava-grey-50 uppercase tracking-wider">
                <th className="px-6 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Fonte → Destino</th>
                <th className="px-4 py-3 text-left">Estratégia</th>
                <th className="px-4 py-3 text-left">Layer</th>
                <th className="px-4 py-3 text-left">Progresso</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Duração</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ava-grey-10">
              {migrations.map((m) => {
                const { label, badge } = statusConfig[m.status];
                const pct = m.totalRows > 0 ? Math.round((m.rowsMigrated / m.totalRows) * 100) : 0;
                return (
                  <tr key={m.id} className="hover:bg-ava-grey-10/40 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-ava-grey-80 max-w-[220px] truncate">{m.name}</p>
                      <p className="text-[11px] text-ava-grey-40 mt-0.5">{m.source.database}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-ava-grey-60">
                        <span className="font-medium">{sourceLabel[m.source.type]}</span>
                        <span className="text-ava-grey-30">→</span>
                        <span className="font-medium">{targetLabel[m.target.type]}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={m.strategy === 'incremental' ? 'outline' : 'grey'}>
                        {m.strategy === 'incremental' ? 'Incremental' : 'Full Load'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-ava-sm ${layerColor[m.layer]}`}>
                        {m.layer}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="w-20 h-1.5 bg-ava-grey-10 rounded-full">
                        <div
                          className={`h-1.5 rounded-full ${
                            m.status === 'failed' ? 'bg-ava-thermal' :
                            m.status === 'completed' ? 'bg-ava-success' : 'bg-ava-orange'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-ava-grey-40 mt-0.5 block">
                        {(m.rowsMigrated / 1000).toFixed(0)}k / {(m.totalRows / 1000).toFixed(0)}k
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={badge}>{label}</Badge>
                    </td>
                    <td className="px-4 py-4 text-xs text-ava-grey-50">
                      {m.duration ?? (m.status === 'running' ? '⏱ em andamento' : '—')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-ava-sm hover:bg-ava-grey-10 text-ava-grey-50 hover:text-ava-orange transition-colors">
                          <Eye size={14} />
                        </button>
                        {m.status === 'failed' && (
                          <button className="p-1.5 rounded-ava-sm hover:bg-ava-grey-10 text-ava-grey-50 hover:text-ava-orange transition-colors">
                            <RotateCcw size={14} />
                          </button>
                        )}
                        {m.status === 'pending' && (
                          <button className="p-1.5 rounded-ava-sm hover:bg-ava-orange/10 text-ava-grey-50 hover:text-ava-orange transition-colors">
                            <Play size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
