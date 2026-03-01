# Stack Research

**Domain:** Battery manufacturing and research management platform
**Researched:** 2026-03-01
**Confidence:** MEDIUM (Context7, WebSearch, and WebFetch unavailable; training data as of August 2025 with explicit confidence flags per finding)

---

## Research Constraints

Context7, WebSearch, and WebFetch tools were unavailable during this research session. All findings derive from training data (cutoff: August 2025). Version numbers marked HIGH confidence were stable, widely-adopted releases at cutoff. Anything marked MEDIUM or LOW should be verified against npm registry or official docs before pinning in package.json.

---

## Chosen Stack Validation

The project has pre-decided the following. This section validates each choice against battery research domain requirements.

| Technology | Domain Fit | Verdict | Risk |
|------------|-----------|---------|------|
| Next.js 15 App Router | Server components reduce JS payload; good for data-heavy dashboards | VALIDATED | RSC + Prisma client boundary requires care (see pitfalls) |
| TypeScript | PhD-level domain objects (cycle data, slurry params) benefit heavily from strict typing | VALIDATED | None |
| Shadcn/ui + Tailwind CSS | Unstyled primitives let you achieve the premium dark-theme look without fighting defaults | VALIDATED | None |
| Framer Motion | Appropriate for premium feel; keep it out of data-render hot paths | VALIDATED | Don't animate chart data updates — freezes at 10k+ points |
| Supabase + PostgreSQL | Time-series cycle data is relational; SQL aggregations (AVG capacity per cycle) outperform document stores here | VALIDATED | Local-first MVP needs Supabase running locally via Docker |
| Prisma ORM | Type-safe queries for complex joins (cell → batch → production run → slurry); migrations suit manufacturing schema evolution | VALIDATED | Prisma Client must stay server-side only in App Router |
| Clerk (auth) | RBAC (admin/researcher/viewer) built in; works with Next.js middleware; handles local deployment | VALIDATED | Clerk requires internet for JWT validation — verify offline mode is acceptable for local-first requirement |
| Claude API | Best-in-class for scientific text generation; anomaly detection via structured outputs; cross-dataset pattern recognition | VALIDATED | Rate limits matter at scale; structure prompts to return JSON for programmatic anomaly flags |
| Recharts + D3 | Recharts for standard charts (capacity fade, coulombic efficiency); D3 for dQ/dV differential curves which need custom path rendering | VALIDATED | Recharts SVG rendering hits performance ceiling at ~5k data points per series — see mitigation below |

**Critical finding on Clerk + local-first:** Clerk's auth SDK validates JWTs against Clerk's cloud infrastructure. In a fully air-gapped local deployment, JWT validation calls will fail. Mitigation: ensure the local deployment has outbound HTTPS access to `api.clerk.com`. This is LOW risk for a lab network but HIGH risk for air-gapped facilities. Flag for deployment phase. Confidence: MEDIUM (based on Clerk's architecture documentation as of training cutoff).

---

## Recommended Stack

### Core Technologies (Pre-decided — validated above)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.x (App Router) | Full-stack framework | Server Components handle data fetching without client-side waterfall; API routes serve Prisma queries; file-upload handling |
| TypeScript | 5.x | Type safety | Enforces domain model correctness — cycle data schemas, slurry measurement types, production step flags |
| Supabase | Latest (self-hosted via Docker for local-first) | PostgreSQL host + storage | Built-in storage bucket for Excel/CSV file retention; local Docker image for MVP; migrate to cloud when needed |
| PostgreSQL | 15+ (via Supabase) | Primary database | Time-series cycle data fits relational model; complex queries (capacity fade trend, multi-cell comparison) benefit from SQL |
| Prisma | 5.x | ORM + migrations | Type-safe schema → TypeScript types; migration history is essential as manufacturing schema evolves |
| Clerk | Latest | Auth + RBAC | Role-based access (admin/researcher/viewer) without building auth from scratch |
| Claude API (Anthropic SDK) | Latest | AI layer | Anomaly detection, automated run summaries, cross-experiment pattern recognition |
| Recharts | 2.x | Standard charts | Capacity fade, coulombic efficiency, voltage curves — compositional API pairs well with Shadcn/ui aesthetics |
| D3.js | 7.x | Custom scientific charts | dQ/dV differential capacity curves require custom SVG path math; D3 scales + Recharts canvas is the hybrid pattern |
| Shadcn/ui | Latest (canary supports RSC) | Component system | Accessible, unstyled-by-default; dark theme native; pairs with Tailwind |
| Tailwind CSS | 3.x / 4.x | Styling | Utility-first; dark mode via `dark:` prefix; no CSS modules overhead |
| Framer Motion | 11.x | Animation | Page transitions, panel reveals; keep OFF chart render paths |

### Domain-Essential Supporting Libraries

These are libraries the pre-decided stack does NOT include but the battery research domain specifically requires:

#### File Parsing (Excel/CSV — Neware BTS format)

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| **xlsx (SheetJS Community Edition)** | 0.18.x | Parse .xlsx and .csv files from Neware BTS exports | Primary import path for all cycle data uploads | MEDIUM — SheetJS CE is stable but v0.18 was latest at training cutoff; verify current version on npm |
| **Papa Parse** | 5.x | Streaming CSV parsing | Use when files exceed ~10MB; Papa Parse streams rows without loading full file into memory | HIGH — extremely stable library, minimal churn |

**Recommendation:** Use SheetJS for .xlsx and Papa Parse for .csv. Do NOT use SheetJS for large CSV files — it parses the full sheet into memory. Neware exports can exceed 50MB for long cycle runs. Papa Parse's streaming mode (`worker: true`) handles this without blocking the main thread.

**Important caveat on SheetJS licensing:** SheetJS Community Edition (xlsx package on npm) changed its license in 2023. The npm package is now Apache-2.0 for CE but the Pro features are commercial. Verify the npm package license before using in any commercial derivative. For purely internal lab tooling, CE is sufficient. Confidence: MEDIUM (licensing state as of August 2025; verify current status).

#### Data Tables for Large Datasets

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| **TanStack Table v8** | 8.x | Headless table engine | All data tables in the app — production project lists, experiment lists, cycle data point viewer | HIGH — TanStack Table v8 is the definitive headless table solution for React; highly stable |
| **TanStack Virtual** | 3.x | Row virtualization | Required for cycle data tables showing 10k+ rows (one row per cycle) | HIGH — pairs directly with TanStack Table for virtual scrolling |

**Recommendation:** Use TanStack Table v8 for ALL tables. It handles sorting, filtering, pagination, and column visibility with no DOM. Combine with TanStack Virtual for the cycle data viewer specifically — a 500-cycle test with 3 measurements per cycle = 1500 rows, easily manageable; a 2000-cycle degradation study with dense data = needs virtualization.

Do NOT use plain HTML tables or a simple `<table>` with pagination for cycle data. Researchers will want to sort by cycle number, filter by capacity threshold, and export — TanStack Table gives you all of this headlessly.

#### Time-Series and Scientific Visualization

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| **Recharts** | 2.x | Capacity fade curves, coulombic efficiency, voltage profiles | Primary charting library for standard battery metrics | HIGH (already in stack) |
| **D3.js** | 7.x | dQ/dV differential capacity curves, custom axes | Use where Recharts composability isn't sufficient — dQ/dV requires derivative calculation + custom path | HIGH (already in stack) |
| **mathjs** | 12.x | Mathematical operations on cycle data | dQ/dV derivative calculation (`dQ/dV = ΔQ/ΔV` for each cycle point), statistical summaries | MEDIUM — mathjs is well-established; version may have advanced |

**On dQ/dV specifically:** Differential capacity analysis (dQ/dV vs V) is a critical diagnostic tool in battery research. It requires: (1) computing the derivative of capacity with respect to voltage for each cycle, (2) smoothing (Savitzky-Golay or simple moving average), and (3) overlaying multiple cycles. This is NOT doable with Recharts out of the box. Use D3 scales and path generators, render into a `<canvas>` or `<svg>` element, and wrap in a React component. mathjs provides the derivative computation.

**On Recharts performance limits:** Recharts renders SVG. At ~5000 data points in a single LineChart, browser rendering slows noticeably. For cycle data with many points per cycle, use one of:
- Data downsampling before rendering (Largest-Triangle-Three-Buckets algorithm)
- Canvas rendering for dense datasets
- A library like **uPlot** (see below)

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| **uPlot** | 1.x | Ultra-fast canvas-based time-series | If Recharts performance is unacceptable for dense voltage/current data | MEDIUM — production-proven in Grafana; API is lower-level |

**Recommendation:** Start with Recharts for capacity fade and CE curves (typically one point per cycle = manageable). Use D3 custom components for dQ/dV. Introduce uPlot only if voltage-over-time profiling (dense time-series within a single cycle) becomes a requirement — that's the scenario where you'd have 10k+ points per chart.

#### Data Processing and State Management

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| **TanStack Query (React Query)** | 5.x | Server state management, caching | Fetching cycle data, experiments, production records; prevents redundant fetches across navigation | HIGH — v5 is stable; essential for any data-heavy Next.js app |
| **Zod** | 3.x | Schema validation | Validate imported Excel/CSV data against expected Neware BTS format before persisting | HIGH — Zod is the de-facto validation library in the Next.js ecosystem |
| **date-fns** | 3.x | Date manipulation | Experiment timestamps, production step timing, duration calculations | HIGH — stable, tree-shakeable; preferred over moment.js |

**On TanStack Query with Next.js App Router:** TanStack Query v5 works with App Router but requires careful placement of `QueryClientProvider` — it must be in a client boundary. Server Components fetch directly via Prisma/fetch; Client Components use TanStack Query for interactive data. This split is important for this app: the cycle data chart is interactive (user selects cycle range) → client component with TanStack Query. The production project detail page is mostly static display → Server Component with direct Prisma call.

#### File Upload and Storage

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| **Supabase Storage** | (via @supabase/supabase-js) | Store raw Excel/CSV files | Upload the original file before parsing; enables re-processing without re-upload | HIGH — built into the chosen stack |
| **react-dropzone** | 14.x | Drag-and-drop file upload UI | All file import screens; provides good UX for researchers dropping Neware exports | HIGH — highly stable library |

#### AI Integration

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| **@anthropic-ai/sdk** | 0.x latest | Claude API client | All AI features: anomaly detection, summaries, pattern recognition | HIGH — official SDK; use structured outputs (tool_use) for anomaly flag responses |
| **ai (Vercel AI SDK)** | 4.x | Streaming AI responses | Use for the automated text summary feature where streaming output improves UX | MEDIUM — Vercel AI SDK v4 was in active development at training cutoff; verify compatibility with Claude |

**Recommendation on AI SDK:** The Vercel AI SDK supports multiple providers including Anthropic and simplifies streaming UI patterns (`useChat`, `useCompletion`). Use it for the streaming summary generation. For structured anomaly detection (where you need a JSON response, not streamed text), call the Anthropic SDK directly with `tool_use` to guarantee schema-conformant output.

#### Developer Experience and Testing

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| **Vitest** | 1.x | Unit testing | Test data transformation logic — dQ/dV calculation, CSV parsing, anomaly detection logic | HIGH — standard choice with Vite-based tooling |
| **Playwright** | 1.x | E2E testing | Critical workflows: file import, production step sign-off, role-based access | HIGH — production-proven E2E framework |
| **ESLint** | 8.x / 9.x | Linting | Standard Next.js config | HIGH |
| **Prettier** | 3.x | Formatting | Standard | HIGH |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Docker + Supabase CLI** | Run Supabase locally (PostgreSQL + Storage + Auth) | Required for local-first MVP; `supabase start` spins up the full stack |
| **Prisma Studio** | Visual database inspector | Essential during development for inspecting manufacturing schema |
| **Prisma Migrate** | Schema migrations | Use `prisma migrate dev` in development, `prisma migrate deploy` in production |

---

## Installation

```bash
# File parsing
npm install xlsx papaparse

# Data tables + virtualization
npm install @tanstack/react-table @tanstack/react-virtual

# Data fetching + validation
npm install @tanstack/react-query zod date-fns

# Scientific computation
npm install mathjs

# AI SDK
npm install @anthropic-ai/sdk ai

# File upload UI
npm install react-dropzone

# Dev dependencies
npm install -D vitest @playwright/test @vitejs/plugin-react
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| TanStack Table v8 | AG Grid Community | AG Grid if you need Excel-like inline editing across the entire table; TanStack if you want full design control |
| TanStack Table v8 | react-data-grid | react-data-grid for spreadsheet-style editing; not needed for read-heavy research data display |
| Papa Parse (CSV) | Node.js `fs` readline | readline on the server when processing very large files as a background job; Papa Parse for client-side streaming |
| Recharts + D3 | Plotly.js | Plotly has built-in scientific chart types (including dQ/dV style). Significant bundle size (~3MB); overkill when D3 + Recharts combination covers the need |
| Recharts + D3 | Chart.js | Chart.js is fine for simple charts but lacks the composability and React integration quality of Recharts; doesn't help with custom scientific curves |
| uPlot | Canvas API directly | uPlot is preferable over raw Canvas API because it handles axes, zoom, pan — only drop to raw Canvas if uPlot's rendering model conflicts with React lifecycle |
| Vercel AI SDK | Custom fetch streaming | Use custom fetch only if Vercel AI SDK adds unacceptable dependency overhead; unlikely |
| date-fns | dayjs | dayjs is also acceptable; date-fns is preferred for its modular imports and better TypeScript support |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **moment.js** | Deprecated, 67KB bundle, mutable API | date-fns (tree-shakeable, immutable) |
| **Chart.js** | Poor React integration, limited composability, no headless API | Recharts (React-native, composable) |
| **react-csv** | Parses CSV synchronously on main thread, no streaming, limited format support | Papa Parse with `worker: true` |
| **Plotly.js** | ~3MB bundle for features mostly not needed here | Recharts + D3 covers 95% of battery visualization needs at 1/10th the size |
| **MUI DataGrid** | Tightly coupled to Material UI design system; fights against Shadcn/Tailwind aesthetic | TanStack Table v8 (headless, design-system agnostic) |
| **Prisma Client in Client Components** | Exposes database credentials to browser bundle | Always call Prisma from Server Components or API routes only |
| **SWR** | TanStack Query v5 has stronger TypeScript types, better devtools, and more active development in the Next.js ecosystem | TanStack Query v5 |
| **Redux / Zustand for server data** | Server state belongs in TanStack Query; client-only UI state (selected cycle range, active tab) can use React state or minimal Zustand | TanStack Query for server state; `useState` or Zustand for UI-only state |

---

## Stack Patterns by Variant

**For the cycle data viewer (dense time-series chart):**
- Fetch data server-side via Server Component or TanStack Query client-side
- Downsample to max 2000 points before passing to Recharts (use LTTB algorithm)
- Render dQ/dV in a D3 custom component alongside Recharts
- Use TanStack Table with TanStack Virtual for the raw data table below the chart

**For the production workflow tracker (step-by-step forms):**
- Server Component for the read view, Client Component for form steps
- Zod schema per step (slurry, electrode, assembly) for validation
- TanStack Query mutations for step sign-off with optimistic updates

**For the file import flow:**
- react-dropzone for drag-and-drop
- Papa Parse (CSV) or SheetJS (xlsx) in a Web Worker to avoid blocking UI
- Zod to validate parsed rows match expected Neware BTS column schema
- Upload raw file to Supabase Storage before processing (enables re-import)
- Prisma transaction to write all cycle points atomically

**For AI anomaly detection:**
- Send cycle data summary (not raw points) to Claude API: capacity trend, CE trend, max/min values
- Use `tool_use` structured output to get back `{ anomalies: [{ cycle: number, type: string, severity: string, message: string }] }`
- Store anomaly results in DB, display as chart annotations

**If local-first deployment hits Clerk auth issues:**
- Verify outbound HTTPS to `api.clerk.com` is available
- If truly air-gapped: consider migrating to NextAuth.js v5 with credentials provider + Prisma adapter (no external calls)
- NextAuth.js v5 is the standard self-hosted alternative; it integrates with Prisma natively

---

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 15 | React 19 | App Router in Next 15 runs on React 19; verify Framer Motion 11 compatibility with React 19 (some animation hooks changed) |
| TanStack Table 8.x | React 18+ / 19 | Works with both; no breaking changes expected |
| TanStack Query 5.x | Next.js App Router | Use `QueryClientProvider` in a client boundary wrapper; works alongside Server Components |
| Prisma 5.x | Supabase PostgreSQL 15 | Fully compatible; use `DATABASE_URL` pointing to local Supabase container |
| Clerk | Next.js 15 | Clerk ships first-party Next.js middleware; generally tracks Next.js major versions quickly |
| Vercel AI SDK 4.x | @anthropic-ai/sdk | AI SDK uses Anthropic provider; verify the provider package version matches SDK expectations |
| SheetJS 0.18.x | Node.js 18+ | Full compatibility; use server-side for large file processing rather than browser |

**Key compatibility risk:** Framer Motion 11 and React 19. React 19 changed how some refs and concurrent features work. At training cutoff (August 2025), Framer Motion 11 had addressed most React 19 issues but verify this is still the case. If animation bugs appear, check the Framer Motion GitHub issues before debugging application code. Confidence: LOW — this is an actively evolving compatibility surface.

---

## Domain-Specific Considerations

### Neware BTS Data Format

Neware Battery Testing System exports cycle data in a structured Excel format with specific column naming conventions:
- Columns typically include: Cycle Index, Discharge Capacity (mAh), Charge Capacity (mAh), Coulombic Efficiency (%), Voltage (V), Current (A), Time
- The column names may vary between Neware BTS software versions
- **Recommendation:** Build a flexible column mapper in the import UI — let researchers confirm which column maps to which field rather than assuming column names. This prevents silent data corruption when column order or naming changes between BTS software versions.

### dQ/dV Calculation

Differential capacity analysis involves:
1. Sorting data by voltage ascending within each half-cycle
2. Computing `dQ = Q[i+1] - Q[i]` and `dV = V[i+1] - V[i]`
3. Computing `dQ/dV[i] = dQ / dV` (division by very small numbers creates noise)
4. Applying smoothing (Savitzky-Golay preferred; simple moving average as fallback)
5. Plotting `dQ/dV` vs `V` per cycle, with charge and discharge half-cycles separately

mathjs handles steps 2-3. For Savitzky-Golay smoothing, consider **savitzky-golay** npm package (a small, focused library). Confidence: MEDIUM on that specific package — verify it's maintained.

### Time-Series Storage in PostgreSQL

For cycle data with high point density, avoid storing each measurement as a separate row with a full cell record reference — this creates massive tables. Instead:
- Store cycle-level summaries (one row per cycle: capacity, CE, avg voltage) in a `cycle_metrics` table
- Store raw time-series points (voltage/current/time within a cycle) in a separate `cycle_points` table, referenced by cycle_id
- Index on `(test_id, cycle_number)` for fast range queries
- Consider PostgreSQL's native array types or JSONB for raw within-cycle point arrays if query patterns don't require per-point filtering

This schema decision has major performance implications. The manufacturing schema (slurry, electrode, assembly steps) is standard relational — no special considerations.

---

## Confidence Assessment Summary

| Area | Confidence | Basis |
|------|------------|-------|
| Core framework choices (Next.js, TypeScript, Prisma, Supabase) | HIGH | Well-established, stable versions; validated domain fit |
| TanStack Table v8 + Virtual | HIGH | Dominant in the React ecosystem; highly stable API |
| Papa Parse for CSV | HIGH | Industry standard, extremely stable |
| Recharts + D3 for visualization | HIGH | Both well-established; domain fit validated |
| SheetJS (xlsx) for Excel parsing | MEDIUM | Stable library but licensing changed in 2023; verify |
| mathjs for dQ/dV computation | MEDIUM | Well-established but version number may have advanced |
| Vercel AI SDK v4 | MEDIUM | Active development at cutoff; verify current Claude provider compatibility |
| Framer Motion + React 19 compatibility | LOW | Actively evolving; verify before finalizing |
| Clerk offline/local behavior | MEDIUM | Architecture understood; specific offline behavior needs verification |
| uPlot for dense time-series | MEDIUM | Production-proven but niche; verify active maintenance |

---

## Sources

- Training data (August 2025 cutoff) — all findings; confidence flags applied per section
- Context7 MCP: unavailable during this session
- WebSearch: unavailable during this session
- WebFetch: unavailable during this session

**Verification recommended before implementation:**
- SheetJS current version and license: https://www.npmjs.com/package/xlsx
- TanStack Table current version: https://www.npmjs.com/package/@tanstack/react-table
- TanStack Virtual current version: https://www.npmjs.com/package/@tanstack/react-virtual
- Vercel AI SDK + Anthropic provider compatibility: https://sdk.vercel.ai/docs/providers/anthropic
- Framer Motion React 19 compatibility: https://www.framer.com/motion/
- Clerk local deployment / offline JWT validation: https://clerk.com/docs/deployments/overview

---

*Stack research for: Battery manufacturing and research management platform (Neware Pro)*
*Researched: 2026-03-01*
