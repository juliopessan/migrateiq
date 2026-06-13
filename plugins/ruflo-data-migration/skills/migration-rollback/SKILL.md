---
name: migration-rollback
description: Roll back a failed migration by truncating target tables that were loaded and clearing checkpoints — only for full-load migrations
argument-hint: "<migration-id>"
allowed-tools: Read Bash mcp__claude-flow__memory_search mcp__claude-flow__memory_store
---

# Migration Rollback

Roll back a failed full-load migration by removing target data.

## When to use

When a full-load migration failed mid-way and you want to clean up the target before retrying. **Incremental rollbacks are not supported** (data already existed before the run).

## Steps

1. **Recall checkpoints** — load all checkpoint keys for `<migration-id>` from AgentDB
2. **Confirm with user** — list tables that will be truncated, ask for confirmation
3. **For each completed or in-progress table**:
   - Run TRUNCATE on the target table (Databricks or Fabric)
   - Clear the checkpoint file (`.migration-checkpoints/<id>_<table>.json`)
4. **Update checkpoint status** — mark all entries as `rolled-back` in AgentDB
5. **Report** — tables truncated, checkpoint files removed

## Safety Rules

- **NEVER** truncate tables from incremental runs
- **ALWAYS** show affected tables and ask for confirmation before truncating
- Only truncate tables that belong to this specific `migration-id`
