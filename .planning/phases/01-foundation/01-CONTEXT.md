# Phase 1: Foundation - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Stand up the complete platform infrastructure: Next.js 15 project with Docker/Supabase local stack, full Prisma schema covering all four pillars, Clerk authentication with session persistence, shared dark-theme UI shell with navigation, and an AI service scaffold (`lib/ai-service.ts`) that prevents scattered Claude API calls. No feature logic — only the foundation every other phase builds on.

</domain>

<decisions>
## Implementation Decisions

### UI Shell Layout
- Left sidebar navigation (not top nav) — research-tool convention; keeps content area wide for charts
- Three top-level sections: **Cycle Tests**, **Experiments**, **Manufacturing** — matching the four pillars (team mgmt deferred to v2 RBAC)
- Sidebar collapses to icon-only on smaller viewports; expands on hover or toggle
- Logo/wordmark "Neware Pro" at sidebar top
- Active state: highlighted pill with accent color
- Page transitions: Framer Motion `AnimatePresence` with subtle fade-slide between routes

### Dark Theme Identity
- Base: `zinc-950` background (near-black, not true black — easier on eyes in long lab sessions)
- Surface cards: `zinc-900` with `zinc-800` borders
- Accent color: **electric blue** (`#3B82F6` / `blue-500`) — professional, not purple/teal; used for active states, CTAs, chart highlights
- Text: `zinc-100` primary, `zinc-400` secondary/muted
- Danger: `red-500`; Success: `emerald-500`; Warning: `amber-500`
- Feels like: Linear or Vercel dashboard — dark, dense, information-rich, not gaming-aesthetic

### Auth Flow UX
- Clerk-hosted sign-in page (not custom) for v1 — fast to implement, handles edge cases
- After sign-in: redirect to `/dashboard` or last visited page
- Unauthenticated routes: redirect to Clerk sign-in
- Auth errors: Clerk's built-in error handling (no custom error pages needed for v1)
- Session: Clerk JWT with `clerkMiddleware` in Next.js middleware.ts

### Database Schema Philosophy
- JSONB `metadata` column on every measurement-heavy table: `SlurryRun`, `ElectrodeRun`, `AssemblyRun`, `CycleDatum` — allows lab-specific fields without schema migrations (this is what caused the old system's rewrite)
- Strict FK chain enforced: `MaterialInput → SlurryRun/ElectrodeRun → ProductionProject → CycleTest` — no text-field linkage anywhere in the traceability chain
- Soft deletes (`deletedAt` timestamp) on `Experiment`, `ProductionProject`, `CycleTest` — researchers must not lose data
- Hard deletes allowed only on import errors (raw malformed rows)
- Prisma singleton pattern in `lib/prisma.ts` + Supabase pooler (transaction mode) URL in `DATABASE_URL`

### AI Service Scaffold
- Single entry point: `lib/ai-service.ts` — exports typed functions only (no raw Anthropic SDK calls outside this file)
- Pattern established in Phase 1 even though AI features ship in v2 — prevents future scattered calls
- Zod schemas define structured output shapes (anomaly detection, summary) so planner can implement them in v2 without rework
- Claude API key in `.env.local`, never committed

### Claude's Discretion
- Exact Prisma migration strategy (baseline vs fresh)
- Docker Compose service names and port assignments
- Specific Framer Motion animation timing/easing values
- Shadcn/ui component initialization specifics
- TanStack Query setup details (stale time, retry config)

</decisions>

<specifics>
## Specific Ideas

- "Feels like a $10k/yr enterprise tool" — reference: Linear, Vercel, Retool dashboards. Dense information, not lots of whitespace. Data-forward.
- Lab sessions are long — `zinc-950` not pure black to reduce eye strain
- Electric blue accent (`blue-500`) used consistently for interactive elements — researchers will pattern-match quickly
- Sidebar should feel like Notion or Linear's left panel — section headers, icon + label items, active pill

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — greenfield project. This phase creates the base components all others extend.

### Established Patterns
- None yet — this phase establishes them. Key patterns to establish:
  - `lib/prisma.ts` singleton (all DB access)
  - `lib/ai-service.ts` abstraction (all AI calls)
  - `app/layout.tsx` as root shell (ClerkProvider + ThemeProvider + QueryProvider)
  - Server Components for data fetching, Client Components for interactivity

### Integration Points
- Every future phase imports from `lib/prisma.ts` — schema must be complete
- Every future phase uses `app/(dashboard)/layout.tsx` for the sidebar shell
- Phase 2 (Cycle Testing) will add routes under `app/(dashboard)/cycle-tests/`
- Phase 3 will add `app/(dashboard)/experiments/`
- Phase 4 will add `app/(dashboard)/manufacturing/`

</code_context>

<deferred>
## Deferred Ideas

- RBAC roles (admin/researcher/viewer) — v2, deferred by user decision
- User profile page — not needed until RBAC lands
- Notification system — out of scope
- Custom Clerk sign-in page styling — can do later if the hosted page feels off-brand

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-01*
