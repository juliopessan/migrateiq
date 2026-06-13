import { logger } from '../utils/logger.js';

/**
 * Minimal data source the profiler needs. Kept independent of the migration
 * `SourceConnector` so profiling can run against any backend (live DB, sample
 * export, or a mock) without dragging in extraction concerns.
 */
export interface ProfilerDataSource {
  listTables(schema: string): Promise<string[]>;
  getRowCount(schema: string, table: string): Promise<number>;
  getColumns(schema: string, table: string): Promise<Array<{ name: string; type: string; isPrimaryKey?: boolean }>>;
  getColumnStats(schema: string, table: string, column: string, sampleSize: number): Promise<ColumnStats>;
}

export interface ColumnStats {
  nullCount: number;
  distinctCount: number;
  emptyStringCount: number;
  minValue: unknown;
  maxValue: unknown;
  avgValue?: number;
  topValues?: Array<{ value: unknown; count: number }>;
}

export interface ColumnProfile {
  name: string;
  type: string;
  nullRate: number;
  uniquenessRate: number;
  minValue: unknown;
  maxValue: unknown;
  avgValue?: number;
  topValues: Array<{ value: unknown; count: number }>;
  isPrimaryKey: boolean;
  anomalies: ColumnAnomaly[];
}

export interface ColumnAnomaly {
  check: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  affectedRows: number;
  recommendation: string;
}

export interface TableProfile {
  schema: string;
  name: string;
  rowCount: number;
  qualityScore: number;
  columns: ColumnProfile[];
  anomalies: ColumnAnomaly[];
}

export interface ProfileResult {
  profilingId: string;
  sourceId: string;
  profiledAt: string;
  overallQualityScore: number;
  tables: TableProfile[];
}

const SAMPLE_SIZE = 1000;
const WATERMARK_HINTS = ['updated_at', 'modified_at', 'dt_atualizacao', 'data_atualizacao', 'timestamp'];

export class DataProfiler {
  constructor(private connector: ProfilerDataSource) {}

  async profileTable(schema: string, table: string): Promise<TableProfile> {
    const fqn = `${schema}.${table}`;
    logger.info(`Profiling ${fqn}`);

    const rowCount = await this.connector.getRowCount(schema, table);
    const columns = await this.connector.getColumns(schema, table);
    const columnProfiles: ColumnProfile[] = [];

    for (const col of columns) {
      const profile = await this.profileColumn(schema, table, col.name, col.type, col.isPrimaryKey ?? false, rowCount);
      columnProfiles.push(profile);
    }

    const anomalies = columnProfiles.flatMap(c => c.anomalies);
    const qualityScore = this.computeQualityScore(anomalies, rowCount);

    return { schema, name: table, rowCount, qualityScore, columns: columnProfiles, anomalies };
  }

  private async profileColumn(
    schema: string,
    table: string,
    column: string,
    type: string,
    isPrimaryKey: boolean,
    totalRows: number,
  ): Promise<ColumnProfile> {
    const stats = await this.connector.getColumnStats(schema, table, column, SAMPLE_SIZE);
    const nullRate = totalRows > 0 ? stats.nullCount / totalRows : 0;
    const uniquenessRate = totalRows > 0 ? stats.distinctCount / totalRows : 0;
    const anomalies: ColumnAnomaly[] = [];

    if (isPrimaryKey && uniquenessRate < 1.0) {
      anomalies.push({
        check: 'duplicate_pk',
        severity: 'CRITICAL',
        affectedRows: Math.round((1 - uniquenessRate) * totalRows),
        recommendation: `Deduplicate ${column} before migration`,
      });
    }

    if (stats.emptyStringCount > 0 && (type.includes('varchar') || type.includes('text') || type.includes('string'))) {
      anomalies.push({
        check: 'empty_string_as_null',
        severity: 'LOW',
        affectedRows: stats.emptyStringCount,
        recommendation: `Set migration option emptyStringToNull: true for column ${column}`,
      });
    }

    if (nullRate > 0.8 && !type.includes('nullable')) {
      anomalies.push({
        check: 'high_null_rate',
        severity: 'MEDIUM',
        affectedRows: Math.round(nullRate * totalRows),
        recommendation: `Investigate why ${column} has ${Math.round(nullRate * 100)}% nulls`,
      });
    }

    return {
      name: column,
      type,
      nullRate,
      uniquenessRate,
      minValue: stats.minValue,
      maxValue: stats.maxValue,
      avgValue: stats.avgValue,
      topValues: stats.topValues ?? [],
      isPrimaryKey,
      anomalies,
    };
  }

  private computeQualityScore(anomalies: ColumnAnomaly[], rowCount: number): number {
    if (rowCount === 0) return 100;
    let deductions = 0;
    for (const a of anomalies) {
      if (a.severity === 'CRITICAL') deductions += 30;
      else if (a.severity === 'HIGH') deductions += 15;
      else if (a.severity === 'MEDIUM') deductions += 7;
      else deductions += 2;
    }
    return Math.max(0, 100 - deductions);
  }

  async profileAll(schemas: string[], tables?: string[]): Promise<ProfileResult> {
    const profilingId = `profiling-${Date.now()}`;
    const allTables: TableProfile[] = [];

    for (const schema of schemas) {
      const schemaTables = tables ?? await this.connector.listTables(schema);
      for (const table of schemaTables) {
        try {
          const profile = await this.profileTable(schema, table);
          allTables.push(profile);
        } catch (err) {
          logger.error(`Failed to profile ${schema}.${table}:`, err);
        }
      }
    }

    const overallScore = allTables.length > 0
      ? Math.round(allTables.reduce((sum, t) => sum + t.qualityScore, 0) / allTables.length)
      : 0;

    return {
      profilingId,
      sourceId: 'source',
      profiledAt: new Date().toISOString(),
      overallQualityScore: overallScore,
      tables: allTables,
    };
  }

  detectWatermarkColumn(columns: ColumnProfile[]): string | undefined {
    return columns.find(c => WATERMARK_HINTS.some(hint => c.name.toLowerCase().includes(hint)))?.name;
  }
}
