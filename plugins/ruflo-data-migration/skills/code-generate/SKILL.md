---
name: code-generate
description: Generate all executable migration artifacts from the approved mapping — DDL statements, ETL manifest, transformation SQL, PII masking functions, test files, and rollback scripts — ready for human review
argument-hint: "<approvedMappingId>"
allowed-tools: Read Write Bash mcp__claude-flow__memory_search mcp__claude-flow__memory_store
---

# Code Generate

Generates all migration code artifacts from the approved mapping manifest. Nothing is executed — all artifacts land in `migrations/generated/{migrationId}/` for human review before any data moves.

## When to use

After schema-mapping APPROVED verdict. Before test-generate and migration-run. This is the code generation phase — review all outputs before proceeding.

## Steps

1. **Load approved mapping** — retrieve `mapping-{id}-approved.yaml`
2. **Generate DDL** — `CREATE TABLE` for Bronze, Silver, Gold (Delta Lake or Fabric syntax)
3. **Generate ETL manifest** — `migration-orchestrator`-ready manifest with all transformations embedded
4. **Generate transformation SQL** — `INSERT INTO ... SELECT` with casts, renames, masking UDF calls
5. **Generate PII masking functions** — reusable UDFs for each masking operation
6. **Generate test stubs** — pytest structure with reconciliation assertions
7. **Generate rollback DDL** — `DROP TABLE IF EXISTS` for all generated tables
8. **Write all artifacts** — to `migrations/generated/{migrationId}/`

## Output

```
=== Code Generate: {migrationId} ===
Artifacts generated in migrations/generated/{migrationId}/:

  ddl/bronze/    {N} CREATE TABLE statements
  ddl/silver/    {N} CREATE TABLE statements (PII masked)
  ddl/gold/      {N} CREATE TABLE statements
  etl/           manifest.yaml + {N} transformation SQL files
  masking/       pii_functions.sql ({M} masking functions)
  tests/         {N} test files ({K} assertions)
  rollback/      drop_all.sql

⚠️ Review all artifacts before executing.

Next step: /migration-test-generate {migrationId}
Then:      /migration-run --manifest migrations/generated/{migrationId}/etl/manifest.yaml
```
