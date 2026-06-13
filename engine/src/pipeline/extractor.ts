import type { SourceConnector } from '../connectors/sources/base-connector.js';
import type { TableSchema, MigrationCheckpoint } from '../schema/types.js';
import { logger } from '../utils/logger.js';

export interface ExtractResult {
  rows: Record<string, unknown>[];
  hasMore: boolean;
  nextOffset: number;
  lastWatermark?: string | number;
}

export async function extractBatch(
  connector: SourceConnector,
  tableSchema: TableSchema,
  batchSize: number,
  offset: number,
  checkpoint?: MigrationCheckpoint
): Promise<ExtractResult> {
  const watermarkColumn = tableSchema.watermarkColumn;
  const lastWatermark = checkpoint?.lastWatermark;

  const batch = await connector.extractBatch(
    tableSchema.schema,
    tableSchema.name,
    offset,
    batchSize,
    watermarkColumn,
    lastWatermark
  );

  const rows = batch.rows as Record<string, unknown>[];
  const hasMore = rows.length === batchSize;

  let newWatermark: string | number | undefined = lastWatermark;
  if (watermarkColumn && rows.length > 0) {
    const lastRow = rows[rows.length - 1];
    const val = lastRow[watermarkColumn];
    if (val !== undefined && val !== null) {
      newWatermark = val instanceof Date ? val.toISOString() : (val as string | number);
    }
  }

  logger.debug('Batch extracted', {
    table: tableSchema.name,
    offset,
    rows: rows.length,
    hasMore,
  });

  return { rows, hasMore, nextOffset: offset + rows.length, lastWatermark: newWatermark };
}
