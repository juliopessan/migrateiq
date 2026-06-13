#!/usr/bin/env bash
# Smoke test for ruflo-data-migration plugin
set -euo pipefail

PASS=0
FAIL=0

check() {
  local name="$1"
  local cmd="$2"
  if eval "$cmd" > /dev/null 2>&1; then
    echo "✅ $name"
    PASS=$((PASS + 1))
  else
    echo "❌ $name"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== ruflo-data-migration smoke tests ==="
echo ""

PLUGIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ROOT_DIR="$(cd "$PLUGIN_DIR/../.." && pwd)"
ENGINE_DIR="$ROOT_DIR/engine"

# ── Plugin structure ──────────────────────────────────────────────────────────
check "plugin README exists"           "[ -f '$PLUGIN_DIR/README.md' ]"
check "agents directory exists"        "[ -d '$PLUGIN_DIR/agents' ]"
check "commands directory exists"      "[ -d '$PLUGIN_DIR/commands' ]"
check "skills directory exists"        "[ -d '$PLUGIN_DIR/skills' ]"

# ── Original agents (3) ───────────────────────────────────────────────────────
check "migration-orchestrator agent"   "[ -f '$PLUGIN_DIR/agents/migration-orchestrator.md' ]"
check "source-inspector agent"         "[ -f '$PLUGIN_DIR/agents/source-inspector.md' ]"
check "migration-validator agent"      "[ -f '$PLUGIN_DIR/agents/migration-validator.md' ]"

# ── New agents — full lifecycle (10) ─────────────────────────────────────────
check "pre-assessment-analyst agent"   "[ -f '$PLUGIN_DIR/agents/pre-assessment-analyst.md' ]"
check "data-profiler agent"            "[ -f '$PLUGIN_DIR/agents/data-profiler.md' ]"
check "as-is-documenter agent"         "[ -f '$PLUGIN_DIR/agents/as-is-documenter.md' ]"
check "to-be-designer agent"           "[ -f '$PLUGIN_DIR/agents/to-be-designer.md' ]"
check "schema-mapper agent"            "[ -f '$PLUGIN_DIR/agents/schema-mapper.md' ]"
check "code-generator agent"           "[ -f '$PLUGIN_DIR/agents/code-generator.md' ]"
check "test-engineer agent"            "[ -f '$PLUGIN_DIR/agents/test-engineer.md' ]"
check "cutover-planner agent"          "[ -f '$PLUGIN_DIR/agents/cutover-planner.md' ]"
check "compliance-auditor agent"       "[ -f '$PLUGIN_DIR/agents/compliance-auditor.md' ]"
check "post-migration-reporter agent"  "[ -f '$PLUGIN_DIR/agents/post-migration-reporter.md' ]"

# ── Original skills (5) ───────────────────────────────────────────────────────
check "migration-plan skill"           "[ -f '$PLUGIN_DIR/skills/migration-plan/SKILL.md' ]"
check "migration-run skill"            "[ -f '$PLUGIN_DIR/skills/migration-run/SKILL.md' ]"
check "migration-status skill"         "[ -f '$PLUGIN_DIR/skills/migration-status/SKILL.md' ]"
check "migration-rollback skill"       "[ -f '$PLUGIN_DIR/skills/migration-rollback/SKILL.md' ]"
check "migration-validate skill"       "[ -f '$PLUGIN_DIR/skills/migration-validate/SKILL.md' ]"

# ── New skills — full lifecycle (12) ─────────────────────────────────────────
check "pre-assessment skill"           "[ -f '$PLUGIN_DIR/skills/pre-assessment/SKILL.md' ]"
check "data-profiling skill"           "[ -f '$PLUGIN_DIR/skills/data-profiling/SKILL.md' ]"
check "pii-scan skill"                 "[ -f '$PLUGIN_DIR/skills/pii-scan/SKILL.md' ]"
check "dependency-map skill"           "[ -f '$PLUGIN_DIR/skills/dependency-map/SKILL.md' ]"
check "as-is-report skill"             "[ -f '$PLUGIN_DIR/skills/as-is-report/SKILL.md' ]"
check "to-be-design skill"             "[ -f '$PLUGIN_DIR/skills/to-be-design/SKILL.md' ]"
check "schema-mapping skill"           "[ -f '$PLUGIN_DIR/skills/schema-mapping/SKILL.md' ]"
check "code-generate skill"            "[ -f '$PLUGIN_DIR/skills/code-generate/SKILL.md' ]"
check "test-generate skill"            "[ -f '$PLUGIN_DIR/skills/test-generate/SKILL.md' ]"
check "cutover-plan skill"             "[ -f '$PLUGIN_DIR/skills/cutover-plan/SKILL.md' ]"
check "reconciliation skill"           "[ -f '$PLUGIN_DIR/skills/reconciliation/SKILL.md' ]"
check "compliance-report skill"        "[ -f '$PLUGIN_DIR/skills/compliance-report/SKILL.md' ]"

# ── Commands ─────────────────────────────────────────────────────────────────
check "migration command"              "[ -f '$PLUGIN_DIR/commands/migration.md' ]"

# ── Engine source — original (7) ──────────────────────────────────────────────
check "types.ts exists"                "[ -f '$ENGINE_DIR/src/schema/types.ts' ]"
check "postgresql connector"           "[ -f '$ENGINE_DIR/src/connectors/sources/postgresql.ts' ]"
check "sqlserver connector"            "[ -f '$ENGINE_DIR/src/connectors/sources/sqlserver.ts' ]"
check "mysql connector"                "[ -f '$ENGINE_DIR/src/connectors/sources/mysql.ts' ]"
check "databricks target"              "[ -f '$ENGINE_DIR/src/connectors/targets/databricks.ts' ]"
check "fabric target"                  "[ -f '$ENGINE_DIR/src/connectors/targets/fabric.ts' ]"
check "orchestrator pipeline"          "[ -f '$ENGINE_DIR/src/pipeline/orchestrator.ts' ]"

# ── Engine source — new modules (8) ───────────────────────────────────────────
check "assessment profiler"            "[ -f '$ENGINE_DIR/src/assessment/profiler.ts' ]"
check "assessment pii-detector"        "[ -f '$ENGINE_DIR/src/assessment/pii-detector.ts' ]"
check "assessment dependency-scanner"  "[ -f '$ENGINE_DIR/src/assessment/dependency-scanner.ts' ]"
check "generation etl-generator"       "[ -f '$ENGINE_DIR/src/generation/etl-generator.ts' ]"
check "generation ddl-generator"       "[ -f '$ENGINE_DIR/src/generation/ddl-generator.ts' ]"
check "testing reconciler"             "[ -f '$ENGINE_DIR/src/testing/reconciler.ts' ]"
check "reporting report-generator"     "[ -f '$ENGINE_DIR/src/reporting/report-generator.ts' ]"
check "compliance audit-logger"        "[ -f '$ENGINE_DIR/src/compliance/audit-logger.ts' ]"

# ── Manifests — original (2) ──────────────────────────────────────────────────
check "full-load template"             "[ -f '$ROOT_DIR/migrations/manifests/full-load.template.yaml' ]"
check "incremental template"           "[ -f '$ROOT_DIR/migrations/manifests/incremental.template.yaml' ]"

# ── Manifests — new (2) ───────────────────────────────────────────────────────
check "assessment template"            "[ -f '$ROOT_DIR/migrations/manifests/assessment.template.yaml' ]"
check "mapping template"               "[ -f '$ROOT_DIR/migrations/manifests/mapping.template.yaml' ]"

# ── Doc templates (5) ─────────────────────────────────────────────────────────
check "as-is-report template"          "[ -f '$ROOT_DIR/migrations/docs/templates/as-is-report.md' ]"
check "to-be-design template"          "[ -f '$ROOT_DIR/migrations/docs/templates/to-be-design.md' ]"
check "cutover-runbook template"       "[ -f '$ROOT_DIR/migrations/docs/templates/cutover-runbook.md' ]"
check "executive-report template"      "[ -f '$ROOT_DIR/migrations/docs/templates/executive-report.md' ]"
check "compliance-report template"     "[ -f '$ROOT_DIR/migrations/docs/templates/compliance-report.md' ]"

# ── Engine package + tsconfig ─────────────────────────────────────────────────
check "engine package.json"           "[ -f '$ENGINE_DIR/package.json' ]"
check "engine tsconfig.json"          "[ -f '$ENGINE_DIR/tsconfig.json' ]"

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="

[ "$FAIL" -eq 0 ]
