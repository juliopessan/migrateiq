---
name: pre-assessment
description: Run the pre-assessment phase — inventory source systems, score complexity, estimate effort, and get a go/no-go verdict before committing to a full migration
argument-hint: "<assessment-config-path>"
allowed-tools: Read Bash mcp__claude-flow__memory_store mcp__claude-flow__memory_search
---

# Pre-Assessment

Run before any other migration phase. Produces a complexity score, effort estimate, risk register, and go/no-go recommendation.

## When to use

At the very start of a migration engagement, before connecting deeply to any source system. Use this to answer: "Is this migration feasible, how complex is it, and how much will it cost?"

## Steps

1. **Load config** — read the assessment config YAML (sources, business context, constraints)
2. **Inventory sources** — for each source system: connect, enumerate schemas/tables, get rough row counts
3. **Score complexity** — apply 7-dimension matrix (Volume / Schema / Quality / Rules / Compliance / Availability / Team)
4. **Estimate effort** — calculate low/mid/high person-days from complexity class
5. **Build risk register** — identify blockers and mitigations
6. **Map stakeholders** — capture data owners, technical contacts, compliance officer
7. **Render output** — save JSON to AgentDB + print summary

## Output Format

```
=== Pre-Assessment: {assessmentId} ===
Sources: {N} systems | {totalTables} tables (estimated) | {totalRows} rows (estimated)

Complexity Score:
  Volume:        {score}/5
  Schema:        {score}/5
  Data Quality:  {score}/5
  Business Rules:{score}/5
  Compliance:    {score}/5
  Availability:  {score}/5
  Team:          {score}/5
  ──────────────────────────
  TOTAL:         {total}/35 → {class} complexity

Effort Estimate: {low}–{high} person-days (mid: {mid})

Top Risks:
  R01 [HIGH]: {risk description}
  R02 [MEDIUM]: {risk description}

Verdict: ✅ PROCEED | ⚠️ PROCEED_WITH_CONDITIONS | 🚫 BLOCK

Next step: /migration-data-profiling <config-path>
```
