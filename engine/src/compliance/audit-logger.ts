import { logger } from '../utils/logger.js';

export type ComplianceFramework = 'LGPD' | 'SOX' | 'GDPR' | 'HIPAA';

export interface AuditEvent {
  eventId: string;
  migrationId: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'SKIPPED';
  details?: Record<string, unknown>;
}

export interface LgpdVerification {
  piiInventoryComplete: boolean;
  maskingCoveragePercent: number;
  consentRecordsPreserved: boolean;
  dataMinimizationApplied: boolean;
  rightToErasureSupported: boolean;
  dpAgreementInPlace: boolean;
  lawfulBasisDocumented: boolean;
  score: number;
  gaps: string[];
}

export interface SoxVerification {
  financialDataIntegrityVerified: boolean;
  auditTrailPresent: boolean;
  segregationOfDuties: boolean;
  changeManagementApproved: boolean;
  retentionPolicySet: boolean;
  score: number;
  gaps: string[];
}

export interface ComplianceVerdict {
  auditId: string;
  migrationId: string;
  auditedAt: string;
  frameworks: ComplianceFramework[];
  lgpd?: LgpdVerification;
  sox?: SoxVerification;
  overallVerdict: 'COMPLIANT' | 'COMPLIANT_WITH_CONDITIONS' | 'NON_COMPLIANT';
  conditions: string[];
  expiresAt: string;
}

export class AuditLogger {
  private events: AuditEvent[] = [];

  log(event: Omit<AuditEvent, 'eventId' | 'timestamp'>): void {
    const auditEvent: AuditEvent = {
      ...event,
      eventId: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
    };
    this.events.push(auditEvent);
    logger.info(`[AUDIT] ${auditEvent.action} on ${auditEvent.resource} → ${auditEvent.outcome}`);
  }

  getEvents(): AuditEvent[] {
    return [...this.events];
  }

  verifyLgpd(params: {
    piiColumnCount: number;
    maskedColumnCount: number;
    tablesWithAuditColumns: number;
    totalTables: number;
    consentTableMigrated: boolean;
    dpAgreementSigned: boolean;
    lawfulBasisDocumented: boolean;
  }): LgpdVerification {
    const maskingCoverage = params.piiColumnCount > 0
      ? (params.maskedColumnCount / params.piiColumnCount) * 100
      : 100;
    const auditCoverage = params.totalTables > 0
      ? (params.tablesWithAuditColumns / params.totalTables) * 100
      : 0;

    const gaps: string[] = [];
    if (maskingCoverage < 100) gaps.push(`${params.piiColumnCount - params.maskedColumnCount} PII columns without masking rules`);
    if (auditCoverage < 100) gaps.push(`${params.totalTables - params.tablesWithAuditColumns} tables missing audit columns`);
    if (!params.dpAgreementSigned) gaps.push('Data Processing Agreement not confirmed');
    if (!params.lawfulBasisDocumented) gaps.push('Lawful basis for processing not documented');

    const score = Math.round(
      (maskingCoverage * 0.4) +
      (auditCoverage * 0.2) +
      (params.consentTableMigrated ? 15 : 0) +
      (params.dpAgreementSigned ? 15 : 0) +
      (params.lawfulBasisDocumented ? 10 : 0),
    );

    return {
      piiInventoryComplete: params.piiColumnCount > 0,
      maskingCoveragePercent: maskingCoverage,
      consentRecordsPreserved: params.consentTableMigrated,
      dataMinimizationApplied: true,
      rightToErasureSupported: true,
      dpAgreementInPlace: params.dpAgreementSigned,
      lawfulBasisDocumented: params.lawfulBasisDocumented,
      score,
      gaps,
    };
  }

  verifySox(params: {
    financialChecksumMatch: boolean;
    auditTrailPresent: boolean;
    segregationConfirmed: boolean;
    changeTicketApproved: boolean;
    retentionYears: number;
  }): SoxVerification {
    const gaps: string[] = [];
    if (!params.financialChecksumMatch) gaps.push('Financial column checksums do not match source');
    if (!params.auditTrailPresent) gaps.push('Audit trail columns missing from target tables');
    if (!params.segregationConfirmed) gaps.push('Segregation of duties not confirmed');
    if (!params.changeTicketApproved) gaps.push('Change management ticket not approved');
    if (params.retentionYears < 7) gaps.push(`Retention period ${params.retentionYears}y < required 7y (SOX §802)`);

    const score = [
      params.financialChecksumMatch,
      params.auditTrailPresent,
      params.segregationConfirmed,
      params.changeTicketApproved,
      params.retentionYears >= 7,
    ].filter(Boolean).length * 20;

    return {
      financialDataIntegrityVerified: params.financialChecksumMatch,
      auditTrailPresent: params.auditTrailPresent,
      segregationOfDuties: params.segregationConfirmed,
      changeManagementApproved: params.changeTicketApproved,
      retentionPolicySet: params.retentionYears >= 7,
      score,
      gaps,
    };
  }

  buildVerdict(
    migrationId: string,
    frameworks: ComplianceFramework[],
    lgpd?: LgpdVerification,
    sox?: SoxVerification,
  ): ComplianceVerdict {
    const allGaps = [...(lgpd?.gaps ?? []), ...(sox?.gaps ?? [])];
    const criticalGaps = allGaps.filter(g =>
      g.includes('checksum') || g.includes('PII columns without masking') || g.includes('not confirmed'),
    );

    let overallVerdict: ComplianceVerdict['overallVerdict'];
    if (criticalGaps.length > 0) overallVerdict = 'NON_COMPLIANT';
    else if (allGaps.length > 0) overallVerdict = 'COMPLIANT_WITH_CONDITIONS';
    else overallVerdict = 'COMPLIANT';

    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 3);

    logger.info(`Compliance verdict for ${migrationId}: ${overallVerdict}`);

    return {
      auditId: `compliance-${Date.now()}`,
      migrationId,
      auditedAt: new Date().toISOString(),
      frameworks,
      lgpd,
      sox,
      overallVerdict,
      conditions: allGaps,
      expiresAt: expiry.toISOString(),
    };
  }
}
