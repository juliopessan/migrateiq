import 'dotenv/config';
import { readFile } from 'fs/promises';
import { parseArgs } from 'node:util';
import { parse as parseYaml } from 'yaml';
import pLimit from 'p-limit';
import type { MigrationManifest, MigrationResult } from './schema/types.js';
import { createSourceConnector } from './schema/inspector.js';
import { inspectSource } from './schema/inspector.js';
import { applyTransformations, deriveWatermarkColumn } from './schema/mapper.js';
import { migrateTable } from './pipeline/orchestrator.js';
import { logger } from './utils/logger.js';

async function loadManifest(path: string): Promise<MigrationManifest> {
  const raw = await readFile(path, 'utf-8');
  return parseYaml(raw) as MigrationManifest;
}

async function runMigration(manifestPath: string): Promise<void> {
  logger.info('=== Data Migration Hub ===', { manifest: manifestPath });

  const manifest = await loadManifest(manifestPath);
  logger.info('Manifest loaded', { id: manifest.id, name: manifest.name, strategy: manifest.strategy });

  // Inspect source
  const tables = await inspectSource(manifest.source);
  const filteredTables = manifest.tables
    ? tables.filter((t) => manifest.tables!.includes(t.name) || manifest.tables!.includes(`${t.schema}.${t.name}`))
    : tables;

  logger.info(`Migrating ${filteredTables.length} tables`, {
    target: manifest.target.type,
    layer: manifest.target.medallionLayer,
  });

  // Apply schema transformations
  const mappedTables = filteredTables.map((t) => {
    const schema = applyTransformations(t, manifest.transformations ?? []);
    if (manifest.strategy === 'incremental' && manifest.incremental) {
      schema.watermarkColumn =
        manifest.incremental.watermarkColumn ?? deriveWatermarkColumn(schema);
    }
    return schema;
  });

  // Connect source
  const connector = createSourceConnector(manifest.source);
  await connector.connect();

  const results: MigrationResult[] = [];
  const limit = pLimit(3); // max 3 concurrent table migrations

  try {
    const tasks = mappedTables.map((table) =>
      limit(async () => {
        logger.info('Starting table migration', { table: table.name });
        try {
          const result = await migrateTable(connector, table, manifest);
          logger.info('Table migration completed', {
            table: table.name,
            rows: result.rowsLoaded,
            durationMs: result.durationMs,
          });
          return result;
        } catch (error) {
          logger.error('Table migration failed', { table: table.name, error: (error as Error).message });
          return {
            manifestId: manifest.id,
            table: table.name,
            rowsExtracted: 0,
            rowsLoaded: 0,
            rowsFailed: 0,
            durationMs: 0,
            status: 'failed' as const,
            strategy: manifest.strategy,
          } satisfies MigrationResult;
        }
      })
    );

    const settled = await Promise.all(tasks);
    results.push(...settled);
  } finally {
    await connector.disconnect();
  }

  // Summary
  const completed = results.filter((r) => r.status === 'completed');
  const failed = results.filter((r) => r.status === 'failed');
  const totalRows = results.reduce((s, r) => s + r.rowsLoaded, 0);

  logger.info('=== Migration Summary ===', {
    total: results.length,
    completed: completed.length,
    failed: failed.length,
    totalRowsMigrated: totalRows,
  });

  if (failed.length > 0) {
    logger.error('Failed tables', { tables: failed.map((r) => r.table) });
    process.exit(1);
  }
}

async function inspectCommand(manifestPath: string): Promise<void> {
  const manifest = await loadManifest(manifestPath);
  const tables = await inspectSource(manifest.source);

  console.log('\n📋 Source Schema Inspection\n');
  for (const t of tables) {
    console.log(`  ${t.schema}.${t.name}`);
    console.log(`    Rows: ${t.rowCount.toLocaleString()}`);
    console.log(`    Columns: ${t.columns.length}`);
    console.log(`    PKs: ${t.primaryKeys.join(', ') || 'none'}`);
    const wm = deriveWatermarkColumn(t);
    if (wm) console.log(`    Watermark: ${wm}`);
    console.log('');
  }
}

// CLI entry
const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    manifest: { type: 'string', short: 'm' },
    help: { type: 'boolean', short: 'h' },
  },
  allowPositionals: true,
});

if (values.help || positionals.length === 0) {
  console.log(`
Data Migration Hub — Ruflo-powered SQL → Databricks/Fabric migrations

Usage:
  npx tsx src/index.ts run --manifest ./migrations/manifests/my-migration.yaml
  npx tsx src/index.ts inspect --manifest ./migrations/manifests/my-migration.yaml

Commands:
  run      Execute migration from manifest
  inspect  Inspect source schema without migrating
`);
  process.exit(0);
}

const command = positionals[0];
const manifestPath = values.manifest ?? positionals[1];

if (!manifestPath) {
  logger.error('--manifest flag is required');
  process.exit(1);
}

if (command === 'run') {
  runMigration(manifestPath).catch((err) => {
    logger.error('Migration failed', { error: err.message });
    process.exit(1);
  });
} else if (command === 'inspect') {
  inspectCommand(manifestPath).catch((err) => {
    logger.error('Inspection failed', { error: err.message });
    process.exit(1);
  });
} else {
  logger.error(`Unknown command: ${command}`);
  process.exit(1);
}
