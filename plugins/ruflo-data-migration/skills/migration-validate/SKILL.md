---
name: migration-validate
description: Run post-migration data quality checks — row count parity, PK uniqueness, null rates, numeric ranges — and issue PASS/WARNING/FAIL verdicts per table
argument-hint: "<migration-id>"
allowed-tools: Read Bash mcp__claude-flow__memory_store mcp__claude-flow__memory_search
---

# Migration Validate

Run data quality gates after a migration completes.

## Steps

1. **Load manifest** — find manifest from AgentDB checkpoint (namespace: `data-migration`)
2. **For each migrated table**:
   a. Query source: `SELECT COUNT(*), MIN(pk), MAX(pk)` 
   b. Query target: same queries
   c. Compare row counts (tolerance: 0 for full, ±0.01% for incremental)
   d. Check PK uniqueness on target
   e. Check null rates for NOT NULL columns
3. **Spawn `migration-validator` agent** per table for detailed checks
4. **Aggregate verdicts** — overall PASS if all tables PASS/WARNING
5. **Store results** in AgentDB namespace `data-migration-validation`
6. **Report** — summary table with per-check status

## CLI Alternative

```bash
# After migration completes, validator runs automatically
# To re-run manually:
npx tsx src/index.ts validate --manifest ./migrations/manifests/my-migration.yaml
```
