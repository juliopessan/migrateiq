# To-Be Design — {assessmentId}

**Generated:** {generatedAt}  
**Based on As-Is:** {asIsReportId}  
**Target Platform:** {platform}  
**Status:** ⚠️ Awaiting approval

---

## 1. Target Architecture Overview

```
Source (on-prem / legacy)
        │
        ▼
  ┌─────────────────┐
  │   Bronze Layer  │  Raw copy · Audit columns · No transforms · PII kept
  └─────────────────┘
        │
        ▼
  ┌─────────────────┐
  │   Silver Layer  │  Cleansed · Typed · PII masked · Business rules applied
  └─────────────────┘
        │
        ▼
  ┌─────────────────┐
  │    Gold Layer   │  Aggregations · KPIs · BI-ready · Restricted access
  └─────────────────┘
```

**Platform:** {platform}  
**Catalog:** {catalog}  
**Bronze schema:** `bronze`  
**Silver schema:** `silver`  
**Gold schema:** `gold`

---

## 2. Medallion Layer Assignments

| Table | Bronze | Silver | Gold | Rationale |
|-------|--------|--------|------|-----------|
| {table} | ✅ | ✅ | ❌ | {reason} |

---

## 3. Target Schema (DDL)

### Bronze Layer

```sql
-- {table} — Bronze (raw copy)
CREATE TABLE IF NOT EXISTS bronze.{table} (
  {column}   {type}   {nullable},
  -- ... additional columns ...
  _migration_id   STRING    NOT NULL,
  _migrated_at    TIMESTAMP NOT NULL,
  _source_system  STRING    NOT NULL,
  _layer          STRING    DEFAULT 'bronze'
)
USING DELTA
PARTITIONED BY (DATE(_migrated_at))
TBLPROPERTIES ('delta.enableChangeDataFeed' = 'true');
```

### Silver Layer

```sql
-- {table} — Silver (cleansed + PII masked)
CREATE TABLE IF NOT EXISTS silver.{table} (
  {column}   {type}   {nullable},  -- PII columns masked here
  -- ... additional columns ...
  _migration_id   STRING    NOT NULL,
  _migrated_at    TIMESTAMP NOT NULL,
  _source_system  STRING    NOT NULL,
  _layer          STRING    DEFAULT 'silver'
)
USING DELTA
PARTITIONED BY (DATE(_migrated_at));
```

---

## 4. Transformation Rules

| Table | Column | Operation | Detail | Layer |
|-------|--------|-----------|--------|-------|
| {table} | {column} | mask | pattern: {pattern} | silver |
| {table} | {column} | tokenize | deterministic SHA-256 | silver |
| {table} | {column} | cast | {fromType} → {toType} | bronze |
| {table} | {column} | drop | reason: {reason} | all |

---

## 5. PII Masking Policy

| Table | Column | PII Type | LGPD Category | Bronze | Silver |
|-------|--------|----------|--------------|--------|--------|
| {table} | {col} | EMAIL | Dados Pessoais | Raw | Masked |
| {table} | {col} | CPF | Dados Pessoais | Raw | Tokenized |
| {table} | {col} | HEALTH | Dados Sensíveis | Raw | Encrypted |

---

## 6. Data Quality Expectations

```yaml
table: {table}
expectations:
  - type: expect_column_values_to_not_be_null
    column: {pk_column}
    severity: ERROR
  - type: expect_column_values_to_be_unique
    column: {pk_column}
    severity: ERROR
  - type: expect_column_values_to_match_regex
    column: email
    regex: "^[^@]+@[^@]+\\.[^@]+$"
    severity: WARNING
    mostly: 0.97
```

---

## 7. Access Control Policy

| Layer | Authorized roles | PII access |
|-------|-----------------|-----------|
| Bronze | data-engineers, migration-service | Raw (restricted) |
| Silver | data-analysts, data-scientists | Masked only |
| Gold | BI-tools, business-analysts | Aggregated (no PII) |

---

## 8. Type Conflicts Accepted

| Table | Column | Source type | Target type | Risk | Accepted by |
|-------|--------|------------|------------|------|------------|
| {table} | {col} | {source} | {target} | {risk} | {name, date} |

---

## Sign-off

| Role | Name | Date |
|------|------|------|
| Data Architect | | |
| Data Owner | | |
| Compliance Officer | | |

_Approval required before schema-mapping and code generation proceed._
