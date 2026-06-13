---
name: schema-mapping
description: Review and approve the column-level mapping between source and target — resolve type conflicts, verify PII coverage, handle unmapped columns — and produce the final mapping manifest for code generation
argument-hint: "<mappingId>"
allowed-tools: Read Write mcp__claude-flow__memory_search mcp__claude-flow__memory_store
---

# Schema Mapping

Finalizes the mapping manifest. This is the human checkpoint before any code is generated. Every source column must have a disposition: map, rename, mask, tokenize, derive, or drop.

## When to use

After to-be-design. Before code-generate. This is a required approval gate — code generation is blocked until schema-mapping produces a verdict of APPROVED.

## Steps

1. **Load draft mapping** — retrieve `mapping-{id}.yaml` from AgentDB
2. **Completeness check** — confirm 100% of source columns have an explicit disposition
3. **Type conflict analysis** — identify lossy casts, flag for confirmation
4. **PII coverage check** — confirm every PII column from pii-scan has a masking rule
5. **Unmapped column handling** — apply defaults or prompt for decision
6. **Conflict resolution** — for each type conflict: accept risk (document) or change target type
7. **Write final mapping** — save approved `migrations/manifests/mapping-{id}-approved.yaml`

## Output

```
=== Schema Mapping: {mappingId} ===
Source columns: {total}
  ✅ mapped: {N}
  ✅ renamed: {N}
  ✅ masked/tokenized: {N}  (PII coverage: 100%)
  ✅ dropped: {N}
  ❌ gaps: {N}

Type conflicts:
  ⚠️ orders.total_amount: DECIMAL(18,6) → DECIMAL(10,2) — PRECISION LOSS
     Accepted: yes | reason: "business confirmed 2 decimal places sufficient"

Verdict: APPROVED ✅

Mapping saved: migrations/manifests/mapping-{id}-approved.yaml

Next step: /migration-code-generate mapping-{id}-approved
```
