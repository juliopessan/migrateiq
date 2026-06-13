---
name: reconciliation
description: Post-execution deep reconciliation — row count parity, column checksums, financial totals, business KPI validation, and null rate comparison between source and target — beyond the basic migration-validate checks
argument-hint: "<migrationId>"
allowed-tools: Read Bash mcp__claude-flow__memory_search mcp__claude-flow__memory_store
---

# Reconciliation

Runs deep post-execution reconciliation comparing source and target. Goes beyond migration-validate (which checks row counts and PKs) to include financial totals, business KPIs, and column-level checksums.

## When to use

Immediately after migration-run completes. Before compliance-report and post-migration-reporter. Feeds the final validation verdict.

## Steps

1. **Row count reconciliation** — source vs. target count per table (tolerance: 0.01% full / 0.1% incremental)
2. **Column checksum** — SUM/COUNT/AVG on numeric columns; result must match within tolerance
3. **Financial reconciliation** — for columns tagged as financial: SUM must match exactly (0% tolerance)
4. **Business KPI validation** — run pre-defined business queries on source and target; compare results
5. **Null rate comparison** — null rate per column must not deviate > 5% relative
6. **PK uniqueness** — zero duplicate PKs in target (all layers)
7. **Watermark check** — max watermark in target >= max in source checkpoint
8. **Verdict** — RECONCILED | RECONCILED_WITH_GAPS | FAILED

## Output

```
=== Reconciliation: {migrationId} ===

Row count parity:
  ┌───────────────────┬────────────┬────────────┬──────────┐
  │ Table             │ Source     │ Target     │ Status   │
  ├───────────────────┼────────────┼────────────┼──────────┤
  │ customers         │ 125,000    │ 125,000    │ ✅ PASS  │
  │ orders            │ 2,500,000  │ 2,499,987  │ ✅ PASS  │  ← within 0.01%
  └───────────────────┴────────────┴────────────┴──────────┘

Financial reconciliation:
  orders.total_amount  SUM: R$ 4,231,540.00 = R$ 4,231,540.00 ✅ EXACT MATCH
  orders.tax_amount    SUM: R$ 338,523.20  = R$ 338,523.20  ✅ EXACT MATCH

Column checksums: {N}/{M} match ✅ | {K} within tolerance ⚠️

Verdict: ✅ RECONCILED

Next step: /migration-compliance-report {migrationId}
```
