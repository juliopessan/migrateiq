import sql from 'mssql';
import type { SourceConnector } from './base-connector.js';
import type { SourceConfig, TableSchema, ColumnSchema, BatchRecord } from '../../schema/types.js';
import { logger } from '../../utils/logger.js';

const MSSQL_TO_DELTA: Record<string, string> = {
  int: 'INT',
  bigint: 'BIGINT',
  smallint: 'SMALLINT',
  tinyint: 'SMALLINT',
  bit: 'BOOLEAN',
  decimal: 'DECIMAL',
  numeric: 'DECIMAL',
  float: 'DOUBLE',
  real: 'FLOAT',
  money: 'DECIMAL(19,4)',
  smallmoney: 'DECIMAL(10,4)',
  char: 'STRING',
  varchar: 'STRING',
  nchar: 'STRING',
  nvarchar: 'STRING',
  text: 'STRING',
  ntext: 'STRING',
  uniqueidentifier: 'STRING',
  date: 'DATE',
  datetime: 'TIMESTAMP',
  datetime2: 'TIMESTAMP',
  datetimeoffset: 'TIMESTAMP',
  smalldatetime: 'TIMESTAMP',
  time: 'STRING',
  varbinary: 'BINARY',
  binary: 'BINARY',
  xml: 'STRING',
};

export class SQLServerConnector implements SourceConnector {
  private pool: sql.ConnectionPool | null = null;

  constructor(private config: SourceConfig) {}

  async connect(): Promise<void> {
    this.pool = await sql.connect({
      server: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.user,
      password: this.config.password,
      options: { encrypt: true, trustServerCertificate: true },
    });
    logger.info('SQL Server connected', { host: this.config.host, db: this.config.database });
  }

  async disconnect(): Promise<void> {
    await this.pool?.close();
    logger.info('SQL Server disconnected');
  }

  private get client(): sql.ConnectionPool {
    if (!this.pool) throw new Error('SQL Server not connected');
    return this.pool;
  }

  async inspectTables(schemas: string[] = ['dbo']): Promise<TableSchema[]> {
    const schemaList = schemas.map((s) => `'${s}'`).join(',');
    const result = await this.client.query<{ schema_name: string; table_name: string }>(
      `SELECT TABLE_SCHEMA as schema_name, TABLE_NAME as table_name
       FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA IN (${schemaList}) AND TABLE_TYPE = 'BASE TABLE'
       ORDER BY TABLE_SCHEMA, TABLE_NAME`
    );

    const results: TableSchema[] = [];
    for (const row of result.recordset) {
      if (
        this.config.tables &&
        !this.config.tables.includes(row.table_name) &&
        !this.config.tables.includes(`${row.schema_name}.${row.table_name}`)
      )
        continue;
      if (this.config.excludeTables?.includes(row.table_name)) continue;
      results.push(await this.inspectTable(row.schema_name, row.table_name));
    }
    return results;
  }

  async inspectTable(schema: string, table: string): Promise<TableSchema> {
    const colResult = await this.client.query<{
      COLUMN_NAME: string;
      DATA_TYPE: string;
      IS_NULLABLE: string;
      COLUMN_DEFAULT: string | null;
      CHARACTER_MAXIMUM_LENGTH: number | null;
      NUMERIC_PRECISION: number | null;
      NUMERIC_SCALE: number | null;
    }>(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT,
              CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = '${schema}' AND TABLE_NAME = '${table}'
       ORDER BY ORDINAL_POSITION`
    );

    const pkResult = await this.client.query<{ COLUMN_NAME: string }>(
      `SELECT kcu.COLUMN_NAME
       FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
       JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
         ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
       WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
         AND tc.TABLE_SCHEMA = '${schema}' AND tc.TABLE_NAME = '${table}'`
    );
    const pkCols = new Set(pkResult.recordset.map((r) => r.COLUMN_NAME));

    const countResult = await this.client.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM [${schema}].[${table}]`
    );

    const columns: ColumnSchema[] = colResult.recordset.map((c) => ({
      name: c.COLUMN_NAME,
      dataType: c.DATA_TYPE,
      targetType: MSSQL_TO_DELTA[c.DATA_TYPE] ?? 'STRING',
      nullable: c.IS_NULLABLE === 'YES',
      isPrimaryKey: pkCols.has(c.COLUMN_NAME),
      isForeignKey: false,
      defaultValue: c.COLUMN_DEFAULT ?? undefined,
      maxLength: c.CHARACTER_MAXIMUM_LENGTH ?? undefined,
      precision: c.NUMERIC_PRECISION ?? undefined,
      scale: c.NUMERIC_SCALE ?? undefined,
    }));

    return {
      name: table,
      schema,
      columns,
      rowCount: countResult.recordset[0].count,
      estimatedSizeMb: 0,
      primaryKeys: pkResult.recordset.map((r) => r.COLUMN_NAME),
    };
  }

  async extractBatch(
    schema: string,
    table: string,
    offset: number,
    limit: number,
    watermarkColumn?: string,
    lastWatermark?: string | number
  ): Promise<BatchRecord> {
    let whereClause = '';
    if (watermarkColumn && lastWatermark !== undefined) {
      const val = typeof lastWatermark === 'string' ? `'${lastWatermark}'` : lastWatermark;
      whereClause = `WHERE [${watermarkColumn}] > ${val}`;
    }

    const query = `
      SELECT * FROM [${schema}].[${table}]
      ${whereClause}
      ORDER BY (SELECT NULL)
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

    const result = await this.client.query(query);
    return {
      rows: result.recordset,
      table: `${schema}.${table}`,
      batchNumber: 0,
      totalBatches: 0,
    };
  }

  async countRows(
    schema: string,
    table: string,
    watermarkColumn?: string,
    lastWatermark?: string | number
  ): Promise<number> {
    let whereClause = '';
    if (watermarkColumn && lastWatermark !== undefined) {
      const val = typeof lastWatermark === 'string' ? `'${lastWatermark}'` : lastWatermark;
      whereClause = `WHERE [${watermarkColumn}] > ${val}`;
    }
    const result = await this.client.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM [${schema}].[${table}] ${whereClause}`
    );
    return result.recordset[0].count;
  }

  async getMaxWatermark(schema: string, table: string, column: string): Promise<string | number> {
    const result = await this.client.query<{ max_val: unknown }>(
      `SELECT MAX([${column}]) as max_val FROM [${schema}].[${table}]`
    );
    return result.recordset[0].max_val as string | number;
  }
}
