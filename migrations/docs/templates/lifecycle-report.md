# Relatório Final de Migração — {migrationId}

**Gerado em:** {generatedAt}  
**Fases executadas:** {completed}/{totalPhases} ({skipped} puladas, {failed} falhas)  
**Duração total:** {totalDuration}  
**Tokens totais:** {totalTokens}  
**Custo estimado:** ${totalCost} USD

---

## Telemetria por fase

| Fase | Agente | Modelo | Duração | Tokens | Custo |
|------|--------|--------|---------|--------|-------|
| ✅ 1. Pre-Assessment | pre-assessment-analyst | Opus 4.8 | {d1} | {t1} | ${c1} |
| ✅ 2. Data Profiling | data-profiler | Opus 4.8 | {d2} | {t2} | ${c2} |
| ✅ 3. As-Is | as-is-documenter | Sonnet 4.6 | {d3} | {t3} | ${c3} |
| ✅ 4. To-Be | to-be-designer | Opus 4.8 | {d4} | {t4} | ${c4} |
| ✅ 5. Schema Mapping | schema-mapper | Sonnet 4.6 | {d5} | {t5} | ${c5} |
| ✅ 6. Code Generation | code-generator | Opus 4.8 | {d6} | {t6} | ${c6} |
| ✅ 7. Testing | test-engineer | Sonnet 4.6 | {d7} | {t7} | ${c7} |
| ✅ 8. Cutover Planning | cutover-planner | Opus 4.8 | {d8} | {t8} | ${c8} |
| ✅ 9. Execution | migration-orchestrator | Opus 4.8 | {d9} | {t9} | ${c9} |
| ✅ 10. Post-Migration | post-migration-reporter | Sonnet 4.6 | {d10} | {t10} | ${c10} |

---

## Modelos utilizados

| Modelo | Fases | Tokens | Duração | Custo |
|--------|-------|--------|---------|-------|
| Opus 4.8 | {opusPhases} | {opusTokens} | {opusDuration} | ${opusCost} |
| Sonnet 4.6 | {sonnetPhases} | {sonnetTokens} | {sonnetDuration} | ${sonnetCost} |

> Os modelos são atribuídos por fase conforme a complexidade:
> - **Opus 4.8** — raciocínio crítico: pre-assessment, data profiling, to-be design, geração de código, cutover, execução, conformidade
> - **Sonnet 4.6** — tarefas estruturadas de alto volume: documentação as-is, mapeamento de schema, testes, relatórios

---

## Totais consolidados

| Métrica | Valor |
|---------|-------|
| Duração total | **{totalDuration}** |
| Tokens consumidos | **{totalTokens}** |
| Custo total estimado | **${totalCost} USD** |
| Custo médio por fase | ${avgCostPerPhase} USD |
| Fases concluídas | {completed}/{totalPhases} |

---

## ROI da migração

| Métrica | Valor |
|---------|-------|
| Linhas migradas | {rowsMigrated} |
| Tabelas | {tables} |
| Custo IA (orquestração) | ${aiCost} USD |
| Custo IA por milhão de linhas | ${costPerMillion} USD |
| Esforço manual estimado evitado | {manualDaysAvoided} dias-pessoa |
| Tempo de ponta a ponta | {endToEnd} |

---

_Relatório de telemetria gerado automaticamente pelo MigrateIQ lifecycle-reporter._  
_Custos são estimativas baseadas no pricing público da Anthropic e podem variar com cache hits e descontos de volume._
