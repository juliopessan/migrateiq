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
| Estilo | Tailwind CSS v3 com design system próprio |
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
└── tailwind.config.ts            # Design tokens do MigrateIQ
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

## Pré-requisitos

- **Node.js 18+** — [nodejs.org/download](https://nodejs.org/download)
- **npm 9+** (incluído com o Node.js)

Verificar versões:

```bash
node --version   # deve ser >= 18
npm --version    # deve ser >= 9
```

## Instalação

```bash
# 1. Clonar o repositório
git clone https://github.com/juliopessan/migrateiq.git
cd migrateiq

# 2. Instalar dependências
npm install

# 3. Iniciar em desenvolvimento (abre em http://localhost:3002)
npm run dev
```

Abra [http://localhost:3002](http://localhost:3002) no navegador.

## Outros comandos

```bash
npm run build       # Build de produção
npm run start       # Iniciar build de produção (requer npm run build antes)
npm run typecheck   # Verificar tipos TypeScript
npm run lint        # Verificar estilo de código
```

---

## Design System

O projeto usa um design system próprio via Tailwind CSS com tokens de cor, tipografia e espaçamento.

**Paleta principal:**

| Token | Hex | Uso |
|-------|-----|-----|
| `orange` | `#FF5800` | Cor primária — CTAs, destaques |
| `grey-80` | `#333333` | Texto principal |
| `grey-60` | `#666666` | Texto secundário |
| `grey-10` | `#e5e5e5` | Backgrounds de seção |
| `success` | `#00A650` | Status positivo |
| `info` | `#0078D4` | Status informativo |

**Gradients:**

```
master:  #FF5800 → #890078  (laranja → aurora)
warm:    #FFD700 → #FF5800  (solar → laranja)
```

**Componentes CSS globais:**

```css
.card                    /* Card com borda laranja de 4px no topo + sombra */
.gradient-text           /* Texto com gradient laranja → aurora */
.accent-bar--gradient    /* Barra de acento gradient horizontal */
```

Tipografia: **Segoe UI** (Light 300 para títulos H1/H2, Semibold 600 para H3/H5).

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
