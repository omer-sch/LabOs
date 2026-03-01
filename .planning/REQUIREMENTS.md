# Requirements: Neware Pro

**Defined:** 2026-03-01
**Core Value:** Researchers can import cycle data, detect anomalies instantly, and trace any cell's failure back to the exact slurry mix, coating run, and assembly step that produced it.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Battery Cycle Testing

- [ ] **CYCLE-01**: User can import cycle data from Excel/CSV exports (Neware BTS format)
- [ ] **CYCLE-02**: User can view capacity fade chart (mAh vs. cycle number) for a test
- [ ] **CYCLE-03**: User can view voltage vs. capacity chart (charge/discharge curves) per cycle
- [ ] **CYCLE-04**: User can view coulombic efficiency chart (CE vs. cycle number)
- [ ] **CYCLE-05**: User can view dQ/dV differential capacity chart with numerical differentiation
- [ ] **CYCLE-06**: User can view per-cycle data table with export to CSV
- [ ] **CYCLE-07**: User can view test metadata (date, device, operator, cell ID) alongside charts
- [ ] **CYCLE-08**: User can select cycle range and zoom on all charts
- [ ] **CYCLE-09**: User can overlay multiple tests on a single comparison chart
- [ ] **CYCLE-10**: User can export any chart as a PNG image

### Research Experiment Tracking

- [ ] **EXPR-01**: User can create, edit, and delete experiment records with protocol, conditions, materials, and results fields
- [ ] **EXPR-02**: User can filter and search experiments by material, protocol, date, and researcher
- [ ] **EXPR-03**: User can link one or more cycle tests to an experiment
- [ ] **EXPR-04**: User can set and update experiment status (planned / in-progress / completed / abandoned)
- [ ] **EXPR-05**: User can add rich-text notes / journal entries to an experiment

### Manufacturing / Production

- [ ] **MFGR-01**: User can create production projects of type "full" (slurry → electrode → assembly → battery test) or "electrode-only" (slurry → electrode only)
- [ ] **MFGR-02**: User can record project-level details: electrode sources (internal/Chinese/inventory for anode and cathode), cell dimensions (length, width), number of cells and interfaces, load per electrode (mg/cm²), electrolyte amount, separator, and linked protocols per electrode type
- [ ] **MFGR-03**: User can record slurry step data: material weights (NMP, PVDF, active material, carbon additives), mixing steps with start/end times, viscosity measurements, grindometer checks, overnight mixing flag, and suitability-for-coating sign-off
- [ ] **MFGR-04**: User can record electrode step data: coating parameters (speed, temperature, gap), load measurements per side (A/B), thickness, viscosity before coating, standard deviation, and visual inspection at each stage
- [ ] **MFGR-05**: User can mark each workflow step complete (anodeSlurryDone, cathodeSlurryDone, electrodeAnodeDone, electrodeCathodeDone, assemblyDone, cellsDone) with operator name and timestamp recorded per flag
- [ ] **MFGR-06**: User can track all material inputs with weights, batch IDs, and sources
- [ ] **MFGR-07**: User can record suitability sign-offs and visual inspection results at each manufacturing step
- [ ] **MFGR-08**: User can link a completed production project to cycle test data (closes traceability loop: materials → batch → cell → test)

### Authentication

- [ ] **AUTH-01**: User can sign in and sign out via Clerk (email/password or social)
- [ ] **AUTH-02**: User session persists across browser refresh

### Platform

- [ ] **PLAT-01**: Application runs entirely on localhost with no cloud dependencies
- [ ] **PLAT-02**: Dark-theme UI using Shadcn/ui with Framer Motion animations throughout
- [ ] **PLAT-03**: All data visualization rendered with Recharts and/or D3

## v2 Requirements

Deferred — add after v1 is validated with the team.

### AI Analysis

- **AI-01**: AI detects anomalies in cycle data and surfaces alerts with cycle reference and description
- **AI-02**: AI generates plain-English automated summaries of completed test runs
- **AI-03**: AI identifies patterns across multiple experiments and datasets (requires data corpus of 50+ experiments)

### Access Control

- **RBAC-01**: Role-based access control with three roles: admin, researcher, viewer
- **RBAC-02**: Admin can invite users, deactivate accounts, and change roles
- **RBAC-03**: Researcher can create and edit their own records only
- **RBAC-04**: Viewer has read-only access to all records

### Protocol Library

- **PROTO-01**: User can save protocols as reusable templates and apply them to new experiments

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Native .nda/.ndax binary parsing | Proprietary format changes across firmware versions; maintenance risk too high for v1 |
| Neware BTS API integration | Infrastructure complexity; Excel/CSV is sufficient for v1 |
| Real-time cycler connection / live data streaming | Requires hardware-level integration; not a local-first MVP feature |
| Mobile app | Web-first; responsive web sufficient for lab tablet use |
| Cloud hosting / multi-tenant | Local-first validates the core before adding infra complexity |
| Custom report builder | Researchers export to Excel anyway; build excellent fixed charts instead |
| ELN replacement (Benchling, Labarchives integration) | Different product category; out of scope |
| Statistical hypothesis testing (t-test, ANOVA) | Too many edge cases; researchers use R/Python for this |
| Federated / inter-lab data sharing | Unsolved at industry level; premature for v1 |
| Notification / alert system (email, Slack, SMS) | In-person lab context; add later if needed |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| PLAT-01 | Phase 1 | Pending |
| PLAT-02 | Phase 1 | Pending |
| PLAT-03 | Phase 1 | Pending |
| CYCLE-01 | Phase 2 | Pending |
| CYCLE-02 | Phase 2 | Pending |
| CYCLE-03 | Phase 2 | Pending |
| CYCLE-04 | Phase 2 | Pending |
| CYCLE-05 | Phase 2 | Pending |
| CYCLE-06 | Phase 2 | Pending |
| CYCLE-07 | Phase 2 | Pending |
| CYCLE-08 | Phase 2 | Pending |
| CYCLE-09 | Phase 2 | Pending |
| CYCLE-10 | Phase 2 | Pending |
| EXPR-01 | Phase 3 | Pending |
| EXPR-02 | Phase 3 | Pending |
| EXPR-03 | Phase 3 | Pending |
| EXPR-04 | Phase 3 | Pending |
| EXPR-05 | Phase 3 | Pending |
| MFGR-01 | Phase 4 | Pending |
| MFGR-02 | Phase 4 | Pending |
| MFGR-03 | Phase 4 | Pending |
| MFGR-04 | Phase 4 | Pending |
| MFGR-05 | Phase 4 | Pending |
| MFGR-06 | Phase 4 | Pending |
| MFGR-07 | Phase 4 | Pending |
| MFGR-08 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-01*
*Last updated: 2026-03-01 after initial definition*
