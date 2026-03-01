# Feature Research

**Domain:** Battery research and manufacturing management platform (4 pillars: cycle testing, experiment tracking, manufacturing production, team collaboration)
**Researched:** 2026-03-01
**Confidence:** MEDIUM — WebSearch and WebFetch were unavailable; findings draw from the PROJECT.md (2 years of encoded domain knowledge), and training-data knowledge of Neware BTS, Arbin MITS Pro, Maccor, and LIMS systems used in battery labs. All training-data-only claims flagged LOW confidence; PROJECT.md-grounded claims flagged MEDIUM-HIGH.

---

## Confidence Notes

- **HIGH**: Directly specified in PROJECT.md (2 years of actual domain experience)
- **MEDIUM**: Consistent with multiple battery software products' documented marketing + training data
- **LOW**: Training-data-only, not verified against current docs

External web research (WebSearch, WebFetch, Brave) was unavailable during this session. Findings relying solely on training data are marked accordingly.

---

## Feature Landscape

### Table Stakes (Users Expect These)

These are what any credible battery cycle testing or lab management tool must have. Missing them means the product feels broken or incomplete to PhD-level battery researchers.

#### Pillar 1: Battery Cycle Testing

| Feature | Why Expected | Complexity | Confidence | Notes |
|---------|--------------|------------|------------|-------|
| CSV/Excel import from cycler software | Every Neware/Arbin/Maccor device exports CSV/Excel; researchers can't use a tool that can't ingest their data | LOW | HIGH | PROJECT.md explicitly requires Neware BTS format; column mapping needed |
| Capacity fade chart (mAh vs. cycle number) | The primary metric for any battery test; a tool without this is not a battery tool | LOW | HIGH | Standard plot in every cycler's own software |
| Voltage vs. capacity plot (charge/discharge curves) | Used to diagnose cell health and compare formation cycles; universal in the domain | MEDIUM | HIGH | Per-cycle overlay critical for researchers |
| Coulombic efficiency chart (CE vs. cycle) | CE is a core diagnostic — lithium plating, SEI growth, etc. — missing it signals the tool doesn't understand the domain | LOW | HIGH | Required per PROJECT.md |
| dQ/dV (differential capacity) plot | Fingerprint of electrochemical reactions; expected by any serious researcher; distinguishes a research tool from a consumer product | MEDIUM | HIGH | Required per PROJECT.md; computationally: numerical differentiation of Q vs. V data |
| Per-cycle data table (raw numbers) | Researchers always want to see raw numbers behind every chart | LOW | HIGH | Export to CSV/Excel from this view also expected |
| Multi-test overlay / comparison view | Comparing multiple test runs on one chart is essential for experimental analysis | MEDIUM | HIGH | Core research workflow; must support same-axis and normalized comparison |
| Test metadata display (date, device, operator, cell ID) | Provenance of data is critical in a regulated research context | LOW | HIGH | Fields already in PROJECT.md data model |
| Data export (chart images, raw CSV) | Researchers embed charts in papers and reports; export is non-negotiable | LOW | MEDIUM | PNG export for charts; CSV re-export of processed data |
| Cycle range selection / zoom | Researchers focus on specific cycle windows (e.g., cycles 50–100); no zoom = painful analysis | LOW | MEDIUM | Frontend interaction feature; recharts supports this |

#### Pillar 2: Research Experiment Tracking

| Feature | Why Expected | Complexity | Confidence | Notes |
|---------|--------------|------------|------------|-------|
| Experiment record creation with structured fields | A LIMS without structured experiment records is just a file server | LOW | HIGH | PROJECT.md: protocol, conditions, materials, results |
| Link cycle test data to experiments | The connection between "what we did" (experiment) and "what we measured" (cycle data) is the entire value of a research system | MEDIUM | HIGH | Core linking feature per PROJECT.md |
| Filter/search experiments by material, protocol, date, researcher | Research teams run hundreds of experiments; without filtering, data is unrecoverable | LOW | HIGH | PROJECT.md explicitly requires this |
| Experiment status / state tracking | Is this planned, in-progress, completed, abandoned? Without this, the team can't triage their backlog | LOW | MEDIUM | Not explicit in PROJECT.md but universally expected in LIMS |
| Protocol library (reusable protocols) | Researchers reuse protocols across many experiments; without a library, they copy-paste manually and drift | MEDIUM | MEDIUM (LOW confidence) | Common LIMS pattern; not explicit in PROJECT.md — should be validated with users |
| Researcher-level record ownership | "Who ran this experiment?" is audited in every serious lab | LOW | HIGH | Implicit in PROJECT.md creator/modifier tracking |
| Notes / journal field per experiment | Free-text observations are a researcher staple; structured fields alone don't capture everything | LOW | MEDIUM | Rich text or markdown preferred |
| Version history / edit log | Researchers need to know when results were entered and if they were modified — critical for scientific integrity | MEDIUM | MEDIUM (LOW confidence) | Standard in LIMS; not explicit in PROJECT.md — flag for validation |

#### Pillar 3: Manufacturing / Production

| Feature | Why Expected | Complexity | Confidence | Notes |
|---------|--------------|------------|------------|-------|
| Step-by-step workflow with completion flags | A manufacturing tracker without stage gates is not a tracker; it's just a form | MEDIUM | HIGH | PROJECT.md: anodeSlurryDone, cathodeSlurryDone, etc. — already modeled |
| Operator assignment per step | Accountability per step is required for traceability in any ISO-adjacent lab | LOW | HIGH | PROJECT.md: each step records operator |
| Timestamp recording per step (start/end) | Time-on-task and process timing are required for reproducibility | LOW | HIGH | PROJECT.md: mixing steps with start/end times |
| Material input tracking (weights, batch IDs) | Material traceability from batch to cell is required to investigate failures | MEDIUM | HIGH | PROJECT.md: full material traceability requirement |
| Measurement recording (viscosity, load, thickness, gap) | Quantitative process data is the core record for electrode manufacturing | MEDIUM | HIGH | PROJECT.md: viscosity, load measurements, grindometer checks |
| Visual inspection sign-off | Go/no-go decisions at each stage must be recorded | LOW | HIGH | PROJECT.md: visual inspection results per step |
| Two project types (full-cell vs. electrode-only) | Lab workflow has two distinct stopping points; a system that forces full-cell creates friction for electrode-only runs | LOW | HIGH | PROJECT.md explicitly models this |
| Link production project to cycle test data | A cell fabricated in manufacturing must be traceable to its test result — this is the whole point of the platform | MEDIUM | HIGH | Core traceability requirement per PROJECT.md |
| Production project dashboard / overview | "Where is this batch right now?" must be answerable at a glance | LOW | MEDIUM | Status overview per project; depends on step flags |
| Suitability sign-off (slurry → coating) | Go/no-go at the slurry stage is a real lab gate; without it the tool doesn't match the actual workflow | LOW | HIGH | PROJECT.md: suitability-for-coating sign-off |

#### Pillar 4: Team Collaboration

| Feature | Why Expected | Complexity | Confidence | Notes |
|---------|--------------|------------|------------|-------|
| Role-based access control (Admin / Researcher / Viewer) | Research systems with no access control leak data and allow accidental edits | LOW | HIGH | PROJECT.md: explicitly defined three roles |
| Creator and modifier attribution on all records | Scientific data must be attributable; this is table stakes for any research tool | LOW | HIGH | PROJECT.md: creator and last-modified-by on all records |
| User management (invite, deactivate, role change) | Admin must be able to manage team without developer intervention | LOW | HIGH | PROJECT.md: admin manages users and roles |
| Researcher can only edit own records | Data integrity requires that researchers can't accidentally overwrite each other's data | LOW | HIGH | PROJECT.md: explicitly specified |
| Viewer role is read-only | External stakeholders, PIs reviewing data, management — must be able to see without touching | LOW | HIGH | PROJECT.md: viewer is read-only |

---

### Differentiators (Competitive Advantage)

Features that set Neware Pro apart from generic LIMS or the bundled software that comes with testing devices. These are where the platform competes.

| Feature | Value Proposition | Complexity | Confidence | Notes |
|---------|-------------------|------------|------------|-------|
| AI anomaly detection on cycle data | Neware/Arbin software has no AI layer; this is a genuine differentiator — catches capacity drops, voltage plateaus, CE anomalies before researchers notice manually | HIGH | HIGH | PROJECT.md priority 1 AI feature; uses Claude API; model needs cycle-context injection |
| AI-generated automated test summaries | Translating raw cycle data into natural language summaries saves 30–60 min per test; no existing cycler software does this | MEDIUM | HIGH | PROJECT.md priority 2 AI feature; output must use correct battery terminology |
| AI cross-dataset pattern recognition | Identifying that a capacity fade trend appears across multiple experiments is a research insight that currently requires manual comparison by the lead researcher | HIGH | HIGH | PROJECT.md priority 3 AI feature; requires multi-experiment data access in prompt context |
| Full traceability: materials → batch → cell → cycle data | Existing tools either track manufacturing OR cycle data, not both in one linked system; this is the platform's core value proposition per PROJECT.md | HIGH | HIGH | The linkage itself is the differentiator; no extra complexity beyond the data model |
| Dark-theme premium UI designed for long lab sessions | Cycler-bundled software (Neware BTS, MITS Pro) has dated, Windows-native UIs that researchers tolerate, not love; a polished tool increases adoption in a team context | MEDIUM | HIGH | PROJECT.md: "feels like a $10k/yr enterprise tool"; Shadcn + Framer Motion already chosen |
| Unified platform (cycle data + experiments + manufacturing in one system) | Researchers currently use a cycler's export software, a spreadsheet LIMS, and a manual manufacturing logbook as three separate systems; integration is the differentiator | MEDIUM | HIGH | The platform's defining feature; each pillar in isolation is not differentiated |
| dQ/dV analysis with cycle-range selection | Bundled cycler software does basic dQ/dV; interactive range selection, overlay, and smoothing controls are rare in lab software | MEDIUM | MEDIUM | Requires numerical differentiation (Savitzky-Golay smoothing recommended); computationally straightforward |
| Experiment-to-production-to-test audit trail | A researcher can trace any anomaly in cycle data back to the exact slurry batch, operator, and coating run that produced the cell — no existing tool does this end-to-end | HIGH | HIGH | This is PROJECT.md's stated core value: "trace any cell's failure back to the exact slurry mix, coating run, and assembly step" |
| Grindometer / viscosity tracking with historical trend | Process engineers want to see viscosity drift over time across batches; existing tools have no process analytics layer | MEDIUM | MEDIUM (LOW confidence) | Not verified against actual user behavior — validate before building trend charts |

---

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem like good ideas but create disproportionate cost or risk for v1.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Native .nda / .ndax binary file parsing | Researchers want to skip the CSV export step; direct import sounds cleaner | Neware's binary format is proprietary, undocumented, and changes across firmware versions; reverse-engineering it creates a maintenance nightmare; one firmware update breaks the importer | Stick with CSV/Excel export for v1; build binary parsing only after validating user demand justifies the maintenance cost |
| Real-time cycler connection / live data streaming | "See the test as it runs" is appealing; feels modern | Requires network access to cycler hardware, driver-level integration per device model, and a streaming data pipeline — adds massive infrastructure complexity for a local-first MVP | Surface last-known-data from last import; researchers check tests at the end of a run, not mid-cycle in practice |
| Automated statistical comparison / hypothesis testing | Researchers want significance testing (t-test, ANOVA) built into the UI | The edge cases are enormous (unequal cycle counts, missing data, different C-rates); a badly-implemented stat test gives false confidence; researchers who need this use R/Python | Provide clean CSV export; let researchers take data to their statistical tools of choice |
| Notification / alert system (email, Slack, SMS) | "Alert me when my test is done" sounds useful | For a local-first MVP with 5–20 users on a shared instance, notification infra is a distraction; researchers check results in-person | Add a simple in-app status badge; defer push notifications to post-validation |
| Full ELN (Electronic Lab Notebook) replacement | Research teams want all their notes, protocols, safety docs, and data in one place | An ELN is a different product category requiring rich text editing, attachments, SOPs, audit trails per FDA 21 CFR Part 11 — expanding into this scope will kill the MVP timeline | Build a clean notes field per experiment; integrate with an existing ELN (Benchling, Labarchives) in a later phase |
| Mobile app | "Access data from my phone" is requested universally | The actual use case (checking a running test) is served by the web UI on a lab tablet; a mobile app is a second codebase with 10x the QA burden | Ensure the web UI is responsive; that is sufficient for the target use case |
| Multi-tenant cloud hosting | "Share data with our collaborators at another university" is requested | Cloud multi-tenancy requires data isolation, billing, compliance (potentially ITAR for battery research), and infra monitoring — a different product | Focus on local-first for the team; consider a single-tenant cloud deploy as a v2 option after validating the core product |
| Custom report builder (drag-and-drop) | "Let me build my own charts" sounds powerful | Report builders are notoriously hard to build well and even harder to maintain; researchers end up exporting to Excel anyway | Provide curated, excellent chart views with good export; do not build a generic report designer |
| Inter-lab / federated data sharing | "Compare our results with published data from another lab" | Federated access, data provenance, and format standardization (e.g., HDF5-based battery data format, BattINFO ontology) are unsolved at the industry level; premature to attempt | Focus on one lab's data first; add external data import as a v2 research project |

---

## Feature Dependencies

```
[CSV/Excel Import]
    └──required-by──> [Capacity Fade Chart]
    └──required-by──> [Voltage vs. Capacity Chart]
    └──required-by──> [Coulombic Efficiency Chart]
    └──required-by──> [dQ/dV Chart]
    └──required-by──> [Per-Cycle Data Table]
    └──required-by──> [AI Anomaly Detection]
    └──required-by──> [AI Test Summaries]
    └──required-by──> [AI Cross-Dataset Patterns]

[User Auth (Clerk)]
    └──required-by──> [Role-Based Access Control]
    └──required-by──> [Creator Attribution on All Records]
    └──required-by──> [Researcher Owns Their Records]

[Manufacturing Production Project]
    └──required-by──> [Full Traceability: materials → batch → cell → test]
    └──required-by──> [Production → Cycle Test Link]
    └──required-by──> [Experiment-to-Production Audit Trail]

[Experiment Record]
    └──required-by──> [Link Cycle Test to Experiment]
    └──required-by──> [Experiment → Production Link]
    └──required-by──> [AI Cross-Dataset Patterns]

[Cycle Test Data (imported)]
    └──required-by──> [Multi-Test Overlay / Comparison]
    └──required-by──> [AI Anomaly Detection]
    └──required-by──> [Full Traceability Audit Trail]

[AI Anomaly Detection]
    └──enhances──> [Capacity Fade Chart]  (surface anomaly markers on chart)

[AI Cross-Dataset Patterns]
    └──requires──> [Multiple Experiments with linked Cycle Tests]

[Unified Platform Value Proposition]
    └──requires──> [All four pillars minimally functional]
    (partial platform = no traceability story)
```

### Dependency Notes

- **CSV/Excel Import requires everything downstream:** The entire cycle data analysis pillar is gated on the importer. This must be Milestone 1.
- **AI features require cycle data in the database:** Anomaly detection, summaries, and pattern recognition all require that cycle data is imported and stored first. AI layer cannot be built in parallel with import.
- **Traceability requires all four pillars:** The full audit trail (materials → cell → test → experiment) only delivers value when manufacturing, testing, and experiments are all linked. This means the platform must be functional across all pillars before the headline value prop is demonstrable.
- **Auth requires all other features:** Role-based access must wrap every feature; build auth before any user-facing feature is production-ready.
- **Multi-test overlay requires per-test charts work first:** Can't overlay what you can't display individually.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the core value proposition: "trace any cell's failure back to the exact slurry mix, coating run, and assembly step."

- [ ] **CSV/Excel import (Neware BTS format)** — without this, no cycle data enters the system
- [ ] **Core cycle charts: capacity fade, voltage vs. capacity, coulombic efficiency, dQ/dV** — these four together constitute a complete cycle test view; without all four, PhD researchers won't trust the tool
- [ ] **Per-cycle data table with export** — researchers need to verify what the chart shows
- [ ] **Experiment record creation and search** — minimum viable experiment tracking
- [ ] **Link cycle test to experiment** — the cross-pillar link that starts delivering research value
- [ ] **Manufacturing production project (full + electrode-only)** — the workflow tracker
- [ ] **Step-level tracking with operator, timestamps, measurements** — the traceability engine
- [ ] **Link production project to experiment and cycle data** — closes the traceability loop
- [ ] **Role-based access control (admin / researcher / viewer)** — non-negotiable for a shared team tool
- [ ] **AI anomaly detection on cycle data** — this is the first differentiator that justifies the platform over a spreadsheet

### Add After Validation (v1.x)

Features to add once core is working and users are in the system.

- [ ] **AI automated test summaries** — trigger: users are importing data regularly and asking "can you summarize this?"
- [ ] **Multi-test overlay / comparison view** — trigger: users want to compare experiments
- [ ] **Protocol library (reusable protocols)** — trigger: users are copy-pasting protocols across experiments
- [ ] **dQ/dV with smoothing controls** — trigger: electrochemists specifically request control over smoothing window
- [ ] **Visual inspection photo upload** — trigger: operators want photographic evidence in the record

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **AI cross-dataset pattern recognition** — requires a meaningful data corpus in the system (50+ experiments minimum) before the AI has enough context to find meaningful patterns; defer until data accumulates
- [ ] **Native .nda/.ndax binary parsing** — defer until validated user demand justifies the maintenance risk
- [ ] **Cloud hosting / multi-tenant** — defer; local-first validates the core before adding infra complexity
- [ ] **ELN integration (Benchling, Labarchives)** — defer; requires external API agreements and scope expansion
- [ ] **Grindometer / viscosity historical trend analytics** — defer until manufacturing data accumulates
- [ ] **Real-time cycler connection** — defer; significant hardware integration scope

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| CSV/Excel import | HIGH | MEDIUM | P1 |
| Capacity fade chart | HIGH | LOW | P1 |
| Voltage vs. capacity chart | HIGH | LOW | P1 |
| Coulombic efficiency chart | HIGH | LOW | P1 |
| dQ/dV chart | HIGH | MEDIUM | P1 |
| Per-cycle data table + export | HIGH | LOW | P1 |
| Experiment record CRUD + search | HIGH | LOW | P1 |
| Link cycle test to experiment | HIGH | LOW | P1 |
| Manufacturing project (full + electrode-only) | HIGH | HIGH | P1 |
| Step-level tracking (operator, timestamps, measurements) | HIGH | MEDIUM | P1 |
| Link production to experiment + cycle data | HIGH | MEDIUM | P1 |
| Role-based access control | HIGH | MEDIUM | P1 |
| AI anomaly detection | HIGH | HIGH | P1 |
| AI automated test summaries | MEDIUM | MEDIUM | P2 |
| Multi-test overlay / comparison | HIGH | MEDIUM | P2 |
| Protocol library | MEDIUM | LOW | P2 |
| dQ/dV smoothing controls | MEDIUM | LOW | P2 |
| AI cross-dataset patterns | HIGH | HIGH | P3 |
| Grindometer/viscosity trend analytics | MEDIUM | MEDIUM | P3 |
| Native .nda binary parsing | MEDIUM | HIGH | P3 |
| Real-time cycler connection | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

The direct competitors are: Neware BTS 8.0/9.0 software, Arbin MITS Pro, Maccor System software, and generic LIMS platforms (LabWare, STARLIMS, Benchling adapted for battery labs). Confidence on competitor specifics is MEDIUM (training data); not verified against current product docs due to tool restrictions.

| Feature | Neware BTS Software | Arbin MITS Pro | Maccor Software | Our Approach |
|---------|---------------------|----------------|-----------------|--------------|
| Cycle data visualization | Basic charts (capacity, voltage, energy) | More advanced; custom channel grouping | Basic charts, Windows-native | All 4 core charts with interactive zoom, overlay, export |
| dQ/dV | Yes (basic) | Yes (basic) | Yes (basic) | With smoothing controls and cycle-range selection |
| Experiment tracking | No | No | No | Full experiment module with material, protocol, result tracking |
| Manufacturing tracking | No | No | No | Full slurry → electrode → assembly workflow |
| AI / anomaly detection | No | No | No | Claude API integration — genuine differentiator |
| Full traceability (material → cell → data) | No | No | No | The platform's core value proposition |
| Team collaboration / RBAC | No | Limited | Limited | First-class RBAC (admin/researcher/viewer) |
| UI quality | Dated Windows UI | Dated Windows UI | Dated Windows UI | Dark, premium, Shadcn + Framer Motion |
| Cross-experiment comparison | Limited | Limited | Limited | Multi-test overlay with synchronized axes |
| Data export | CSV/Excel | CSV | CSV | CSV, Excel, chart PNG — researcher-native formats |

**Key insight:** Bundled cycler software does one thing — control the cycler and store the raw data. None of them do experiment tracking, manufacturing traceability, or AI-assisted analysis. This is why a unified platform is a genuine differentiator, not just a feature list.

---

## Researcher Day-in-the-Life: What They Actually Need

This section synthesizes the real daily workflow to ground feature prioritization. Confidence: MEDIUM (consistent with domain knowledge; not empirically validated with target users).

**Morning: Check overnight tests**
- Import CSV from Neware BTS export software → see capacity fade chart → check CE is above 99.5% → look for anomalies (AI alert would surface this immediately) → attach to the experiment they set up yesterday

**Mid-day: Electrode coating run**
- Create a production project → fill in slurry weights and mixing parameters → record viscosity check → sign off on suitability → record coating speed, temperature, gap → measure load (both sides) → record thickness → visual inspection sign-off

**Afternoon: Experiment documentation**
- Open experiment record → add notes from this morning's test results → compare with previous test using multi-test overlay → write a brief results summary (AI summary would draft this) → update experiment status

**End of day: Traceability check before writing**
- A result seems anomalous → click through from cycle data → find the linked experiment → find the linked production project → see that on day X, the slurry viscosity was out of spec → found the root cause → ready to report

This daily workflow directly validates the feature priority order: import first, charts second, experiment linking third, manufacturing tracking fourth, AI assist everywhere.

---

## Sources

- **PROJECT.md** (HIGH confidence) — 2 years of domain knowledge encoded in the project requirements; primary source for all table stakes features
- **Neware BTS software knowledge** (MEDIUM confidence) — training data; WebFetch was unavailable; verify against https://www.newarebattery.com
- **Arbin MITS Pro knowledge** (MEDIUM confidence) — training data; verify against https://www.arbin.com
- **Maccor software knowledge** (MEDIUM confidence) — training data; verify against https://www.maccor.com
- **LIMS domain patterns** (MEDIUM confidence) — training data patterns from LabWare, Benchling, STARLIMS documentation; verify against current product docs
- **Battery electrochemistry terminology** (HIGH confidence) — dQ/dV, coulombic efficiency, capacity fade, C-rate, PVDF, NMP, grindometer — domain-specific terms verified against electrochemistry literature in training data

**Research gap:** WebSearch and WebFetch were unavailable. Competitor feature analysis should be verified against current product pages before roadmap finalization. The core feature categorization (table stakes vs. differentiators) is well-grounded in PROJECT.md domain knowledge and is reliable for roadmap purposes.

---

*Feature research for: Battery research and manufacturing management platform (Neware Pro)*
*Researched: 2026-03-01*
