# ruflo-data-migration

AI-orchestrated data migration from SQL databases to Databricks and Microsoft Fabric.

## Overview

Uses Ruflo swarm agents to inspect source schemas, map column types, execute parallel table migrations, validate data quality, and manage incremental checkpoints. Supports Full Load and Incremental strategies with automatic watermark detection and medallion architecture (Bronze → Silver → Gold).

## Installation

```bash
claude --plugin-dir plugins/ruflo-data-migration
```

## Agents

| Agent | Model | Role |
|-------|-------|------|
| `migration-orchestrator` | sonnet | Swarm coordinator, strategy decisions, progress tracking |
| `source-inspector` | sonnet | Schema discovery, type mapping, row profiling |
| `schema-mapper` | sonnet | Source→target type mapping, medallion layer design |
| `data-extractor` | haiku | Batch extraction with cursor/watermark management |
| `data-transformer` | haiku | Column transforms, masking, audit column injection |
| `data-loader` | sonnet | Batch insert/merge to Databricks or Fabric |
| `migration-validator` | sonnet | Row count checks, checksums, quality gates |

## Skills

| Skill | Usage | Description |
|-------|-------|-------------|
| `migration-plan` | `/migration-plan <manifest>` | Analyze manifest and generate execution plan |
| `migration-run` | `/migration-run <manifest>` | Execute full migration from YAML manifest |
| `migration-status` | `/migration-status <migration-id>` | Show progress and checkpoint state |
| `migration-rollback` | `/migration-rollback <migration-id>` | Roll back a failed migration |
| `migration-validate` | `/migration-validate <migration-id>` | Validate data quality post-migration |

## Commands

```bash
migration plan <manifest>       # Preview what will be migrated
migration run <manifest>        # Execute migration
migration status <id>           # Show progress
migration validate <id>         # Validate data quality
migration rollback <id>         # Rollback migration
migration inspect <manifest>    # Inspect source schema
```

## Supported Sources

| Source | Type | Auth |
|--------|------|------|
| PostgreSQL | `postgresql` | host/user/password |
| SQL Server | `sqlserver` | host/user/password |
| MySQL | `mysql` | host/user/password |

## Supported Targets

| Target | Type | Auth |
|--------|------|------|
| Databricks | `databricks` | Personal Access Token |
| Microsoft Fabric | `fabric` | Service Principal (OAuth) |

## Medallion Architecture

The schema-mapper automatically generates Bronze/Silver/Gold schemas:
- **Bronze**: Raw copy of source data, no transformations
- **Silver**: Cleaned data + audit columns (`_migration_id`, `_migrated_at`, `_layer`)
- **Gold**: Aggregated / business-ready views (manual configuration)

## Load Strategies

- **full**: Truncate + full reload. Supports resume via checkpoint on failure.
- **incremental**: Watermark-based delta load. Auto-detects `updated_at`, `modified_at`, etc.

## Verification

```bash
bash plugins/ruflo-data-migration/scripts/smoke.sh
```
