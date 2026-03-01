# Pitfalls Research

**Domain:** Battery Research & Manufacturing Management Platform (Scientific LIMS)
**Researched:** 2026-03-01
**Confidence:** MEDIUM — All external research tools (WebSearch, WebFetch, Brave, Bash) were unavailable during this session. Findings draw on training knowledge of LIMS systems, battery testing workflows, Prisma/Supabase/Next.js 15/Claude API patterns, and scientific software post-mortems. Confidence is MEDIUM for domain-specific pitfalls (well-documented community problems) and LOW for any specific version behaviors that may have changed since August 2025.

---

## Critical Pitfalls

### Pitfall 1: Rigid Measurement Schema — The Original Sin of Lab Software

**What goes wrong:**
The data model for cycle test results, slurry measurements, and electrode parameters gets hardcoded as fixed columns. When researchers change their protocol (new measurement type, extra viscosity check, additional additive in slurry), there's no way to capture it without a schema migration. The system either silently drops the new data or forces a code deploy just to add a field. This is the most common reason LIMS systems get rewritten after 1-2 years — which is exactly what happened to the old system this project replaces.

**Why it happens:**
Developers model the first set of measurements they see and assume protocols are stable. Battery R&D protocols are not stable — they evolve with every research cycle. Engineers add new characterization steps, change C-rates, add new materials. A rigid relational schema cannot absorb this without migrations.

**How to avoid:**
Use a hybrid schema: fixed columns for core identifiers and well-understood workflow steps (operator, timestamps, booleans for step completion), and a JSONB `metadata` column on every measurement-heavy table for flexible, schema-free additional data. This is the proven PostgreSQL pattern for lab software. Do NOT use pure EAV (Entity-Attribute-Value) tables — they destroy query performance. JSONB with GIN indexes gives you both flexibility and queryability.

```sql
-- Example for slurry step table
CREATE TABLE slurry_steps (
  id          UUID PRIMARY KEY,
  project_id  UUID NOT NULL REFERENCES production_projects(id),
  operator    TEXT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL,
  -- Fixed, always-present fields
  nmp_weight_g        NUMERIC,
  pvdf_weight_g       NUMERIC,
  active_material_g   NUMERIC,
  suitability_sign_off BOOLEAN,
  -- Flexible capture for protocol evolution
  metadata    JSONB DEFAULT '{}'
);
CREATE INDEX slurry_steps_metadata_gin ON slurry_steps USING GIN (metadata);
```

**Warning signs:**
- PR reviews where a new measurement requires a migration + code change + UI change simultaneously
- Researchers saying "I had to leave that field blank because the form doesn't have it"
- `ALTER TABLE ADD COLUMN` showing up more than once per sprint

**Phase to address:** Data model / database foundation phase (the very first phase). Cannot be retrofitted without a full migration.

---

### Pitfall 2: Cycle Data Volume — Treating Time-Series Like CRUD Records

**What goes wrong:**
Cycle test data is time-series in nature. A single multi-hundred-cycle test at 0.1C can generate tens of thousands of data points (voltage, current, capacity, time at each measurement interval). Storing this naively as individual rows in a standard relational table, then querying all points for a chart render, produces query times measured in seconds rather than milliseconds. At 10 tests this is invisible. At 100 tests with multiple chart views open, the UI becomes unusable.

**Why it happens:**
Developers prototype with small CSV files (100-200 rows), see fast queries, and ship. Real Neware exports from long-duration tests contain 50,000–500,000 data points per test file. The problem only manifests when real lab data is loaded.

**How to avoid:**
- Store raw cycle data as a compressed JSONB blob or binary attachment (Supabase Storage), NOT as individual rows. Only extract and store aggregated metrics (capacity per cycle, coulombic efficiency per cycle, average voltage) as queryable rows.
- For chart rendering: pre-aggregate at import time. Store a `cycle_summary` table with one row per cycle number (not one row per measurement point).
- For dQ/dV analysis (which requires raw point data): compute and cache the derivative at import time, store as a JSON array on the cycle record, serve that cached array to the chart.
- Never run dQ/dV computation on-demand from raw data at render time.

**Warning signs:**
- Chart page load > 500ms with a single test loaded
- Database query plan showing sequential scan on cycle_data table
- Developers adding `LIMIT 1000` to "fix" performance rather than redesigning the model

**Phase to address:** Data import pipeline phase. The import step is where aggregation must happen. Changing this after the fact requires re-importing all historical data.

---

### Pitfall 3: AI Integration Sprawl — Treating Claude as a Magic Black Box

**What goes wrong:**
The team integrates Claude API for anomaly detection and summaries by passing raw data to the API in an ad-hoc way — different prompt formats per feature, no structured output validation, no cost controls, no caching. Result: unpredictable AI outputs that break the UI, token costs that spike unexpectedly, and AI calls that happen synchronously during page loads (making the app feel slow).

**Why it happens:**
Claude API is easy to call. The first integration works. Developers copy-paste the pattern for the next feature without building a proper AI abstraction layer. By feature 3, there are 5 different prompt formats, no shared error handling, and outputs are parsed with ad-hoc string matching that breaks when Claude's phrasing changes.

**How to avoid:**
- Build an `ai-service` abstraction layer before the first AI feature ships. All Claude API calls go through it.
- Use Claude's structured output / JSON mode for anomaly detection. Define a TypeScript schema for the expected response, validate with Zod, never parse free text.
- AI calls must be async and non-blocking. Surface results via a job/status pattern: trigger analysis → store result when ready → poll or refresh. Never await Claude in a Next.js API route that the user is waiting on.
- Set per-request token budgets. Anomaly detection on a 500-cycle dataset should not send all 500 cycles worth of raw data; send aggregated metrics only.
- Cache AI results. Anomaly detection on a completed test should run once at completion, store the result, and serve the cached result on subsequent views.

**Warning signs:**
- `fetch('https://api.anthropic.com/...')` appearing in more than one place in the codebase
- AI call errors causing 500s on the main page
- No TypeScript type for Claude response shapes
- Token costs growing faster than feature count

**Phase to address:** AI features phase, but the abstraction layer scaffolding must be built in the foundation phase — before the first AI call is written.

---

### Pitfall 4: Traceability as an Afterthought — The Cell Lineage Problem

**What goes wrong:**
The core value proposition of this system is: "trace any cell's failure back to the exact slurry mix, coating run, and assembly step that produced it." This requires a complete lineage graph from materials → slurry batch → electrode → cell → test. If this is not modeled as explicit foreign key relationships from the start, teams patch it later with text fields ("which batch was this from?" filled in manually), which breaks the automated traceability.

**Why it happens:**
Developers build each module (slurry, electrode, assembly, test) independently and link them later. The links become loose references (string IDs, manual lookup) rather than enforced relational constraints. Data entry errors break the lineage. One researcher typos a batch number and a cell becomes untraceable.

**How to avoid:**
- Design the entity relationship diagram for the full traceability chain before writing a single table. `material_batches → slurry_steps → electrode_runs → assembly_steps → cells → cycle_tests`. Every foreign key must be enforced at the database level (not just application level).
- The UI must enforce this chain — you cannot create an electrode run without selecting a slurry step. No free-text "which slurry did you use?" fields.
- When a production project is created, pre-allocate the step records so the chain exists before data is entered. Do not create step records on-demand.

**Warning signs:**
- Any table with a `slurry_batch_name TEXT` column instead of `slurry_step_id UUID REFERENCES slurry_steps(id)`
- UI allows saving an electrode step without a linked slurry step
- "Traceability report" requires manual data reconciliation

**Phase to address:** Data model phase (same as Pitfall 1). Must be correct from day one.

---

### Pitfall 5: Data Integrity During Import — CSV as Ground Truth

**What goes wrong:**
Neware BTS CSV exports have quirks: column names change between BTS software versions, numeric values use different decimal separators depending on locale settings, some cycles have empty rows (failed measurement), voltage values occasionally contain "Error" strings. An import pipeline that trusts CSV structure will silently import corrupt data — wrong capacity values, NaN in coulombic efficiency — and researchers will not discover the corruption until weeks later when they see anomalous charts.

**Why it happens:**
The happy-path CSV (clean lab export from one BTS machine) works perfectly. Edge cases only appear with files from different machines, different BTS versions, or exports after a power interruption.

**How to avoid:**
- Parse → Validate → Transform → Store. Never skip validation.
- At validation: check that voltage ranges are physically plausible (e.g., for Li-ion: 2.5V–4.5V), capacity values are positive and within expected range for cell format, coulombic efficiency is between 0.5 and 1.05 (anything outside is a data quality flag, not auto-reject).
- Reject rows with non-numeric values in numeric columns; log them; surface a validation report to the user before confirming the import.
- Store the raw import file in Supabase Storage alongside the parsed results, so the original can always be re-parsed if the parser is fixed.
- Version the import parser — `parser_version: "1.2"` stored on each import record — so you know which records were parsed with which logic.

**Warning signs:**
- Import always succeeds regardless of file content
- No import validation report shown to user
- Coulombic efficiency values above 1.05 in production data with no flag

**Phase to address:** Cycle data import phase. The validation layer is not optional and is expensive to add retroactively.

---

### Pitfall 6: Prisma in Next.js App Router — Connection Pool Exhaustion

**What goes wrong:**
In Next.js 15 App Router, Server Components and Route Handlers can instantiate a new Prisma Client on every request during development (due to HMR) and in production (due to serverless-style execution model even in local deployments). Each PrismaClient instance holds a connection pool. With 10 concurrent requests you get 10 pools × N connections = exhausted Postgres connection limit. The app starts returning "too many clients" errors under moderate load.

**Why it happens:**
The official Prisma "getting started" guide shows `new PrismaClient()` without the singleton pattern. Developers follow it, it works locally with one user, and fails under load.

**How to avoid:**
Use the singleton pattern for Prisma Client — one global instance, reused across requests:

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

Additionally, with Supabase: use the connection pooler (PgBouncer on port 6543) for transactional pooling, not the direct connection (port 5432), for all Prisma queries. The direct connection is only for migrations.

**Warning signs:**
- "prepared statement already exists" errors in logs
- "too many clients" Postgres errors
- App works fine with 1-2 users but degrades with 5+

**Phase to address:** Foundation/infrastructure phase. The singleton must be established before any database queries are written.

---

### Pitfall 7: Role-Based Access Control Inconsistency — Client-Side Only Enforcement

**What goes wrong:**
The app checks user roles in the UI (`if (role === 'viewer') hide edit button`) but does not enforce the same rules server-side. A technically sophisticated user (this system's users are PhD engineers) can call the API directly with their auth token and write data they should only be able to read. In a lab context, unauthorized edits to experimental records can corrupt research data — which may be published or used for patent filings.

**Why it happens:**
Client-side checks are easy to implement and immediately visible. Server-side checks require more boilerplate. Developers implement client-side first and intend to "add server-side later" — which rarely happens.

**How to avoid:**
- Implement server-side authorization in every Next.js Route Handler and Server Action. The auth check is not optional.
- Use a middleware pattern: create a `requireRole(role)` helper that checks the Clerk session server-side, called at the top of every mutation handler.
- Supabase RLS (Row Level Security) provides a secondary layer: policies at the database level enforce access rules even if application code is wrong. Enable RLS on all tables from the start.
- Never trust `role` from the client request body — always derive it from the server-side Clerk session.

**Warning signs:**
- Edit buttons hidden in UI but no server-side check in the corresponding Route Handler
- `role` passed as a request body parameter to API routes
- RLS disabled on any table with sensitive data

**Phase to address:** Auth and RBAC phase (early). Must precede any feature that has role-differentiated behavior.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoded column list for measurements (no JSONB flexibility) | Simpler queries, type safety | Schema migrations required for every new measurement type; causes rewrites | Never — use JSONB metadata from day one |
| Storing raw cycle data rows per measurement point | Simple mental model, easy queries | Query time collapses at >10K rows per test; charts become unusable | Never — pre-aggregate at import time |
| Ad-hoc Claude API calls without a service layer | Fast to ship first AI feature | Unpredictable costs, inconsistent output handling, difficult to add caching | Only for a single throw-away prototype; never in production code |
| Skipping import validation ("we trust our CSV files") | Faster import shipping | Silent data corruption discovered weeks later; requires re-import with no audit trail | Never — validation is non-negotiable for scientific data |
| `new PrismaClient()` per request | Simpler code | Connection pool exhaustion under any multi-user load | Never in production |
| Client-only RBAC | Fast UI development | Data integrity violations by any user with a REST client | Never — server-side enforcement is mandatory |
| Linking steps via text/name fields instead of foreign keys | Faster initial development | Traceability breaks on any typo; cannot do reliable JOIN queries | Never for the production chain; acceptable for free-text notes |
| Single monolithic experiment record with all fields | Simple to build initially | Fields not applicable to this experiment type are always null; researchers confused | Acceptable for MVP if experiment types are limited; add polymorphism when types diverge |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase + Prisma | Using Prisma with Supabase's direct connection URL for all queries | Use the pooler URL (`?pgbouncer=true&connection_limit=1`) for Prisma queries; direct URL only for `prisma migrate` |
| Supabase RLS + Prisma | RLS policies bypass when Prisma uses the service role key | Prisma should use the anon key with RLS, or service key with explicit policy-aware queries. Never use service key for user-context reads |
| Clerk + Next.js 15 App Router | Reading auth state in a Server Component without `await auth()` | In App Router, Clerk auth is async: `const { userId } = await auth()` — missing the await returns stale/null state |
| Clerk + Supabase | Clerk userId not matching Supabase auth.users — two identity systems running in parallel | Pick one as the identity source of truth. For Supabase + Clerk: use Clerk as identity, store `clerk_user_id TEXT` on your own `users` table, do not use Supabase Auth at all |
| Claude API + large datasets | Sending full raw cycle data (50K+ data points) in a single prompt | Pre-aggregate: send cycle-level summaries (capacity, CE, voltage at each cycle) not point-level data. Token costs and context limits make raw data impractical |
| Claude API structured output | Parsing Claude's text response with regex/string matching | Use the `response_format` JSON mode (or XML tags + Zod parsing) and define a strict TypeScript type. Claude's phrasing changes; regex patterns break silently |
| Neware CSV import | Assuming consistent column headers across BTS software versions | Detect format version from file header/metadata, map to a normalized schema per version. BTS 5.x and 7.x have different column names for the same data |
| Supabase Storage + large files | Storing large CSV/Excel files in the database as bytea blobs | Use Supabase Storage (S3-compatible) for raw import files; store only the storage path in the database |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Per-measurement-point rows in cycle_data table | Chart load > 3s; DB CPU spikes on any chart view | Pre-aggregate at import: one row per cycle in `cycle_summaries` table | ~5 tests loaded (~50K rows) |
| N+1 queries in experiment list view | List page slow; DB shows hundreds of queries per page load | Use Prisma `include` or `select` to eager-load related data in a single query | ~20 experiments displayed |
| dQ/dV computed on demand from raw data | dQ/dV chart times out; server returns 504 | Compute and cache dQ/dV array at import time; store as JSONB on the cycle record | Any test with >1000 points per cycle |
| Unindexed filter columns | Filter/search by material or researcher takes seconds | Add database indexes on every column used in WHERE clauses (operator, material_name, created_at, project_id) | ~500 records |
| All Recharts data loaded into browser memory | Browser tab freezes when viewing multi-test comparison | Downsample for visualization: send max 500 points to the chart, use the pre-computed summaries for overview | >10 tests in comparison view |
| Claude API called synchronously during page load | Page load hangs for 3-8 seconds waiting for AI | All Claude calls must be fire-and-forget (queue job → poll for result). Never await Claude in a render path | First real use |
| Prisma schema with no explicit indexes | Queries work fast in dev (small dataset), slow in staging | Add `@@index` directives in Prisma schema for all FK columns and filter columns from day one | ~1000 records per table |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Research data readable by all users in a shared local instance | Researcher A can read Researcher B's unpublished experimental results, potential IP leakage | RLS policies scoped to project membership; viewer role cannot see experiments they are not assigned to |
| Operator name stored as free text (no link to user account) | Anyone can claim to be any operator; audit trail is meaningless for accountability | `operator_id` must be a FK to `users` table, populated from Clerk session — never from a form field |
| Import file accepted without size/type validation | Malicious file upload could exhaust server storage or trigger parser bugs | Validate MIME type + file extension + size limit (e.g., 50MB max) before processing |
| AI-generated summaries cached and served without regeneration controls | If AI output is wrong/hallucinated, there is no mechanism to invalidate and regenerate | Store AI results with a `generated_at` timestamp and a `regenerate` button; never treat AI output as permanent |
| Service role Supabase key exposed in client-side code | Full database bypass — any client can read/write anything | Service role key must only exist in server-side environment variables, never in `NEXT_PUBLIC_` vars |
| No audit log for data modifications | Cannot reconstruct who changed experimental results, critical for scientific integrity and patent defensibility | Every mutation records `created_by`, `updated_by`, `created_at`, `updated_at`; consider append-only audit log for critical records |

---

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Generic error messages on import failure ("Import failed") | PhD researcher cannot diagnose what's wrong with their CSV; re-exports and tries again blindly | Show row-level validation errors: "Row 47: voltage column contains 'Error' string. Row 203: capacity value -0.003 is below threshold." |
| Terminology mismatch (using developer terms vs. lab terms) | Researchers distrust the system; fear it's incorrect | Use domain terms throughout: "coulombic efficiency" not "CE ratio", "dQ/dV" not "differential capacity", "C-rate" not "rate", "grindometer" not "grind test" |
| Forcing completion of all workflow steps before saving | Lab is interrupted; researcher loses partially entered data | Auto-save draft state at every step; a step can be "in progress" or "complete", never lost |
| No indication that AI analysis is running | Researcher navigates away thinking nothing is happening; comes back to no results | Show clear async status: "AI analysis queued → running → complete (with link to results)" |
| Hiding the raw data behind AI summaries | Researchers do not trust AI summaries alone; they want to verify the underlying data | AI summary is a supplement, not a replacement. Always provide direct access to source data, charts, and the reasoning behind anomaly flags |
| Flat list of experiments with no filtering | After 6 months, experiment list has 200+ entries; unusable | Filtering by material, protocol, researcher, date range, and result outcome is a day-one requirement, not a later enhancement |
| Blocking UI during file import | Large CSV import takes 10-30 seconds; user sees a frozen spinner | Upload file → immediate acknowledgment → background processing → notification when complete |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Cycle Data Import:** Appears to work (happy path CSV imports successfully) — verify that malformed rows, missing columns, locale-specific number formats, and multi-sheet Excel files all produce clear error messages, not silent failures or crashes.
- [ ] **Manufacturing Workflow:** Each step appears to save — verify that the FK chain is enforced (electrode step cannot be saved without a linked slurry step ID), not just that the form submits.
- [ ] **AI Anomaly Detection:** AI returns a result — verify that the result is structured/typed (not a raw string), validated against a Zod schema, and that failures (API timeout, malformed response) are surfaced to the user rather than silently swallowed.
- [ ] **Role-Based Access:** Edit buttons are hidden for viewer role — verify that the corresponding server Route Handlers return 403 if a viewer token is used to call them directly.
- [ ] **Traceability Report:** The UI shows a lineage chain — verify that every link in the chain is a real FK relationship, not a text string lookup, and that deleting any upstream record is prevented by FK constraints.
- [ ] **dQ/dV Chart:** Chart renders — verify it uses pre-computed/cached data and does not recompute from raw points on every render. Load time should be < 300ms.
- [ ] **Data Export:** Users can export data — verify that the export includes all metadata (operator, timestamps, protocol version) not just raw measurements.
- [ ] **Experiment Filtering:** Filter UI exists — verify that filters combine correctly (AND logic for multiple filters) and that results are paginated (not all records loaded into memory).

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Rigid measurement schema (no JSONB) | HIGH | Add JSONB `metadata` column to affected tables; migrate existing data; update import pipeline and UI; zero downtime if done carefully with Prisma expand-contract pattern |
| Per-point row storage for cycle data | HIGH | Re-import all historical data through updated pipeline; requires users to re-validate imports; plan for 1-2 day migration window |
| AI integration without service layer | MEDIUM | Extract all Claude calls into a single service module; standardize response types; add caching layer. 2-3 days of refactoring if caught early |
| Connection pool exhaustion (Prisma) | LOW | Implement singleton pattern and switch to pooler URL; deploy; immediate resolution |
| Client-only RBAC | MEDIUM | Add server-side checks to every Route Handler; enable RLS policies in Supabase; can be done incrementally per feature |
| Text-based step linking (no FK) | HIGH | Requires data migration to create FK relationships; high risk of data loss for records where the text didn't match; avoid at all costs |
| Silent import validation failures | MEDIUM | Add validation layer to import pipeline; mark previously imported records as "unvalidated"; prompt researchers to re-verify |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Rigid measurement schema | Phase 1: Database foundation | Run schema review checklist: every measurement table has `metadata JSONB` column |
| Cycle data volume / row-per-point | Phase 2: Data import pipeline | Import a real Neware CSV with 10K+ rows; verify query time < 200ms; verify `cycle_summaries` table is populated |
| AI integration sprawl | Phase 1: Foundation (scaffold AI service) then Phase X: AI features | Grep codebase for direct `fetch('api.anthropic.com')` — zero results outside `lib/ai-service.ts` |
| Traceability chain gaps | Phase 1: Database foundation | Attempt to create an electrode record without a slurry step ID; should fail at DB constraint level |
| CSV import data integrity | Phase 2: Data import pipeline | Run import with deliberately malformed CSV rows; verify row-level error report is returned, not a 500 |
| Prisma connection pool exhaustion | Phase 1: Foundation | Run 20 concurrent requests; monitor Postgres connection count; should stay bounded |
| Client-only RBAC | Phase 3: Auth and collaboration | Call every mutation Route Handler with a viewer token directly via curl; all should return 403 |
| dQ/dV on-demand computation | Phase 2: Data import pipeline | Load dQ/dV chart for a 500-cycle test; load time must be < 300ms |

---

## Sources

- Training knowledge: Prisma Next.js singleton pattern — documented in Prisma official guides and widely discussed in the community (MEDIUM confidence; verify current best practice against Prisma docs at implementation time)
- Training knowledge: Supabase + Prisma connection pooler setup — documented in Supabase official guides (MEDIUM confidence)
- Training knowledge: LIMS rewrite patterns — drawn from scientific software engineering community post-mortems and LIMS vendor documentation; consistent pattern across multiple independent sources (MEDIUM confidence)
- Training knowledge: Battery testing data characteristics — drawn from Neware BTS documentation patterns and electrochemistry data management literature (MEDIUM confidence for data volume estimates; LOW confidence for exact BTS version differences)
- Training knowledge: Clerk + Next.js 15 async auth pattern — `await auth()` requirement introduced with Clerk v5 async migration (MEDIUM confidence; verify against Clerk docs at implementation time)
- Training knowledge: Claude API structured output and token budget practices — based on Anthropic documentation patterns known at training time (MEDIUM confidence; verify current Claude API capabilities at implementation time)
- Training knowledge: JSONB + GIN index pattern for flexible lab data — well-established PostgreSQL pattern, used in production LIMS systems (HIGH confidence)

**Note:** All external research tools (WebSearch, WebFetch, Bash/Brave) were denied during this session. Verify any specific version numbers, API signatures, or library-specific patterns against official documentation before implementation.

---
*Pitfalls research for: Battery Research & Manufacturing Management Platform (Neware Pro)*
*Researched: 2026-03-01*
