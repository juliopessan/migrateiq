---
name: migration-run
description: Execute a full data migration from a YAML manifest — inspects source, maps schemas, runs parallel table migrations to Databricks or Fabric, and validates results
argument-hint: "<manifest-path>"
allowed-tools: Read Write Glob Bash mcp__claude-flow__memory_store mcp__claude-flow__memory_search mcp__claude-flow__swarm_init mcp__claude-flow__agent_spawn
---

# Migration Run

Execute a complete data migration from a YAML manifest file.

## When to use

When you have a prepared migration manifest and want to execute the full ETL pipeline: source inspection → schema mapping → parallel extraction → target loading → validation.

## Steps

1. **Read manifest** — load and validate the YAML manifest from `<manifest-path>`
2. **Initialize swarm** — call `mcp__claude-flow__swarm_init` with hierarchical topology, max 6 agents
3. **Spawn source-inspector** — discover all tables in scope from the manifest
4. **Spawn schema-mapper** — map source types to target types (Delta Lake or Fabric SQL)
5. **For each target layer** (`bronze` first): call `ensureSchema` on the target connector
6. **Parallel extraction** — spawn up to 3 `data-extractor` agents concurrently (one per table)
7. **Load to target** — each extractor pipes batches to `data-loader` for the configured target
8. **Checkpoint** — save progress every `checkpointInterval` rows to `data-migration` namespace
9. **Spawn migration-validator** — run quality gates after all tables complete
10. **Report** — display summary: tables migrated, rows loaded, duration, verdict

## Resume Behavior

If migration was interrupted:
- Recall checkpoints from AgentDB `data-migration` namespace
- Resume each table from its last saved offset / watermark
- Skip tables already marked `completed`

## CLI Alternative

```bash
npx tsx src/index.ts run --manifest <manifest-path>
```

## Error Handling

- Per-table failures: mark failed, continue other tables, report all at end
- FAIL verdict from validator: print issues, do NOT auto-rollback (use `/migration-rollback`)
- Source disconnect: save all checkpoints, stop gracefully
