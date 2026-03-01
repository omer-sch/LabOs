# Project Research Summary

**Project:** Neware Pro — Battery Manufacturing and Research Management Platform
**Domain:** Scientific LIMS (Laboratory Information Management System) for battery R&D
**Researched:** 2026-03-01
**Confidence:** MEDIUM — research tools (WebSearch, WebFetch, Context7) were unavailable; all findings derive from training data (August 2025 cutoff) and PROJECT.md domain knowledge. Core stack/architecture findings are well-grounded; version-specific and competitor-specific details should be verified before pinning dependencies.

---

## Executive Summary

Neware Pro is a unified, four-pillar scientific LIMS for battery R&D labs: cycle test data management, research experiment tracking, manufacturing production traceability, and team collaboration with role-based access. The defining feature is end-to-end traceability — linking raw material batches through slurry preparation, electrode coating, and cell assembly, all the way to cycle test results and AI-assisted anomaly detection. No existing tool (Neware BTS, Arbin MITS Pro, Maccor) provides this integration, which is the platform's genuine differentiator.

The recommended approach follows a validated, dependency-ordered build: establish the database schema and auth infrastructure first (everything else depends on them), then build the cycle testing module (the core scientific value), then experiment tracking and manufacturing traceability, and finally the AI analysis layer. This order is imposed by hard feature dependencies: cycle data must exist before AI can analyze it, all four pillars must be functional before the traceability story is complete, and auth must wrap every write path from day one. The pre-decided stack (Next.js 15, TypeScript, Supabase/PostgreSQL, Prisma, Clerk, Claude API, Recharts/D3, Shadcn/ui) is well-validated for this domain; the primary supplemental additions are SheetJS/Papa Parse for Excel/CSV parsing, TanStack Table/Virtual for data tables, mathjs for dQ/dV computation, and TanStack Query for client-side data fetching.

The three highest-severity risks are: (1) hardcoding measurement schemas without JSONB flexibility, which caused the rewrite of the old system and will do so again; (2) storing raw cycle data as per-measurement-point rows rather than pre-aggregated cycle summaries, which causes query performance collapse at realistic data volumes; and (3) calling Claude API ad-hoc without a centralized service layer, which creates unpredictable costs and fragile output parsing. All three must be addressed in the foundation phase — they cannot be retrofitted cheaply.

---

## Key Findings

### Recommended Stack

The pre-decided stack is well-matched to the domain. Next.js 15 App Router provides Server Components that handle data-heavy dashboard pages without client-side waterfall fetches. Prisma 5.x enforces type safety across a complex multi-module schema (cycle data, slurry, electrode, assembly) and provides a migration history that is essential as manufacturing protocols evolve. Supabase provides PostgreSQL with built-in object storage for raw Neware CSV/Excel files, and runs locally via Docker for the local-first MVP target.

The stack requires several domain-essential additions not in the initial selection: SheetJS for Excel parsing and Papa Parse (streaming mode) for large CSV files; TanStack Table v8 and TanStack Virtual for data tables that handle 1000–10,000+ cycle rows; mathjs for dQ/dV differential capacity computation; and TanStack Query v5 for client-side interactive data fetching. The Vercel AI SDK (alongside the Anthropic SDK) is recommended for streaming AI summary generation. One critical risk: Clerk validates JWTs against Clerk's cloud infrastructure, which fails in air-gapped lab networks — verify outbound HTTPS to `api.clerk.com` is available, or plan a NextAuth.js fallback.

**Core technologies:**
- Next.js 15 (App Router): Full-stack framework — Server Components reduce JS payload for data-heavy dashboards; API routes handle file upload and AI calls
- TypeScript 5.x: Type safety — enforces domain model correctness across cycle data schemas, slurry parameters, and production step records
- Supabase + PostgreSQL 15: Primary database and file storage — time-series cycle data fits relational model; SQL aggregations outperform document stores for this domain; runs locally via Docker
- Prisma 5.x: ORM and migrations — type-safe queries for complex joins (cell → batch → production run → slurry); migration history essential as schema evolves
- Clerk: Auth and RBAC — role-based access (admin/researcher/viewer) without building auth from scratch; works with Next.js middleware
- Claude API (Anthropic SDK): AI layer — anomaly detection via structured outputs, automated run summaries, cross-experiment pattern recognition
- Recharts 2.x + D3.js 7.x: Visualization — Recharts for capacity fade/CE/voltage curves; D3 for dQ/dV differential capacity curves (custom SVG path math required)
- Shadcn/ui + Tailwind CSS: Component system — accessible, dark-theme native, pairs with Framer Motion for premium feel
- SheetJS (xlsx) + Papa Parse: File parsing — SheetJS for .xlsx; Papa Parse streaming mode for large .csv files (Neware exports can exceed 50MB)
- TanStack Table v8 + TanStack Virtual: Data tables — headless, supports sorting/filtering/virtualization for 10k+ row cycle data tables
- TanStack Query v5: Client-side data fetching — caching and invalidation for interactive chart views; required for the cycle chart's cycle-range selector
- mathjs + Zod: Scientific computation and validation — dQ/dV derivative computation; Zod for Neware CSV column schema validation before import

**Verify before pinning:**
- SheetJS CE license status (changed 2023; verify current state)
- Framer Motion 11 + React 19 compatibility (actively evolving surface)
- Vercel AI SDK v4 + Anthropic provider compatibility
- Clerk offline/local behavior for lab network deployments

### Expected Features

The full feature landscape is documented in `.planning/research/FEATURES.md`. The summary below focuses on what matters for phase decisions.

**Must have for v1 (table stakes across all four pillars):**
- CSV/Excel import from Neware BTS — without this, no cycle data enters the system; everything downstream is blocked
- Core cycle charts: capacity fade, voltage vs. capacity, coulombic efficiency, dQ/dV — all four required; PhD researchers will not trust a tool missing any of them
- Per-cycle data table with CSV export — researchers verify charts against raw numbers
- Experiment record CRUD with filter/search by material, protocol, date, researcher
- Link cycle test to experiment — the cross-pillar link that starts delivering research value
- Manufacturing production project (full-cell and electrode-only types) with step-level tracking: operator, timestamps, material weights, measurements, sign-off flags
- Link production project to experiment and cycle data — closes the traceability loop
- Role-based access control (admin/researcher/viewer) with server-side enforcement
- AI anomaly detection on cycle data — the first differentiator that justifies the platform over a spreadsheet

**Should have after validation (v1.x):**
- AI automated test summaries — after users are importing regularly
- Multi-test overlay and comparison view — after single-test charts are stable
- Protocol library for reusable experiment protocols
- dQ/dV smoothing controls for electrochemists
- Visual inspection photo upload for operators

**Defer to v2+:**
- AI cross-dataset pattern recognition — requires 50+ experiments in the system before the AI has meaningful context
- Native .nda/.ndax binary file parsing — maintenance risk from proprietary format changes; validate user demand first
- Cloud hosting and multi-tenancy — local-first validates the core product first
- ELN integration (Benchling, Labarchives) — different product category; builds scope
- Real-time cycler connection — significant hardware integration scope, not a day-to-day workflow need

**Hard anti-features (do not build):**
- Statistical comparison / hypothesis testing built into the UI — bad implementations give false confidence; researchers use R/Python
- Mobile app — web UI on a lab tablet is sufficient; a mobile app is a second codebase
- Generic drag-and-drop report builder — researchers export to Excel regardless; curated excellent charts beat a generic builder

**Critical dependency chain:** CSV/Excel import blocks all cycle data features. Auth blocks all user-facing features in production. The full traceability story requires all four pillars functional — a partial platform cannot demonstrate the headline value proposition.

### Architecture Approach

The architecture follows a layered Next.js 15 App Router pattern: four module-scoped UI sections (cycle testing, experiments, manufacturing, team) render via Server Components or TanStack Query client components; all database access flows through a service layer (`services/`) that calls Prisma exclusively — no direct Prisma calls in component files; Server Actions handle form-based mutations (~80% of writes); Route Handlers handle file upload, AI calls, and streaming responses. Clerk middleware gates all lab routes. Each module (cycle-tests, experiments, production, team) is isolated — modules communicate only through the service layer, never by importing each other's components. The AI service (`lib/ai.ts`) is the exclusive entry point for all Claude API calls, with structured output validation via Zod and async/non-blocking execution patterns.

**Major components:**
1. Cycle Testing Module — import, display, and trigger AI analysis of Neware BTS cycle data; owns CycleTest, CycleDatum, AIAnalysis tables
2. Research Experiments Module — experiment CRUD with protocol/conditions/results; links to CycleTests via many-to-many join table
3. Manufacturing Production Module — step-by-step workflow (slurry → electrode → assembly) with boolean sign-off flags as source of truth; links to CycleTests for finished cell traceability
4. Team Collaboration Module — Clerk identity synced to DB users table; role enforcement in service layer on every mutation; RBAC wraps all other modules
5. Import Service — parses Neware BTS CSV/Excel, validates column schema with Zod, normalizes to canonical schema, runs in server context to avoid blocking UI
6. AI Service — centralized Claude API orchestration, structured output (tool_use) for anomaly detection, streaming via Vercel AI SDK for summaries, async job pattern for all calls
7. Shared UI Shell — dark-theme layout, navigation sidebar, Shadcn/ui components, Framer Motion for page transitions

**Key data model decisions:**
- `CycleDatum` stores one row per cycle (capacity, CE, voltages) — NOT one row per measurement point; dQ/dV is computed server-side from raw charge/voltage pairs, cached, not stored per cycle
- `ProductionProject` uses explicit boolean flags (`anodeSlurryDone`, etc.) for workflow progress — not derived from child record existence, which conflates "record exists" with "operator signed off"
- `SlurryRun`, `ElectrodeRun`, `AssemblyRun` tables include a JSONB `metadata` column for protocol evolution without migrations
- All step records link via enforced foreign keys — no text-field references that break traceability on typos

### Critical Pitfalls

The full pitfall analysis is in `.planning/research/PITFALLS.md`. These seven are the build-order-defining risks:

1. **Rigid measurement schema (no JSONB flexibility)** — add a `metadata JSONB` column to every measurement table from day one; this is the pattern failure that caused the old system's rewrite; cannot be retrofitted cheaply
2. **Per-measurement-point row storage for cycle data** — pre-aggregate at import time; store one row per cycle in `cycle_summaries`; compute dQ/dV server-side and cache; never query raw point data for chart rendering; performance collapses at ~5 tests with realistic data volumes
3. **AI integration sprawl without a service layer** — build `lib/ai.ts` as the sole Claude API entry point before the first AI feature; use Zod-validated structured outputs (tool_use); never await Claude in a render path; cache AI results after generation
4. **Traceability chain gaps** — enforce the full FK chain (material → slurry → electrode → assembly → cell → test) at the database level from day one; the UI must prevent skipping steps; text-field batch references break under the first typo
5. **CSV import data integrity failures** — implement Parse → Validate → Transform → Store pipeline; surface row-level validation errors (not generic "import failed"); store raw file in Supabase Storage for re-import; version the parser
6. **Prisma connection pool exhaustion** — implement the singleton pattern for PrismaClient and use Supabase's PgBouncer connection pooler URL for all queries; direct connection only for migrations; must be set up before any database queries are written
7. **Client-side-only RBAC** — implement `requireRole()` in every Route Handler and Server Action; enable Supabase RLS as a secondary layer; the system's users are PhD engineers who can call APIs directly

---

## Implications for Roadmap

Research across all four files points to a clear 6-phase build order driven by hard technical dependencies, not arbitrary grouping. The architecture file explicitly documents the same order derived independently from component dependencies.

### Phase 1: Foundation — Schema, Auth, and Infrastructure

**Rationale:** Every subsequent module depends on the database schema, Prisma setup, Clerk auth integration, and the shared UI shell. Three of the seven critical pitfalls (JSONB schema design, Prisma singleton, traceability FK chain) must be addressed here or they require expensive retrofits. The AI service scaffold (empty `lib/ai.ts` with the abstraction pattern) belongs here even though AI features ship later — this prevents the ad-hoc API call anti-pattern from taking root.

**Delivers:** Working local Supabase + Prisma setup; complete schema with all tables, JSONB columns, and FK constraints; Clerk auth with role sync to DB; `requireRole()` middleware on all write paths; dark-theme shell with navigation; Prisma singleton; `lib/ai.ts` scaffold; Docker Compose for local development.

**Addresses:** Auth and RBAC (table stakes), user management groundwork, all four-pillar data model requirements.

**Avoids:** Rigid measurement schema (Pitfall 1), traceability FK gaps (Pitfall 4), Prisma connection pool exhaustion (Pitfall 6), client-only RBAC (Pitfall 7).

**Research flag:** Standard well-documented patterns. No phase-level research needed. Verify Clerk + Next.js 15 async `auth()` pattern before implementation.

### Phase 2: Cycle Testing Module and Data Import

**Rationale:** This is the core scientific value of the platform and the dependency root for all AI features. Researchers can use the platform immediately after this phase. The import pipeline (with full validation) is the highest-risk implementation in the entire project — Neware CSV format quirks, large file handling, and the pre-aggregation decision all live here. Getting it right now prevents re-importing all historical data later.

**Delivers:** Neware BTS CSV/Excel import with Papa Parse / SheetJS; Zod column schema validation; row-level error reporting; raw file storage in Supabase Storage; pre-aggregated `cycle_summaries` table populated at import time; dQ/dV computation with mathjs and server-side caching; capacity fade chart, voltage vs. capacity chart, coulombic efficiency chart, dQ/dV chart (all four); TanStack Table with TanStack Virtual for cycle data table; CSV export from data table; cycle range selection / zoom.

**Addresses:** CSV/Excel import, all four core cycle charts, per-cycle data table with export, cycle range selection (all P1 table stakes).

**Avoids:** Per-point row storage performance trap (Pitfall 2), import data integrity failures (Pitfall 5), dQ/dV on-demand recomputation performance trap.

**Uses:** Papa Parse + SheetJS, TanStack Table v8 + TanStack Virtual, mathjs, Recharts + D3, react-dropzone, Zod, Supabase Storage.

**Research flag:** Likely needs phase-level research. Neware BTS column format variations across BTS versions, flexible column mapper design, and the LTTB downsampling algorithm for Recharts rendering are niche enough to warrant verification before implementation.

### Phase 3: Research Experiments Module

**Rationale:** Depends on CycleTest records from Phase 2 to be meaningful (experiments link to cycle tests). Independent from manufacturing — researchers can document experiments before manufacturing tracking exists. Relatively low complexity; mostly standard CRUD with filtering and many-to-many linking.

**Delivers:** Experiment record creation with protocol, conditions, materials, and results fields; filter and search by material, protocol, date, researcher, status; link cycle tests to experiments (many-to-many); experiment status tracking (active/completed/archived); notes/journal field; creator and modifier attribution display.

**Addresses:** Experiment record CRUD, filter/search, link cycle test to experiment, creator attribution (all P1 table stakes).

**Research flag:** Standard CRUD and filtering patterns. No phase-level research needed. Validate with users whether the `conditions` and `materials` fields as JSONB vs. structured form fields meets their actual workflow.

### Phase 4: Manufacturing Production Module

**Rationale:** The most complex module — five sub-steps (anode slurry, cathode slurry, anode electrode, cathode electrode, assembly), two project types (full-cell vs. electrode-only), and the workflow sign-off flag logic. Depends on Phase 2 CycleTests for the final cell-to-test linkage but can be built independently otherwise. The FK-enforced traceability chain was scaffolded in Phase 1 schema; this phase implements the UI and service layer on top of it.

**Delivers:** Production project creation with type selector (full-cell vs. electrode-only); SlurryRun tracking with mixing steps, material weights, viscosity measurements, grindometer check, suitability sign-off; ElectrodeRun tracking with coating parameters, load measurements (both sides), thickness, approval sign-off; AssemblyRun with cell configuration and electrode sourcing; WorkflowProgress component showing boolean flag state; link production project to cycle tests for finished cell testing.

**Addresses:** Step-by-step workflow with completion flags, operator assignment, timestamp recording, material input tracking, measurement recording, visual inspection sign-off, two project types, link production to cycle test (all P1 table stakes).

**Avoids:** Workflow progress derived from record counts instead of flags (Pitfall 4 anti-pattern). Every step completion validates prerequisites before setting the flag.

**Research flag:** Likely needs phase-level research. The manufacturing workflow is domain-specific and complex — step-level form design, the boolean flag progression logic, and the electrode sourcing model (internal/Chinese/inventory) may have evolved from PROJECT.md. Validate the full workflow with a domain expert before building forms.

### Phase 5: AI Analysis Layer

**Rationale:** Requires CycleTest data to exist and be importable (Phase 2). The AI service scaffold exists from Phase 1. This phase wires it to real features. AI calls must be async and non-blocking — the async job pattern (trigger → poll → display) is the main architectural challenge here. Anomaly detection is the P1 AI feature (justifies the platform over a spreadsheet); summaries are P2 (add when users are importing regularly).

**Delivers:** AI anomaly detection on individual CycleTest — aggregated cycle statistics sent to Claude via `tool_use` structured output; anomaly results stored in AIAnalysis table; anomaly markers overlaid on capacity fade chart; AI automated test summary generation with streaming output via Vercel AI SDK; async job status display ("queued → running → complete"); regenerate button for stale AI results; model version stored in AIAnalysis for reproducibility.

**Addresses:** AI anomaly detection (P1), AI automated test summaries (P2), async status UX.

**Avoids:** AI integration sprawl (Pitfall 3) — all calls flow through `lib/ai.ts`; Claude never called synchronously in a render path; token budgets enforced by sending cycle-level summaries not raw point data.

**Research flag:** Needs phase-level research. Prompt engineering for battery-domain anomaly detection, structured output schema design for anomaly types (capacity drop, voltage plateau, CE anomaly), and token budget optimization for cycle data context are specialized enough to warrant verification against current Claude API documentation and capabilities before implementation.

### Phase 6: Team Collaboration Module

**Rationale:** Role display (created_by/updated_by) is visible in all earlier phases as a user ID without a full Team module — this is acceptable placeholder UX. The full admin UI for managing users and roles is independent of all researcher workflows and can ship last without blocking anyone. Server-side role enforcement was already implemented in Phase 1 via `requireRole()`.

**Delivers:** User management UI (admin only) — invite, deactivate, role assignment; user list with role and activity display; audit trail display (created_by, updated_by, timestamps) on all records; viewer read-only enforcement verification (all write Route Handlers return 403 for viewer tokens); Clerk user sync on first sign-in.

**Addresses:** User management, role assignment UI, audit trail display, viewer read-only (all P1 table stakes that require a UI layer beyond Phase 1 server-side enforcement).

**Research flag:** Standard patterns. No phase-level research needed. Verify Clerk webhook vs. first-request sync approach for user provisioning.

### Phase Ordering Rationale

- **Foundation before everything:** Three of the seven critical pitfalls (JSONB schema, FK chain, Prisma singleton) must be correct from the first line of database code — they cannot be added incrementally
- **Cycle testing before experiments and manufacturing:** CycleTest records are the linking entity that makes both other modules meaningful; building experiments first produces a module with nothing to link to
- **Manufacturing after experiments:** Manufacturing is more complex; researchers get immediate value from experiments + cycle testing while manufacturing is being built
- **AI last:** AI analysis is additive and addictive — researchers will want it immediately, but it can only run on data that already exists; shipping it too early leads to testing AI on synthetic data which gives false confidence in prompt quality
- **Team module last:** Auth enforcement ships in Phase 1; the user management UI is a convenience for admins and does not block any researcher workflow

### Research Flags

**Phases needing deeper research during planning:**

- **Phase 2 (Cycle Data Import):** Neware BTS CSV format variations across software versions (5.x vs 7.x column naming), flexible column mapper UX design, LTTB downsampling algorithm implementation, and Papa Parse streaming in a Next.js server context are niche enough to benefit from dedicated phase research before implementation.
- **Phase 4 (Manufacturing Module):** The step-level form design and workflow flag logic are domain-specific. Validate the complete manufacturing workflow with a domain expert before building. The electrode sourcing model and assembly parameters may require clarification beyond what PROJECT.md specifies.
- **Phase 5 (AI Layer):** Battery-domain prompt engineering, structured output schema for anomaly types, token budget strategy for cycle data context injection, and current Claude API structured output capabilities should be researched and prototyped before committing to an implementation approach.

**Phases with standard well-documented patterns (skip research-phase):**

- **Phase 1 (Foundation):** Next.js 15 + Clerk + Prisma + Supabase setup follows well-documented official guides; Prisma singleton is a documented pattern.
- **Phase 3 (Experiments):** Standard CRUD with filtering and many-to-many linking; Prisma relation patterns are well-documented.
- **Phase 6 (Team):** Clerk user management and webhook patterns are documented; RBAC server enforcement was already designed in Phase 1.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Core framework choices (Next.js, Prisma, Supabase, Clerk) are HIGH; supplemental libraries (SheetJS license, Framer Motion + React 19, Vercel AI SDK + Anthropic provider) are MEDIUM-LOW; all need version verification before pinning |
| Features | MEDIUM-HIGH | Table stakes grounded in PROJECT.md (2 years domain knowledge) = HIGH; competitor feature analysis is MEDIUM (training data, not verified against current product docs); anti-feature rationale is HIGH |
| Architecture | MEDIUM | Module structure, service layer pattern, and data model are well-grounded in Next.js 15 conventions and PROJECT.md requirements; specific API signatures (Clerk `await auth()`, Prisma `createMany`) should be verified against current docs |
| Pitfalls | MEDIUM | JSONB + GIN index pattern and LIMS rewrite anti-patterns are HIGH confidence (well-documented community patterns); Neware BTS format-specific quirks are MEDIUM (training data); specific version behaviors are LOW |

**Overall confidence: MEDIUM**

The research is sufficient to begin roadmap creation and Phase 1 implementation. Phase 2 and Phase 5 should have dedicated phase-level research before starting implementation.

### Gaps to Address

- **Neware BTS CSV format specifics:** Column naming conventions across BTS 5.x vs. 7.x vs. 9.x are not fully characterized from training data. Build a flexible column mapper UI (as recommended in STACK.md) and test with real lab exports before finalizing the import schema.
- **Clerk offline behavior:** Whether Clerk JWT validation works on a lab network with outbound HTTPS to `api.clerk.com` but no general internet access needs explicit verification during Phase 1 deployment setup. Prepare NextAuth.js v5 as a fallback.
- **SheetJS CE license:** Verify current license status before using in any context with commercial implications. PA Parse is an unambiguous alternative for pure CSV workflows.
- **Framer Motion + React 19:** Verify compatibility before relying on animation features. If incompatible, the dark-theme premium feel still works without animations — defer Framer Motion integration until confirmed stable.
- **AI prompt quality:** Battery-domain anomaly detection prompts require domain-specific tuning. Plan a prompt engineering spike during Phase 5 research before committing to a production implementation.
- **Competitor feature parity:** WebSearch was unavailable; competitor analysis in FEATURES.md is based on training data. Verify current Neware BTS 9.0 feature set before finalizing differentiator claims.

---

## Sources

### Primary (HIGH confidence)
- `PROJECT.md` — 2 years of encoded domain knowledge; primary source for all feature requirements and data model decisions
- Battery electrochemistry domain knowledge (training data) — dQ/dV, coulombic efficiency, capacity fade, C-rate, PVDF, NMP, grindometer — domain-specific terms and their computational requirements

### Secondary (MEDIUM confidence)
- Training data (August 2025 cutoff) — Next.js 15 App Router patterns, Prisma 5.x ORM patterns, Clerk + Next.js middleware integration, Supabase + Prisma connection pooler setup, TanStack Table v8, Papa Parse streaming, mathjs, Vercel AI SDK v4
- Training data — LIMS domain patterns from LabWare, Benchling, STARLIMS; LIMS rewrite post-mortems; scientific software engineering community patterns
- Training data — Neware BTS, Arbin MITS Pro, Maccor software feature analysis (competitor landscape)

### Tertiary (LOW confidence — verify before using)
- Framer Motion 11 + React 19 compatibility status (actively evolving)
- SheetJS CE license current state (changed 2023; verify current npm package)
- Vercel AI SDK v4 + Anthropic provider exact compatibility
- Clerk offline/local JWT validation behavior
- Neware BTS 9.0 specific column naming conventions
- TimescaleDB scaling path (not relevant for MVP; flag for 1000+ user scale)

**Verification recommended before implementation:**
- https://www.npmjs.com/package/xlsx (license and version)
- https://sdk.vercel.ai/docs/providers/anthropic (AI SDK + Anthropic compatibility)
- https://www.framer.com/motion/ (React 19 compatibility)
- https://clerk.com/docs/deployments/overview (offline/local behavior)
- https://nextjs.org/docs/app (App Router patterns, Server Actions)
- https://www.prisma.io/docs (createMany, singleton pattern, Supabase pooler setup)

---
*Research completed: 2026-03-01*
*Ready for roadmap: yes*
