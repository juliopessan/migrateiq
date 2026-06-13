---
name: pii-scan
description: Scan source databases for personally identifiable information (PII) — CPF, CNPJ, email, phone, name, date-of-birth — and output a masking requirements report per LGPD
argument-hint: "<manifest-path>"
allowed-tools: Read Bash mcp__claude-flow__memory_store mcp__claude-flow__memory_search
---

# PII Scan

Dedicated PII detection pass. Can run standalone or as part of data-profiling. Produces the PII inventory that feeds compliance-auditor and schema-mapper masking rules.

## When to use

- As part of data-profiling (runs automatically)
- Standalone when compliance team needs a PII report before approving the migration
- After adding new tables to scope to check if new PII is introduced

## Steps

1. **Load manifest** — scope of tables to scan
2. **Name-based detection** — flag columns whose names match PII hint patterns (cpf, email, telefone, nome, etc.)
3. **Pattern-based detection** — sample up to 1000 rows per column, apply regex patterns to detect CPF, CNPJ, email, phone, credit card
4. **Classify by LGPD category** — Dados Pessoais / Dados Pessoais Sensíveis (health, race, religion, biometric)
5. **Generate masking requirements** — for each PII column: recommended masking operation (mask, tokenize, pseudonymize, encrypt, drop)
6. **Save inventory** — persist to AgentDB namespace `data-migration-pii`
7. **Output report** — LGPD-ready PII inventory

## LGPD Categories

| Category | Examples | Required treatment |
|----------|---------|-------------------|
| Dados Pessoais | name, email, CPF, phone, address | Mask or pseudonymize in Silver+ |
| Dados Pessoais Sensíveis | health data, race, religion, biometric, political opinion | Extra protection — encrypt or tokenize, restrict access |
| Dados de Crianças | any data of person under 13 | Block migration unless parental consent verified |

## Output Format

```
=== PII Scan: {scanId} ===
Tables scanned: {N} | Columns scanned: {M}

PII Inventory:
  ┌──────────────────┬──────────────┬────────────────┬─────────────────────────┐
  │ Table.Column     │ PII Type     │ LGPD Category  │ Recommended operation   │
  ├──────────────────┼──────────────┼────────────────┼─────────────────────────┤
  │ customers.email  │ EMAIL        │ Dados Pessoais │ mask → j***@domain.com  │
  │ customers.cpf    │ CPF          │ Dados Pessoais │ tokenize (deterministic)│
  │ customers.nome   │ FULL_NAME    │ Dados Pessoais │ pseudonymize            │
  │ patients.diag    │ HEALTH_DATA  │ Sensível       │ encrypt (AES-256)       │
  └──────────────────┴──────────────┴────────────────┴─────────────────────────┘

Sensitive data tables: {N} — require additional access controls
Masking rules generated: {M} → feed to /migration-schema-mapping

Next step: /migration-compliance-report <scanId>
```
