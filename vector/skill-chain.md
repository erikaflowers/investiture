# Investiture Skill Chain

**Generated:** 2026-03-19
**Skills:** 25

---

## Visual Chain

```
FOUNDATION
  init ──────────┐
  backfill ──────┤──▶ VECTOR.md + ARCHITECTURE.md + CLAUDE.md + /vector/
  doctrine ◀─────┘    (audits the three files against each other + disk)
  architecture ◀──────(audits codebase against ARCHITECTURE.md)

RESEARCH
  interview ─────┐
  validate ──────┤──▶ /vector/research/
  synthesize ────┤    (updates assumptions, personas, JTBD, VECTOR.md)
  brief ─────────┘──▶ /vector/briefs/

PLANNING
  prd ───────────┐
  scope ─────────┤──▶ /vector/prds/, /vector/scope/
  crew ──────────┤──▶ /vector/missions/
  metrics ───────┘──▶ /vector/metrics-framework.md

CLIENT
  proposal ──────┐
  contract ──────┤──▶ /vector/proposals/, /vector/contracts/
  status ────────┤──▶ /vector/reports/
  handoff ───────┘──▶ /vector/handoffs/

OPERATIONS
  capture ───────┐
  changelog ─────┤──▶ /vector/captures/, /vector/changelog/, CHANGELOG.md
  retro ─────────┤──▶ /vector/retros/
  adr ───────────┤──▶ /vector/decisions/
  dependency ────┘──▶ /vector/audits/invest-dependency.md

GOVERNANCE
  compliance ────┐
  risk ──────────┤──▶ /vector/compliance/, /vector/risk-register.md
  trace ─────────┤──▶ /vector/audits/invest-trace.md
  benchmark ─────┘──▶ /vector/audits/invest-benchmark.md
```

### Flow Diagram

```
                    ┌──────────────────────────────────────────────────┐
                    │               FOUNDATION                         │
                    │                                                  │
                    │  init ─┬──▶ doctrine ──▶ architecture            │
                    │        │        ▲              ▲                  │
                    │  backfill ──────┘              │                  │
                    └───────────────┬────────────────┼──────────────────┘
                                   │                │
             ┌─────────────────────▼────────┐       │
             │          RESEARCH            │       │
             │                              │       │
             │  interview ◀── validate      │       │
             │       │            ▲         │       │
             │       ▼            │         │       │
             │  synthesize ───▶ doctrine    │       │
             │       │                      │       │
             │       ▼                      │       │
             │     brief                    │       │
             └──────┬───────────────────────┘       │
                    │                               │
     ┌──────────────▼───────────────┐               │
     │          PLANNING            │               │
     │                              │               │
     │  prd ──▶ scope ──▶ crew     │               │
     │   │        │                 │               │
     │   │        │     metrics     │               │
     └───┼────────┼────────┬────────┘               │
         │        │        │                        │
     ┌───▼────────▼────────▼────────┐               │
     │          CLIENT              │               │
     │                              │               │
     │  proposal ──▶ contract       │               │
     │       status    handoff      │               │
     └──────────────────────────────┘               │
                                                    │
     ┌──────────────────────────────┐               │
     │        OPERATIONS            │               │
     │                              │               │
     │  capture ──▶ adr             │               │
     │    │  │                      │               │
     │    │  └──▶ prd --from-capture│               │
     │    │                         │               │
     │  changelog   retro           │               │
     │           dependency ────────┼───────────────┘
     └──────────────────────────────┘

     ┌──────────────────────────────┐
     │        GOVERNANCE            │
     │                              │
     │  compliance ──▶ risk         │
     │  trace      benchmark        │
     │  (reads nearly everything)   │
     └──────────────────────────────┘
```

---

## Dependency Table

| Skill | Reads (inputs) | Writes (outputs) | Upstream (feeds into this) | Downstream (this feeds into) |
|-------|---------------|-------------------|---------------------------|------------------------------|
| **init** | Checks for existing VECTOR.md, ARCHITECTURE.md, CLAUDE.md | VECTOR.md, ARCHITECTURE.md, CLAUDE.md, /vector/ tree, /vector/research/README.md | (entry point) | doctrine, architecture, capture |
| **backfill** | README.md, package manifests, configs, git log, git remote, source files, existing doctrine | VECTOR.md, ARCHITECTURE.md, CLAUDE.md, /vector/ tree, /vector/audits/invest-backfill.md | (entry point) | doctrine, architecture, dependency |
| **doctrine** | VECTOR.md, ARCHITECTURE.md, CLAUDE.md, filesystem (disk vs declared structure) | /vector/audits/invest-doctrine.md | init, backfill, synthesize, capture | architecture, crew, all downstream skills |
| **architecture** | ARCHITECTURE.md, VECTOR.md, CLAUDE.md, all source files, token files | /vector/audits/invest-architecture.md | doctrine | risk, benchmark, retro, status |
| **interview** | VECTOR.md, /vector/research/assumptions/, /vector/research/personas/, /vector/research/jtbd/, /vector/research/interviews/ | /vector/research/interviews/guide-[slug]-[date].md | validate, brief | synthesize |
| **validate** | VECTOR.md, /vector/schemas/, /vector/research/assumptions/ | /vector/research/assumptions/validation-plan-[date].md | capture, synthesize | interview |
| **synthesize** | VECTOR.md, /vector/research/assumptions/, /vector/research/interviews/, /vector/research/personas/, /vector/research/jtbd/, raw input | Updated assumption files, persona files, JTBD files, VECTOR.md patches, /vector/audits/invest-synthesize.md | interview (session notes) | validate, doctrine, brief |
| **brief** | VECTOR.md, ARCHITECTURE.md, /vector/research/personas/, /vector/research/jtbd/, /vector/research/assumptions/, /vector/decisions/ | /vector/briefs/[slug]-[date].md | synthesize, prd | interview (for risk validation) |
| **prd** | VECTOR.md, ARCHITECTURE.md, /vector/research/personas/, /vector/research/jtbd/, /vector/research/assumptions/, /vector/metrics-framework.md, /vector/prds/, /vector/captures/ | /vector/prds/prd-[slug]-[date].md | capture (--from-capture), brief, synthesize | scope, contract, proposal |
| **scope** | VECTOR.md, ARCHITECTURE.md, /vector/prds/, /vector/research/assumptions/, /vector/decisions/, /vector/research/personas/, /vector/research/jtbd/, /vector/scope/ | /vector/scope/[name]-scope.md | prd | contract, proposal, crew |
| **crew** | ARCHITECTURE.md, CLAUDE.md, VECTOR.md | /vector/missions/[slug].md | doctrine, scope | status, retro, handoff |
| **metrics** | VECTOR.md, /vector/research/jtbd/, /vector/research/assumptions/, /vector/research/personas/ | /vector/metrics-framework.md | synthesize, validate | prd, contract, status, retro |
| **proposal** | VECTOR.md, ARCHITECTURE.md, /vector/research/assumptions/, /vector/audits/, /vector/decisions/, /vector/research/personas/, /vector/research/jtbd/ | /vector/proposals/[client]-proposal.md | scope, architecture, doctrine | contract, risk |
| **contract** | VECTOR.md, /vector/prds/, /vector/scope/, /vector/metrics-framework.md, /vector/missions/ | /vector/contracts/deliverable-manifest-[date].md | prd, scope, metrics, crew | status, trace |
| **status** | git log, VECTOR.md, /vector/missions/, /vector/audits/, /vector/risk-register.md, /vector/research/assumptions/, /vector/metrics-framework.md | /vector/reports/status-[date].md | architecture, risk, metrics, crew, contract | (terminal — client-facing) |
| **handoff** | VECTOR.md, CLAUDE.md, ARCHITECTURE.md, /vector/audits/, /vector/decisions/, /vector/missions/ | /vector/handoffs/[role]-[date].md | doctrine, architecture, crew | (terminal — onboarding) |
| **capture** | git diff, git log, VECTOR.md, ARCHITECTURE.md, CLAUDE.md, /vector/research/assumptions/, /vector/decisions/, /vector/captures/ | /vector/captures/capture-[date].md, new assumption files, ADR drafts, doctrine patches | (entry point — post-session) | validate, prd (--from-capture), retro, adr, doctrine |
| **changelog** | git log, git tags, VECTOR.md | /vector/changelog/[version].md, CHANGELOG.md | (entry point — release time) | (terminal — user-facing) |
| **retro** | git log, VECTOR.md, ARCHITECTURE.md, CLAUDE.md, /vector/research/assumptions/, /vector/audits/, /vector/decisions/, /vector/sprints/, /vector/missions/ | /vector/retros/[name]-retro.md | capture, architecture, status | (feeds next sprint planning) |
| **adr** | VECTOR.md, ARCHITECTURE.md, /vector/decisions/ | /vector/decisions/ADR-[NNN]-[slug].md | capture | scope, proposal, compliance, trace, brief |
| **dependency** | ARCHITECTURE.md, VECTOR.md, package manifests, lockfiles | /vector/audits/invest-dependency.md | backfill | risk, compliance |
| **compliance** | VECTOR.md, ARCHITECTURE.md, /vector/decisions/, /vector/audits/, /vector/risk-register.md, codebase scan | /vector/compliance/[framework]-mapping-[date].md | architecture, dependency, risk, adr | risk, proposal, contract |
| **risk** | VECTOR.md, ARCHITECTURE.md, /vector/research/assumptions/, /vector/audits/, /vector/decisions/, /vector/risk-register.md (prior) | /vector/risk-register.md | validate, architecture, dependency, compliance, adr | status, proposal |
| **trace** | VECTOR.md, ARCHITECTURE.md, /vector/research/personas/, /vector/prds/, /vector/scope/, /vector/missions/, /vector/decisions/, /vector/audits/, /vector/research/assumptions/, codebase | /vector/audits/invest-trace.md | prd, scope, crew, contract, architecture | status, retro |
| **benchmark** | VECTOR.md, CLAUDE.md, ARCHITECTURE.md, all /vector/ subdirectories, CHANGELOG.md, git log | /vector/audits/invest-benchmark.md | (reads everything) | (terminal — maturity assessment) |

---

## Common Paths

### New project setup
```
init ──▶ doctrine ──▶ architecture ──▶ capture (after first session)
```

### Existing project onboarding
```
backfill ──▶ doctrine ──▶ architecture ──▶ dependency
```

### Feature planning
```
prd ──▶ scope ──▶ contract ──▶ crew
```

### Client engagement
```
proposal ──▶ contract ──▶ status (recurring) ──▶ handoff
```

### Research loop
```
interview ──▶ synthesize ──▶ validate ──▶ brief
      ▲                          │
      └──────────────────────────┘
```

### Post-session capture
```
capture ──▶ validate         (new assumptions get prioritized)
capture ──▶ prd --from-capture  (research gaps become PRD candidates)
capture ──▶ retro            (captures feed sprint retrospectives)
capture ──▶ adr              (implicit decisions get formalized)
```

### Release
```
changelog ──▶ (tag release)
```

### Sprint cycle
```
prd ──▶ scope ──▶ crew ──▶ [build] ──▶ capture ──▶ retro ──▶ status
```

### Governance / audit
```
doctrine ──▶ architecture ──▶ dependency ──▶ compliance ──▶ risk ──▶ benchmark
```

### Full traceability
```
trace (reads: VECTOR.md ──▶ PRDs ──▶ ADRs ──▶ missions ──▶ codebase ──▶ tests/audits)
```
