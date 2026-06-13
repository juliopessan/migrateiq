---
name: as-is-report
description: Generate the complete As-Is documentation — data dictionary, ER diagram, ETL inventory, lineage, and volume baselines — from profiling and dependency map results
argument-hint: "<profilingId>"
allowed-tools: Read Write mcp__claude-flow__memory_search mcp__claude-flow__memory_store
---

# As-Is Report

Generates the formal As-Is documentation of the source environment. This is the baseline document that stakeholders sign off before any design work begins.

## When to use

After data-profiling and dependency-map complete. Before to-be-design. This document is the "before" snapshot — it must be approved by the data owner before proceeding.

## Steps

1. **Retrieve all phase data** — load pre-assessment, profiling, PII scan, and dependency map from AgentDB
2. **Build data dictionary** — table-by-table with business name inference, constraints, sample values
3. **Generate ER diagram** — Mermaid ERD syntax covering all tables and FK relationships
4. **Compile ETL inventory** — stored procedures, views, triggers with business purpose
5. **Document lineage** — which tables feed which downstream consumers
6. **Capture baselines** — row counts, null rates, quality scores as acceptance criteria
7. **Write report** — populate `docs/as-is-report-{id}.md` from template

## Output

Writes: `docs/as-is-report-{profilingId}.md`

```
=== As-Is Report generated ===
File: docs/as-is-report-{id}.md
Tables documented: {N}
ER diagram: {M} relationships
ETL objects inventoried: {K}
PII columns documented: {P}

⚠️ Requires sign-off from data owner before proceeding to To-Be design.

Next step: /migration-to-be-design <profilingId>
```
