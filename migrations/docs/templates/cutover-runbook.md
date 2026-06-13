# Cutover Runbook — {migrationId}

**Strategy:** {Big Bang | Phased | Parallel Run}  
**Generated:** {generatedAt}  
**Scheduled cutover:** {cutoverDate}  
**Estimated freeze window:** {freezeWindow}  
**Estimated total duration:** {totalDuration}  
**Status:** ⚠️ Awaiting sign-off

---

## Pre-Cutover Checklist (T-24h)

| # | Check | Owner | Status |
|---|-------|-------|--------|
| 1 | Test run completed — verdict: PASS | Tech Lead | ☐ |
| 2 | UAT sign-off obtained from {dataOwner} | PM | ☐ |
| 3 | Rollback script tested in staging | DBA | ☐ |
| 4 | Source DBA confirmed on-call | DBA | ☐ |
| 5 | Target platform capacity verified | Infra | ☐ |
| 6 | Monitoring dashboards live | Ops | ☐ |
| 7 | Stakeholder communication sent | PM | ☐ |
| 8 | Change management ticket approved | PM | ☐ |

---

## Cutover Day Timeline

| Time | Step | Owner | Est. duration | Go/No-Go criteria |
|------|------|-------|--------------|-------------------|
| T+0:00 | Freeze source writes (set read-only) | DBA | 5 min | 0 active transactions |
| T+0:05 | Final incremental load | Orchestrator | ~{duration} | Row delta < 1,000 |
| T+0:XX | Run reconciliation | Validator | 15 min | RECONCILED verdict |
| T+0:XX | Run compliance check | Compliance | 10 min | COMPLIANT verdict |
| T+0:XX | Execute DDL on target (Silver/Gold) | Tech Lead | 10 min | DDL runs without error |
| T+0:XX | Update application connection strings | Infra | 10 min | App smoke test passes |
| T+0:XX | Enable target writes | DBA | 5 min | — |
| T+0:XX | Monitor error rates | Ops | 15 min | Error rate < 0.1% |
| T+0:XX | Declare cutover complete | Project Lead | — | No alerts in 15 min |

---

## Rollback Triggers — ABORT immediately if:

- [ ] Reconciliation verdict: FAIL
- [ ] Error rate > 0.1% in first 15 minutes post-cutover
- [ ] Business UAT report mismatch > 0.01%
- [ ] Any CRITICAL anomaly detected in target
- [ ] Application cannot connect to target
- [ ] Data Owner requests abort

---

## Rollback Procedure

**Estimated rollback time: {rollbackDuration}**

1. **Revert connection strings** to source system (< 5 min) — Owner: {Infra}
2. **Notify stakeholders** via communication plan — Owner: {PM}
3. **Run rollback script:**
   ```bash
   bash plugins/ruflo-data-migration/scripts/rollback.sh --migrationId {migrationId}
   ```
4. **Verify source system** is accepting writes — Owner: {DBA}
5. **Confirm no data loss** — reconcile row counts in source — Owner: {Tech Lead}
6. **Schedule post-mortem** within 48h — Owner: {Project Lead}

---

## Parallel Run Exit Criteria _(if applicable)_

Exit parallel run and decommission source only when:
- [ ] 14 consecutive days with zero reconciliation gaps
- [ ] Business stakeholders sign the parallel run report
- [ ] Performance on target equals or exceeds source SLA
- [ ] All downstream consumers confirmed on target

---

## Communication Plan

| Milestone | Recipients | Channel | Message template |
|-----------|-----------|---------|-----------------|
| Cutover start | {stakeholders} | Email/Slack | "Migration cutover starting. Source system enters read-only mode at {time}." |
| Cutover complete | {stakeholders} | Email | "Migration complete. Data available at {targetConnectionString}." |
| Rollback triggered | {stakeholders} | Slack (urgent) | "Migration aborted. Source system restored. Post-mortem in 48h." |

---

## Emergency Contacts

| Role | Name | Phone | Backup |
|------|------|-------|--------|
| DBA on-call | | | |
| Infra on-call | | | |
| Data Owner | | | |
| Project Lead | | | |

---

## Sign-off (required before production execution)

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Data Owner | | | |
| DBA | | | |
| Project Lead | | | |
| Compliance Officer | | | |
