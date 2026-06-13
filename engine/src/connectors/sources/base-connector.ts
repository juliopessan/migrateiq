import type { TableSchema, BatchRecord } from '../../schema/types.js';

export interface SourceConnector {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  inspectTables(schemas?: string[]): Promise<TableSchema[]>;
  inspectTable(schema: string, table: string): Promise<TableSchema>;
  extractBatch(
    schema: string,
    table: string,
    offset: number,
    limit: number,
    watermarkColumn?: string,
    lastWatermark?: string | number
  ): Promise<BatchRecord>;
  countRows(
    schema: string,
    table: string,
    watermarkColumn?: string,
    lastWatermark?: string | number
  ): Promise<number>;
  getMaxWatermark(schema: string, table: string, column: string): Promise<string | number>;
}
