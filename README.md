# MigrateIQ

**AI-native data migration platform** — SQL Server, PostgreSQL e MySQL para Databricks e Microsoft Fabric, orquestrado por múltiplos agentes de IA.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)
![Smoke Tests](https://img.shields.io/badge/smoke%20tests-24%2F24-brightgreen)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Visão Geral

MigrateIQ elimina semanas de scripts ETL manuais. A plataforma inspeciona o schema de origem, sugere mapeamentos de tipos automaticamente via IA, executa a migração em paralelo com checkpoints automáticos e valida cada batch antes de confirmar no destino.

**Fontes suportadas:** SQL Server · PostgreSQL · MySQL  
**Destinos suportados:** Databricks Delta Lake · Microsoft Fabric Lakehouse  
**Estratégias:** Full Load · Incremental com Watermark  
**Arquitetura:** Medallion (Bronze → Silver → Gold)

---

## Estrutura do Repositório

```
migrateiq/
├── app/                          # Frontend Next.js (App Router)
│   ├── page.tsx                  # Landing page
│   └── app/
│       ├── dashboard/page.tsx    # Dashboard
│       ├── migrations/page.tsx   # Gerenciamento de migrações
│       └── connections/page.tsx  # Conexões
├── components/                   # Componentes React
│   ├── layout/ (Sidebar, Header)
│   └── ui/ (Button, Badge)
├── engine/                       # Engine de migração (Node.js)
│   ├── src/
│   │   ├── connectors/
│   │   │   ├── sources/          # PostgreSQL, SQL Server, MySQL
│   │   │   └── targets/          # Databricks, Microsoft Fabric
│   │   ├── pipeline/             # Orchestrator, Extractor, Transformer
│   │   ├── schema/               # Types, Mapper, Inspector
│   │   └── utils/                # Checkpoint, Logger, Retry
│   ├── package.json              # Dependências do engine
│   └── tsconfig.json
├── plugins/
│   └── ruflo-data-migration/     # Plugin de orquestração multi-agente
│       ├── agents/               # migration-orchestrator, source-inspector, migration-validator
│       ├── skills/               # migration-plan, run, status, rollback, validate
│       ├── commands/
│       └── scripts/smoke.sh      # 24 smoke tests
├── migrations/
│   └── manifests/                # Templates YAML (full-load, incremental)
├── lib/                          # Mock data (frontend)
└── public/                       # Assets estáticos
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
| Orquestração | Multi-agente com checkpoints e retry automático |
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
# Expected: 24 passed, 0 failed
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

### Incremental com Watermark
Detecta automaticamente colunas de timestamp (`updated_at`, `modified_at`, etc.) para cargas incrementais com checkpoint de retomada automática.

### Validação em Tempo Real
Row count parity, unicidade de PKs e null rates — validados automaticamente antes de cada batch ser confirmado no destino.

### Medallion Architecture
Bronze → Silver → Gold gerado automaticamente com colunas de auditoria (`_migration_id`, `_migrated_at`, `_layer`) e lineage completo.

### Mascaramento & Compliance
PII masking em nível de coluna via YAML. Logs de auditoria completos compatíveis com LGPD e SOX.

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
# Smoke tests do plugin (deve retornar 24/24)
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

---

## Licença

MIT © 2026 MigrateIQ
