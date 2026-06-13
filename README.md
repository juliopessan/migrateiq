# MigrateIQ

**AI-native data migration platform** — SQL Server, PostgreSQL e MySQL para Databricks e Microsoft Fabric, orquestrado por múltiplos agentes de IA.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Visão Geral

MigrateIQ elimina semanas de scripts ETL manuais. A plataforma inspeciona o schema de origem, sugere mapeamentos de tipos automaticamente via IA, executa a migração em paralelo com checkpoints automáticos e valida cada batch antes de confirmar no destino.

**Fontes suportadas:** SQL Server · PostgreSQL · MySQL  
**Destinos suportados:** Databricks Delta Lake · Microsoft Fabric Lakehouse  
**Estratégias:** Full Load · Incremental com Watermark  
**Arquitetura:** Medallion (Bronze → Silver → Gold)

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Estilo | Tailwind CSS v3 com design system Avanade |
| Componentes | Lucide React + Recharts |
| Engine de migração | [`data-migration-hub/`](../data-migration-hub) — TypeScript + Node.js 18+ |
| Orquestração | Multi-agente de IA com checkpoints e retry |

---

## Estrutura

```
migrateiq/
├── app/
│   ├── page.tsx                  # Landing page
│   └── app/
│       ├── dashboard/page.tsx    # Dashboard com métricas e migrações recentes
│       ├── migrations/page.tsx   # Lista e gerenciamento de migrações
│       └── connections/page.tsx  # Gerenciamento de fontes e destinos
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx           # Sidebar de navegação fixa
│   │   └── Header.tsx            # Header do app com breadcrumb
│   └── ui/
│       ├── Button.tsx            # 4 variantes (primary, secondary, ghost, gradient)
│       └── Badge.tsx             # 7 variantes de status
├── lib/
│   └── mock-data.ts              # Dados de demonstração
└── tailwind.config.ts            # Design tokens Avanade completos
```

---

## Features

### AI Schema Mapper
Detecta e mapeia automaticamente colunas equivalentes entre sistemas com base em heurísticas de IA. Aprende com cada migração via feedback loop.

### Incremental com Watermark
Detecta automaticamente colunas de timestamp (`updated_at`, `modified_at`, etc.) para cargas incrementais com checkpoint de retomada automática.

### Validação em Tempo Real
Row count parity, unicidade de PKs e null rates — validados automaticamente antes de cada batch ser confirmado no destino.

### Medallion Architecture
Bronze → Silver → Gold gerado automaticamente com colunas de auditoria (`_migration_id`, `_migrated_at`, `_layer`) e lineage completo.

### Mascaramento & Compliance
PII masking em nível de coluna via YAML. Logs de auditoria completos compatíveis com LGPD e SOX.

---

## Instalação

```bash
# Dependências
npm install

# Desenvolvimento (porta 3002)
npm run dev

# Build de produção
npm run build

# Type check
npm run typecheck

# Lint
npm run lint
```

---

## Design System

O projeto usa o design system Avanade completo via Tailwind CSS:

```css
/* Cores principais */
--ava-orange: #FF5800      /* Cor primária da marca */
--ava-grey-80: #333333     /* Texto principal */
--ava-master: linear-gradient(135deg, #FF5800 0%, #890078 100%)

/* Componentes */
.ava-card            /* Card com borda laranja de 4px no topo */
.ava-gradient-text   /* Texto com master gradient */
.ava-accent-bar--gradient  /* Barra de acento gradient */
```

Tokens disponíveis: cores primárias, 8 tons de cinza, família de gradients (Solar → Luminous → Glow → Flame → Thermal → Aurora), tipografia Segoe UI, escala de espaçamento 4px, sombras e border radius.

---

## Planos

| Plano | Preço | Linhas / mês | Conexões |
|-------|-------|-------------|----------|
| Starter | Grátis | 1M | 1 + 1 |
| Pro | R$ 990/mês | 50M | 5 |
| Enterprise | Sob consulta | Ilimitado | Ilimitado |

---

## Roadmap

- [ ] Conectores SAP, TOTVS e Salesforce
- [ ] Monitor em tempo real com WebSocket
- [ ] CLI para execução local de manifests
- [ ] API pública REST para integração com pipelines
- [ ] Deploy on-prem (Docker / Kubernetes)

---

## Licença

MIT © 2026 MigrateIQ
