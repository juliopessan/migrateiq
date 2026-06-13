---
name: to-be-design
description: Generate the To-Be target architecture — Medallion layer assignments, target DDL, transformation rules, masking policies, and data quality expectations — ready for schema-mapper review
argument-hint: "<profilingId>"
allowed-tools: Read Write mcp__claude-flow__memory_search mcp__claude-flow__memory_store
---

# To-Be Design

Generates the complete target architecture design. This is the "after" blueprint — what the data will look like in Databricks or Microsoft Fabric after migration.

## When to use

After As-Is report is signed off. Before schema-mapping. This produces all design artifacts that feed code generation.

## Steps

1. **Retrieve as-is data** — load profiling, PII scan, and dependency map
2. **Assign Medallion layers** — decide Bronze/Silver/Gold for each table using assignment rules
3. **Design target schema** — map source types to Delta Lake types, add audit columns
4. **Define transformations** — cast, rename, mask, derive, drop rules per column
5. **Define DQ expectations** — Great Expectations-style rules per table
6. **Generate masking policies** — one masking rule per PII column per layer
7. **Write target DDL** — `CREATE TABLE` statements for Bronze, Silver, and Gold
8. **Write design doc** — populate `docs/to-be-design-{id}.md` from template

## Output

Writes:
- `docs/to-be-design-{id}.md` — human-readable design document
- `migrations/manifests/mapping-{id}.yaml` — draft mapping for schema-mapper

```
=== To-Be Design generated ===
Bronze tables: {N}
Silver tables: {N} (PII masked)
Gold tables: {N} (aggregations)
Transformation rules: {M}
Masking rules: {P} (covering 100% of PII columns)
DQ expectations: {K}

⚠️ Draft mapping saved — send to /migration-schema-mapping <mappingId> for approval.

Next step: /migration-schema-mapping mapping-{id}
```
