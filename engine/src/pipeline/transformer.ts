import type { TransformRule, TableSchema } from '../schema/types.js';
import { logger } from '../utils/logger.js';

export function transformRows(
  rows: Record<string, unknown>[],
  tableSchema: TableSchema,
  rules: TransformRule[],
  migrationId: string
): Record<string, unknown>[] {
  const tableRules = rules.filter((r) => r.table === tableSchema.name);
  const now = new Date().toISOString();

  return rows.map((row) => {
    let transformed = { ...row };

    for (const rule of tableRules) {
      switch (rule.operation) {
        case 'rename':
          if (rule.targetColumn && rule.column in transformed) {
            transformed[rule.targetColumn] = transformed[rule.column];
            delete transformed[rule.column];
          }
          break;

        case 'mask':
          if (rule.column in transformed) {
            transformed[rule.column] = maskValue(transformed[rule.column]);
          }
          break;

        case 'compute':
          if (rule.value && rule.targetColumn) {
            transformed[rule.targetColumn] = evaluateExpression(rule.value, transformed);
          }
          break;
      }
    }

    // Audit columns for silver/gold layers
    transformed['_migration_id'] = migrationId;
    transformed['_migrated_at'] = now;

    return transformed;
  });
}

function maskValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.length <= 4) return '****';
  return str.slice(0, 2) + '*'.repeat(str.length - 4) + str.slice(-2);
}

function evaluateExpression(expression: string, row: Record<string, unknown>): unknown {
  try {
    // Safe expression: only allows column references like {{column_name}}
    return expression.replace(/\{\{(\w+)\}\}/g, (_, col) => String(row[col] ?? ''));
  } catch {
    logger.warn('Failed to evaluate expression', { expression });
    return null;
  }
}
