# Phase 1: Foundation - Research

**Researched:** 2026-03-01
**Domain:** Next.js 15 App Router + Clerk + Prisma + Supabase local stack + Shadcn/ui dark theme
**Confidence:** MEDIUM — core framework patterns are HIGH confidence from training data; Framer Motion + React 19 compatibility and Clerk offline behavior are LOW/MEDIUM and flagged for verification

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Left sidebar navigation (not top nav) — research-tool convention; keeps content area wide for charts
- Three top-level sections: Cycle Tests, Experiments, Manufacturing — matching the four pillars (team mgmt deferred to v2 RBAC)
- Sidebar collapses to icon-only on smaller viewports; expands on hover or toggle
- Logo/wordmark "Neware Pro" at sidebar top
- Active state: highlighted pill with accent color
- Page transitions: Framer Motion `AnimatePresence` with subtle fade-slide between routes
- Base: `zinc-950` background; Surface cards: `zinc-900` with `zinc-800` borders
- Accent: electric blue (`#3B82F6` / `blue-500`) — used for active states, CTAs, chart highlights
- Text: `zinc-100` primary, `zinc-400` secondary/muted
- Danger: `red-500`; Success: `emerald-500`; Warning: `amber-500`
- Clerk-hosted sign-in page (not custom) for v1
- After sign-in: redirect to `/dashboard` or last visited page
- Session: Clerk JWT with `clerkMiddleware` in Next.js `middleware.ts`
- JSONB `metadata` column on `SlurryRun`, `ElectrodeRun`, `AssemblyRun`, `CycleDatum`
- Strict FK chain enforced: `MaterialInput → SlurryRun/ElectrodeRun → ProductionProject → CycleTest`
- Soft deletes (`deletedAt` timestamp) on `Experiment`, `ProductionProject`, `CycleTest`
- Hard deletes allowed only on import errors (raw malformed rows)
- Prisma singleton pattern in `lib/prisma.ts` + Supabase pooler (transaction mode) URL in `DATABASE_URL`
- Single entry point `lib/ai-service.ts` — exports typed functions only; no raw Anthropic SDK calls outside this file
- Zod schemas define structured output shapes (anomaly detection, summary) in Phase 1 scaffold
- Claude API key in `.env.local`, never committed

### Claude's Discretion
- Exact Prisma migration strategy (baseline vs fresh)
- Docker Compose service names and port assignments
- Specific Framer Motion animation timing/easing values
- Shadcn/ui component initialization specifics
- TanStack Query setup details (stale time, retry config)

### Deferred Ideas (OUT OF SCOPE)
- RBAC roles (admin/researcher/viewer) — v2, deferred by user decision
- User profile page — not needed until RBAC lands
- Notification system — out of scope
- Custom Clerk sign-in page styling — can do later
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can sign in and sign out via Clerk (email/password or social) | Clerk-hosted sign-in + `clerkMiddleware` in `middleware.ts`; `SignInButton`/`SignOutButton` from `@clerk/nextjs` |
| AUTH-02 | User session persists across browser refresh | Clerk JWT session cookie is persistent by default; no extra config required |
| PLAT-01 | Application runs entirely on localhost with no cloud dependencies | Supabase local Docker stack via `supabase start`; Clerk requires outbound HTTPS to `api.clerk.com` — must verify lab network allows this |
| PLAT-02 | Dark-theme UI using Shadcn/ui with Framer Motion animations throughout | Shadcn/ui initialized with dark theme; Tailwind `darkMode: 'class'`; Framer Motion `AnimatePresence` for route transitions — React 19 compatibility must be verified |
| PLAT-03 | All data visualization rendered with Recharts and/or D3 | Phase 1 scope: dark-theme rendering check only (placeholder chart); full chart implementation in Phase 2 |
</phase_requirements>

---

## Summary

Phase 1 establishes the foundation that every subsequent phase builds on: a working Next.js 15 App Router project wired to a local Supabase/PostgreSQL instance via Prisma, protected by Clerk auth, with the complete database schema (all four pillars, JSONB columns, FK chain), a dark-theme UI shell with left sidebar navigation, and an `lib/ai-service.ts` scaffold that prevents scattered Claude API calls in future phases.

This phase has no novel algorithms or unusual libraries — it is a well-trodden integration of four documented tools. The primary risk is not complexity but correctness in setup: the Prisma singleton + Supabase pooler URL must be configured exactly right from the start, the full schema must be complete (JSONB columns, soft-delete columns, FK constraints), and Clerk middleware must gate all lab routes before the first route is built. Getting any of these wrong is cheap now and expensive to fix later.

The secondary risks are external compatibility: Framer Motion 11 + React 19 has known evolving compatibility, and Clerk JWT validation requires outbound HTTPS to `api.clerk.com` — a real concern for an air-gapped lab network. Both must be verified during Phase 1 setup, not assumed resolved.

**Primary recommendation:** Set up infrastructure in strict order — Docker/Supabase → Prisma schema (complete, all tables) → Clerk middleware → UI shell → AI scaffold. Do not begin UI work until the database is reachable and migrated.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x (App Router) | Full-stack framework | Server Components for data-heavy pages; Server Actions for mutations; already decided |
| TypeScript | 5.x | Type safety | Enforces domain model correctness across Prisma schema → service layer → UI |
| Prisma | 5.x | ORM + migrations | Type-safe queries, migration history; singleton pattern prevents connection exhaustion |
| Supabase | Latest (local Docker) | PostgreSQL host for local-first MVP | `supabase start` spins full stack; Storage for raw file retention in later phases |
| PostgreSQL | 15+ (via Supabase) | Primary database | Relational model fits cycle data + manufacturing traceability |
| Clerk | Latest | Auth + session management | Hosted sign-in, JWT sessions, Next.js middleware integration; already decided |
| Shadcn/ui | Latest | Component system | Unstyled-by-default, dark-theme native, pairs with Tailwind |
| Tailwind CSS | 3.x | Styling | Utility-first; `dark:` prefix for dark mode; `zinc-*` palette is built-in |
| Framer Motion | 11.x | Page transitions + animations | `AnimatePresence` for route fade-slide; already decided — verify React 19 compat |
| Zod | 3.x | Schema validation | Validates AI output shapes in `lib/ai-service.ts` scaffold; used throughout |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @anthropic-ai/sdk | Latest | Claude API client | Imported only in `lib/ai-service.ts` — never elsewhere |
| TanStack Query | 5.x | Client-side data fetching | `QueryClientProvider` in client boundary wrapper for interactive components |
| @supabase/supabase-js | Latest | Supabase CLI + storage client | `supabase start` for local dev; storage client for Phase 2 file uploads |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Clerk | NextAuth.js v5 | NextAuth.js v5 is fully self-hosted — no outbound HTTPS requirement. Use if lab network is air-gapped. Clerk is preferred because it ships faster and handles edge cases; NextAuth.js is the verified fallback. |
| Prisma singleton | New PrismaClient per request | Per-request instantiation exhausts Supabase connection pool under concurrent load. Singleton is mandatory. |
| Supabase local Docker | Plain PostgreSQL Docker | Supabase local provides Storage and auth infrastructure needed in later phases; start with it now to avoid migration. |

**Installation (Phase 1 relevant packages):**
```bash
# Core framework (create-next-app handles Next.js + TypeScript + Tailwind)
npx create-next-app@latest neware-pro --typescript --tailwind --app

# Auth
npm install @clerk/nextjs

# Database
npm install prisma @prisma/client
npx prisma init

# Supabase local (Supabase CLI)
brew install supabase/tap/supabase
supabase init
supabase start

# UI components
npx shadcn@latest init

# Animation
npm install framer-motion

# Data fetching + validation
npm install @tanstack/react-query zod

# AI scaffold (SDK only — no live calls in Phase 1)
npm install @anthropic-ai/sdk
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── (auth)/                    # Clerk-protected route group
│   │   ├── layout.tsx             # Dashboard shell: sidebar + content area
│   │   └── dashboard/
│   │       └── page.tsx           # Landing page after sign-in
│   ├── layout.tsx                 # Root layout: ClerkProvider + QueryProvider + ThemeProvider
│   └── globals.css                # Tailwind base + dark theme CSS vars
│
├── components/
│   ├── ui/                        # Shadcn/ui generated components
│   ├── layout/
│   │   ├── Sidebar.tsx            # Left nav: collapsible, icon+label items, active pill
│   │   ├── SidebarItem.tsx        # Individual nav item with active state
│   │   └── PageTransition.tsx     # Framer Motion AnimatePresence wrapper
│   └── shared/
│       └── ThemeProvider.tsx      # next-themes wrapper (dark mode class)
│
├── lib/
│   ├── prisma.ts                  # Prisma singleton — ONLY place PrismaClient is instantiated
│   ├── ai-service.ts              # Claude API entry point — scaffold only in Phase 1
│   └── utils.ts                   # cn() helper, shared formatters
│
├── services/                      # Server-only business logic (future phases populate)
│
├── types/                         # Shared TypeScript types derived from Prisma
│
└── prisma/
    ├── schema.prisma              # Complete schema — ALL tables for all four pillars
    └── migrations/                # Migration history starts here
```

### Pattern 1: Prisma Singleton

**What:** A single `PrismaClient` instance shared across all server-side code, stored in `globalThis` to survive hot-reload in development.

**When to use:** Always. This is mandatory — Next.js dev mode creates new module instances on each hot-reload, which exhausts the connection pool without the global guard.

**Example:**
```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Environment variables:**
```bash
# .env — Supabase pooler URL (transaction mode) for all app queries
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres?pgbouncer=true&connection_limit=1"

# .env — Direct URL for Prisma migrations only (bypasses pooler)
DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
```

```prisma
// prisma/schema.prisma — both URLs required
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Pattern 2: Clerk Middleware Gating All Lab Routes

**What:** `clerkMiddleware` in `middleware.ts` intercepts every request. All routes under `/(auth)/` require authentication. Public routes (sign-in, sign-up) are explicitly listed.

**When to use:** Set up in Phase 1 before any routes are created. Every future phase's routes are automatically protected.

**Example:**
```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
```

### Pattern 3: Root Layout Providers

**What:** `app/layout.tsx` wraps the entire app in three providers: `ClerkProvider` (auth context), `QueryClientProvider` (TanStack Query), and dark-mode class on `<html>`.

**When to use:** Established once in Phase 1; all future phases inherit it.

**Example:**
```typescript
// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import { QueryClientWrapper } from "@/components/shared/QueryClientWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className="bg-zinc-950 text-zinc-100">
          <QueryClientWrapper>
            {children}
          </QueryClientWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

```typescript
// components/shared/QueryClientWrapper.tsx  ("use client")
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryClientWrapper({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000, retry: 1 } },
  }));
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

### Pattern 4: Left Sidebar with Framer Motion Page Transitions

**What:** `app/(auth)/layout.tsx` renders the two-column layout: fixed sidebar on the left, main content area on the right. `AnimatePresence` wraps page content for fade-slide transitions on route change.

**When to use:** The dashboard shell — all lab routes render inside this layout.

**Example:**
```typescript
// app/(auth)/layout.tsx
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-zinc-950">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

```typescript
// components/layout/Sidebar.tsx  ("use client" — needs usePathname)
"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

const navItems = [
  { href: "/cycle-tests", label: "Cycle Tests", icon: BeakerIcon },
  { href: "/experiments", label: "Experiments", icon: FlaskIcon },
  { href: "/manufacturing", label: "Manufacturing", icon: FactoryIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col">
      <div className="p-6 border-b border-zinc-800">
        <span className="text-zinc-100 font-semibold text-lg">Neware Pro</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              }`}>
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

### Pattern 5: AI Service Scaffold

**What:** `lib/ai-service.ts` exports typed async functions. In Phase 1 these are stubs. The pattern (Zod output schemas, typed inputs, sole SDK import point) is established so Phase 5 fills in implementations without refactoring call sites.

**When to use:** Import this file everywhere AI is needed. Never import `@anthropic-ai/sdk` directly anywhere else.

**Example:**
```typescript
// lib/ai-service.ts
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Output schemas — defined now; implemented in Phase 5
export const AnomalySchema = z.object({
  anomalies: z.array(z.object({
    cycleNumber: z.number(),
    type: z.enum(["capacity_drop", "ce_anomaly", "voltage_plateau", "resistance_increase"]),
    severity: z.enum(["low", "medium", "high"]),
    description: z.string(),
  })),
  summary: z.string(),
});

export type AnomalyResult = z.infer<typeof AnomalySchema>;

// Scaffold — throws NotImplementedError until Phase 5
export async function analyzeAnomalies(cycleTestId: string): Promise<AnomalyResult> {
  throw new Error("AI analysis not yet implemented — Phase 5 feature");
}

export async function generateTestSummary(cycleTestId: string): Promise<string> {
  throw new Error("AI summary not yet implemented — Phase 5 feature");
}
```

### Anti-Patterns to Avoid

- **Multiple PrismaClient instances:** Never call `new PrismaClient()` outside `lib/prisma.ts`. Each instance holds its own connection pool; multiple instances will exhaust Supabase's pooler limit.
- **Importing Prisma in Client Components:** Prisma client contains Node.js bindings — it cannot run in the browser. Any component importing `lib/prisma.ts` must be a Server Component or server-only file. Use `import "server-only"` at the top of service files.
- **Direct Supabase JS client for DB queries:** The Supabase JS client bypasses Prisma's type safety and schema enforcement. Use Prisma for all DB access; use the Supabase client only for Storage operations in Phase 2+.
- **Calling Claude API outside `lib/ai-service.ts`:** Scattered `new Anthropic()` calls make cost tracking, output validation, and model versioning impossible to maintain.
- **Skipping JSONB metadata columns:** Adding `metadata Json?` to `SlurryRun`, `ElectrodeRun`, `AssemblyRun`, `CycleDatum` in Phase 1 is the specific lesson from the old system rewrite. Do not defer this to "when we need it" — JSONB is needed from day one.
- **Using the pooler URL for migrations:** `prisma migrate dev` must use the direct connection URL, not the pooler URL. Migrations over PgBouncer in transaction mode fail intermittently.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auth session management | Custom JWT handling, cookie management | Clerk | JWT rotation, CSRF protection, session persistence, and social OAuth are deep rabbit holes with serious security implications |
| Dark theme toggle | CSS variable switching code | Shadcn/ui + Tailwind `dark:` class | Shadcn's `ThemeProvider` handles system preference, localStorage persistence, and SSR flicker prevention |
| Component primitives | Custom Modal, Dropdown, Select | Shadcn/ui components | Accessibility (ARIA, keyboard nav, focus trap) is already solved; hand-rolled alternatives almost always miss edge cases |
| Form state management | Custom form hooks | React Hook Form (installed by Shadcn) | Already a dependency from Shadcn's form components; handles validation, touched state, and submission |
| Route protection | Manual session checks per route | Clerk `clerkMiddleware` | One-line protection for all routes; handles redirect, return URL, and edge cases |

---

## Common Pitfalls

### Pitfall 1: Connection Pool Exhaustion

**What goes wrong:** Application throws `P2024: A required value was not present` or connections hang. Database becomes unresponsive under moderate load.

**Why it happens:** Next.js hot-reload creates new module instances, each with a new `PrismaClient` and connection pool. After ~10 reloads, the Supabase pooler's connection limit is hit.

**How to avoid:** Use the singleton pattern in `lib/prisma.ts` (see Pattern 1). Set `DATABASE_URL` to the pooler URL (`?pgbouncer=true&connection_limit=1`) and `DIRECT_URL` to the direct connection. Never create `new PrismaClient()` outside `lib/prisma.ts`.

**Warning signs:** "too many connections" Postgres errors; application works on first load but fails after a few route navigations.

### Pitfall 2: Framer Motion + React 19 Incompatibility

**What goes wrong:** `AnimatePresence` causes hydration errors or silent animation failures. Some motion hooks throw type errors.

**Why it happens:** React 19 changed concurrent rendering internals. Framer Motion 11 addressed most issues by training data cutoff (August 2025) but this surface was still evolving.

**How to avoid:** Verify before implementing any animation: check https://www.framer.com/motion/ and the Framer Motion GitHub issues for React 19 compatibility status. If incompatible, remove `AnimatePresence` from the route layout — the dark-theme shell works without animations; defer until confirmed stable.

**Warning signs:** Console hydration mismatch warnings; animations that work on first render but break on navigation.

### Pitfall 3: Clerk Outbound HTTPS Requirement

**What goes wrong:** Authentication fails entirely in a lab network environment. Users are stuck on the Clerk sign-in redirect with no error message.

**Why it happens:** Clerk validates JWTs against `api.clerk.com`. If the lab network blocks outbound HTTPS (common in secure lab environments), JWT validation calls fail and all auth-protected routes return 401/redirect.

**How to avoid:** During Phase 1 setup, explicitly test outbound HTTPS connectivity: `curl https://api.clerk.com` from the server host. If blocked, implement NextAuth.js v5 with credentials provider + Prisma adapter as a drop-in replacement. NextAuth.js v5 does all JWT validation locally.

**Warning signs:** Auth works in development (on developer's machine with full internet) but fails on the lab workstation; Clerk dashboard shows no sign-in events despite user attempts.

### Pitfall 4: Incomplete Schema in Phase 1

**What goes wrong:** Phase 2 or later adds a table or column that creates a migration requiring data backfill. Existing data is inconsistent with new schema.

**Why it happens:** Developers scope Phase 1 schema to "only what Phase 1 needs" — skipping tables for modules that ship in later phases.

**How to avoid:** The complete Prisma schema (all four pillars: `CycleTest`, `CycleDatum`, `AIAnalysis`, `Experiment`, `ExperimentCycleTest`, `ProductionProject`, `SlurryRun`, `MixingStep`, `ElectrodeRun`, `AssemblyRun`, `User`) must be migrated in Phase 1. JSONB `metadata` columns on `SlurryRun`, `ElectrodeRun`, `AssemblyRun`, `CycleDatum` must be included. `deletedAt` soft-delete columns on `Experiment`, `ProductionProject`, `CycleTest` must be included.

**Warning signs:** Phase 2 planning creates new migration files for tables that "weren't needed in Phase 1" — this is the anti-pattern occurring.

### Pitfall 5: Migrations Run Over Pooler URL

**What goes wrong:** `prisma migrate dev` hangs or fails intermittently with transaction errors.

**Why it happens:** PgBouncer in transaction mode does not support the multi-statement transactions Prisma uses during migration execution.

**How to avoid:** `schema.prisma` must declare both `url` (pooler, for app queries) and `directUrl` (direct connection, for migrations). Prisma automatically uses `directUrl` for `migrate dev`/`deploy` commands.

---

## Code Examples

Verified patterns from official sources and established conventions:

### Complete Prisma Schema (Phase 1 — all four pillars)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ── Auth ──────────────────────────────────────────────────────────────────────
model User {
  id        String   @id               // Clerk user ID (e.g., user_2xyz...)
  email     String   @unique
  name      String
  createdAt DateTime @default(now())

  cycleTests         CycleTest[]
  experiments        Experiment[]
  productionProjects ProductionProject[]

  @@map("users")
}

// ── Cycle Testing ─────────────────────────────────────────────────────────────
model CycleTest {
  id          String    @id @default(cuid())
  name        String
  description String?
  cellId      String?
  importedAt  DateTime  @default(now())
  deletedAt   DateTime?                // Soft delete
  createdById String
  updatedById String?

  createdBy   User                  @relation(fields: [createdById], references: [id])
  cycles      CycleDatum[]
  aiAnalysis  AIAnalysis?
  experiments ExperimentCycleTest[]

  @@map("cycle_tests")
}

model CycleDatum {
  id                  String    @id @default(cuid())
  cycleTestId         String
  cycleNumber         Int
  capacity            Float?
  coulombicEfficiency Float?
  chargeVoltage       Float?
  dischargeVoltage    Float?
  energy              Float?
  cRate               Float?
  temperature         Float?
  recordedAt          DateTime?
  metadata            Json?             // JSONB for lab-specific fields

  cycleTest CycleTest @relation(fields: [cycleTestId], references: [id], onDelete: Cascade)

  @@index([cycleTestId, cycleNumber])
  @@map("cycle_data")
}

model AIAnalysis {
  id           String   @id @default(cuid())
  cycleTestId  String   @unique
  anomalies    Json
  summary      String
  patterns     Json?
  modelVersion String
  generatedAt  DateTime @default(now())

  cycleTest CycleTest @relation(fields: [cycleTestId], references: [id], onDelete: Cascade)

  @@map("ai_analyses")
}

// ── Research Experiments ──────────────────────────────────────────────────────
model Experiment {
  id          String           @id @default(cuid())
  title       String
  protocol    String
  conditions  Json
  materials   Json
  results     String?
  status      ExperimentStatus @default(ACTIVE)
  deletedAt   DateTime?        // Soft delete
  createdById String
  updatedById String?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  createdBy  User                  @relation(fields: [createdById], references: [id])
  cycleTests ExperimentCycleTest[]

  @@map("experiments")
}

enum ExperimentStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
}

model ExperimentCycleTest {
  experimentId String
  cycleTestId  String
  linkedAt     DateTime @default(now())

  experiment Experiment @relation(fields: [experimentId], references: [id])
  cycleTest  CycleTest  @relation(fields: [cycleTestId], references: [id])

  @@id([experimentId, cycleTestId])
  @@map("experiment_cycle_tests")
}

// ── Manufacturing / Production ────────────────────────────────────────────────
model ProductionProject {
  id          String      @id @default(cuid())
  name        String
  type        ProjectType
  description String?
  deletedAt   DateTime?   // Soft delete
  createdById String
  updatedById String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Workflow boolean sign-off flags (source of truth for step progress)
  anodeSlurryDone      Boolean @default(false)
  cathodeSlurryDone    Boolean @default(false)
  electrodeAnodeDone   Boolean @default(false)
  electrodeCathodeDone Boolean @default(false)
  assemblyDone         Boolean @default(false)
  cellsDone            Boolean @default(false)

  // Cell configuration
  numberOfCells      Int?
  numberOfInterfaces Int?
  cellDimensions     Json?

  createdBy     User           @relation(fields: [createdById], references: [id])
  slurryRuns    SlurryRun[]
  electrodeRuns ElectrodeRun[]
  assemblyRun   AssemblyRun?

  @@map("production_projects")
}

enum ProjectType {
  FULL
  ELECTRODE_ONLY
}

model SlurryRun {
  id                   String        @id @default(cuid())
  productionProjectId  String
  electrodeType        ElectrodeType
  operatorId           String
  startedAt            DateTime
  completedAt          DateTime?
  nmpWeight            Float?
  pvdfWeight           Float?
  activeMaterialWeight Float?
  carbonAdditiveWeight Float?
  viscosityMeasurements Json?
  grindometerCheck     Float?
  overnightMixing      Boolean       @default(false)
  suitableForCoating   Boolean?
  visualInspectionNotes String?
  metadata             Json?         // JSONB for lab-specific fields

  mixingSteps       MixingStep[]
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
  id                    String        @id @default(cuid())
  productionProjectId   String
  electrodeType         ElectrodeType
  operatorId            String
  startedAt             DateTime
  completedAt           DateTime?
  coatingSpeed          Float?
  coatingTemperature    Float?
  coatingGap            Float?
  viscosityBeforeCoating Float?
  loadSideA             Float?
  loadSideB             Float?
  loadStdDev            Float?
  thickness             Float?
  visualInspectionNotes String?
  approvedForAssembly   Boolean?
  metadata              Json?         // JSONB for lab-specific fields

  productionProject ProductionProject @relation(fields: [productionProjectId], references: [id])

  @@map("electrode_runs")
}

enum ElectrodeType {
  ANODE
  CATHODE
}

model AssemblyRun {
  id                  String          @id @default(cuid())
  productionProjectId String          @unique
  operatorId          String
  startedAt           DateTime
  completedAt         DateTime?
  anodeSource         ElectrodeSource
  cathodeSource       ElectrodeSource
  anodeLoadMgCm2      Float?
  cathodeLoadMgCm2    Float?
  electrolyteAmountMl Float?
  separator           String?
  anodeProtocolRef    String?
  cathodeProtocolRef  String?
  visualInspectionNotes String?
  notes               String?
  metadata            Json?           // JSONB for lab-specific fields

  productionProject ProductionProject @relation(fields: [productionProjectId], references: [id])

  @@map("assembly_runs")
}

enum ElectrodeSource {
  INTERNAL
  CHINESE
  INVENTORY
}
```

### Docker Compose for Local Supabase (discretionary)

```yaml
# docker-compose.yml — Supabase CLI manages this automatically via `supabase start`
# Use `supabase start` rather than manual Docker Compose for the local stack
# This file is for reference; the Supabase CLI generates the actual compose file
```

**Recommendation:** Use `supabase start` (Supabase CLI) rather than a hand-rolled Docker Compose. The CLI manages service names, ports, and internal networking automatically. Default ports: PostgreSQL on `54322`, Supabase Studio on `54323`, API on `54321`.

### Tailwind Dark Theme Configuration

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",   // Dark mode via .dark class on <html>
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Design token aliases matching CONTEXT.md decisions
        background: "hsl(var(--background))",    // zinc-950
        surface: "hsl(var(--surface))",           // zinc-900
        border: "hsl(var(--border))",             // zinc-800
        accent: "#3B82F6",                        // blue-500
      },
    },
  },
  plugins: [require("tailwindcss-animate")],     // Shadcn/ui dependency
};
export default config;
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `getServerSideProps` / `getStaticProps` | Server Components with direct async data fetch | Next.js 13 (App Router) | No API round-trip for server-rendered pages; Prisma can be called directly in Server Components |
| `next-auth` v4 | Clerk (hosted) or NextAuth.js v5 | 2023-2024 | Clerk is the fast path; NextAuth.js v5 is the self-hosted alternative with Prisma adapter support |
| CSS Modules + manual dark mode | Tailwind CSS `dark:` prefix + Shadcn/ui | 2022-2023 | Dark mode is now a first-class Tailwind feature; Shadcn generates accessible components with dark support built in |
| Multiple `PrismaClient` instances | Singleton with `globalThis` guard | Prisma 4.x recommendation | Prevents connection pool exhaustion in Next.js development hot-reload |
| Separate `directUrl` for migrations | Prisma `directUrl` in `schema.prisma` | Prisma 4.x with Supabase | Cleanly separates pooler URL (app) from direct URL (migrations) in one config file |

**Deprecated/outdated:**
- `pages/` directory routing: Do not mix with `app/` directory. This project uses App Router exclusively.
- `next/router` import: Replaced by `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`) in App Router.
- `clerkMiddleware` from older Clerk versions used `authMiddleware` — use `clerkMiddleware` from `@clerk/nextjs/server` (current API).

---

## Open Questions

1. **Framer Motion + React 19 compatibility**
   - What we know: Framer Motion 11 addressed most React 19 issues by August 2025 training cutoff; some concurrent rendering edge cases were still open.
   - What's unclear: Whether `AnimatePresence` route transitions specifically work without hydration errors in Next.js 15 + React 19 as of March 2026.
   - Recommendation: During Phase 1 setup, install Framer Motion and test a single `AnimatePresence` transition. If hydration errors appear, remove `AnimatePresence` from the layout and add a tracking issue. The UI shell is functional without animations.

2. **Clerk outbound HTTPS on lab network**
   - What we know: Clerk requires outbound HTTPS to `api.clerk.com` for JWT validation.
   - What's unclear: Whether the specific lab network where this will run has this connectivity.
   - Recommendation: Test `curl https://api.clerk.com` from the lab machine during Phase 1 setup. If blocked, switch to NextAuth.js v5 with credentials provider + Prisma adapter before writing any auth-dependent code. Do not discover this in Phase 2.

3. **Supabase local Docker memory requirements**
   - What we know: Supabase local stack runs multiple containers (PostgreSQL, PostgREST, GoTrue, Realtime, Storage, etc.).
   - What's unclear: Whether the lab workstation has sufficient RAM (Supabase local typically requires 2-4GB free).
   - Recommendation: Run `supabase start` during initial setup and confirm all services reach healthy status before proceeding. If memory-constrained, a plain PostgreSQL Docker container with Prisma is an acceptable alternative for Phase 1 (Storage is not needed until Phase 2 file uploads).

---

## Sources

### Primary (HIGH confidence)
- `.planning/research/ARCHITECTURE.md` — complete schema, project structure, architectural patterns (derived from project domain knowledge)
- `.planning/research/STACK.md` — stack validation, version compatibility table, alternative analysis
- `.planning/research/SUMMARY.md` — pitfall analysis, build order rationale
- `.planning/phases/01-foundation/01-CONTEXT.md` — locked user decisions

### Secondary (MEDIUM confidence)
- Training data (August 2025): Prisma singleton pattern, `clerkMiddleware` API, Next.js 15 App Router conventions, Tailwind `darkMode: "class"`, TanStack Query v5 `QueryClientProvider` in client boundary
- Training data: Shadcn/ui initialization, `next-themes` for dark mode, Framer Motion `AnimatePresence` usage

### Tertiary (LOW confidence — verify before implementing)
- Framer Motion 11 + React 19 compatibility status (March 2026) — verify at https://www.framer.com/motion/
- Clerk `clerkMiddleware` exact API (may have changed since August 2025) — verify at https://clerk.com/docs/quickstarts/nextjs
- Supabase local Docker current port defaults — verify at https://supabase.com/docs/guides/cli/local-development

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries are pre-decided and well-established; versions are stable
- Architecture patterns: HIGH — Prisma singleton, Clerk middleware, and root provider layout are documented patterns with no known variations
- Schema completeness: HIGH — derived directly from ARCHITECTURE.md which encodes full domain knowledge
- Framer Motion compatibility: LOW — actively evolving surface; must be verified during setup
- Clerk local behavior: MEDIUM — architecture understood; specific lab network behavior requires runtime verification

**Research date:** 2026-03-01
**Valid until:** 2026-03-31 (30 days — stable libraries; Framer Motion React 19 compat may resolve sooner)
