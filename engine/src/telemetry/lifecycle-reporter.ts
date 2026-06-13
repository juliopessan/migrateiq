import { logger } from '../utils/logger.js';
import {
  type TelemetryReport,
  type PhaseMetrics,
  type LifecyclePhase,
  formatDuration,
} from './phase-tracker.js';

const PHASE_ORDER: LifecyclePhase[] = [
  'pre-assessment',
  'data-profiling',
  'as-is',
  'to-be',
  'schema-mapping',
  'code-generation',
  'testing',
  'cutover-planning',
  'execution',
  'post-migration',
];

const PHASE_LABEL: Record<LifecyclePhase, string> = {
  'pre-assessment':   '1. Pre-Assessment',
  'data-profiling':   '2. Data Profiling',
  'as-is':            '3. As-Is',
  'to-be':            '4. To-Be',
  'schema-mapping':   '5. Schema Mapping',
  'code-generation':  '6. Code Generation',
  'testing':          '7. Testing',
  'cutover-planning': '8. Cutover Planning',
  'execution':        '9. Execution',
  'post-migration':   '10. Post-Migration',
};

const STATUS_ICON: Record<PhaseMetrics['status'], string> = {
  completed: '✅',
  skipped: '⏭️',
  failed: '❌',
};

/**
 * Renders the consolidated lifecycle telemetry report — the final document that
 * shows, per phase and in total: model used, duration, tokens, and estimated cost.
 */
export class LifecycleReporter {
  /** Render the full markdown report from an aggregated telemetry report. */
  render(report: TelemetryReport, businessMetrics?: BusinessMetrics): string {
    const sorted = [...report.phases].sort(
      (a, b) => PHASE_ORDER.indexOf(a.phase) - PHASE_ORDER.indexOf(b.phase),
    );

    logger.info(`Rendering lifecycle report for ${report.migrationId}`);

    return [
      this.header(report),
      this.phaseTable(sorted),
      this.modelTable(report),
      this.totals(report),
      businessMetrics ? this.businessSection(businessMetrics) : '',
      this.footer(report),
    ].filter(Boolean).join('\n\n');
  }

  private header(report: TelemetryReport): string {
    return `# Relatório Final de Migração — ${report.migrationId}

**Gerado em:** ${report.generatedAt}
**Fases executadas:** ${report.totals.completed}/${report.totals.phases} (${report.totals.skipped} puladas, ${report.totals.failed} falhas)
**Duração total:** ${report.totals.durationLabel}
**Tokens totais:** ${report.totals.tokensLabel}
**Custo estimado:** $${report.totals.costUsd.toFixed(2)} USD`;
  }

  private phaseTable(phases: PhaseMetrics[]): string {
    const rows = phases.map(p => {
      const tokensK = (p.totalTokens / 1000).toFixed(1);
      return `| ${STATUS_ICON[p.status]} ${PHASE_LABEL[p.phase]} | ${p.agent} | ${this.modelShort(p.model)} | ${formatDuration(p.durationMs)} | ${tokensK}k | $${p.estimatedCostUsd.toFixed(4)} |`;
    }).join('\n');

    return `## Telemetria por fase

| Fase | Agente | Modelo | Duração | Tokens | Custo |
|------|--------|--------|---------|--------|-------|
${rows}`;
  }

  private modelTable(report: TelemetryReport): string {
    const rows = report.byModel
      .sort((a, b) => b.costUsd - a.costUsd)
      .map(m => `| ${m.label} | ${m.phases} | ${m.tokensLabel} | ${m.durationLabel} | $${m.costUsd.toFixed(2)} |`)
      .join('\n');

    return `## Modelos utilizados

| Modelo | Fases | Tokens | Duração | Custo |
|--------|-------|--------|---------|-------|
${rows}

> Os modelos são atribuídos por fase conforme a complexidade: **Sonnet 4.6** para raciocínio crítico (assessment, design, mapeamento, geração de código, cutover, execução, conformidade, relatório) e **Haiku 4.5** para tarefas estruturadas de alto volume (documentação as-is, testes).`;
  }

  private totals(report: TelemetryReport): string {
    const t = report.totals;
    const avgCostPerPhase = t.phases > 0 ? (t.costUsd / t.completed).toFixed(4) : '0';
    return `## Totais consolidados

| Métrica | Valor |
|---------|-------|
| Duração total | **${t.durationLabel}** |
| Tokens consumidos | **${t.tokensLabel}** |
| Custo total estimado | **$${t.costUsd.toFixed(2)} USD** |
| Custo médio por fase | $${avgCostPerPhase} USD |
| Fases concluídas | ${t.completed}/${t.phases} |`;
  }

  private businessSection(b: BusinessMetrics): string {
    const costPerMillion = b.rowsMigrated > 0
      ? (b.aiCostUsd / (b.rowsMigrated / 1_000_000)).toFixed(2)
      : '0';
    return `## ROI da migração

| Métrica | Valor |
|---------|-------|
| Linhas migradas | ${b.rowsMigrated.toLocaleString()} |
| Tabelas | ${b.tables} |
| Custo IA (orquestração) | $${b.aiCostUsd.toFixed(2)} USD |
| Custo IA por milhão de linhas | $${costPerMillion} USD |
| Esforço manual estimado evitado | ${b.manualDaysAvoided} dias-pessoa |
| Tempo de ponta a ponta | ${b.endToEndLabel} |`;
  }

  private footer(report: TelemetryReport): string {
    return `---

_Relatório de telemetria gerado automaticamente pelo MigrateIQ lifecycle-reporter._
_Custos são estimativas baseadas no pricing público da Anthropic e podem variar com cache hits e descontos de volume._`;
  }

  private modelShort(model: string): string {
    if (model.includes('sonnet')) return 'Sonnet 4.6';
    if (model.includes('haiku')) return 'Haiku 4.5';
    return model;
  }

  /** Compact one-line summary, mirroring the Claude Code footer format. */
  renderFooterLine(report: TelemetryReport): string {
    return `${report.totals.durationLabel} · ${report.totals.tokensLabel} · $${report.totals.costUsd.toFixed(2)} · ${report.totals.completed} fases`;
  }
}

export interface BusinessMetrics {
  rowsMigrated: number;
  tables: number;
  aiCostUsd: number;
  manualDaysAvoided: number;
  endToEndLabel: string;
}
