---
name: compliance-report
description: Generate the final LGPD/SOX/GDPR compliance package — masking evidence, audit trail verification, access control confirmation, PII lineage, and signed compliance declaration — ready for legal and regulatory records
argument-hint: "<migrationId>"
allowed-tools: Read Write Bash mcp__claude-flow__memory_search mcp__claude-flow__memory_store
---

# Compliance Report

Generates the compliance evidence package. This is the artifact that legal, compliance, and audit teams keep as proof that the migration followed regulatory requirements.

## When to use

After reconciliation RECONCILED verdict. Part of the post-migration phase. Required before data can be accessed by end users in production.

## Steps

1. **Retrieve compliance audit** — load verdict from `compliance-auditor` run during design phase
2. **Verify masking applied** — confirm masking functions ran and PII is not present in Silver/Gold
3. **Verify audit columns** — confirm `_migration_id`, `_migrated_at`, `_source_system`, `_layer` present in all tables
4. **Verify access controls** — confirm only authorized roles can access PII columns
5. **Generate PII lineage** — trace each PII field from source to masked state in target
6. **Generate LGPD declaration** — formal declaration of compliance per Art. 5 and Art. 46 Lei 13.709/2018
7. **Write compliance package** — `docs/compliance-package-{migrationId}.md`

## Output

```
=== Compliance Report: {migrationId} ===

LGPD Compliance:
  PII inventory: ✅ complete ({N} fields across {M} tables)
  Masking coverage: ✅ 100% ({N} fields masked in Silver/Gold)
  Bronze PII access: ✅ restricted to migration-service-account + data-engineers
  Audit trail: ✅ all tables have _migration_id + _migrated_at
  Right to erasure: ✅ DELETE pathway tested and verified
  Lawful basis: ✅ documented (Legitimate Interest — data migration)

SOX Compliance:
  Financial data integrity: ✅ checksums verified
  Segregation of duties: ✅ operator ≠ auditor confirmed
  Change management: ✅ Change ticket #{ticketId} approved
  Retention: ✅ 7-year retention configured in Delta table properties

Overall verdict: ✅ COMPLIANT

Package saved: docs/compliance-package-{migrationId}.md

This document serves as evidence for LGPD Art. 46 technical safeguards compliance.
Retain for minimum 5 years per ANPD guidance.
```
