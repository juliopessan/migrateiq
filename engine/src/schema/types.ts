export type SourceType = 'postgresql' | 'sqlserver' | 'mysql';
export type TargetType = 'databricks' | 'fabric';
export type LoadStrategy = 'full' | 'incremental';
export type MigrationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'rolled-back';
export type MedallionLayer = 'bronze' | 'silver' | 'gold';

export interface ColumnSchema {
  name: string;
  dataType: string;
  targetType: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  defaultValue?: string;
  maxLength?: number;
  precision?: number;
  scale?: number;
}

export interface TableSchema {
  name: string;
  schema: string;
  columns: ColumnSchema[];
  rowCount: number;
  estimatedSizeMb: number;
  primaryKeys: string[];
  watermarkColumn?: string;
}

export interface SourceConfig {
  type: SourceType;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  schemas?: string[];
  tables?: string[];
  excludeTables?: string[];
}

export interface DatabricksConfig {
  host: string;
  token: string;
  catalog: string;
  schema: string;
  warehouseId?: string;
  clusterId?: string;
}

export interface FabricConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  workspaceId: string;
  lakehouseId: string;
  server: string;
  database: string;
}

export interface TargetConfig {
  type: TargetType;
  databricks?: DatabricksConfig;
  fabric?: FabricConfig;
  medallionLayer: MedallionLayer;
}

export interface IncrementalConfig {
  watermarkColumn: string;
  lastWatermark?: string | number;
  checkpointFile?: string;
}

export interface MigrationManifest {
  id: string;
  name: string;
  source: SourceConfig;
  target: TargetConfig;
  strategy: LoadStrategy;
  incremental?: IncrementalConfig;
  batchSize: number;
  maxRetries: number;
  tables?: string[];
  transformations?: TransformRule[];
}

export interface TransformRule {
  table: string;
  column: string;
  operation: 'rename' | 'cast' | 'mask' | 'compute';
  value?: string;
  targetColumn?: string;
}

export interface MigrationCheckpoint {
  manifestId: string;
  table: string;
  rowsProcessed: number;
  lastWatermark?: string | number;
  status: MigrationStatus;
  startedAt: string;
  updatedAt: string;
  errorMessage?: string;
}

export interface MigrationResult {
  manifestId: string;
  table: string;
  rowsExtracted: number;
  rowsLoaded: number;
  rowsFailed: number;
  durationMs: number;
  status: MigrationStatus;
  strategy: LoadStrategy;
}

export interface BatchRecord {
  rows: Record<string, unknown>[];
  table: string;
  batchNumber: number;
  totalBatches: number;
}
