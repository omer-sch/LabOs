# Neware Pro

## What This Is

Neware Pro is a battery manufacturing and research management platform for lab teams of 5–20 PhD-level engineers and researchers. It centralizes battery cycle testing data, research experiment tracking, manufacturing production workflows, and team collaboration into a single premium, dark-themed tool. It is a complete rebuild of an existing system that accumulated two years of domain knowledge, restarted clean due to tech debt.

## Core Value

Researchers can import cycle data, detect anomalies instantly, and trace any cell's failure back to the exact slurry mix, coating run, and assembly step that produced it.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Battery Cycle Testing**
- [ ] User can import cycle data from Excel/CSV exports (Neware BTS format)
- [ ] User can view capacity fade, voltage, coulombic efficiency, and dQ/dV charts per test
- [ ] AI detects anomalies in cycle data and surfaces alerts with cycle reference
- [ ] AI generates automated text summaries of completed test runs
- [ ] AI identifies patterns across multiple experiments/datasets

**Research Experiment Tracking**
- [ ] User can create research experiments with protocol, conditions, materials, and results
- [ ] User can link cycle test data files to experiments
- [ ] Research experiments are a separate module from production projects
- [ ] User can browse and filter experiments by material, protocol, date, researcher

**Manufacturing / Production**
- [ ] User can create production projects of type "full" (slurry → electrode → assembly → battery test) or "electrode-only" (slurry → electrode)
- [ ] Full production project tracks: electrode sources (internal/Chinese/inventory for anode + cathode), cell dimensions, number of cells and interfaces, load per electrode (mg/cm²), electrolyte amount, separator, and linked protocols per electrode type
- [ ] Slurry step tracks: material weights (NMP, PVDF, active material, carbon additives), mixing steps with start/end times, viscosity measurements, grindometer checks, overnight mixing flag, and suitability-for-coating sign-off
- [ ] Electrode step tracks: coating parameters (speed, temperature, gap), load measurements per side (A/B), thickness, viscosity before coating, standard deviation, and visual inspection at each stage
- [ ] Workflow progress tracked via boolean step flags: anodeSlurryDone, cathodeSlurryDone, electrodeAnodeDone, electrodeCathodeDone, assemblyDone, cellsDone
- [ ] Each step records operator, timestamps, visual inspection results, and measurements
- [ ] Full material traceability: materials → batch → cell → test data

**Team Collaboration**
- [ ] Role-based access control: admin, researcher, viewer
- [ ] Admin can manage users and roles
- [ ] All records display creator and last-modified-by
- [ ] Researcher can create/edit their own records; viewer is read-only

**Platform / UI**
- [ ] Dark-theme premium UI — feels like a $10k/yr enterprise tool
- [ ] Smooth animations via Framer Motion
- [ ] Professional data visualization (Recharts/D3)
- [ ] Runs entirely locally (no cloud dependency for MVP)
- [ ] Auth via Clerk

### Out of Scope

- Binary .nda/.ndax file parsing — Excel/CSV import sufficient for v1; native binary format is future
- Neware BTS API integration — possible future connection, not v1
- Mobile app — web-first
- Real-time notifications — not required for local-first MVP
- Cloud hosting / multi-tenant — local deployment only for v1

## Context

- **Old system**: 2 years of domain knowledge encoded in a system that became too coupled to safely iterate on. The rebuild carries forward the experiment/protocol structure and the manufacturing workflow model.
- **Data source**: Neware BTS (Battery Testing System) devices export test cycle data; Excel/CSV is the practical import format for v1. Raw binary (.nda) files also exist in the lab — handled later.
- **Users**: PhD-level battery researchers and engineers, technically sophisticated. They expect precision, not hand-holding. Terminology matters (dQ/dV, coulombic efficiency, C-rate, grindometer, PVDF).
- **AI layer**: Claude API for anomaly detection (priority 1), automated summaries (priority 2), and cross-dataset pattern recognition (priority 3).
- **Manufacturing workflow**: Highly specialized. Two project types — "full" (full cell fabrication pipeline) and "electrode-only" (stops before assembly). Detailed step-level tracking with operator accountability.

## Constraints

- **Tech Stack**: Next.js 15 App Router, TypeScript, Shadcn/ui, Tailwind CSS, Framer Motion, Supabase + PostgreSQL, Prisma ORM, Clerk (auth), Claude API — all already decided
- **Deployment**: Local-first for MVP — no cloud infra dependencies
- **Data Import**: Excel/CSV only for v1; no .nda binary parsing
- **Team Size**: Designed for 5–20 users on a shared local instance

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Complete rebuild vs. iteration | Tech debt made the old system too costly to extend safely | — Pending |
| Excel/CSV import (not binary .nda) | Simplifies v1 data ingestion; researchers already export from BTS software | — Pending |
| Supabase + Prisma (not pure Firebase) | Type-safe ORM, SQL querying power for complex cycle data analysis | — Pending |
| Local-first MVP | Removes cloud complexity and cost while team validates the new system | — Pending |
| Two production project types (full / electrode-only) | Matches actual lab workflow — some runs stop at electrode stage | — Pending |
| Research and production as separate modules | Different mental models — research is scientific, production is operational | — Pending |

---
*Last updated: 2026-03-01 after initialization*
