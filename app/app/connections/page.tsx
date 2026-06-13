import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { connections } from '@/lib/mock-data';
import { Plus, RefreshCw, Trash2, Settings, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const typeLabel: Record<string, string> = {
  postgresql: 'PostgreSQL',
  sqlserver:  'SQL Server',
  mysql:      'MySQL',
  databricks: 'Databricks',
  fabric:     'Microsoft Fabric',
};

const typeIcon: Record<string, string> = {
  postgresql: '🐘', sqlserver: '🔷', mysql: '🐬',
  databricks: '⚡', fabric:    '◈',
};

const typeBadge: Record<string, 'orange' | 'info' | 'grey'> = {
  postgresql: 'grey', sqlserver: 'grey', mysql: 'grey',
  databricks: 'orange', fabric: 'info',
};

const sources = connections.filter((c) =>
  ['postgresql', 'sqlserver', 'mysql'].includes(c.type)
);
const targets = connections.filter((c) =>
  ['databricks', 'fabric'].includes(c.type)
);

function ConnectionCard({ conn }: { conn: typeof connections[0] }) {
  return (
    <div className="ava-card p-5 flex items-start justify-between group">
      <div className="flex items-start gap-3">
        <div className="text-2xl leading-none mt-0.5">{typeIcon[conn.type]}</div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm text-ava-grey-80">{conn.name}</p>
            <Badge variant={typeBadge[conn.type]}>{typeLabel[conn.type]}</Badge>
          </div>
          {conn.host && <p className="text-xs text-ava-grey-50">{conn.host}</p>}
          {conn.database && <p className="text-xs text-ava-grey-40">{conn.database}</p>}
          {conn.workspace && <p className="text-xs text-ava-grey-50">{conn.workspace}</p>}
          {conn.tables !== undefined && (
            <p className="text-xs text-ava-grey-40 mt-1">{conn.tables} tabelas detectadas</p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-3">
        {/* Status */}
        <div className="flex items-center gap-1.5">
          {conn.status === 'connected' && (
            <>
              <CheckCircle2 size={13} className="text-ava-success" />
              <span className="text-xs text-ava-success font-medium">Conectado</span>
            </>
          )}
          {conn.status === 'error' && (
            <>
              <AlertCircle size={13} className="text-ava-thermal" />
              <span className="text-xs text-ava-thermal font-medium">Erro</span>
            </>
          )}
          {conn.status === 'testing' && (
            <>
              <Loader2 size={13} className="text-ava-luminous animate-spin" />
              <span className="text-xs text-ava-luminous font-medium">Testando...</span>
            </>
          )}
        </div>
        <span className="text-[10px] text-ava-grey-40">Testado {conn.lastTested}</span>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 rounded-ava-sm hover:bg-ava-grey-10 text-ava-grey-40 hover:text-ava-orange transition-colors">
            <RefreshCw size={13} />
          </button>
          <button className="p-1.5 rounded-ava-sm hover:bg-ava-grey-10 text-ava-grey-40 hover:text-ava-grey-70 transition-colors">
            <Settings size={13} />
          </button>
          <button className="p-1.5 rounded-ava-sm hover:bg-red-50 text-ava-grey-40 hover:text-ava-thermal transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConnectionsPage() {
  const ok    = connections.filter((c) => c.status === 'connected').length;
  const err   = connections.filter((c) => c.status === 'error').length;

  return (
    <>
      <Header title="Conexões" />
      <main className="pt-16 p-8 space-y-8">

        {/* Summary */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-ava-success" />
            <span className="text-sm text-ava-grey-70"><strong>{ok}</strong> conectadas</span>
          </div>
          {err > 0 && (
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="text-ava-thermal" />
              <span className="text-sm text-ava-thermal"><strong>{err}</strong> com erro</span>
            </div>
          )}
          <Button size="sm" className="ml-auto">
            <Plus size={14} /> Nova conexão
          </Button>
        </div>

        {/* Sources */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="ava-accent-bar" />
            <h2 className="font-semibold text-ava-grey-80">Fontes (SQL)</h2>
            <Badge variant="grey">{sources.length}</Badge>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map((c) => <ConnectionCard key={c.id} conn={c} />)}

            {/* Add source CTA */}
            <div className="border-2 border-dashed border-ava-grey-20 rounded-ava-sm p-5 flex flex-col items-center
                            justify-center gap-2 text-ava-grey-40 hover:border-ava-orange hover:text-ava-orange
                            transition-colors cursor-pointer group min-h-[100px]">
              <Plus size={20} className="group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium">Adicionar fonte</p>
              <p className="text-xs text-center">SQL Server, PostgreSQL ou MySQL</p>
            </div>
          </div>
        </div>

        {/* Targets */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="ava-accent-bar--gradient" />
            <h2 className="font-semibold text-ava-grey-80">Destinos (Cloud)</h2>
            <Badge variant="orange">{targets.length}</Badge>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {targets.map((c) => <ConnectionCard key={c.id} conn={c} />)}

            <div className="border-2 border-dashed border-ava-grey-20 rounded-ava-sm p-5 flex flex-col items-center
                            justify-center gap-2 text-ava-grey-40 hover:border-ava-orange hover:text-ava-orange
                            transition-colors cursor-pointer group min-h-[100px]">
              <Plus size={20} className="group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium">Adicionar destino</p>
              <p className="text-xs text-center">Databricks ou Microsoft Fabric</p>
            </div>
          </div>
        </div>

        {/* AI tip */}
        <div className="bg-ava-master/5 border border-ava-orange/20 rounded-ava-sm p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-ava-sm bg-ava-master flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">✦</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-ava-grey-80 mb-1">AI Schema Mapper disponível</p>
              <p className="text-sm text-ava-grey-60">
                Ao conectar uma nova fonte, o agente <code className="text-xs bg-ava-grey-10 px-1.5 py-0.5 rounded">source-inspector</code> mapeia
                automaticamente todas as tabelas e sugere mapeamentos de tipos para Delta Lake ou Fabric.
                Nenhuma configuração manual necessária.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
