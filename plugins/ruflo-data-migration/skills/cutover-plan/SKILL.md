---
name: cutover-plan
description: Generate the production cutover runbook — strategy selection, step-by-step timeline, rollback triggers, freeze window, and communication plan — required before any production execution
argument-hint: "<migrationId>"
allowed-tools: Read Write mcp__claude-flow__memory_search mcp__claude-flow__memory_store
---

# Cutover Plan

Generates the production cutover runbook. This is the last gate before real data is moved. No production execution is allowed without an approved cutover runbook.

## When to use

After test-generate verdict PASS or PASS_WITH_WARNINGS. Before production migration-run. Requires human approval of the generated runbook.

## Steps

1. **Select strategy** — Big Bang / Phased / Parallel Run based on complexity and constraints
2. **Calculate freeze window** — estimate final incremental load duration + reconciliation time
3. **Build timeline** — step-by-step with owners, durations, and go/no-go checks
4. **Define rollback triggers** — explicit conditions that abort cutover
5. **Write rollback procedure** — step-by-step reversal with time estimates
6. **Define parallel run criteria** — if parallel run: exit criteria and reconciliation schedule
7. **Write communication plan** — who gets notified at each milestone
8. **Output runbook** — `docs/cutover-runbook-{migrationId}.md`

## Output

```
=== Cutover Plan: {migrationId} ===
Strategy: {Big Bang | Phased | Parallel Run}
Estimated freeze window: {duration}
Estimated total cutover time: {duration}

Runbook saved: docs/cutover-runbook-{migrationId}.md

Steps in runbook: {N}
Rollback triggers defined: {M}
Stakeholders in communication plan: {K}

⚠️ Runbook requires sign-off from: {data owner}, {DBA}, {project lead}

After approval, run:
  npm run migrate -- run --manifest migrations/generated/{migrationId}/etl/manifest.yaml --env production
```
