---
name: dependency-map
description: Map all object dependencies in source databases — FK relationships, views, stored procedures, triggers, and report dependencies — to identify what must migrate in which order
argument-hint: "<manifest-path>"
allowed-tools: Read Bash mcp__claude-flow__memory_store mcp__claude-flow__memory_search
---

# Dependency Map

Traces all inter-object dependencies in the source database to determine migration order and identify objects that cannot be migrated without their dependencies.

## When to use

After data-profiling. Before As-Is documentation. Essential for databases with > 10 tables or any FK relationships.

## Steps

1. **FK graph** — build directed graph of all FK relationships; detect circular references
2. **View dependencies** — list all views and which tables they reference
3. **Stored procedure scan** — parse SP bodies to extract referenced tables (heuristic)
4. **Trigger inventory** — list triggers, their events, and tables they read/write
5. **Migration order** — topological sort of tables by FK dependency (parents before children)
6. **Orphan detection** — identify FK values with no matching parent (must be fixed or excluded)
7. **Impact analysis** — for each table: what breaks if it migrates but its dependencies don't

## Migration Order Output

```
=== Dependency Map: {mapId} ===
Tables: {N} | FK relationships: {M} | Circular refs: {C}

Recommended migration order (FK-safe):
  Batch 1 (no dependencies):  products, categories, regions
  Batch 2 (depend on Batch 1): customers, suppliers
  Batch 3 (depend on Batch 2): orders, addresses
  Batch 4 (depend on Batch 3): order_items, returns

Objects NOT migrated (view-only, no data):
  Views: v_active_customers, v_monthly_sales (recreate in target)
  SPs:   sp_process_orders (recreate as dbt model or Databricks job)
  Triggers: trg_audit (replace with Delta CDF in target)

Orphan FK records: 230 in dbo.orders.customer_id → will be excluded or NULL-filled
  Recommendation: set migration_null_on_orphan: true in manifest

Next step: /migration-as-is-report <mapId>
```
