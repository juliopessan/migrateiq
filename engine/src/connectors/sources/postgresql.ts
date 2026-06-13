import pg from 'pg';
import type { SourceConnector } from './base-connector.js';
import type { SourceConfig, TableSchema, ColumnSchema, BatchRecord } from '../../schema/types.js';
import { logger } from '../../utils/logger.js';

const PG_TO_DELTA: Record<string, string> = {
  integer: 'INT',
  bigint: 'BIGINT',
  smallint: 'SMALLINT',
  numeric: 'DECIMAL',
  decimal: 'DECIMAL',
  real: 'FLOAT',
  'double precision': 'DOUBLE',
  boolean: 'BOOLEAN',
  text: 'STRING',
  'character varying': 'STRING',
  character: 'STRING',
  uuid: 'STRING',
  date: 'DATE',
  timestamp: 'TIMESTAMP',
  'timestamp without time zone': 'TIMESTAMP',
  'timestamp with time zone': 'TIMESTAMP',
  json: 'STRING',
  jsonb: 'STRING',
  bytea: 'BINARY',
};

export class PostgreSQLConnector implements SourceConnector {
  private pool: pg.Pool | null = null;

  constructor(private config: SourceConfig) {}

  async connect(): Promise<void> {
    this.pool = new pg.Pool({
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.user,
      password: this.config.password,
      max: 5,
    });
    await this.pool.query('SELECT 1');
    logger.info('PostgreSQL connected', { host: this.config.host, db: this.config.database });
  }

  async disconnect(): Promise<void> {
    await this.pool?.end();
    logger.info('PostgreSQL disconnected');
  }

  private get client(): pg.Pool {
    if (!this.pool) throw new Error('PostgreSQL not connected');
    return this.pool;
  }

  async inspectTables(schemas: string[] = ['public']): Promise<TableSchema[]> {
    const placeholders = schemas.map((_, i) => `$${i + 1}`).join(',');
    const { rows } = await this.client.query<{ schema_name: string; table_name: string }>(
      `SELECT table_schema as schema_name, table_name
       FROM information_schema.tables
       WHERE table_schema IN (${placeholders}) AND table_type = 'BASE TABLE'
       ORDER BY table_schema, table_name`,
      schemas
    );

    const results: TableSchema[] = [];
    for (const row of rows) {
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
    const { rows: cols } = await this.client.query<{
      column_name: string;
      data_type: string;
      is_nullable: string;
      column_default: string | null;
      character_maximum_length: number | null;
      numeric_precision: number | null;
      numeric_scale: number | null;
    }>(
      `SELECT column_name, data_type, is_nullable, column_default,
              character_maximum_length, numeric_precision, numeric_scale
       FROM information_schema.columns
       WHERE table_schema = $1 AND table_name = $2
       ORDER BY ordinal_position`,
      [schema, table]
    );

    const { rows: pks } = await this.client.query<{ column_name: string }>(
      `SELECT kcu.column_name
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu USING (constraint_name, table_schema, table_name)
       WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = $1 AND tc.table_name = $2`,
      [schema, table]
    );
    const pkCols = new Set(pks.map((r) => r.column_name));

    const { rows: countRows } = await this.client.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM "${schema}"."${table}"`
    );

    const columns: ColumnSchema[] = cols.map((c) => ({
      name: c.column_name,
      dataType: c.data_type,
      targetType: PG_TO_DELTA[c.data_type] ?? 'STRING',
      nullable: c.is_nullable === 'YES',
      isPrimaryKey: pkCols.has(c.column_name),
      isForeignKey: false,
      defaultValue: c.column_default ?? undefined,
      maxLength: c.character_maximum_length ?? undefined,
      precision: c.numeric_precision ?? undefined,
      scale: c.numeric_scale ?? undefined,
    }));

    return {
      name: table,
      schema,
      columns,
      rowCount: parseInt(countRows[0].count, 10),
      estimatedSizeMb: 0,
      primaryKeys: pks.map((r) => r.column_name),
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
    let query = `SELECT * FROM "${schema}"."${table}"`;
    const params: unknown[] = [];

    if (watermarkColumn && lastWatermark !== undefined) {
      params.push(lastWatermark);
      query += ` WHERE "${watermarkColumn}" > $${params.length}`;
    }

    query += ` ORDER BY 1 LIMIT ${limit} OFFSET ${offset}`;

    const { rows } = await this.client.query(query, params);
    return { rows, table: `${schema}.${table}`, batchNumber: 0, totalBatches: 0 };
  }

  async countRows(
    schema: string,
    table: string,
    watermarkColumn?: string,
    lastWatermark?: string | number
  ): Promise<number> {
    let query = `SELECT COUNT(*) as count FROM "${schema}"."${table}"`;
    const params: unknown[] = [];
    if (watermarkColumn && lastWatermark !== undefined) {
      params.push(lastWatermark);
      query += ` WHERE "${watermarkColumn}" > $${params.length}`;
    }
    const { rows } = await this.client.query<{ count: string }>(query, params);
    return parseInt(rows[0].count, 10);
  }

  async getMaxWatermark(schema: string, table: string, column: string): Promise<string | number> {
    const { rows } = await this.client.query<{ max_val: unknown }>(
      `SELECT MAX("${column}") as max_val FROM "${schema}"."${table}"`
    );
    return rows[0].max_val as string | number;
  }
}
