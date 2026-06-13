---
name: lifecycle-report
description: Generate the final consolidated migration report — per-phase telemetry (duration, tokens, model, cost), models-used breakdown, totals, and ROI — aggregating telemetry captured across all 10 lifecycle phases
argument-hint: "<migrationId>"
allowed-tools: Read Write Bash mcp__claude-flow__memory_search mcp__claude-flow__memory_store
---

# Lifecycle Report

Generates the final telemetry report for a migration. Every phase emits its own telemetry record (duration, tokens, model, estimated cost) via the `PhaseTracker`; this skill aggregates all of them into one consolidated report — including which model was used at each step and the total cost.

## When to use

At the very end of the migration, after post-migration. This is the report that goes to the project sponsor: it shows exactly how the AI orchestration was spent across the lifecycle.

## How telemetry is captured

Each agent wraps its work in a tracked phase:

```ts
const tracker = new PhaseTracker(migrationId);

tracker.start('pre-assessment');              // model resolved from PHASE_DEFAULT_MODEL
// ... agent does work ...
tracker.end('pre-assessment', {               // report token usage
  input: 12_000, output: 3_400, cacheRead: 80_000,
});

// ... repeat for all 10 phases ...

const report = tracker.aggregate();           // consolidated telemetry
```

Telemetry per phase is persisted to AgentDB namespace `data-migration-telemetry` so the report survives across sessions and interruptions.

## Steps

1. **Collect telemetry** — load all phase records from AgentDB `data-migration-telemetry` for the migrationId
2. **Resolve models** — map each phase to the model that executed it (Sonnet 4.6 / Haiku 4.5)
3. **Compute costs** — per-phase and total, using `MODEL_PRICING`
4. **Aggregate by model** — tokens, duration, and cost grouped by model
5. **Compute ROI** — AI cost vs. estimated manual person-days avoided
6. **Render report** — populate `docs/lifecycle-report-{migrationId}.md` from template
7. **Print footer line** — one-line summary in Claude Code footer format

## Output

```
=== Lifecycle Report: {migrationId} ===

Telemetry per phase:
  ┌──────────────────────┬────────────────────────┬───────────┬──────────┬─────────┬──────────┐
  │ Phase                │ Agent                  │ Model     │ Duration │ Tokens  │ Cost     │
  ├──────────────────────┼────────────────────────┼───────────┼──────────┼─────────┼──────────┤
  │ ✅ 1. Pre-Assessment │ pre-assessment-analyst │ Sonnet 4.6│ 2m 10s   │ 95.4k   │ $0.1221  │
  │ ✅ 2. Data Profiling │ data-profiler          │ Sonnet 4.6│ 5m 32s   │ 210.0k  │ $0.2688  │
  │ ✅ 3. As-Is          │ as-is-documenter       │ Haiku 4.5 │ 3m 05s   │ 142.0k  │ $0.0568  │
  │ ✅ 4. To-Be          │ to-be-designer         │ Sonnet 4.6│ 4m 48s   │ 188.0k  │ $0.2406  │
  │ ✅ 5. Schema Mapping │ schema-mapper          │ Sonnet 4.6│ 1m 50s   │  78.0k  │ $0.0998  │
  │ ✅ 6. Code Gen       │ code-generator         │ Sonnet 4.6│ 6m 20s   │ 256.0k  │ $0.3277  │
  │ ✅ 7. Testing        │ test-engineer          │ Haiku 4.5 │ 4m 12s   │ 165.0k  │ $0.0660  │
  │ ✅ 8. Cutover Plan   │ cutover-planner        │ Sonnet 4.6│ 2m 30s   │  98.0k  │ $0.1254  │
  │ ✅ 9. Execution      │ migration-orchestrator │ Sonnet 4.6│ 12m 18s  │ 320.0k  │ $0.4096  │
  │ ✅ 10. Post-Migration│ post-migration-reporter│ Sonnet 4.6│ 2m 40s   │ 110.0k  │ $0.1408  │
  └──────────────────────┴────────────────────────┴───────────┴──────────┴─────────┴──────────┘

Models used:
  Sonnet 4.6 — 8 phases | 1.36M tokens | $1.73
  Haiku 4.5  — 2 phases | 307k tokens  | $0.12

TOTALS: 45m 25s · 1.66M tokens · $1.86 USD · 10/10 phases

Report saved: docs/lifecycle-report-{migrationId}.md
```
