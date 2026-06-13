---
name: test-generate
description: Generate and run the full test suite — unit tests for transformations, reconciliation tests, UAT test cases, and performance benchmarks — and produce a test verdict before cutover is allowed
argument-hint: "<migrationId>"
allowed-tools: Read Write Bash mcp__claude-flow__memory_search mcp__claude-flow__memory_store
---

# Test Generate

Generates the complete test suite from the approved mapping and generated code, then executes automated tests. Produces a test verdict required before cutover planning can begin.

## When to use

After code-generate. Before cutover-plan. Verdict PASS or PASS_WITH_WARNINGS required to unlock cutover planning.

## Steps

1. **Load mapping and generated code** — retrieve from AgentDB and `migrations/generated/{migrationId}/`
2. **Enrich test stubs** — add business-rule assertions on top of generated reconciliation tests
3. **Generate UAT test cases** — human-readable scenarios for business stakeholder sign-off
4. **Generate performance benchmarks** — throughput targets based on pre-assessment estimates
5. **Run automated tests** — execute reconciliation, unit, and performance tests against staging
6. **Collect results** — aggregate pass/fail/warning per category
7. **Issue verdict** — PASS | PASS_WITH_WARNINGS | FAIL

## Output

```
=== Test Suite: {migrationId} ===

Unit tests:         {N}/{N} passed ✅
Reconciliation:     {N}/{N} passed ✅ | {W} warnings
Performance:
  Throughput:       62,000 rows/sec (target: 50,000) ✅
  Duration:         28m (estimate: 27m) ✅
  Memory peak:      4.2 GB (limit: 8 GB) ✅

UAT test cases generated: {N}
  → docs/uat-tests-{migrationId}.md (requires business sign-off)

Verdict: ✅ PASS

Next step: /migration-cutover-plan {migrationId}
```
