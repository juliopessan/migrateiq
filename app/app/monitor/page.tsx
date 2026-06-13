import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { migrations } from '@/lib/mock-data';
import { Clock, Zap } from 'lucide-react';

export default function MonitorPage() {
  const active = migrations.filter((m) => m.status === 'running' || m.status === 'validating');

  return (
    <>
      <Header title="Monitor em tempo real" />
      <main className="pt-16 p-8 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-ava-success animate-pulse-slow" />
          <span className="text-sm text-ava-grey-60">{active.length} migração(ões) ativa(s)</span>
        </div>

        {active.length === 0 && (
          <div className="ava-card p-12 text-center">
            <Clock size={32} className="text-ava-grey-30 mx-auto mb-4" />
            <p className="text-lg font-light text-ava-grey-50">Nenhuma migração ativa no momento.</p>
          </div>
        )}

        {active.map((m) => {
          const pct = m.totalRows > 0 ? Math.round((m.rowsMigrated / m.totalRows) * 100) : 0;
          return (
            <div key={m.id} className="ava-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Zap size={15} className="text-ava-orange" />
                    <h3 className="font-semibold text-ava-grey-80">{m.name}</h3>
                  </div>
                  <p className="text-xs text-ava-grey-50">{m.source.database} → {m.target.name}</p>
                </div>
                <Badge variant={m.status === 'validating' ? 'warning' : 'info'}>
                  {m.status === 'validating' ? 'Validando' : 'Executando'}
                </Badge>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-ava-grey-50 mb-1">
                  <span>{(m.rowsMigrated / 1_000).toFixed(0)}k linhas carregadas</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 bg-ava-grey-10 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-ava-master rounded-full transition-all duration-1000"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-ava-grey-40">
                <span>Tabelas: {m.tables}</span>
                <span>Estratégia: {m.strategy}</span>
                <span>Layer: {m.layer}</span>
              </div>
            </div>
          );
        })}
      </main>
    </>
  );
}
