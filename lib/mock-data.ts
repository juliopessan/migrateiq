export type MigrationStatus = 'completed' | 'running' | 'failed' | 'pending' | 'validating';
export type SourceType = 'postgresql' | 'sqlserver' | 'mysql';
export type TargetType = 'databricks' | 'fabric';

export interface Migration {
  id: string;
  name: string;
  source: { type: SourceType; host: string; database: string };
  target: { type: TargetType; name: string };
  strategy: 'full' | 'incremental';
  status: MigrationStatus;
  tables: number;
  rowsMigrated: number;
  totalRows: number;
  startedAt: string;
  duration?: string;
  layer: 'bronze' | 'silver' | 'gold';
}

export interface Connection {
  id: string;
  name: string;
  type: SourceType | TargetType;
  host?: string;
  database?: string;
  workspace?: string;
  status: 'connected' | 'error' | 'testing';
  lastTested: string;
  tables?: number;
}

export const migrations: Migration[] = [
  {
    id: 'mig-001',
    name: 'ERP Produção → Databricks Bronze',
    source: { type: 'sqlserver', host: 'erp-prod.company.com', database: 'ERP_PROD' },
    target: { type: 'databricks', name: 'prod-catalog.bronze' },
    strategy: 'full',
    status: 'completed',
    tables: 24,
    rowsMigrated: 4_823_100,
    totalRows: 4_823_100,
    startedAt: '2026-06-13T07:00:00Z',
    duration: '18m 42s',
    layer: 'bronze',
  },
  {
    id: 'mig-002',
    name: 'CRM Delta → Fabric Silver',
    source: { type: 'postgresql', host: 'crm-db.internal', database: 'crm_production' },
    target: { type: 'fabric', name: 'workspace-prod.silver' },
    strategy: 'incremental',
    status: 'running',
    tables: 8,
    rowsMigrated: 142_880,
    totalRows: 310_000,
    startedAt: '2026-06-13T09:10:00Z',
    layer: 'silver',
  },
  {
    id: 'mig-003',
    name: 'Financeiro Mensal → Databricks Gold',
    source: { type: 'mysql', host: 'fin-db.company.com', database: 'financeiro' },
    target: { type: 'databricks', name: 'prod-catalog.gold' },
    strategy: 'full',
    status: 'validating',
    tables: 12,
    rowsMigrated: 98_400,
    totalRows: 98_400,
    startedAt: '2026-06-13T08:45:00Z',
    duration: '4m 18s',
    layer: 'gold',
  },
  {
    id: 'mig-004',
    name: 'Legacy HR → Fabric Bronze',
    source: { type: 'sqlserver', host: 'hr-legacy.corp', database: 'HRSYSTEM' },
    target: { type: 'fabric', name: 'workspace-dev.bronze' },
    strategy: 'full',
    status: 'failed',
    tables: 6,
    rowsMigrated: 12_300,
    totalRows: 45_000,
    startedAt: '2026-06-12T22:00:00Z',
    duration: '2m 11s',
    layer: 'bronze',
  },
  {
    id: 'mig-005',
    name: 'Vendas Q2 → Databricks Silver',
    source: { type: 'postgresql', host: 'sales-db.internal', database: 'sales' },
    target: { type: 'databricks', name: 'prod-catalog.silver' },
    strategy: 'incremental',
    status: 'pending',
    tables: 5,
    rowsMigrated: 0,
    totalRows: 280_000,
    startedAt: '2026-06-13T10:00:00Z',
    layer: 'silver',
  },
];

export const connections: Connection[] = [
  { id: 'src-01', name: 'ERP Produção', type: 'sqlserver',   host: 'erp-prod.company.com', database: 'ERP_PROD',        status: 'connected', lastTested: '2m atrás',    tables: 47 },
  { id: 'src-02', name: 'CRM Principal',  type: 'postgresql', host: 'crm-db.internal',      database: 'crm_production', status: 'connected', lastTested: '5m atrás',    tables: 23 },
  { id: 'src-03', name: 'Financeiro',     type: 'mysql',      host: 'fin-db.company.com',   database: 'financeiro',     status: 'connected', lastTested: '12m atrás',   tables: 18 },
  { id: 'src-04', name: 'Legacy HR',      type: 'sqlserver',  host: 'hr-legacy.corp',       database: 'HRSYSTEM',       status: 'error',     lastTested: '1h atrás',    tables: 9  },
  { id: 'tgt-01', name: 'Databricks Prod',type: 'databricks', workspace: 'adb-xxx.azuredatabricks.net',                  status: 'connected', lastTested: '1m atrás'                },
  { id: 'tgt-02', name: 'Fabric Prod',    type: 'fabric',     workspace: 'workspace-prod',                               status: 'connected', lastTested: '3m atrás'                },
  { id: 'tgt-03', name: 'Databricks Dev', type: 'databricks', workspace: 'adb-dev.azuredatabricks.net',                  status: 'testing',   lastTested: 'agora'                   },
];

export const metrics = {
  totalMigrations: 156,
  rowsThisMonth: 48_320_000,
  successRate: 97.4,
  avgDuration: '12m 33s',
  activeNow: 2,
  savedVsTraditional: 87,
};

export const recentActivity = [
  { time: '09:14', event: 'CRM Delta migração iniciada', type: 'info' as const },
  { time: '09:02', event: 'Financeiro Mensal — validação iniciada', type: 'info' as const },
  { time: '08:49', event: 'ERP Produção migração concluída — 4.8M linhas', type: 'success' as const },
  { time: '08:31', event: 'AI Schema Mapper detectou 3 mapeamentos automáticos', type: 'info' as const },
  { time: '07:55', event: 'Legacy HR falhou — Connection timeout (retry 3/3)', type: 'error' as const },
];
