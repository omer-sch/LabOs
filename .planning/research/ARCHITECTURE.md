# Architecture Research

**Domain:** Battery Manufacturing and Research Management Platform (Neware Pro)
**Researched:** 2026-03-01
**Confidence:** MEDIUM — Web search unavailable; based on project context (PROJECT.md) and established Next.js 15 / Prisma / Supabase patterns from training data. Patterns flagged where verification is recommended.

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser (Client Layer)                       │
│                                                                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐  │
│  │   Cycle      │ │  Research    │ │Manufacturing │ │   Team     │  │
│  │   Testing    │ │  Experiments │ │  Production  │ │Collaboration│  │
│  │   Module     │ │  Module      │ │  Module      │ │  Module    │  │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └─────┬──────┘  │
│         │                │                │               │          │
│         └────────────────┴────────────────┴───────────────┘          │
│                                   │                                   │
│                     ┌─────────────▼──────────────┐                   │
│                     │     Shared UI Shell          │                   │
│                     │  (Nav, Layout, Dark Theme)   │                   │
│                     └─────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
                                   │ HTTP / Server Actions
┌─────────────────────────────────────────────────────────────────────┐
│                    Next.js 15 App Router (Server Layer)              │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                     Route Handlers / Server Actions           │    │
│  │   /api/cycle-tests  /api/experiments  /api/production        │    │
│  │   /api/team         /api/ai           /api/import            │    │
│  └──────────────────────────────┬───────────────────────────────┘    │
│                                 │                                     │
│  ┌──────────────────────────────▼───────────────────────────────┐    │
│  │                       Service Layer                           │    │
│  │  CycleTestService  ExperimentService  ProductionService       │    │
│  │  TeamService       AIService          ImportService           │    │
│  └──────────────────────────────┬───────────────────────────────┘    │
│                                 │                                     │
│  ┌──────────────────────────────▼───────────────────────────────┐    │
│  │                    Prisma ORM (Data Access Layer)             │    │
│  └──────────────────────────────┬───────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                   │
┌─────────────────────────────────────────────────────────────────────┐
│                         Data / External Layer                        │
│                                                                       │
│  ┌────────────────┐  ┌──────────────────┐  ┌──────────────────────┐ │
│  │  Supabase      │  │  Clerk           │  │  Claude API          │ │
│  │  PostgreSQL    │  │  (Auth)          │  │  (AI Analysis)       │ │
│  │  (Primary DB)  │  │                  │  │                      │ │
│  └────────────────┘  └──────────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| Cycle Testing Module | Import, display, and trigger AI analysis of BTS cycle data | ImportService, AIService, CycleTest DB tables |
| Research Experiments Module | Track scientific experiments, link to cycle tests and protocols | ExperimentService, CycleTestService, Production Module (read only) |
| Manufacturing Production Module | Manage full-cell and electrode-only production workflows with step-level tracking | ProductionService, Research Module (protocol links), CycleTest Module (test linkage) |
| Team Collaboration Module | RBAC, user management, audit trail (created_by, updated_by) | Clerk (identity), TeamService, all other modules (auth middleware) |
| Shared UI Shell | Dark-theme layout, navigation sidebar, global toast/alert state | All modules |
| Import Service | Parse Excel/CSV Neware BTS exports, normalize to canonical schema | CycleTestService, file storage |
| AI Service | Claude API calls for anomaly detection, summaries, cross-dataset patterns | CycleTestService, ExperimentService |
| Service Layer | Business logic, validation, transaction coordination | Prisma ORM |
| Prisma ORM | Type-safe queries, schema migrations, relation management | Supabase PostgreSQL |
| Clerk | Authentication, session management, user identity propagation | All server components via `auth()` |

---

## Recommended Project Structure

```
src/
├── app/                              # Next.js 15 App Router
│   ├── (auth)/                       # Clerk-protected route group
│   │   ├── layout.tsx                # Auth shell (sidebar, nav)
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── cycle-tests/              # Cycle Testing Module
│   │   │   ├── page.tsx              # Test list / import entry
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx          # Test detail + charts
│   │   │   │   └── analysis/
│   │   │   │       └── page.tsx      # AI analysis results
│   │   │   └── import/
│   │   │       └── page.tsx          # Upload + preview
│   │   ├── experiments/              # Research Experiments Module
│   │   │   ├── page.tsx              # Experiment browser/filter
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── production/               # Manufacturing Module
│   │   │   ├── page.tsx              # Project list
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # Project type selector (full / electrode-only)
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Project overview + workflow progress
│   │   │       ├── slurry/
│   │   │       │   └── page.tsx      # Slurry step tracking
│   │   │       ├── electrode/
│   │   │       │   └── page.tsx      # Electrode coating step
│   │   │       └── assembly/
│   │   │           └── page.tsx      # Assembly step (full projects only)
│   │   └── team/                     # Team Collaboration Module
│   │       ├── page.tsx              # User list
│   │       └── [userId]/
│   │           └── page.tsx
│   ├── api/                          # Route Handlers (REST endpoints)
│   │   ├── cycle-tests/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── [id]/analyze/route.ts # Trigger AI analysis
│   │   ├── experiments/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── production/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── import/
│   │   │   └── route.ts              # File upload + parse endpoint
│   │   └── team/
│   │       └── route.ts
│   ├── layout.tsx                    # Root layout
│   └── globals.css
│
├── components/
│   ├── ui/                           # Shadcn/ui base components
│   ├── charts/                       # Recharts wrappers: CapacityFade, VoltageProfile, dQdV, CE
│   ├── cycle-tests/                  # Module-specific components
│   ├── experiments/
│   ├── production/
│   │   ├── WorkflowProgress.tsx      # Boolean step flags visualization
│   │   ├── SlurryForm.tsx
│   │   ├── ElectrodeForm.tsx
│   │   └── AssemblyForm.tsx
│   └── shared/
│       ├── AuditBadge.tsx            # created_by / updated_by display
│       └── RoleGuard.tsx             # Client-side role enforcement
│
├── lib/
│   ├── db.ts                         # Prisma client singleton
│   ├── auth.ts                       # Clerk auth helpers (currentUser, requireRole)
│   ├── ai.ts                         # Claude API client wrapper
│   └── utils.ts                      # Shared utilities (cn, formatters)
│
├── services/                         # Business logic (server-only)
│   ├── cycle-test.service.ts
│   ├── experiment.service.ts
│   ├── production.service.ts
│   ├── team.service.ts
│   ├── import.service.ts             # Excel/CSV parsing logic
│   └── ai.service.ts                 # Claude API orchestration
│
├── types/
│   ├── cycle-test.ts
│   ├── experiment.ts
│   ├── production.ts
│   └── team.ts
│
└── prisma/
    ├── schema.prisma
    └── migrations/
```

### Structure Rationale

- **`app/(auth)/`**: Route group keeps Clerk middleware centralized; all lab routes require login without repeating middleware logic.
- **`services/`**: Server-only business logic separated from route handlers; enables testing and reuse across Server Actions and API routes without duplicating logic.
- **`components/charts/`**: Recharts chart wrappers isolated here so chart logic doesn't bleed into module-specific pages; makes AI visualization additions (e.g., anomaly overlays) non-breaking changes.
- **`production/` route depth**: Each workflow step gets its own route (`/slurry`, `/electrode`, `/assembly`) so users can deep-link to their current step and browser history works naturally.
- **Module isolation**: Each module (`cycle-tests`, `experiments`, `production`, `team`) owns its components, routes, and service — modules communicate only through the service layer, not by importing each other's components.

---

## Core Data Model

### Entity Relationship Overview

```
Team / Organization
  └── User (Clerk-managed identity + role stored in DB)
        │
        ├── CycleTest (battery cycle data import)
        │     ├── CycleDatum (one row per cycle: capacity, CE, voltage, etc.)
        │     └── AIAnalysis (Claude results: anomalies, summary, patterns)
        │
        ├── Experiment (research experiment)
        │     ├── linked to → CycleTest[] (many-to-many)
        │     └── linked to → ProductionProject[] (optional, read-only reference)
        │
        └── ProductionProject (manufacturing run)
              ├── type: "full" | "electrode-only"
              ├── SlurryRun (anode + cathode slurry)
              │     └── MixingStep[]
              ├── ElectrodeRun (anode + cathode coating)
              │     └── LoadMeasurement[] (side A + B per electrode)
              ├── AssemblyRun (cells + interfaces — full projects only)
              └── linked to → CycleTest[] (test data on finished cells)
```

### Key Schema (Prisma)

```prisma
// ============================================================
// USERS & AUTH (Clerk owns identity; we store role + metadata)
// ============================================================
model User {
  id        String   @id                    // Clerk user ID
  email     String   @unique
  name      String
  role      Role     @default(RESEARCHER)
  createdAt DateTime @default(now())

  cycleTests         CycleTest[]
  experiments        Experiment[]
  productionProjects ProductionProject[]

  @@map("users")
}

enum Role {
  ADMIN
  RESEARCHER
  VIEWER
}

// ============================================================
// CYCLE TESTING MODULE
// ============================================================
model CycleTest {
  id          String   @id @default(cuid())
  name        String
  description String?
  cellId      String?                       // Optional: links to a produced cell
  importedAt  DateTime @default(now())
  createdById String
  updatedById String?

  createdBy   User     @relation(fields: [createdById], references: [id])
  cycles      CycleDatum[]
  aiAnalysis  AIAnalysis?
  experiments ExperimentCycleTest[]

  @@map("cycle_tests")
}

model CycleDatum {
  id               String    @id @default(cuid())
  cycleTestId      String
  cycleNumber      Int
  capacity         Float?    // mAh/g
  coulombicEfficiency Float?  // %
  chargeVoltage    Float?    // V
  dischargeVoltage Float?    // V
  energy           Float?    // Wh/kg
  cRate            Float?    // C
  temperature      Float?    // °C
  recordedAt       DateTime?

  cycleTest CycleTest @relation(fields: [cycleTestId], references: [id], onDelete: Cascade)

  @@index([cycleTestId, cycleNumber])
  @@map("cycle_data")
}

// dQ/dV is derived on read (computed from V/Q differentials), not stored,
// to avoid schema explosion. Compute server-side, cache in Redis if needed.

model AIAnalysis {
  id          String   @id @default(cuid())
  cycleTestId String   @unique
  anomalies   Json     // [{cycle: N, type: "capacity_drop", confidence: 0.9, ...}]
  summary     String   // Prose summary generated by Claude
  patterns    Json?    // Cross-dataset pattern findings
  generatedAt DateTime @default(now())
  modelVersion String  // Track which Claude model version was used

  cycleTest CycleTest @relation(fields: [cycleTestId], references: [id], onDelete: Cascade)

  @@map("ai_analyses")
}

// ============================================================
// RESEARCH EXPERIMENTS MODULE
// ============================================================
model Experiment {
  id          String   @id @default(cuid())
  title       String
  protocol    String   // Markdown or structured text
  conditions  Json     // {temperature, cRate, electrolyte, ...}
  materials   Json     // {activeMaterial, binder, solvent, ...}
  results     String?  // Researcher notes / findings
  status      ExperimentStatus @default(ACTIVE)
  createdById String
  updatedById String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  createdBy     User                  @relation(fields: [createdById], references: [id])
  cycleTests    ExperimentCycleTest[]

  @@map("experiments")
}

enum ExperimentStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
}

// Join table for Experiment <-> CycleTest many-to-many
model ExperimentCycleTest {
  experimentId  String
  cycleTestId   String
  linkedAt      DateTime @default(now())

  experiment Experiment @relation(fields: [experimentId], references: [id])
  cycleTest  CycleTest  @relation(fields: [cycleTestId], references: [id])

  @@id([experimentId, cycleTestId])
  @@map("experiment_cycle_tests")
}

// ============================================================
// MANUFACTURING / PRODUCTION MODULE
// ============================================================
model ProductionProject {
  id          String      @id @default(cuid())
  name        String
  type        ProjectType
  description String?
  createdById String
  updatedById String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Workflow boolean flags (source of truth for progress)
  anodeSlurryDone    Boolean @default(false)
  cathodeSlurryDone  Boolean @default(false)
  electrodeAnodeDone Boolean @default(false)
  electrodeCathodeDone Boolean @default(false)
  assemblyDone       Boolean @default(false)
  cellsDone          Boolean @default(false)

  // Cell configuration (for full projects)
  numberOfCells     Int?
  numberOfInterfaces Int?
  cellDimensions    Json?   // {width, height, thickness — mm}

  createdBy   User          @relation(fields: [createdById], references: [id])
  slurryRuns  SlurryRun[]
  electrodeRuns ElectrodeRun[]
  assemblyRun AssemblyRun?

  @@map("production_projects")
}

enum ProjectType {
  FULL
  ELECTRODE_ONLY
}

model SlurryRun {
  id                  String   @id @default(cuid())
  productionProjectId String
  electrodeType       ElectrodeType  // ANODE | CATHODE
  operatorId          String
  startedAt           DateTime
  completedAt         DateTime?

  // Material weights (grams)
  nmpWeight           Float?
  pvdfWeight          Float?
  activeMaterialWeight Float?
  carbonAdditiveWeight Float?

  // QC
  viscosityMeasurements Json?   // [{time, value_cP}]
  grindometerCheck      Float?  // μm
  overnightMixing       Boolean @default(false)
  suitableForCoating    Boolean?
  visualInspectionNotes String?

  mixingSteps MixingStep[]
  productionProject ProductionProject @relation(fields: [productionProjectId], references: [id])

  @@map("slurry_runs")
}

model MixingStep {
  id          String    @id @default(cuid())
  slurryRunId String
  stepNumber  Int
  description String
  startedAt   DateTime
  endedAt     DateTime?
  notes       String?

  slurryRun SlurryRun @relation(fields: [slurryRunId], references: [id])

  @@map("mixing_steps")
}

model ElectrodeRun {
  id                  String   @id @default(cuid())
  productionProjectId String
  electrodeType       ElectrodeType
  operatorId          String
  startedAt           DateTime
  completedAt         DateTime?

  // Coating parameters
  coatingSpeed        Float?   // mm/s
  coatingTemperature  Float?   // °C
  coatingGap          Float?   // μm

  // Pre-coating
  viscosityBeforeCoating Float? // cP

  // Load measurements (mg/cm²)
  loadSideA           Float?
  loadSideB           Float?
  loadStdDev          Float?
  thickness           Float?   // μm

  // QC
  visualInspectionNotes String?
  approvedForAssembly   Boolean?

  productionProject ProductionProject @relation(fields: [productionProjectId], references: [id])

  @@map("electrode_runs")
}

enum ElectrodeType {
  ANODE
  CATHODE
}

model AssemblyRun {
  id                  String   @id @default(cuid())
  productionProjectId String   @unique
  operatorId          String
  startedAt           DateTime
  completedAt         DateTime?

  // Electrode sourcing
  anodeSource         ElectrodeSource
  cathodeSource       ElectrodeSource
  anodeLoadMgCm2      Float?
  cathodeLoadMgCm2    Float?
  electrolyteAmountMl Float?
  separator           String?

  // Linked protocols
  anodeProtocolRef    String?
  cathodeProtocolRef  String?

  visualInspectionNotes String?
  notes               String?

  productionProject ProductionProject @relation(fields: [productionProjectId], references: [id])

  @@map("assembly_runs")
}

enum ElectrodeSource {
  INTERNAL
  CHINESE
  INVENTORY
}
```

---

## Architectural Patterns

### Pattern 1: Server Actions for Mutations, Route Handlers for AI/Import

**What:** Use Next.js 15 Server Actions (inline `"use server"` functions) for form-based mutations (create experiment, update step flags, save slurry measurements). Use Route Handlers (`app/api/`) for operations that need streaming responses or long-running work (file upload parsing, Claude API calls).

**When to use:** Server Actions handle ~80% of write operations. Route Handlers handle file upload (`/api/import`) and AI triggers (`/api/cycle-tests/[id]/analyze`) where streaming or async job patterns are needed.

**Trade-offs:** Server Actions have simpler mental model and automatic CSRF protection. Route Handlers give more control over response streaming. Mixing both is idiomatic Next.js 15.

**Example:**
```typescript
// Server Action — simple mutation (services/experiment.service.ts called from action)
"use server"
export async function createExperiment(data: CreateExperimentInput) {
  const { userId } = auth()
  if (!userId) throw new Error("Unauthorized")
  return prisma.experiment.create({
    data: { ...data, createdById: userId }
  })
}

// Route Handler — file upload + parse (app/api/import/route.ts)
export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get("file") as File
  const parsed = await ImportService.parseNewareCsv(file)
  return Response.json({ preview: parsed.slice(0, 10), total: parsed.length })
}
```

### Pattern 2: Module-Scoped Service Layer (Server-Only)

**What:** Each module has a dedicated service file (`lib/services/cycle-test.service.ts`) that contains all Prisma queries and business logic for that domain. Route Handlers and Server Actions import from services, never call Prisma directly in component files.

**When to use:** Always. This is the line between "framework" code and "business" code.

**Trade-offs:** Adds one indirection layer but makes business logic testable, reusable, and movable. No downside at this scale.

**Example:**
```typescript
// services/cycle-test.service.ts
export async function getCycleTestWithCycles(id: string, userId: string) {
  const test = await prisma.cycleTest.findUnique({
    where: { id },
    include: { cycles: { orderBy: { cycleNumber: "asc" } }, aiAnalysis: true }
  })
  if (!test) throw new NotFoundError("CycleTest", id)
  return test
}
```

### Pattern 3: Workflow Step Flags as Source of Truth

**What:** Production project workflow progress is tracked via boolean flags on the `ProductionProject` model (`anodeSlurryDone`, `cathodeSlurryDone`, etc.) rather than derived from child record existence. UI reads flags; completing a step form sets the flag.

**When to use:** This domain pattern — explicitly from PROJECT.md. Avoids complex JOIN-based progress derivation; flags are intentional sign-offs by operators, not just "records exist."

**Trade-offs:** Flags can drift from actual data (a flag true with no slurry record). Prevent with DB-level constraint (check if related record exists before allowing flag update) in the service layer.

**Example:**
```typescript
// services/production.service.ts
export async function completeSlurryStep(projectId: string, electrodeType: ElectrodeType) {
  // Verify slurry record exists before setting flag
  const slurry = await prisma.slurryRun.findFirst({
    where: { productionProjectId: projectId, electrodeType }
  })
  if (!slurry) throw new Error("Cannot complete: no slurry record exists")
  if (!slurry.suitableForCoating) throw new Error("Slurry not signed off for coating")

  const flagKey = electrodeType === "ANODE" ? "anodeSlurryDone" : "cathodeSlurryDone"
  return prisma.productionProject.update({
    where: { id: projectId },
    data: { [flagKey]: true }
  })
}
```

### Pattern 4: Role Enforcement in Service Layer (not just UI)

**What:** `VIEWER` role enforcement is applied in the service layer (server-side), not only in the React UI. Clerk provides the user's role via JWT custom claims synced to the DB `User.role` field.

**When to use:** Always for write operations. Read operations can also be gated here. Never trust client-sent role values.

**Example:**
```typescript
// lib/auth.ts
export async function requireRole(minimumRole: Role) {
  const { userId } = auth()
  if (!userId) throw new UnauthorizedError()
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!hasRole(user.role, minimumRole)) throw new ForbiddenError()
  return user
}
```

---

## Data Flow

### Cycle Data Import Flow

```
Researcher uploads Excel/CSV file
    │
    ▼
POST /api/import
    │
    ▼
ImportService.parseNewareCsv(file)
    │  ← Parse headers, normalize column names to canonical fields
    │  ← Validate: cycle numbers sequential, required columns present
    │  ← Return preview rows + parsed metadata
    ▼
Client shows preview (10 rows, column mapping UI)
    │
Researcher confirms import
    ▼
Server Action: createCycleTestWithData(metadata, cycles[])
    │
    ▼
Prisma transaction:
  CycleTest.create({ name, description, ... })
  CycleDatum.createMany({ data: cycles[] })    ← bulk insert
    │
    ▼
Redirect to /cycle-tests/[id]
    │
    ▼ (optional, researcher-triggered)
POST /api/cycle-tests/[id]/analyze
    │
    ▼
AIService.analyzeTest(cycleTestId)
    │  ← Fetch CycleTest + CycleDatum[] from DB
    │  ← Build prompt with cycle statistics
    │  ← Call Claude API (anomaly detection)
    │  ← Parse structured JSON response
    ▼
Prisma: AIAnalysis.upsert({ cycleTestId, anomalies, summary })
    │
    ▼
Client revalidates → Shows anomaly overlays on charts
```

### Manufacturing Traceability Flow

```
ProductionProject (full type)
    │
    ├── SlurryRun (anode) → MixingStep[] → suitableForCoating sign-off
    ├── SlurryRun (cathode) → MixingStep[] → suitableForCoating sign-off
    ├── ElectrodeRun (anode) → load measurements → approvedForAssembly sign-off
    ├── ElectrodeRun (cathode) → load measurements → approvedForAssembly sign-off
    └── AssemblyRun → cell configuration → links to finished cells
          │
          └── CycleTest[] (test data on completed cells)
                │
                └── CycleDatum[] + AIAnalysis

Traceability query: "Which slurry batch produced this anomalous cell?"
  CycleDatum (anomaly at cycle N)
    → CycleTest
      → AssemblyRun (via productionProjectId + cell linkage)
        → ElectrodeRun (coating parameters)
          → SlurryRun (material weights, mixing steps)
```

### Authentication Flow

```
Every request
    │
    ▼
Clerk middleware validates session JWT
    │  ← userId extracted from JWT
    ▼
Server Component / Route Handler / Server Action
    │
    ▼
auth() helper → { userId }
    │
    ▼
requireRole() → DB lookup → User.role
    │
    ▼
Service layer proceeds (or throws ForbiddenError)
```

### AI Cross-Dataset Pattern Flow

```
Researcher triggers "Find patterns" on Experiment
    │
    ▼
ExperimentService fetches all linked CycleTests + their CycleDatum[]
    │
    ▼
AIService.findPatterns(cycleTests[])
    │  ← Aggregate statistics per test (mean capacity, CE trend, etc.)
    │  ← Build comparative prompt
    │  ← Call Claude API
    ▼
Structured pattern report → stored in AIAnalysis.patterns (JSON)
    │
    ▼
Displayed on Experiment detail page
```

---

## Module Build Order (Dependencies)

The modules have explicit dependency arrows. Build in this order:

### Phase 1: Foundation (blocks everything)
- Database schema (Prisma) — all modules depend on this
- Auth integration (Clerk + User model + role enforcement) — all modules require auth
- Shared UI shell (layout, nav, dark theme) — all pages require shell
- Core lib files (`lib/db.ts`, `lib/auth.ts`)

**Why first:** No module can function without DB schema, auth, or a shell to render into.

### Phase 2: Cycle Testing Module (highest standalone value)
- Import service (CSV/Excel parsing)
- CycleTest + CycleDatum CRUD
- Chart components (CapacityFade, CE, Voltage, dQ/dV)
- Basic anomaly display

**Why second:** This is the core scientific value of the product. It depends only on Phase 1. Researchers can import and visualize data immediately. This module's data (CycleTest records) is then referenced by Phases 3 and 4.

### Phase 3: Research Experiments Module
- Experiment CRUD with filtering
- Link experiments to CycleTests (requires Phase 2 CycleTests to exist)
- Protocol/conditions/results fields

**Why third:** Depends on CycleTest records existing to be meaningful. Independent from Manufacturing — researchers can run scientific experiments without production tracking.

### Phase 4: Manufacturing Production Module
- ProductionProject (full / electrode-only type selector)
- SlurryRun + MixingStep tracking
- ElectrodeRun + load measurement tracking
- AssemblyRun + cell configuration
- Workflow flag progression logic
- Link production project → CycleTest (test data on finished cells)

**Why fourth:** Most complex module with 5 sub-steps. Depends on CycleTests for the final linkage step but can be built independently otherwise. Experiments can reference production projects (read-only) once this module exists.

### Phase 5: AI Layer
- Claude API integration (`lib/ai.ts`)
- Anomaly detection on individual CycleTest
- Automated summary generation
- Cross-experiment pattern detection

**Why fifth:** Requires CycleTest data to exist and be importable. AI layer is additive — it enhances existing data, not a dependency for any other feature. Ships when data quality is confirmed.

### Phase 6: Team Collaboration Module
- User management (Clerk + DB sync)
- Role assignment UI (admin only)
- Audit trail display (created_by, updated_by on all records)
- Viewer read-only enforcement (write-gate all services)

**Why last:** Role display (created_by) is visible in all earlier phases without a full Team module — it's just a user ID. The full admin UI for managing users/roles is independent of all other modules and can be added last without blocking researcher workflows.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Clerk | Middleware + `auth()` in Server Components; user ID synced to `users` table on first sign-in | Use `clerkMiddleware()` in `middleware.ts`; sync user to DB in a `SignIn` webhook or on first authenticated request |
| Supabase PostgreSQL | Prisma ORM as exclusive data access layer; no direct Supabase client usage in app code | Avoid mixing Prisma and Supabase client — pick one interface. Prisma wins because of type safety. Supabase provides the hosted Postgres only. |
| Claude API | Service wrapper in `lib/ai.ts`; called from Server Actions or Route Handlers only | Never call Claude from client components. Apply rate limiting — AI calls are expensive. Store model version used in AIAnalysis for reproducibility. |
| Excel/CSV (Neware BTS) | Server-side file parsing in `ImportService` using `xlsx` or `papaparse` | Parse on server to avoid sending raw file data to client. Normalize column names (Neware BTS uses non-standard headers). |

### Internal Module Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Cycle Testing ↔ Experiments | Via `ExperimentCycleTest` join table (many-to-many) | Experiments read CycleTest records; never the reverse |
| Cycle Testing ↔ Production | `CycleTest.cellId` references produced cells (loose reference, not FK) | Keeps modules independent; traceability query spans the join manually |
| Production ↔ Experiments | Experiment may reference a `ProductionProject` as context (optional FK) | Read-only reference; production module doesn't know about experiments |
| All modules ↔ Team | Every service calls `requireRole()` from `lib/auth.ts` | Auth is a shared lib, not a module-to-module dependency |

---

## Anti-Patterns

### Anti-Pattern 1: Storing dQ/dV Values Per Cycle

**What people do:** Add `dqdv_data` JSON column to `CycleDatum` storing arrays of (V, dQ/dV) points per cycle.

**Why it's wrong:** dQ/dV is derived by differentiating V with respect to Q — it's a computed view of existing data. Storing it doubles data footprint, creates synchronization risk (does stored dQ/dV match current raw data?), and each cycle's dQ/dV array can be megabytes.

**Do this instead:** Compute dQ/dV server-side from raw `chargeVoltage` / `capacity` pairs on request. Cache the result in memory or Redis if the dataset is large and re-computation is slow. Present as a derived chart, not persisted data.

### Anti-Pattern 2: Calling Prisma Directly from React Components

**What people do:** Import `prisma` into Server Components and write queries inline in the component body.

**Why it's wrong:** Business logic scatters across the UI layer, becomes impossible to reuse, untestable, and creates a refactoring nightmare when requirements change (e.g., adding role checks to every query).

**Do this instead:** All Prisma calls live in `services/`. Server Components call service functions, not Prisma directly.

### Anti-Pattern 3: Storing Entire CSV File as a Blob

**What people do:** Store the original Neware CSV as a blob in the database "for auditability."

**Why it's wrong:** Neware BTS exports can be large (thousands of cycles). Storing blobs in PostgreSQL degrades query performance and backup size. The normalized `CycleDatum` rows already represent the complete dataset.

**Do this instead:** Parse on import, store only normalized rows. If original file preservation is required (for audit), store in Supabase Storage (object storage), not in the database rows.

### Anti-Pattern 4: Deriving Workflow Progress from Child Record Counts

**What people do:** Compute whether "slurry step is done" by checking if `SlurryRun` records exist for both electrode types.

**Why it's wrong:** Record existence is not operator sign-off. A partial slurry run (abandoned halfway) still creates a record. The domain requires explicit human sign-off, which is what the boolean flags represent.

**Do this instead:** Use the boolean flags as defined in PROJECT.md. Flags are set by the operator via a deliberate "Mark complete" action, validated in the service layer to ensure prerequisites are met.

### Anti-Pattern 5: Clerk Role Claims Without DB Sync

**What people do:** Store role only in Clerk's `publicMetadata`, read it only from the JWT, never write it to the database.

**Why it's wrong:** The database has no record of who is admin vs. researcher, making queries like "show me all records created by researchers" or "audit log by role" impossible without external API calls.

**Do this instead:** Sync Clerk user + role to the `users` table on creation/update. `User.role` in the DB is the source of truth for all DB-level queries. Clerk metadata is kept in sync as a convenience for JWT claims, but DB is authoritative.

---

## Scaling Considerations

This system targets 5–20 concurrent lab users on a shared local instance (per PROJECT.md). Scaling to thousands of users is explicitly out of scope for MVP. These notes address the realistic growth path.

| Concern | At 5-20 users (MVP) | At 100-500 users | At 1,000+ users |
|---------|---------------------|-----------------|-----------------|
| Cycle data volume | 1M rows = fine for Postgres | 100M rows — add `cycleTestId` + `cycleNumber` composite index, consider partitioning | TimescaleDB extension on Postgres for time-series hypertables |
| AI analysis latency | Sync Claude call per test OK | Queue with Bull/pg-boss for async AI jobs | Dedicated AI worker process |
| File import size | Synchronous parse fine | Stream parse large files (Papa Parse streaming) | Background job with progress tracking |
| Concurrent writes | Single Postgres instance fine | Read replica for analytics queries | Connection pooling (PgBouncer) |
| Auth overhead | `requireRole()` DB call per request OK | Cache user role in Redis (5-min TTL) | Auth service extraction |

### Scaling Priorities (when they hit)

1. **First bottleneck:** Large CycleDatum imports (>10,000 cycles per test) causing slow inserts. Fix: use `prisma.cycleDatum.createMany()` with `skipDuplicates: true` instead of individual creates. Already the recommendation.

2. **Second bottleneck:** dQ/dV computation time for large datasets. Fix: cache computed dQ/dV in Redis with `cycleTestId` key, invalidate on data update.

---

## Sources

- Project context: `/Users/omer/Desktop/battery-system/.planning/PROJECT.md` (HIGH confidence — primary domain spec)
- Next.js 15 App Router conventions: training data (MEDIUM confidence — verify against https://nextjs.org/docs/app)
- Prisma schema patterns and `createMany`: training data (MEDIUM confidence — verify against https://www.prisma.io/docs)
- Clerk + Next.js integration: training data (MEDIUM confidence — verify against https://clerk.com/docs/quickstarts/nextjs)
- dQ/dV computation approach: domain knowledge from battery research (MEDIUM confidence — standard electrochemistry practice)
- TimescaleDB for time-series Postgres: training data (LOW confidence for MVP scale — not needed at 5-20 users, flag for future research)

---
*Architecture research for: Battery Manufacturing and Research Management Platform (Neware Pro)*
*Researched: 2026-03-01*
