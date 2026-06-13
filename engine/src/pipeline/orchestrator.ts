import type { MigrationManifest, TableSchema, MigrationResult, MigrationCheckpoint } from '../schema/types.js';
import type { SourceConnector } from '../connectors/sources/base-connector.js';
import { DatabricksConnector } from '../connectors/targets/databricks.js';
import { FabricConnector } from '../connectors/targets/fabric.js';
import { extractBatch } from './extractor.js';
import { transformRows } from './transformer.js';
import { deriveWatermarkColumn } from '../schema/mapper.js';
import { saveCheckpoint, loadCheckpoint, clearCheckpoint } from '../utils/checkpoint.js';
import { logger } from '../utils/logger.js';
import { withRetry } from '../utils/retry.js';

export async function migrateTable(
  connector: SourceConnector,
  tableSchema: TableSchema,
  manifest: MigrationManifest
): Promise<MigrationResult> {
  const startedAt = new Date().toISOString();
  const layer = manifest.target.medallionLayer;
  const mode = manifest.strategy === 'incremental' ? 'merge' : 'append';
  let rowsLoaded = 0;
  let rowsFailed = 0;

  // Resolve watermark for incremental
  if (manifest.strategy === 'incremental' && manifest.incremental) {
    tableSchema = {
      ...tableSchema,
      watermarkColumn:
        manifest.incremental.watermarkColumn ?? deriveWatermarkColumn(tableSchema),
    };
  }

  // Load or init checkpoint
  const existingCp = await loadCheckpoint(manifest.id, tableSchema.name);
  let checkpoint: MigrationCheckpoint = existingCp ?? {
    manifestId: manifest.id,
    table: tableSchema.name,
    rowsProcessed: 0,
    lastWatermark: manifest.incremental?.lastWatermark,
    status: 'running',
    startedAt,
    updatedAt: startedAt,
  };

  const startOffset = checkpoint.rowsProcessed;
  if (startOffset > 0) {
    logger.info('Resuming from checkpoint', { table: tableSchema.name, offset: startOffset });
  }

  // Build target connector
  const target = buildTargetConnector(manifest);

  // For full load: truncate first (only if starting fresh)
  if (manifest.strategy === 'full' && startOffset === 0) {
    await truncateTarget(target, tableSchema.name, layer, manifest);
  }

  // Prepare target table
  await ensureTargetTable(target, tableSchema, layer, manifest);

  let offset = startOffset;
  let hasMore = true;

  while (hasMore) {
    const { rows, hasMore: more, nextOffset, lastWatermark } = await extractBatch(
      connector,
      tableSchema,
      manifest.batchSize,
      offset,
      checkpoint
    );

    hasMore = more;

    if (rows.length === 0) break;

    const transformed = transformRows(
      rows,
      tableSchema,
      manifest.transformations ?? [],
      manifest.id
    );

    await withRetry(
      () => loadToTarget(target, transformed, tableSchema, layer, mode, manifest),
      manifest.maxRetries,
      `load batch table=${tableSchema.name} offset=${offset}`
    );

    rowsLoaded += rows.length;
    offset = nextOffset;

    // Save checkpoint every N rows
    checkpoint = {
      ...checkpoint,
      rowsProcessed: offset,
      lastWatermark,
      status: 'running',
      updatedAt: new Date().toISOString(),
    };
    await saveCheckpoint(checkpoint);

    logger.info('Progress', {
      table: tableSchema.name,
      loaded: rowsLoaded,
      offset,
    });
  }

  // Update watermark for next incremental run
  if (manifest.strategy === 'incremental' && tableSchema.watermarkColumn) {
    const maxWatermark = await connector.getMaxWatermark(
      tableSchema.schema,
      tableSchema.name,
      tableSchema.watermarkColumn
    );
    checkpoint = { ...checkpoint, lastWatermark: maxWatermark };
  }

  await clearCheckpoint(manifest.id, tableSchema.name);

  return {
    manifestId: manifest.id,
    table: tableSchema.name,
    rowsExtracted: rowsLoaded,
    rowsLoaded,
    rowsFailed,
    durationMs: Date.now() - new Date(startedAt).getTime(),
    status: 'completed',
    strategy: manifest.strategy,
  };
}

function buildTargetConnector(manifest: MigrationManifest): DatabricksConnector | FabricConnector {
  if (manifest.target.type === 'databricks' && manifest.target.databricks) {
    return new DatabricksConnector(manifest.target.databricks);
  }
  if (manifest.target.type === 'fabric' && manifest.target.fabric) {
    return new FabricConnector(manifest.target.fabric);
  }
  throw new Error(`Invalid target configuration: ${manifest.target.type}`);
}

async function ensureTargetTable(
  target: DatabricksConnector | FabricConnector,
  tableSchema: TableSchema,
  layer: string,
  manifest: MigrationManifest
): Promise<void> {
  if (manifest.target.type === 'databricks') {
    const db = target as DatabricksConnector;
    await db.ensureSchema(layer);
    await db.createTable(tableSchema, layer);
  } else {
    const fb = target as FabricConnector;
    await fb.createTable(tableSchema, layer);
  }
}

async function truncateTarget(
  target: DatabricksConnector | FabricConnector,
  tableName: string,
  layer: string,
  manifest: MigrationManifest
): Promise<void> {
  if (manifest.target.type === 'databricks') {
    await (target as DatabricksConnector).truncateTable(tableName, layer);
  } else {
    await (target as FabricConnector).truncateTable(tableName, layer);
  }
}

async function loadToTarget(
  target: DatabricksConnector | FabricConnector,
  rows: Record<string, unknown>[],
  tableSchema: TableSchema,
  layer: string,
  mode: 'append' | 'merge',
  manifest: MigrationManifest
): Promise<void> {
  if (manifest.target.type === 'databricks') {
    await (target as DatabricksConnector).loadBatch(rows, tableSchema, layer, mode);
  } else {
    await (target as FabricConnector).loadBatch(rows, tableSchema, layer, mode);
  }
}
