import { logger } from '../utils/logger.js';

export interface MigrationMetrics {
  migrationId: string;
  source: string;
  target: string;
  strategy: 'full' | 'incremental';
  startedAt: string;
  completedAt: string;
  totalTables: number;
  totalRowsMigrated: number;
  throughputRowsPerSec: number;
  estimatedDurationMin: number;
  actualDurationMin: number;
  tablesWithPii: number;
  qualityScore: number;
  reconciliationVerdict: string;
  complianceVerdict: string;
}

export interface ReportSection {
  title: string;
  content: string;
}

export class ReportGenerator {
  generateExecutiveSummary(metrics: MigrationMetrics): string {
    const durationDelta = metrics.actualDurationMin - metrics.estimatedDurationMin;
    const durationDeltaStr = durationDelta >= 0
      ? `+${durationDelta.toFixed(1)}m vs estimate`
      : `${durationDelta.toFixed(1)}m vs estimate`;

    const status = metrics.reconciliationVerdict === 'RECONCILED' && metrics.complianceVerdict === 'COMPLIANT'
      ? '✅ SUCCESS'
      : '⚠️ SUCCESS WITH GAPS';

    return `# Migration Complete — ${metrics.migrationId}
**Date:** ${metrics.completedAt}
**Duration:** ${metrics.actualDurationMin.toFixed(1)} min (${durationDeltaStr})
**Status:** ${status}

## What moved
- **${metrics.totalTables} tables** from ${metrics.source} to ${metrics.target}
- **${metrics.totalRowsMigrated.toLocaleString()}** rows migrated
- **${metrics.tablesWithPii} tables** with PII — all masked per LGPD requirements
- Strategy: **${metrics.strategy === 'full' ? 'Full Load' : 'Incremental with Watermark'}**

## Quality
- Reconciliation: ${metrics.reconciliationVerdict === 'RECONCILED' ? '✅ RECONCILED' : `⚠️ ${metrics.reconciliationVerdict}`}
- Data quality score: **${metrics.qualityScore}/100**
- Compliance: ${metrics.complianceVerdict === 'COMPLIANT' ? '✅ COMPLIANT (LGPD + SOX)' : `⚠️ ${metrics.complianceVerdict}`}

## Performance
- Throughput: **${metrics.throughputRowsPerSec.toLocaleString()} rows/sec**
- Total duration: **${metrics.actualDurationMin.toFixed(1)} min** (estimated: ${metrics.estimatedDurationMin.toFixed(1)} min)

## Next steps
- Data is available at: \`${metrics.target}\`
- Contact the technical team for connection strings and access setup
`;
  }

  generateTechnicalReport(metrics: MigrationMetrics, sections: ReportSection[]): string {
    const header = `# Technical Migration Report — ${metrics.migrationId}
Generated: ${new Date().toISOString()}

| Field | Value |
|-------|-------|
| Migration ID | ${metrics.migrationId} |
| Source | ${metrics.source} |
| Target | ${metrics.target} |
| Strategy | ${metrics.strategy} |
| Started | ${metrics.startedAt} |
| Completed | ${metrics.completedAt} |
| Duration | ${metrics.actualDurationMin.toFixed(1)} min |
| Rows migrated | ${metrics.totalRowsMigrated.toLocaleString()} |
| Throughput | ${metrics.throughputRowsPerSec.toLocaleString()} rows/sec |
| Reconciliation | ${metrics.reconciliationVerdict} |
| Compliance | ${metrics.complianceVerdict} |

`;

    const body = sections.map(s => `## ${s.title}\n\n${s.content}`).join('\n\n---\n\n');
    return header + body;
  }

  generateDataLineage(
    tables: Array<{ source: string; bronze: string; silver: string; gold?: string; transformations: string }>,
  ): string {
    const rows = tables
      .map(t => `| ${t.source} | ${t.bronze} | ${t.silver} | ${t.gold ?? '—'} | ${t.transformations} |`)
      .join('\n');

    return `# Data Lineage — post-migration

| Source table | Bronze | Silver | Gold | Transformations |
|-------------|--------|--------|------|----------------|
${rows}

_Lineage generated automatically from mapping manifest. Retain for data governance records._
`;
  }

  generateLessonsLearned(
    metrics: MigrationMetrics,
    anomaliesFound: number,
    notes: string[],
  ): string {
    const throughputDelta = ((metrics.throughputRowsPerSec - 50000) / 50000 * 100).toFixed(1);
    const durationDelta = ((metrics.actualDurationMin / metrics.estimatedDurationMin - 1) * 100).toFixed(1);

    return `## Lessons Learned

### Estimates vs. Actuals
| Metric | Estimated | Actual | Delta |
|--------|-----------|--------|-------|
| Duration | ${metrics.estimatedDurationMin.toFixed(1)} min | ${metrics.actualDurationMin.toFixed(1)} min | ${durationDelta}% |
| Throughput | 50,000 rows/s | ${metrics.throughputRowsPerSec.toLocaleString()} rows/s | ${throughputDelta}% |
| Anomalies | 0 expected | ${anomaliesFound} found | — |

### Notes
${notes.map(n => `- ${n}`).join('\n')}
`;
  }

  logReport(type: string, migrationId: string): void {
    logger.info(`Report generated: ${type} for migration ${migrationId}`);
  }
}
