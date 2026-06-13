---
name: data-profiling
description: Deep-profile source data quality — null rates, uniqueness, value distributions, anomalies — per table and column, producing a quality score and readiness assessment
argument-hint: "<manifest-path>"
allowed-tools: Read Bash mcp__claude-flow__memory_store mcp__claude-flow__memory_search
---

# Data Profiling

Runs after pre-assessment. Connects to source databases and collects column-level statistics for every table in scope.

## When to use

After pre-assessment GO verdict. Before As-Is documentation. Use to answer: "What is the actual quality of the data we will migrate, and what problems do we need to fix?"

## Steps

1. **Load manifest** — read source connection details and table scope
2. **Connect to source** — run `npx tsx engine/src/index.ts profile --manifest <path>`
3. **Per-column statistics** — for each column: null rate, uniqueness, min/max, avg (numeric), top-10 values, regex pattern (string)
4. **Anomaly detection** — duplicate PKs, orphan FKs, NOT NULL violations, date anomalies, empty strings as NULL
5. **Quality scoring** — per-table score (0–100) weighted by anomaly severity
6. **Save results** — persist to AgentDB namespace `data-migration-profiling`
7. **Print summary** — table-by-table quality scores and top anomalies

## Output Format

```
=== Data Profiling: {profilingId} ===
Source: {source} | Tables profiled: {N} | Duration: {duration}

Quality Scores:
  ┌───────────────────────┬───────┬──────────┬────────────────────────────┐
  │ Table                 │ Score │ PII cols │ Anomalies                  │
  ├───────────────────────┼───────┼──────────┼────────────────────────────┤
  │ dbo.customers         │ 92/100│ 4        │ 1 LOW (empty→null)         │
  │ dbo.orders            │ 85/100│ 0        │ 2 MEDIUM (orphan FKs: 230) │
  │ dbo.products          │ 98/100│ 0        │ none                       │
  └───────────────────────┴───────┴──────────┴────────────────────────────┘

Overall source quality: 78/100
PII inventory: 4 tables with PII — masking rules required

Critical anomalies: 0 | High: 2 | Medium: 3 | Low: 1

Next step: /migration-as-is-report <profilingId>
```
