import axios, { type AxiosInstance } from 'axios';
import type { DatabricksConfig, TableSchema } from '../../schema/types.js';
import { logger } from '../../utils/logger.js';
import { withRetry } from '../../utils/retry.js';

export class DatabricksConnector {
  private http: AxiosInstance;

  constructor(private config: DatabricksConfig) {
    this.http = axios.create({
      baseURL: config.host,
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      timeout: 60_000,
    });
  }

  async test(): Promise<void> {
    await this.http.get('/api/2.0/clusters/list');
    logger.info('Databricks connection verified', { host: this.config.host });
  }

  private get fullSchema(): string {
    return `${this.config.catalog}.${this.config.schema}`;
  }

  private buildDDL(tableSchema: TableSchema, layer: string): string {
    const targetTable = `${this.fullSchema}_${layer}.${tableSchema.name}`;
    const cols = tableSchema.columns
      .map((c) => `  \`${c.name}\` ${c.targetType}${c.nullable ? '' : ' NOT NULL'}`)
      .join(',\n');

    return `CREATE TABLE IF NOT EXISTS ${targetTable} (\n${cols}\n) USING DELTA`;
  }

  async ensureSchema(layer: string): Promise<void> {
    const schema = `${this.config.catalog}.${this.config.schema}_${layer}`;
    await this.executeStatement(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
    logger.info('Schema ensured', { schema });
  }

  async createTable(tableSchema: TableSchema, layer: string): Promise<void> {
    const ddl = this.buildDDL(tableSchema, layer);
    await this.executeStatement(ddl);
    logger.info('Table created/verified', {
      table: `${this.fullSchema}_${layer}.${tableSchema.name}`,
    });
  }

  async loadBatch(
    rows: Record<string, unknown>[],
    tableSchema: TableSchema,
    layer: string,
    mode: 'append' | 'merge'
  ): Promise<void> {
    if (rows.length === 0) return;
    const targetTable = `${this.fullSchema}_${layer}.${tableSchema.name}`;

    if (mode === 'append' || tableSchema.primaryKeys.length === 0) {
      await this.insertRows(rows, targetTable, tableSchema);
    } else {
      await this.mergeRows(rows, targetTable, tableSchema);
    }
  }

  private async insertRows(
    rows: Record<string, unknown>[],
    targetTable: string,
    tableSchema: TableSchema
  ): Promise<void> {
    const cols = tableSchema.columns.map((c) => `\`${c.name}\``).join(', ');
    const colNames = tableSchema.columns.map((c) => c.name);

    // Databricks SQL: batch INSERT via VALUES
    const chunks = chunkArray(rows, 500);
    for (const chunk of chunks) {
      const values = chunk
        .map((row) => {
          const vals = colNames.map((col) => formatValue(row[col]));
          return `(${vals.join(', ')})`;
        })
        .join(',\n');
      await this.executeStatement(`INSERT INTO ${targetTable} (${cols}) VALUES ${values}`);
    }
  }

  private async mergeRows(
    rows: Record<string, unknown>[],
    targetTable: string,
    tableSchema: TableSchema
  ): Promise<void> {
    const pks = tableSchema.primaryKeys;
    const nonPkCols = tableSchema.columns.filter((c) => !pks.includes(c.name));
    const colNames = tableSchema.columns.map((c) => c.name);

    const chunks = chunkArray(rows, 500);
    for (const chunk of chunks) {
      const values = chunk
        .map((row) => {
          const vals = colNames.map((col) => formatValue(row[col]));
          return `(${vals.join(', ')})`;
        })
        .join(',\n');

      const cols = tableSchema.columns.map((c) => `\`${c.name}\``).join(', ');
      const matchCond = pks.map((pk) => `t.\`${pk}\` = s.\`${pk}\``).join(' AND ');
      const updateSet =
        nonPkCols.length > 0
          ? nonPkCols.map((c) => `t.\`${c.name}\` = s.\`${c.name}\``).join(', ')
          : pks.map((pk) => `t.\`${pk}\` = s.\`${pk}\``).join(', ');

      const mergeSQL = `
        MERGE INTO ${targetTable} t
        USING (SELECT ${cols} FROM VALUES ${values} AS tmp(${cols})) s
        ON ${matchCond}
        WHEN MATCHED THEN UPDATE SET ${updateSet}
        WHEN NOT MATCHED THEN INSERT (${cols}) VALUES (${colNames.map((c) => `s.\`${c}\``).join(', ')})`;

      await this.executeStatement(mergeSQL);
    }
  }

  async truncateTable(tableName: string, layer: string): Promise<void> {
    const targetTable = `${this.fullSchema}_${layer}.${tableName}`;
    await this.executeStatement(`TRUNCATE TABLE IF EXISTS ${targetTable}`);
  }

  private async executeStatement(statement: string): Promise<unknown> {
    return withRetry(
      async () => {
        const resp = await this.http.post('/api/2.0/sql/statements', {
          warehouse_id: this.config.warehouseId,
          statement,
          wait_timeout: '50s',
        });

        if (resp.data.status?.state === 'FAILED') {
          throw new Error(resp.data.status.error?.message ?? 'Statement failed');
        }
        return resp.data;
      },
      3,
      'Databricks statement'
    );
  }
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (val instanceof Date) return `'${val.toISOString()}'`;
  return `'${String(val).replace(/'/g, "''")}'`;
}
