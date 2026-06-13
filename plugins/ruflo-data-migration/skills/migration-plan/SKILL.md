---
name: migration-plan
description: Analyze a migration manifest and generate a detailed execution plan with estimated row counts, duration, and table-by-table strategy before running
argument-hint: "<manifest-path>"
allowed-tools: Read Bash mcp__claude-flow__memory_search mcp__claude-flow__agentdb_pattern-search
---

# Migration Plan

Analyze a manifest and produce an execution plan — without executing anything.

## When to use

Before running `/migration-run`, use this to review what will be migrated, estimate time and volume, and identify potential issues.

## Steps

1. **Read manifest** — load YAML and validate structure
2. **Connect to source** — run `npx tsx src/index.ts inspect --manifest <path>` to get real table counts
3. **Recall past patterns** — search AgentDB for similar past migrations (same source type/target)
4. **Calculate estimates**:
   - Total rows = sum of row counts for all in-scope tables
   - Estimated duration = total rows / (batch_size × estimated_batches_per_minute)
   - Network estimate = total rows × avg_row_size_bytes
5. **Identify risks**:
   - Tables with no PK (incremental merge not possible → will append)
   - Tables with no watermark column (incremental not supported → will full load)
   - Tables with row count > 10M (suggest partitioned extraction)
   - Columns with type `text`/`ntext`/`longtext` (may cause large batch sizes)
6. **Output plan** — formatted table with per-table strategy

## Output Format

```
=== Migration Plan: migration-001 ===
Source: sqlserver:production
Target: databricks bronze
Strategy: full load

Tables to migrate:
  ┌─────────────────────┬────────────┬──────────┬──────────┬──────────────┐
  │ Table               │ Rows       │ Strategy │ Batches  │ Est. Duration│
  ├─────────────────────┼────────────┼──────────┼──────────┼──────────────┤
  │ dbo.customers       │ 125,000    │ full     │ 13       │ ~1m 20s      │
  │ dbo.orders          │ 2,500,000  │ full     │ 250      │ ~25m         │
  │ dbo.products        │ 8,500      │ full     │ 1        │ ~10s         │
  └─────────────────────┴────────────┴──────────┴──────────┴──────────────┘

Total: 2,633,500 rows | ~27m estimated | 3 tables

Risks:
  ⚠ dbo.orders: no watermark column detected (incremental runs will full-reload this table)
  ℹ dbo.customers: watermark=updated_at (incremental ready)
```
