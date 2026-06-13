---
name: migration-status
description: Show real-time progress of a running or interrupted migration — per-table status, rows loaded, watermarks, and checkpoint state from AgentDB
argument-hint: "<migration-id>"
allowed-tools: Read Bash mcp__claude-flow__memory_search
---

# Migration Status

Show the current state of a migration from its checkpoints.

## Steps

1. **Recall checkpoints** — search AgentDB namespace `data-migration` for key prefix `<migration-id>`
2. **Recall validation results** — search namespace `data-migration-validation` for the same ID
3. **Format status table** — show per-table progress

## Output Format

```
=== Migration Status: migration-001 ===
Strategy: incremental | Last run: 2024-06-13 09:15:00

Tables:
  ✅ dbo.customers        completed   125,000 rows   watermark: 2024-06-13T09:00:00Z
  🔄 dbo.orders           running     1,250,000/2,500,000 rows (50%)
  ⏳ dbo.products         pending     0/8,500 rows
  ❌ dbo.legacy_table     failed      error: connection timeout

Validation: PASS (3/4 tables validated)
```
