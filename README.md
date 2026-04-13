# LabOS 🔋

> **AI-Powered Operating System for Battery R&D Labs**

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Prisma](https://img.shields.io/badge/Prisma_7-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io)
[![Claude API](https://img.shields.io/badge/Claude_API-D97757?style=flat-square&logo=anthropic&logoColor=white)](https://anthropic.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**LabOS** is a full-stack platform that brings intelligence to every step of battery research — from raw material intake to cycle test analysis. Built by a sole developer as the operational backbone of an active battery R&D startup.

---

## What It Does

Battery research generates a massive amount of data spread across disconnected tools: Excel files from cyclers, handwritten lab notebooks, informal Slack messages, and one-off scripts. LabOS replaces all of that with a single, opinionated platform that:

- **Guides researchers step-by-step** through manufacturing workflows with real-time validation and operator sign-offs
- **Imports and parses Neware BTS files** automatically — 6-sheet Excel exports, streamed in chunks for large multi-thousand-cycle datasets
- **Visualizes test results** with capacity fade curves, Coulombic efficiency plots, voltage profiles, and dQ/dV analysis
- **Runs AI analysis** on every cycle test via Claude API — anomaly detection, fade rate, recommendations
- **Maintains full traceability** from raw material lot → slurry mixing → electrode coating → cell assembly → every test cycle

---

## Modules

### ⚡ Cycle Tests
Upload a Neware BTS `.xlsx` file and get a fully analyzed test in seconds.

- **Auto-detection** of Neware BTS format (5.x, 7.x, 9.x column variations handled)
- **Streaming parser** for large files — up to 2,500,000 records processed without memory issues
- **Charts:** Capacity fade (with 80% EOL reference), Coulombic efficiency, Voltage profiles, dQ/dV
- **Multi-test comparison** — overlay 2–6 tests on the same chart
- **AI Copilot** — one-click Claude analysis of retention%, anomaly cycles, fade rate, recommendations
- **Anomaly flags** — automatic detection of capacity drops >3% or CE <95%

### 🏭 Manufacturing
End-to-end production tracking with enforced step ordering and immutable audit trail.

| Step | Process |
|------|---------|
| 1 | Anode slurry — NMP, PVDF, AM, viscosity, grindometer |
| 2 | Cathode slurry |
| 3 | Anode electrode — loading mg/cm², porosity, thickness |
| 4 | Cathode electrode |
| 5 | Cell assembly — electrolyte, separator, housing |
| 6 | Final cells — count and log |

Each step requires operator sign-off. Steps unlock in order. Sign-offs are timestamp-immutable.

### 🧪 Experiments
Track R&D experiments linked to materials, protocols, and cycle test results.

### 📦 Materials Inventory
Manage active materials, conductive additives, binders, solvents, electrolyte salts, and foils — with lot tracking and supplier metadata.

### 🧮 Calculators
Built-in calculators for slurry formulation, electrode loading, and electrolyte preparation.

### 📊 Dashboard
CEO-level overview of lab activity — active projects, recent test results, manufacturing status, anomaly alerts.

---

## AI Architecture

LabOS uses Claude (Anthropic) as the analysis layer. The AI copilot consumes precomputed summaries — never raw records — to stay fast and cost-efficient.

```
buildTestContext(testId) → {
  metadata:      { builder, remarks, startTime, totalCycles }
  summary:       { retention%, avgCE, anomalyCycles[], fadeRate }
  capacityTrend: CycleSummary[]
  stepPlan:      StepPlanEntry[]
}
```

AI analysis is cached with TTL to prevent redundant API calls on repeat visits.

---

## Data Import Pipeline

The import pipeline is **source-agnostic by design**. Neware BTS is the first supported format. Arbin, Maccor, BioLogic, and MITS Pro are planned.

### Neware BTS Parser

Neware Excel exports contain 6 sheets with fundamentally different structures:

| Sheet | Content | Parse Strategy |
|-------|---------|---------------|
| `test` | Non-tabular metadata + step plan | Custom positional parser |
| `cycle` | Cycle-level summaries | Standard tabular |
| `step` | Step-level summaries | Standard tabular |
| `record` | Raw time-series (every 30s) | **Streamed in 5,000-row chunks** |
| `idle` | Idle monitoring | Skipped if empty |
| `curve` | Neware chart config | Always skipped |

A standard 500-cycle aging test produces ~625,000 records. A long-life 2,000-cycle test produces ~2,500,000. The parser handles all of it without loading into memory.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript — strict, no `any` |
| UI | React 19 + Tailwind CSS v4 + Shadcn/ui + Radix UI |
| Animation | Framer Motion |
| Charts | Recharts |
| Auth | Clerk |
| Database | Supabase (PostgreSQL) via Prisma 7 |
| File Storage | Supabase Storage |
| AI | Anthropic Claude API |
| Data Fetching | TanStack React Query |
| Validation | Zod |
| Testing | Vitest + RTL + Playwright (5-layer pyramid) |

---

## Design System

LabOS ships with **4 complete themes** — every component looks finished in all four:

| Theme | Description |
|-------|------------|
| `dark` | Deep navy/slate lab environment |
| `light` | Clean white research interface |
| `fashion-dark` | High-contrast editorial dark |
| `fashion-light` | Premium light with accent colors |

Colors live entirely in CSS variables in `globals.css`. Switching themes = zero component changes.

---

## Getting Started

```bash
git clone https://github.com/omer-sch/labos.git
cd labos
npm install
```

Copy `.env.example` to `.env.local` and fill in:

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
ANTHROPIC_API_KEY=sk-ant-...
```

```bash
npx prisma migrate dev
npx prisma generate
npm run dev   # → http://localhost:3000
```

---

## Testing

```bash
npm test                    # Unit (Vitest + RTL)
npm run test:integration    # Integration (Vitest + Prisma mocks)
npm run test:e2e            # E2E (Playwright, Chromium)
npm run test:perf           # Performance benchmarks
npm run test:security       # Security tests
```

---

## Built By

**Omer Schreiber** — sole developer. Designed, architected, and built end-to-end as the operational backbone of an active battery R&D startup.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Omer_Schreiber-0077B5?style=flat-square&logo=linkedin)](https://linkedin.com/in/omer-schreiber-48b3912b6)
[![GitHub](https://img.shields.io/badge/GitHub-omer--sch-181717?style=flat-square&logo=github)](https://github.com/omer-sch)

---

## License

MIT
