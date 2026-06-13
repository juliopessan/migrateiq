import mysql from 'mysql2/promise';
import type { SourceConnector } from './base-connector.js';
import type { SourceConfig, TableSchema, ColumnSchema, BatchRecord } from '../../schema/types.js';
import { logger } from '../../utils/logger.js';

const MYSQL_TO_DELTA: Record<string, string> = {
  tinyint: 'SMALLINT',
  smallint: 'SMALLINT',
  mediumint: 'INT',
  int: 'INT',
  integer: 'INT',
  bigint: 'BIGINT',
  float: 'FLOAT',
  double: 'DOUBLE',
  decimal: 'DECIMAL',
  numeric: 'DECIMAL',
  bit: 'BOOLEAN',
  char: 'STRING',
  varchar: 'STRING',
  tinytext: 'STRING',
  text: 'STRING',
  mediumtext: 'STRING',
  longtext: 'STRING',
  enum: 'STRING',
  set: 'STRING',
  date: 'DATE',
  datetime: 'TIMESTAMP',
  timestamp: 'TIMESTAMP',
  time: 'STRING',
  year: 'INT',
  tinyblob: 'BINARY',
  blob: 'BINARY',
  mediumblob: 'BINARY',
  longblob: 'BINARY',
  json: 'STRING',
};

export class MySQLConnector implements SourceConnector {
  private pool: mysql.Pool | null = null;

  constructor(private config: SourceConfig) {}

  async connect(): Promise<void> {
    this.pool = mysql.createPool({
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.user,
      password: this.config.password,
      connectionLimit: 5,
    });
    await this.pool.query('SELECT 1');
    logger.info('MySQL connected', { host: this.config.host, db: this.config.database });
  }

  async disconnect(): Promise<void> {
    await this.pool?.end();
    logger.info('MySQL disconnected');
  }

  private get client(): mysql.Pool {
    if (!this.pool) throw new Error('MySQL not connected');
    return this.pool;
  }

  async inspectTables(schemas?: string[]): Promise<TableSchema[]> {
    const targetSchema = schemas?.[0] ?? this.config.database;
    const [rows] = await this.client.query<mysql.RowDataPacket[]>(
      `SELECT TABLE_NAME as table_name
       FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'
       ORDER BY TABLE_NAME`,
      [targetSchema]
    );

    const results: TableSchema[] = [];
    for (const row of rows) {
      const tableName = row['table_name'] as string;
      if (this.config.tables && !this.config.tables.includes(tableName)) continue;
      if (this.config.excludeTables?.includes(tableName)) continue;
      results.push(await this.inspectTable(targetSchema, tableName));
    }
    return results;
  }

  async inspectTable(schema: string, table: string): Promise<TableSchema> {
    const [cols] = await this.client.query<mysql.RowDataPacket[]>(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT,
              CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE,
              COLUMN_KEY
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
       ORDER BY ORDINAL_POSITION`,
      [schema, table]
    );

    const [countRows] = await this.client.query<mysql.RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM \`${schema}\`.\`${table}\``
    );

    const pkCols = new Set(
      cols.filter((c) => c['COLUMN_KEY'] === 'PRI').map((c) => c['COLUMN_NAME'] as string)
    );

    const columns: ColumnSchema[] = cols.map((c) => ({
      name: c['COLUMN_NAME'] as string,
      dataType: c['DATA_TYPE'] as string,
      targetType: MYSQL_TO_DELTA[c['DATA_TYPE'] as string] ?? 'STRING',
      nullable: c['IS_NULLABLE'] === 'YES',
      isPrimaryKey: pkCols.has(c['COLUMN_NAME'] as string),
      isForeignKey: false,
      defaultValue: (c['COLUMN_DEFAULT'] as string | null) ?? undefined,
      maxLength: (c['CHARACTER_MAXIMUM_LENGTH'] as number | null) ?? undefined,
      precision: (c['NUMERIC_PRECISION'] as number | null) ?? undefined,
      scale: (c['NUMERIC_SCALE'] as number | null) ?? undefined,
    }));

    return {
      name: table,
      schema,
      columns,
      rowCount: (countRows[0] as mysql.RowDataPacket)['count'] as number,
      estimatedSizeMb: 0,
      primaryKeys: [...pkCols],
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
    let query = `SELECT * FROM \`${schema}\`.\`${table}\``;
    const params: unknown[] = [];

    if (watermarkColumn && lastWatermark !== undefined) {
      query += ` WHERE \`${watermarkColumn}\` > ?`;
      params.push(lastWatermark);
    }

    query += ` ORDER BY 1 LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await this.client.query<mysql.RowDataPacket[]>(query, params);
    return {
      rows: rows as Record<string, unknown>[],
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
    let query = `SELECT COUNT(*) as count FROM \`${schema}\`.\`${table}\``;
    const params: unknown[] = [];
    if (watermarkColumn && lastWatermark !== undefined) {
      query += ` WHERE \`${watermarkColumn}\` > ?`;
      params.push(lastWatermark);
    }
    const [rows] = await this.client.query<mysql.RowDataPacket[]>(query, params);
    return (rows[0] as mysql.RowDataPacket)['count'] as number;
  }

  async getMaxWatermark(schema: string, table: string, column: string): Promise<string | number> {
    const [rows] = await this.client.query<mysql.RowDataPacket[]>(
      `SELECT MAX(\`${column}\`) as max_val FROM \`${schema}\`.\`${table}\``
    );
    return (rows[0] as mysql.RowDataPacket)['max_val'] as string | number;
  }
}
