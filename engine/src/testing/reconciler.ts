import { logger } from '../utils/logger.js';

export interface ReconciliationCheck {
  name: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  status: 'PASS' | 'FAIL' | 'SKIP';
  sourceValue: unknown;
  targetValue: unknown;
  tolerance?: number;
  detail: string;
}

export interface TableReconciliation {
  table: string;
  verdict: 'PASS' | 'PASS_WITH_WARNINGS' | 'FAIL';
  checks: ReconciliationCheck[];
  reconciledAt: string;
}

export interface ReconciliationResult {
  reconciliationId: string;
  migrationId: string;
  strategy: 'full' | 'incremental';
  verdict: 'RECONCILED' | 'RECONCILED_WITH_GAPS' | 'FAILED';
  tables: TableReconciliation[];
  reconciledAt: string;
  summary: {
    totalTables: number;
    passed: number;
    warnings: number;
    failed: number;
  };
}

const FULL_LOAD_ROW_TOLERANCE = 0.0001;   // 0.01%
const INCREMENTAL_ROW_TOLERANCE = 0.001;   // 0.1%
const NULL_RATE_TOLERANCE = 0.05;          // 5% relative
const NUMERIC_CHECKSUM_TOLERANCE = 0.00001; // 0.001%

export class Reconciler {
  checkRowCount(
    table: string,
    sourceCount: number,
    targetCount: number,
    strategy: 'full' | 'incremental',
  ): ReconciliationCheck {
    const tolerance = strategy === 'full' ? FULL_LOAD_ROW_TOLERANCE : INCREMENTAL_ROW_TOLERANCE;
    const delta = Math.abs(sourceCount - targetCount) / Math.max(sourceCount, 1);
    const pass = delta <= tolerance;

    return {
      name: 'row_count_parity',
      severity: 'ERROR',
      status: pass ? 'PASS' : 'FAIL',
      sourceValue: sourceCount,
      targetValue: targetCount,
      tolerance,
      detail: pass
        ? `source=${sourceCount} target=${targetCount} delta=${(delta * 100).toFixed(4)}%`
        : `MISMATCH: source=${sourceCount} target=${targetCount} delta=${(delta * 100).toFixed(4)}% exceeds ${(tolerance * 100).toFixed(2)}% tolerance`,
    };
  }

  checkPkUniqueness(table: string, duplicateCount: number): ReconciliationCheck {
    return {
      name: 'pk_uniqueness',
      severity: 'ERROR',
      status: duplicateCount === 0 ? 'PASS' : 'FAIL',
      sourceValue: 0,
      targetValue: duplicateCount,
      detail: duplicateCount === 0
        ? 'No duplicate PKs in target'
        : `${duplicateCount} duplicate PK values found in target`,
    };
  }

  checkNullRate(column: string, sourceNullRate: number, targetNullRate: number): ReconciliationCheck {
    const relativeDelta = sourceNullRate > 0
      ? Math.abs(sourceNullRate - targetNullRate) / sourceNullRate
      : Math.abs(targetNullRate);
    const pass = relativeDelta <= NULL_RATE_TOLERANCE;

    return {
      name: `null_rate_${column}`,
      severity: 'WARNING',
      status: pass ? 'PASS' : 'FAIL',
      sourceValue: `${(sourceNullRate * 100).toFixed(2)}%`,
      targetValue: `${(targetNullRate * 100).toFixed(2)}%`,
      tolerance: NULL_RATE_TOLERANCE,
      detail: pass
        ? `null rate within tolerance (${(relativeDelta * 100).toFixed(2)}% relative delta)`
        : `null rate deviation exceeds 5%: source=${(sourceNullRate * 100).toFixed(2)}% target=${(targetNullRate * 100).toFixed(2)}%`,
    };
  }

  checkNumericSum(column: string, sourceSum: number, targetSum: number, isFinancial = false): ReconciliationCheck {
    const tolerance = isFinancial ? 0 : NUMERIC_CHECKSUM_TOLERANCE;
    const delta = Math.abs(sourceSum - targetSum) / Math.max(Math.abs(sourceSum), 1);
    const pass = delta <= tolerance;

    return {
      name: `sum_${column}`,
      severity: isFinancial ? 'ERROR' : 'WARNING',
      status: pass ? 'PASS' : 'FAIL',
      sourceValue: sourceSum,
      targetValue: targetSum,
      tolerance,
      detail: pass
        ? `SUM matches${isFinancial ? ' (exact match — financial column)' : ''}`
        : `SUM mismatch: source=${sourceSum} target=${targetSum} delta=${(delta * 100).toFixed(6)}%`,
    };
  }

  buildTableResult(table: string, checks: ReconciliationCheck[]): TableReconciliation {
    const errors = checks.filter(c => c.severity === 'ERROR' && c.status === 'FAIL');
    const warnings = checks.filter(c => c.severity === 'WARNING' && c.status === 'FAIL');

    let verdict: TableReconciliation['verdict'];
    if (errors.length > 0) verdict = 'FAIL';
    else if (warnings.length > 0) verdict = 'PASS_WITH_WARNINGS';
    else verdict = 'PASS';

    logger.info(`Table ${table} reconciliation: ${verdict}`);
    return { table, verdict, checks, reconciledAt: new Date().toISOString() };
  }

  buildResult(migrationId: string, tables: TableReconciliation[], strategy: 'full' | 'incremental'): ReconciliationResult {
    const failed = tables.filter(t => t.verdict === 'FAIL').length;
    const warnings = tables.filter(t => t.verdict === 'PASS_WITH_WARNINGS').length;

    let verdict: ReconciliationResult['verdict'];
    if (failed > 0) verdict = 'FAILED';
    else if (warnings > 0) verdict = 'RECONCILED_WITH_GAPS';
    else verdict = 'RECONCILED';

    return {
      reconciliationId: `recon-${Date.now()}`,
      migrationId,
      strategy,
      verdict,
      tables,
      reconciledAt: new Date().toISOString(),
      summary: {
        totalTables: tables.length,
        passed: tables.filter(t => t.verdict === 'PASS').length,
        warnings,
        failed,
      },
    };
  }
}
