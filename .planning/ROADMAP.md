# Roadmap: Neware Pro

## Overview

Neware Pro is built in five dependency-ordered phases. Phase 1 establishes the entire foundation — database schema (with JSONB and FK chain), Clerk auth, Prisma singleton, shared UI shell — because three of the seven critical pitfalls must be addressed here or they require expensive retrofits. Phase 2 delivers the core scientific value: Neware BTS cycle data import and all four mandatory charts (capacity fade, voltage, coulombic efficiency, dQ/dV). Phase 3 adds research experiment tracking, which becomes meaningful only after cycle data exists to link to it. Phase 4 implements the complex manufacturing production module with step-level workflow tracking. Phase 5 closes the traceability loop — linking finished cells from production through cycle tests — which is the platform's headline differentiator and requires all four prior phases to be functional.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Database schema, Clerk auth, Prisma singleton, AI service scaffold, and shared UI shell
- [ ] **Phase 2: Cycle Testing** - Neware BTS import pipeline, all four cycle charts (including dQ/dV), data table, and cycle comparison
- [ ] **Phase 3: Research Experiments** - Experiment CRUD, filter/search, cycle test linking, status tracking, and rich-text notes
- [ ] **Phase 4: Manufacturing Production** - Full production workflow (slurry → electrode → assembly) with step-level sign-offs and two project types
- [ ] **Phase 5: Traceability Closure** - Material tracking, inspection sign-offs, and production-to-cycle-test link that completes the end-to-end traceability chain

## Phase Details

### Phase 1: Foundation
**Goal**: The platform's infrastructure is in place — researchers can sign in, the database schema supports all four pillars without requiring future migrations, and the shared UI shell reflects the premium dark-theme identity
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, PLAT-01, PLAT-02, PLAT-03
**Success Criteria** (what must be TRUE):
  1. A researcher can sign in with email/password via Clerk and remain signed in across browser refreshes without re-authenticating
  2. A researcher can sign out from any page and their session is terminated
  3. The application loads on localhost with no outbound cloud dependencies for data storage or core functionality
  4. Every page renders with the dark-theme Shadcn/ui shell, navigation sidebar, and Framer Motion page transitions matching the premium aesthetic
  5. Data visualization components (Recharts and D3) render correctly within the dark theme without visual artifacts
**Plans**: 5 plans

Plans:
- [ ] 01-01-PLAN.md — Local development environment — Docker Compose for Supabase, environment variables, Next.js 15 project scaffold with TypeScript
- [ ] 01-02-PLAN.md — Database schema — all tables (CycleTest, CycleDatum, Experiment, ProductionProject, SlurryRun, ElectrodeRun, AssemblyRun, User, AIAnalysis) with JSONB metadata columns and FK constraints; Prisma singleton and pooler URL
- [ ] 01-03-PLAN.md — Clerk authentication — sign-in/sign-out flows, session persistence, user sync to DB on first sign-in, requireRole() middleware on all write paths
- [ ] 01-04-PLAN.md — Shared UI shell — dark-theme layout, navigation sidebar (Cycle Tests, Experiments, Manufacturing), Framer Motion page transitions, Shadcn/ui component baseline
- [ ] 01-05-PLAN.md — AI service scaffold — lib/ai.ts abstraction layer with Zod-validated structured output pattern; no live features yet, anti-ad-hoc-call contract established

### Phase 2: Cycle Testing
**Goal**: Researchers can import Neware BTS cycle data and immediately analyze it through all four standard cycle charts — including the specialized dQ/dV differential capacity chart — with a full per-cycle data table and multi-test comparison
**Depends on**: Phase 1
**Requirements**: CYCLE-01, CYCLE-02, CYCLE-03, CYCLE-04, CYCLE-05, CYCLE-06, CYCLE-07, CYCLE-08, CYCLE-09, CYCLE-10
**Success Criteria** (what must be TRUE):
  1. A researcher can upload a Neware BTS Excel or CSV file and see the imported test appear in the cycle test list with correct metadata (date, device, operator, cell ID) within seconds, with row-level errors surfaced for any malformed records
  2. A researcher can open a cycle test and view capacity fade, voltage vs. capacity, and coulombic efficiency charts that render smoothly with real data
  3. A researcher can view the dQ/dV differential capacity chart with numerical differentiation computed server-side, displaying peaks and troughs that correspond to known electrochemical phase transitions
  4. A researcher can select a cycle range, zoom into any chart, and export any chart as a PNG — all without page reload
  5. A researcher can overlay two or more tests on a single comparison chart to evaluate performance differences across cells
  6. A researcher can view the per-cycle data table with sorting, and export it to CSV
**Plans**: TBD

Plans:
- [ ] 02-01: Import pipeline — Papa Parse (CSV streaming) + SheetJS (Excel), Zod column schema validation for Neware BTS format, row-level error reporting, raw file storage in Supabase Storage, flexible column mapper for BTS version variations
- [ ] 02-02: Pre-aggregation and data model — import populates cycle_summaries (one row per cycle: capacity, CE, voltages) not raw measurement points; dQ/dV computed server-side with mathjs and cached; CycleTest and CycleDatum service layer
- [ ] 02-03: Cycle test list and metadata UI — test list page with search/sort, test detail page showing metadata (date, device, operator, cell ID) alongside charts, TanStack Query for client-side data fetching
- [ ] 02-04: Capacity fade, voltage vs. capacity, and coulombic efficiency charts — Recharts implementation with dark-theme styling, cycle range selector, zoom controls, PNG export
- [ ] 02-05: dQ/dV differential capacity chart — D3.js custom SVG implementation with numerical differentiation; smoothing; peak/trough highlighting; cycle selector; PNG export (1-2 day specialized implementation)
- [ ] 02-06: Per-cycle data table and CSV export — TanStack Table v8 with TanStack Virtual for 10k+ row virtualization, sortable columns, CSV export from current view
- [ ] 02-07: Multi-test overlay comparison — chart variant that accepts multiple CycleTest IDs, overlay rendering with color coding per test, cycle range alignment

### Phase 3: Research Experiments
**Goal**: Researchers can document and search experiments with protocol, conditions, materials, and results, and link cycle test data to experiments — turning isolated data files into a searchable scientific record
**Depends on**: Phase 2
**Requirements**: EXPR-01, EXPR-02, EXPR-03, EXPR-04, EXPR-05
**Success Criteria** (what must be TRUE):
  1. A researcher can create an experiment record with protocol, conditions, materials, and results fields and see it in the experiment list immediately
  2. A researcher can filter and search experiments by material, protocol, date, and researcher name — returning accurate results across all persisted experiments
  3. A researcher can link one or more cycle tests to an experiment and navigate from the experiment to those test charts in one click
  4. A researcher can set and update the experiment status (planned / in-progress / completed / abandoned) and the status is reflected in the list view filter
  5. A researcher can add and edit rich-text journal notes on an experiment, with creator and last-modified-by attribution shown on every record
**Plans**: TBD

Plans:
- [ ] 03-01: Experiment data model and service layer — Prisma schema for Experiment, ExperimentCycleTest join table, status enum; service functions with requireRole() enforcement
- [ ] 03-02: Experiment CRUD UI — create/edit form with protocol, conditions (JSONB-backed), materials, results fields; delete with confirmation; status selector
- [ ] 03-03: Experiment list with filter and search — filter by material, protocol, date range, researcher, status; full-text search; creator attribution display
- [ ] 03-04: Cycle test linking — multi-select cycle tests to attach to experiment; linked test thumbnails on experiment detail page; navigate to full chart view
- [ ] 03-05: Rich-text notes / journal — Tiptap or equivalent rich-text editor embedded in experiment detail; notes stored as JSON; timestamps and author per entry

### Phase 4: Manufacturing Production
**Goal**: Lab operators can create production projects, step through the full fabrication workflow (anode slurry, cathode slurry, anode electrode, cathode electrode, assembly), and record all measurements, mixing parameters, coating parameters, and operator sign-offs at each step
**Depends on**: Phase 1
**Requirements**: MFGR-01, MFGR-02, MFGR-03, MFGR-04, MFGR-05
**Success Criteria** (what must be TRUE):
  1. An operator can create a production project of type "full" or "electrode-only" and the correct step sequence is enforced — electrode-only projects do not show assembly or battery test steps
  2. An operator can fill in project-level details (electrode sources, cell dimensions, number of cells, load per electrode, electrolyte, separator, linked protocols) and save them independently of step data
  3. An operator can record the slurry step for anode and cathode: material weights, mixing steps with start/end times, viscosity measurements, grindometer check result, overnight mixing flag, and suitability-for-coating sign-off
  4. An operator can record the electrode step: coating parameters, load measurements for both A and B sides, thickness, viscosity before coating, standard deviation, and visual inspection sign-off
  5. A researcher can view a production project and see the current workflow progress as a step-by-step indicator reflecting the boolean flags (anodeSlurryDone, cathodeSlurryDone, electrodeAnodeDone, electrodeCathodeDone, assemblyDone, cellsDone) with operator name and timestamp per completed flag
**Plans**: TBD

Plans:
- [ ] 04-01: Production project data model — Prisma schema for ProductionProject (type enum, boolean flags, project-level fields), SlurryRun, ElectrodeRun, AssemblyRun (all with JSONB metadata); service layer with requireRole()
- [ ] 04-02: Project creation and project-level details form — type selector (full / electrode-only), electrode source fields (internal/Chinese/inventory for anode + cathode), cell dimensions, number of cells/interfaces, load, electrolyte, separator, linked protocols
- [ ] 04-03: Slurry step forms — anode and cathode slurry data entry: material weights (NMP, PVDF, active material, carbon additives), mixing steps (dynamic add/remove with start/end times), viscosity measurements, grindometer check, overnight flag, sign-off button with operator confirmation
- [ ] 04-04: Electrode step forms — coating parameters (speed, temperature, gap), load measurements per side (A/B) with dynamic rows, thickness, viscosity before coating, standard deviation, visual inspection at each stage with sign-off
- [ ] 04-05: Workflow progress and boolean flag management — WorkflowProgress component showing step status; flag-setting Server Actions that validate prerequisites before marking complete; operator name and timestamp recorded per flag; electrode-only branch logic

### Phase 5: Traceability Closure
**Goal**: Every cell's full history is one click away — from the raw material weights and batch IDs in the slurry step, through electrode coating measurements and assembly, to the finished cycle test data — completing Neware Pro's headline differentiator
**Depends on**: Phase 4
**Requirements**: MFGR-06, MFGR-07, MFGR-08
**Success Criteria** (what must be TRUE):
  1. An operator can record all material inputs for a production project — material names, weights, batch IDs, and sources — and each input is linked to a specific production step (slurry or electrode), not free-text
  2. An operator can record and view suitability sign-offs and visual inspection results at each manufacturing step, with operator identity and timestamp persisted for every sign-off
  3. A researcher can link a completed production project to one or more cycle tests, closing the full chain: materials → batch → slurry → electrode → assembly → cell → cycle test data
  4. A researcher can navigate from any cycle test back to the production project that produced the cell and drill into any step's material inputs, measurements, and sign-offs
**Plans**: TBD

Plans:
- [ ] 05-01: Material tracking data model — MaterialInput table linked to ProductionProject and step (SlurryRun / ElectrodeRun); fields: material name, weight, batch ID, source; service layer for CRUD; validate no orphan batch IDs
- [ ] 05-02: Material input UI — dynamic material input form embedded in slurry and electrode step pages; batch ID field with uniqueness hint; per-input source selector; summary view on project overview
- [ ] 05-03: Visual inspection and sign-off layer — InspectionRecord model or JSONB extension on step tables; sign-off UI component with operator confirmation dialog; read-only inspection history panel per step
- [ ] 05-04: Production-to-cycle-test link — ProductionCycleTest join table; link UI on completed project page (multi-select from available cycle tests); display linked tests on project overview with navigation to test charts
- [ ] 05-05: Traceability drill-down view — given a cycle test, surface the linked production project with one-click navigation to each step's data; given a production project, surface linked cycle tests; full chain readable in one session without manual lookups

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/5 | Not started | - |
| 2. Cycle Testing | 0/7 | Not started | - |
| 3. Research Experiments | 0/5 | Not started | - |
| 4. Manufacturing Production | 0/5 | Not started | - |
| 5. Traceability Closure | 0/5 | Not started | - |
