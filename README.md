# MigrateIQ

**Plataforma AI-native de migração de dados** — ciclo completo do pre-assessment ao relatório executivo, orquestrado por 13 agentes especializados.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)
![Smoke Tests](https://img.shields.io/badge/smoke%20tests-65%2F65-brightgreen)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Visão Geral

MigrateIQ elimina semanas de scripts ETL manuais. A plataforma cobre o ciclo completo de migração: desde a avaliação inicial de complexidade, perfilamento de qualidade de dados, design da arquitetura Medallion, geração de código ETL, até o relatório executivo pós-migração com evidências de conformidade LGPD e SOX.

**Fontes suportadas:** SQL Server · PostgreSQL · MySQL  
**Destinos suportados:** Databricks Delta Lake · Microsoft Fabric Lakehouse  
**Estratégias:** Full Load · Incremental com Watermark  
**Arquitetura:** Medallion (Bronze → Silver → Gold)

---

## Ciclo Completo de Migração (10 fases)

```
1. Pre-Assessment    → Inventário de fontes, score de complexidade, go/no-go
2. Data Profiling    → Qualidade de dados, detecção de PII, anomalias por coluna
3. As-Is             → Dicionário de dados, diagrama ER, inventário ETL, lineage
4. To-Be             → Design Medallion, DDL alvo, regras de transformação, mascaramento
5. Schema Mapping    → Mapeamento coluna-a-coluna aprovado, resolução de conflitos de tipo
6. Code Generation   → Scripts ETL, DDL, funções PII, testes — tudo para revisão humana
7. Testing           → Testes unitários, reconciliação, UAT, benchmarks de performance
8. Cutover Planning  → Runbook de produção, triggers de rollback, plano de comunicação
9. Execution         → Full load / incremental com checkpoint e retry automático
10. Post-Migration   → Relatório executivo, lineage final, pacote de conformidade LGPD/SOX
```

**Telemetria em todas as fases:** cada uma das 10 fases é rastreada por um `PhaseTracker` que registra duração, tokens (input/output/cache), modelo usado e custo estimado. Ao final, o `lifecycle-report` consolida tudo em um relatório único — com a tabela de modelos utilizados e o custo total da orquestração de IA.

---

## Estrutura do Repositório

```
migrateiq/
├── app/                              # Frontend Next.js (App Router)
│   ├── page.tsx                      # Landing page
│   └── app/
│       ├── dashboard/page.tsx        # Dashboard
│       ├── migrations/page.tsx       # Gerenciamento de migrações
│       └── connections/page.tsx      # Conexões
├── components/                       # Componentes React
│   ├── layout/ (Sidebar, Header)
│   └── ui/ (Button, Badge)
├── engine/                           # Engine de migração (Node.js)
│   ├── src/
│   │   ├── connectors/
│   │   │   ├── sources/              # PostgreSQL, SQL Server, MySQL
│   │   │   └── targets/              # Databricks, Microsoft Fabric
│   │   ├── pipeline/                 # Orchestrator, Extractor, Transformer
│   │   ├── schema/                   # Types, Mapper, Inspector
│   │   ├── assessment/               # Profiler, PII Detector, Dependency Scanner
│   │   ├── generation/               # ETL Generator, DDL Generator
│   │   ├── testing/                  # Reconciler
│   │   ├── reporting/                # Report Generator
│   │   ├── compliance/               # Audit Logger
│   │   ├── telemetry/                # Phase Tracker, Lifecycle Reporter
│   │   └── utils/                    # Checkpoint, Logger, Retry
│   ├── package.json
│   └── tsconfig.json
├── plugins/
│   └── ruflo-data-migration/         # Plugin de orquestração multi-agente
│       ├── agents/                   # 13 agentes especializados
│       │   ├── pre-assessment-analyst.md
│       │   ├── data-profiler.md
│       │   ├── as-is-documenter.md
│       │   ├── to-be-designer.md
│       │   ├── schema-mapper.md
│       │   ├── code-generator.md
│       │   ├── test-engineer.md
│       │   ├── cutover-planner.md
│       │   ├── compliance-auditor.md
│       │   ├── post-migration-reporter.md
│       │   ├── migration-orchestrator.md
│       │   ├── source-inspector.md
│       │   └── migration-validator.md
│       ├── skills/                   # 18 skills (5 execução + 12 ciclo + telemetria)
│       │   ├── pre-assessment/
│       │   ├── data-profiling/
│       │   ├── pii-scan/
│       │   ├── dependency-map/
│       │   ├── as-is-report/
│       │   ├── to-be-design/
│       │   ├── schema-mapping/
│       │   ├── code-generate/
│       │   ├── test-generate/
│       │   ├── cutover-plan/
│       │   ├── reconciliation/
│       │   ├── compliance-report/
│       │   ├── migration-plan/
│       │   ├── migration-run/
│       │   ├── migration-status/
│       │   ├── migration-rollback/
│       │   └── migration-validate/
│       ├── commands/
│       └── scripts/smoke.sh          # 65 smoke tests
├── migrations/
│   ├── manifests/                    # Templates YAML (assessment, mapping, full-load, incremental)
│   └── docs/templates/               # Templates de documentação (as-is, to-be, cutover, relatórios)
├── lib/                              # Mock data (frontend)
└── public/                           # Assets estáticos
```

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Estilo | Tailwind CSS v3 com design system próprio |
| Engine | Node.js 20+ + TypeScript strict |
| Fontes SQL | `pg` · `mssql` · `mysql2` |
| Destinos cloud | Databricks REST API · Microsoft Fabric API |
| Orquestração | 13 agentes com checkpoints e retry automático |
| Plugin | `ruflo-data-migration` |

---

## Pré-requisitos

- **Node.js 20+** — [nodejs.org/download](https://nodejs.org/download)
- **npm 9+** (incluído com o Node.js)

```bash
node --version   # deve ser >= 20
npm --version    # deve ser >= 9
```

---

## Instalação

### Frontend (interface web)

```bash
# 1. Clonar o repositório
git clone https://github.com/juliopessan/migrateiq.git
cd migrateiq

# 2. Instalar dependências do frontend
npm install

# 3. Iniciar em desenvolvimento (http://localhost:3002)
npm run dev
```

### Engine de migração

```bash
# Instalar dependências do engine separadamente
cd engine
npm install

# Copiar e configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais de banco e cloud

# Executar uma migração
npm run migrate -- run --manifest ../migrations/manifests/full-load.template.yaml

# Inspecionar schema de origem
npm run migrate -- inspect --manifest ../migrations/manifests/full-load.template.yaml
```

---

## Outros comandos

### Frontend
```bash
npm run build       # Build de produção
npm run start       # Iniciar build de produção
npm run typecheck   # Verificar tipos TypeScript
npm run lint        # Verificar estilo de código
```

### Engine
```bash
cd engine
npm run build       # Compilar TypeScript
npm run typecheck   # Verificar tipos
npm run dev         # Watch mode
```

### Smoke tests (plugin)
```bash
bash plugins/ruflo-data-migration/scripts/smoke.sh
# Expected: 65 passed, 0 failed
```

---

## Configuração do Engine (`.env`)

```env
# SQL Server
MSSQL_HOST=localhost
MSSQL_PORT=1433
MSSQL_USER=sa
MSSQL_PASSWORD=your_password
MSSQL_DATABASE=source_db

# PostgreSQL
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_password
PG_DATABASE=source_db

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=source_db

# Databricks
DATABRICKS_HOST=https://your-workspace.azuredatabricks.net
DATABRICKS_TOKEN=dapi...
DATABRICKS_WAREHOUSE_ID=abc123

# Microsoft Fabric
FABRIC_TENANT_ID=your-tenant-id
FABRIC_CLIENT_ID=your-client-id
FABRIC_CLIENT_SECRET=your-secret
FABRIC_WORKSPACE_ID=your-workspace-id
```

---

## Features

### AI Schema Mapper
Detecta e mapeia automaticamente colunas equivalentes entre sistemas. Aprende com cada migração via feedback loop.

### Detecção de PII e Conformidade LGPD
Identifica CPF, CNPJ, email, telefone, nome e dados sensíveis. Gera regras de mascaramento por coluna e produz o pacote de evidências LGPD/SOX.

### Incremental com Watermark
Detecta automaticamente colunas de timestamp para cargas incrementais com checkpoint de retomada automática.

### Validação em Tempo Real
Row count parity, unicidade de PKs e null rates — validados antes de cada batch ser confirmado no destino.

### Medallion Architecture
Bronze → Silver → Gold gerado automaticamente com audit columns e lineage completo.

### Geração de Código Revisável
Todos os scripts ETL, DDL e testes são gerados para revisão humana antes de qualquer execução — nada roda sem aprovação.

### Cutover Planning
Runbook de produção completo com timeline, triggers de rollback, plano de comunicação e checklist pré-cutover.

### Telemetria e Relatório Final
Cada fase é instrumentada com um `PhaseTracker` que captura duração, tokens, modelo usado e custo estimado — no mesmo formato do rodapé do Claude Code (`12m 18s · 39.9k tokens`). O `lifecycle-report` consolida todas as fases em um único relatório com a tabela de modelos utilizados, totais e ROI.

```
=== Relatório Final de Migração: migration-001 ===

| Fase                 | Agente                  | Modelo     | Duração | Tokens | Custo    |
|----------------------|-------------------------|------------|---------|--------|----------|
| ✅ 1. Pre-Assessment | pre-assessment-analyst  | Opus 4.8   | 2m 10s  | 95.4k  | $0.4521  |
| ✅ 2. Data Profiling | data-profiler           | Opus 4.8   | 5m 32s  | 210.0k | $1.2030  |
| ✅ 3. As-Is          | as-is-documenter        | Sonnet 4.6 | 3m 05s  | 142.0k | $0.1820  |
| ✅ 4. To-Be          | to-be-designer          | Opus 4.8   | 4m 48s  | 188.0k | $0.9900  |
| ✅ 5. Schema Mapping | schema-mapper           | Sonnet 4.6 | 1m 50s  | 78.0k  | $0.0930  |
| ✅ 6. Code Gen       | code-generator          | Opus 4.8   | 6m 20s  | 256.0k | $1.5400  |
| ✅ 7. Testing        | test-engineer           | Sonnet 4.6 | 4m 12s  | 165.0k | $0.2050  |
| ✅ 8. Cutover Plan   | cutover-planner         | Opus 4.8   | 2m 30s  | 98.0k  | $0.5100  |
| ✅ 9. Execution      | migration-orchestrator  | Opus 4.8   | 12m 18s | 320.0k | $1.8800  |
| ✅ 10. Post-Migration| post-migration-reporter | Sonnet 4.6 | 2m 40s  | 110.0k | $0.1380  |

Modelos: Opus 4.8 (6 fases, $6.58) · Sonnet 4.6 (4 fases, $0.62)
TOTAIS: 45m 25s · 1.76M tokens · $7.20 USD · 10/10 fases
```

---

## Agentes

| Agente | Fase | Função |
|--------|------|--------|
| `pre-assessment-analyst` | 1 | Score de complexidade, go/no-go |
| `data-profiler` | 2 | Qualidade de dados, detecção de PII |
| `as-is-documenter` | 3 | Documentação do estado atual |
| `to-be-designer` | 4 | Design da arquitetura alvo |
| `schema-mapper` | 5 | Aprovação do mapeamento coluna-a-coluna |
| `code-generator` | 6 | Geração de scripts ETL e DDL |
| `test-engineer` | 7 | Geração e execução de testes |
| `cutover-planner` | 8 | Runbook de cutover |
| `migration-orchestrator` | 9 | Coordenação da execução |
| `source-inspector` | 9 | Discovery de schema |
| `migration-validator` | 9 | Validação pós-execução |
| `compliance-auditor` | 10 | Conformidade LGPD/SOX |
| `post-migration-reporter` | 10 | Relatório executivo e handover |

---

## Planos

| Plano | Linhas / mês | Conexões |
|-------|-------------|----------|
| Starter | 1M | 1 + 1 |
| Pro | 50M | 5 |
| Enterprise | Ilimitado | Ilimitado |

Todos os planos sob consulta — [falar com vendas](mailto:contato@migrateiq.com.br).

---

## Verificação rápida

```bash
# Smoke tests do plugin (deve retornar 65/65)
bash plugins/ruflo-data-migration/scripts/smoke.sh

# TypeScript do frontend
npx tsc --noEmit

# TypeScript do engine
cd engine && npx tsc --noEmit
```

---

## Roadmap

- [ ] Conectores SAP, TOTVS e Salesforce
- [ ] Monitor em tempo real com WebSocket
- [ ] API pública REST
- [ ] Deploy on-prem (Docker / Kubernetes)
- [ ] Interface de configuração de manifests (no-code)
- [ ] Dashboard de qualidade de dados (pós-profiling)
- [ ] Integração com Great Expectations para DQ automático

---

## Licença

MIT © 2026 MigrateIQ
