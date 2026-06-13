import type { TableSchema, TransformRule, MedallionLayer } from './types.js';
import { logger } from '../utils/logger.js';

export function applyTransformations(tableSchema: TableSchema, rules: TransformRule[]): TableSchema {
  const tableRules = rules.filter((r) => r.table === tableSchema.name);
  if (tableRules.length === 0) return tableSchema;

  let columns = [...tableSchema.columns];

  for (const rule of tableRules) {
    const idx = columns.findIndex((c) => c.name === rule.column);
    if (idx === -1) continue;

    switch (rule.operation) {
      case 'rename':
        columns[idx] = { ...columns[idx], name: rule.targetColumn ?? rule.column };
        break;
      case 'cast':
        columns[idx] = { ...columns[idx], targetType: rule.value ?? columns[idx].targetType };
        break;
      case 'mask':
        logger.debug('Mask rule will be applied at transform stage', { rule });
        break;
      case 'compute':
        logger.debug('Compute rule will be applied at transform stage', { rule });
        break;
    }
  }

  logger.debug('Transformations applied', { table: tableSchema.name, rules: tableRules.length });
  return { ...tableSchema, columns };
}

export function deriveWatermarkColumn(tableSchema: TableSchema): string | undefined {
  const candidates = [
    'updated_at', 'UpdatedAt', 'UPDATED_AT',
    'modified_at', 'ModifiedAt',
    'created_at', 'CreatedAt',
    'timestamp', 'last_modified',
    'data_atualizacao', 'dt_atualizacao',
  ];

  for (const candidate of candidates) {
    if (tableSchema.columns.some((c) => c.name.toLowerCase() === candidate.toLowerCase())) {
      return candidate;
    }
  }
  return undefined;
}

export function buildMedallionSchema(tables: TableSchema[]): Record<MedallionLayer, TableSchema[]> {
  return {
    bronze: tables,
    silver: tables.map((t) => addAuditColumns(t, 'silver')),
    gold: [],
  };
}

function addAuditColumns(schema: TableSchema, layer: MedallionLayer): TableSchema {
  const auditCols = [
    { name: '_migration_id', dataType: 'string', targetType: 'STRING', nullable: false, isPrimaryKey: false, isForeignKey: false },
    { name: '_migrated_at', dataType: 'timestamp', targetType: 'TIMESTAMP', nullable: false, isPrimaryKey: false, isForeignKey: false },
    { name: '_layer', dataType: 'string', targetType: 'STRING', nullable: false, isPrimaryKey: false, isForeignKey: false },
  ];

  return {
    ...schema,
    columns: [...schema.columns, ...auditCols],
  };
}
