import axios, { type AxiosInstance } from 'axios';
import type { FabricConfig, TableSchema } from '../../schema/types.js';
import { logger } from '../../utils/logger.js';
import { withRetry } from '../../utils/retry.js';

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

export class FabricConnector {
  private http: AxiosInstance;
  private token: string | null = null;
  private tokenExpiry = 0;

  constructor(private config: FabricConfig) {
    this.http = axios.create({ timeout: 60_000 });
  }

  private async getToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiry - 30_000) return this.token;

    const url = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`;
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope: 'https://api.fabric.microsoft.com/.default',
    });

    const resp = await axios.post<TokenResponse>(url, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    this.token = resp.data.access_token;
    this.tokenExpiry = Date.now() + resp.data.expires_in * 1000;
    return this.token;
  }

  async test(): Promise<void> {
    const token = await this.getToken();
    await axios.get(
      `https://api.fabric.microsoft.com/v1/workspaces/${this.config.workspaceId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    logger.info('Microsoft Fabric connection verified', {
      workspace: this.config.workspaceId,
    });
  }

  private buildDDL(tableSchema: TableSchema, layer: string): string {
    const tableName = `${layer}_${tableSchema.name}`;
    const cols = tableSchema.columns
      .map((c) => `  [${c.name}] ${mapToFabricType(c.targetType)}${c.nullable ? '' : ' NOT NULL'}`)
      .join(',\n');

    return `IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = '${tableName}')
    CREATE TABLE [${tableName}] (\n${cols}\n)`;
  }

  async createTable(tableSchema: TableSchema, layer: string): Promise<void> {
    const ddl = this.buildDDL(tableSchema, layer);
    await this.executeSql(ddl);
    logger.info('Fabric table created/verified', {
      table: `${layer}_${tableSchema.name}`,
    });
  }

  async loadBatch(
    rows: Record<string, unknown>[],
    tableSchema: TableSchema,
    layer: string,
    mode: 'append' | 'merge'
  ): Promise<void> {
    if (rows.length === 0) return;
    const tableName = `${layer}_${tableSchema.name}`;

    if (mode === 'append' || tableSchema.primaryKeys.length === 0) {
      await this.insertRows(rows, tableName, tableSchema);
    } else {
      await this.mergeRows(rows, tableName, tableSchema);
    }
  }

  private async insertRows(
    rows: Record<string, unknown>[],
    tableName: string,
    tableSchema: TableSchema
  ): Promise<void> {
    const colNames = tableSchema.columns.map((c) => c.name);
    const cols = colNames.map((c) => `[${c}]`).join(', ');

    const chunks = chunkArray(rows, 500);
    for (const chunk of chunks) {
      const values = chunk
        .map((row) => `(${colNames.map((col) => formatValue(row[col])).join(', ')})`)
        .join(',\n');
      await this.executeSql(`INSERT INTO [${tableName}] (${cols}) VALUES ${values}`);
    }
  }

  private async mergeRows(
    rows: Record<string, unknown>[],
    tableName: string,
    tableSchema: TableSchema
  ): Promise<void> {
    const pks = tableSchema.primaryKeys;
    const nonPkCols = tableSchema.columns.filter((c) => !pks.includes(c.name));
    const colNames = tableSchema.columns.map((c) => c.name);
    const cols = colNames.map((c) => `[${c}]`).join(', ');

    const chunks = chunkArray(rows, 500);
    for (const chunk of chunks) {
      const values = chunk
        .map((row) => `(${colNames.map((col) => formatValue(row[col])).join(', ')})`)
        .join(',\n');

      const matchCond = pks.map((pk) => `t.[${pk}] = s.[${pk}]`).join(' AND ');
      const updateSet =
        nonPkCols.length > 0
          ? nonPkCols.map((c) => `t.[${c.name}] = s.[${c.name}]`).join(', ')
          : pks.map((pk) => `t.[${pk}] = s.[${pk}]`).join(', ');

      const insertCols = colNames.map((c) => `s.[${c}]`).join(', ');

      const mergeSQL = `
        MERGE [${tableName}] AS t
        USING (VALUES ${values}) AS s(${cols})
        ON ${matchCond}
        WHEN MATCHED THEN UPDATE SET ${updateSet}
        WHEN NOT MATCHED THEN INSERT (${cols}) VALUES (${insertCols});`;

      await this.executeSql(mergeSQL);
    }
  }

  async truncateTable(tableName: string, layer: string): Promise<void> {
    await this.executeSql(`IF OBJECT_ID('${layer}_${tableName}', 'U') IS NOT NULL TRUNCATE TABLE [${layer}_${tableName}]`);
  }

  private async executeSql(statement: string): Promise<unknown> {
    return withRetry(
      async () => {
        const token = await this.getToken();
        const url = `https://api.fabric.microsoft.com/v1/workspaces/${this.config.workspaceId}/lakehouses/${this.config.lakehouseId}/livySessions`;

        const resp = await this.http.post(
          url,
          { code: statement, kind: 'sql' },
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        return resp.data;
      },
      3,
      'Fabric SQL statement'
    );
  }
}

function mapToFabricType(deltaType: string): string {
  const map: Record<string, string> = {
    INT: 'INT',
    BIGINT: 'BIGINT',
    SMALLINT: 'SMALLINT',
    FLOAT: 'FLOAT',
    DOUBLE: 'FLOAT',
    DECIMAL: 'DECIMAL(18,4)',
    BOOLEAN: 'BIT',
    STRING: 'NVARCHAR(MAX)',
    DATE: 'DATE',
    TIMESTAMP: 'DATETIME2',
    BINARY: 'VARBINARY(MAX)',
  };
  return map[deltaType.split('(')[0]] ?? 'NVARCHAR(MAX)';
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? '1' : '0';
  if (val instanceof Date) return `'${val.toISOString()}'`;
  return `N'${String(val).replace(/'/g, "''")}'`;
}
