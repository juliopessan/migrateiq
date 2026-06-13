---
name: migration
description: Data migration operations — plan, run, validate, rollback, and inspect SQL-to-Databricks/Fabric migrations
---

Migration commands:

**`migration plan <manifest>`** — Preview migration plan without executing.
1. Load and validate YAML manifest
2. Connect to source and inspect all in-scope tables
3. Display table-by-table plan: rows, batches, estimated duration
4. Highlight risks: missing PKs, no watermark column, large tables

**`migration run <manifest>`** — Execute migration.
1. Load manifest and validate credentials
2. Initialize Ruflo swarm (hierarchical, max 6 agents)
3. Spawn `source-inspector` → `schema-mapper` → parallel `data-extractor` + `data-loader`
4. Save checkpoints every N rows to AgentDB `data-migration` namespace
5. Auto-resume from checkpoint if interrupted
6. Run `migration-validator` after all tables complete
7. Display summary: tables migrated, rows loaded, duration, verdict

**`migration status <id>`** — Show progress of a running or interrupted migration.
1. Recall all checkpoints for migration ID from AgentDB
2. Display per-table status: rows loaded, watermark, status
3. Show validation results if available

**`migration validate <id>`** — Run post-migration quality checks.
1. Query source and target for row counts, MIN/MAX, null rates
2. Run `migration-validator` agent per table
3. Display PASS/WARNING/FAIL verdict per table and overall

**`migration rollback <id>`** — Roll back a failed full-load migration.
1. Recall checkpoint to find which tables were loaded
2. Confirm with user before truncating
3. Truncate target tables and clear checkpoints

**`migration inspect <manifest>`** — Inspect source schema only.
1. Connect to source
2. Display all tables: schema, row count, columns, detected watermark
3. Suggest watermark column for incremental loads
