import { logger } from '../utils/logger.js';

/**
 * The 10 lifecycle phases. Each phase is tracked for duration, tokens, model,
 * and estimated cost — the same telemetry shown in the Claude Code footer
 * (e.g. "12m 18s · 39.9k tokens"), persisted per phase and aggregated at the end.
 */
export type LifecyclePhase =
  | 'pre-assessment'
  | 'data-profiling'
  | 'as-is'
  | 'to-be'
  | 'schema-mapping'
  | 'code-generation'
  | 'testing'
  | 'cutover-planning'
  | 'execution'
  | 'post-migration';

export type ClaudeModel = 'claude-sonnet-4-6' | 'claude-haiku-4-5';

/**
 * Per-million-token pricing (USD). Update when Anthropic pricing changes.
 * cacheWrite = 1.25× input, cacheRead = 0.1× input (standard Anthropic ratios).
 */
export const MODEL_PRICING: Record<ClaudeModel, { input: number; output: number; cacheWrite: number; cacheRead: number }> = {
  'claude-sonnet-4-6': { input: 3.0,  output: 15.0, cacheWrite: 3.75,  cacheRead: 0.3 },
  'claude-haiku-4-5':  { input: 1.0,  output: 5.0,  cacheWrite: 1.25,  cacheRead: 0.1 },
};

export const MODEL_LABEL: Record<ClaudeModel, string> = {
  'claude-sonnet-4-6': 'Sonnet 4.6',
  'claude-haiku-4-5':  'Haiku 4.5',
};

/**
 * Default model assigned to each phase, mirroring the agent frontmatter.
 * Sonnet 4.6 for reasoning-heavy phases; Haiku 4.5 for high-volume,
 * template-driven phases (documentation, test execution, reporting).
 */
export const PHASE_DEFAULT_MODEL: Record<LifecyclePhase, ClaudeModel> = {
  'pre-assessment':   'claude-sonnet-4-6',
  'data-profiling':   'claude-sonnet-4-6',
  'as-is':            'claude-haiku-4-5',
  'to-be':            'claude-sonnet-4-6',
  'schema-mapping':   'claude-sonnet-4-6',
  'code-generation':  'claude-sonnet-4-6',
  'testing':          'claude-haiku-4-5',
  'cutover-planning': 'claude-sonnet-4-6',
  'execution':        'claude-sonnet-4-6',
  'post-migration':   'claude-sonnet-4-6',
};

export const PHASE_AGENT: Record<LifecyclePhase, string> = {
  'pre-assessment':   'pre-assessment-analyst',
  'data-profiling':   'data-profiler',
  'as-is':            'as-is-documenter',
  'to-be':            'to-be-designer',
  'schema-mapping':   'schema-mapper',
  'code-generation':  'code-generator',
  'testing':          'test-engineer',
  'cutover-planning': 'cutover-planner',
  'execution':        'migration-orchestrator',
  'post-migration':   'post-migration-reporter',
};

export interface TokenUsage {
  input: number;
  output: number;
  cacheWrite?: number;
  cacheRead?: number;
}

export interface PhaseMetrics {
  phase: LifecyclePhase;
  agent: string;
  model: ClaudeModel;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  tokens: TokenUsage;
  totalTokens: number;
  estimatedCostUsd: number;
  status: 'completed' | 'failed' | 'skipped';
  notes?: string;
}

interface ActivePhase {
  phase: LifecyclePhase;
  agent: string;
  model: ClaudeModel;
  startTime: number;
  startedAt: string;
}

/**
 * Tracks telemetry across the migration lifecycle. One instance per migration run.
 *
 *   const tracker = new PhaseTracker('migration-001');
 *   tracker.start('pre-assessment');
 *   // ... agent does work, reports token usage ...
 *   tracker.end('pre-assessment', { input: 12000, output: 3400, cacheRead: 80000 });
 *   const report = tracker.aggregate();
 */
export class PhaseTracker {
  private active = new Map<LifecyclePhase, ActivePhase>();
  private completed: PhaseMetrics[] = [];

  constructor(public readonly migrationId: string) {}

  start(phase: LifecyclePhase, model?: ClaudeModel): void {
    const resolvedModel = model ?? PHASE_DEFAULT_MODEL[phase];
    this.active.set(phase, {
      phase,
      agent: PHASE_AGENT[phase],
      model: resolvedModel,
      startTime: Date.now(),
      startedAt: new Date().toISOString(),
    });
    logger.info(`[telemetry] phase '${phase}' started (${MODEL_LABEL[resolvedModel]})`);
  }

  end(
    phase: LifecyclePhase,
    tokens: TokenUsage,
    status: PhaseMetrics['status'] = 'completed',
    notes?: string,
  ): PhaseMetrics {
    const started = this.active.get(phase);
    if (!started) {
      throw new Error(`Cannot end phase '${phase}' — it was never started`);
    }
    this.active.delete(phase);

    const completedAt = new Date().toISOString();
    const durationMs = Date.now() - started.startTime;
    const totalTokens = tokens.input + tokens.output + (tokens.cacheWrite ?? 0) + (tokens.cacheRead ?? 0);
    const estimatedCostUsd = this.cost(started.model, tokens);

    const metrics: PhaseMetrics = {
      phase,
      agent: started.agent,
      model: started.model,
      startedAt: started.startedAt,
      completedAt,
      durationMs,
      tokens,
      totalTokens,
      estimatedCostUsd,
      status,
      notes,
    };

    this.completed.push(metrics);
    logger.info(
      `[telemetry] phase '${phase}' ${status} · ${formatDuration(durationMs)} · ${formatTokens(totalTokens)} · $${estimatedCostUsd.toFixed(4)}`,
    );
    return metrics;
  }

  /** Record a skipped phase (e.g. SOX skipped when no financial data). */
  skip(phase: LifecyclePhase, reason: string): void {
    const now = new Date().toISOString();
    this.completed.push({
      phase,
      agent: PHASE_AGENT[phase],
      model: PHASE_DEFAULT_MODEL[phase],
      startedAt: now,
      completedAt: now,
      durationMs: 0,
      tokens: { input: 0, output: 0 },
      totalTokens: 0,
      estimatedCostUsd: 0,
      status: 'skipped',
      notes: reason,
    });
    logger.info(`[telemetry] phase '${phase}' skipped — ${reason}`);
  }

  cost(model: ClaudeModel, tokens: TokenUsage): number {
    const p = MODEL_PRICING[model];
    return (
      (tokens.input * p.input) +
      (tokens.output * p.output) +
      ((tokens.cacheWrite ?? 0) * p.cacheWrite) +
      ((tokens.cacheRead ?? 0) * p.cacheRead)
    ) / 1_000_000;
  }

  getPhase(phase: LifecyclePhase): PhaseMetrics | undefined {
    return this.completed.find(m => m.phase === phase);
  }

  getAll(): PhaseMetrics[] {
    return [...this.completed];
  }

  aggregate(): TelemetryReport {
    const phases = this.getAll();
    const totalDurationMs = phases.reduce((s, p) => s + p.durationMs, 0);
    const totalTokens = phases.reduce((s, p) => s + p.totalTokens, 0);
    const totalCostUsd = phases.reduce((s, p) => s + p.estimatedCostUsd, 0);

    const byModel = new Map<ClaudeModel, { phases: number; tokens: number; costUsd: number; durationMs: number }>();
    for (const p of phases) {
      const entry = byModel.get(p.model) ?? { phases: 0, tokens: 0, costUsd: 0, durationMs: 0 };
      entry.phases += 1;
      entry.tokens += p.totalTokens;
      entry.costUsd += p.estimatedCostUsd;
      entry.durationMs += p.durationMs;
      byModel.set(p.model, entry);
    }

    return {
      migrationId: this.migrationId,
      generatedAt: new Date().toISOString(),
      phases,
      totals: {
        phases: phases.length,
        completed: phases.filter(p => p.status === 'completed').length,
        skipped: phases.filter(p => p.status === 'skipped').length,
        failed: phases.filter(p => p.status === 'failed').length,
        durationMs: totalDurationMs,
        durationLabel: formatDuration(totalDurationMs),
        tokens: totalTokens,
        tokensLabel: formatTokens(totalTokens),
        costUsd: totalCostUsd,
      },
      byModel: [...byModel.entries()].map(([model, v]) => ({
        model,
        label: MODEL_LABEL[model],
        ...v,
        durationLabel: formatDuration(v.durationMs),
        tokensLabel: formatTokens(v.tokens),
      })),
    };
  }
}

export interface TelemetryReport {
  migrationId: string;
  generatedAt: string;
  phases: PhaseMetrics[];
  totals: {
    phases: number;
    completed: number;
    skipped: number;
    failed: number;
    durationMs: number;
    durationLabel: string;
    tokens: number;
    tokensLabel: string;
    costUsd: number;
  };
  byModel: Array<{
    model: ClaudeModel;
    label: string;
    phases: number;
    tokens: number;
    tokensLabel: string;
    costUsd: number;
    durationMs: number;
    durationLabel: string;
  }>;
}

export function formatDuration(ms: number): string {
  if (ms === 0) return '0s';
  const totalSec = Math.round(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
}

export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M tokens`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k tokens`;
  return `${n} tokens`;
}
