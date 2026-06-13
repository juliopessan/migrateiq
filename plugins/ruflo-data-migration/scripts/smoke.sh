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

# Plugin structure
check "plugin README exists"           "[ -f '$PLUGIN_DIR/README.md' ]"
check "agents directory exists"        "[ -d '$PLUGIN_DIR/agents' ]"
check "commands directory exists"      "[ -d '$PLUGIN_DIR/commands' ]"
check "skills directory exists"        "[ -d '$PLUGIN_DIR/skills' ]"

# Agent files
check "migration-orchestrator agent"   "[ -f '$PLUGIN_DIR/agents/migration-orchestrator.md' ]"
check "source-inspector agent"         "[ -f '$PLUGIN_DIR/agents/source-inspector.md' ]"
check "migration-validator agent"      "[ -f '$PLUGIN_DIR/agents/migration-validator.md' ]"

# Skills
check "migration-plan skill"           "[ -f '$PLUGIN_DIR/skills/migration-plan/SKILL.md' ]"
check "migration-run skill"            "[ -f '$PLUGIN_DIR/skills/migration-run/SKILL.md' ]"
check "migration-status skill"         "[ -f '$PLUGIN_DIR/skills/migration-status/SKILL.md' ]"
check "migration-rollback skill"       "[ -f '$PLUGIN_DIR/skills/migration-rollback/SKILL.md' ]"
check "migration-validate skill"       "[ -f '$PLUGIN_DIR/skills/migration-validate/SKILL.md' ]"

# Commands
check "migration command"              "[ -f '$PLUGIN_DIR/commands/migration.md' ]"

# Engine source code
check "types.ts exists"                "[ -f '$ENGINE_DIR/src/schema/types.ts' ]"
check "postgresql connector"           "[ -f '$ENGINE_DIR/src/connectors/sources/postgresql.ts' ]"
check "sqlserver connector"            "[ -f '$ENGINE_DIR/src/connectors/sources/sqlserver.ts' ]"
check "mysql connector"                "[ -f '$ENGINE_DIR/src/connectors/sources/mysql.ts' ]"
check "databricks target"              "[ -f '$ENGINE_DIR/src/connectors/targets/databricks.ts' ]"
check "fabric target"                  "[ -f '$ENGINE_DIR/src/connectors/targets/fabric.ts' ]"
check "orchestrator pipeline"          "[ -f '$ENGINE_DIR/src/pipeline/orchestrator.ts' ]"

# Manifests
check "full-load template"             "[ -f '$ROOT_DIR/migrations/manifests/full-load.template.yaml' ]"
check "incremental template"           "[ -f '$ROOT_DIR/migrations/manifests/incremental.template.yaml' ]"

# Engine package + tsconfig
check "engine package.json"           "[ -f '$ENGINE_DIR/package.json' ]"
check "engine tsconfig.json"          "[ -f '$ENGINE_DIR/tsconfig.json' ]"

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="

[ "$FAIL" -eq 0 ]
