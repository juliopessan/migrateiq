import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import type { MigrationCheckpoint } from '../schema/types.js';
import { logger } from './logger.js';

const CHECKPOINT_DIR = '.migration-checkpoints';

function checkpointPath(manifestId: string, table: string): string {
  return join(CHECKPOINT_DIR, `${manifestId}_${table.replace(/\./g, '_')}.json`);
}

export async function saveCheckpoint(checkpoint: MigrationCheckpoint): Promise<void> {
  const path = checkpointPath(checkpoint.manifestId, checkpoint.table);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(checkpoint, null, 2), 'utf-8');
  logger.debug('Checkpoint saved', { table: checkpoint.table, rows: checkpoint.rowsProcessed });
}

export async function loadCheckpoint(
  manifestId: string,
  table: string
): Promise<MigrationCheckpoint | null> {
  const path = checkpointPath(manifestId, table);
  if (!existsSync(path)) return null;

  try {
    const raw = await readFile(path, 'utf-8');
    return JSON.parse(raw) as MigrationCheckpoint;
  } catch {
    return null;
  }
}

export async function clearCheckpoint(manifestId: string, table: string): Promise<void> {
  const { unlink } = await import('fs/promises');
  const path = checkpointPath(manifestId, table);
  if (existsSync(path)) {
    await unlink(path);
  }
}
