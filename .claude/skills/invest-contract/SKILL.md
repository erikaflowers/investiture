---
name: invest-contract
description: "Generates a structured deliverable manifest with explicit acceptance criteria for each phase of a consulting engagement. Derives deliverables from PRD scope and doctrine quality gates. Produces an artifact suitable for attachment to a Statement of Work. Use when scoping a new engagement, beginning a new project phase, or when a client asks what exactly they are paying for."
argument-hint: "[--phase N] [--format sow|checklist] [--dry-run]"
disable-model-invocation: true
---

# Investiture Skill: Deliverable Manifest & Acceptance Criteria

You are defining what "done" means before work begins. The number one source of consulting disputes is ambiguity about deliverables — "we thought we were getting X, you delivered Y." This skill generates a structured manifest that lists every deliverable for each engagement phase, with binary acceptance criteria that both sides can evaluate. When a client asks "what am I paying for?", this document is the answer.

**This skill depends on prior planning artifacts.** It reads PRDs (from `invest-prd`), scope decomposition (from `invest-scope`), and doctrine quality gates (from VECTOR.md). The more planning has been done, the more specific the manifest. At minimum, it needs VECTOR.md and a PRD or scope document.

## Step 0: Determine Scope

- **No arguments:** Generate the full manifest for all phases.
- **`--phase [N]`:** Generate the manifest for a specific phase number only (from `invest-scope` output).
- **`--format sow`:** Full Statement of Work attachment format with legal-adjacent language.
- **`--format checklist`:** Lightweight checklist format for internal tracking. Default.
- **`--dry-run`:** Generate and display without writing.

## Step 1: Read Planning Artifacts

Read the following to understand what has been planned and how it is structured:

1. **`VECTOR.md`** — Extract: quality gates (the project's definition of "good enough to ship"), ship criteria (what must be true before any release), constraints (boundaries on what can be delivered), project stage.

2. **PRD files in `/vector/prds/`** — If `invest-prd` has been run, PRDs exist with: problem statement, features, scope, out-of-scope items, success criteria. Each PRD feature is a candidate deliverable.

3. **Scope files in `/vector/scope/`** — If `invest-scope` has been run, a phase decomposition exists with: MVP scope, v2 scope, dependencies, phase boundaries. Each phase becomes a manifest section.

4. **`/vector/metrics-framework.md`** — If `invest-metrics` has been run, success metrics exist. Deliverables should reference measurable outcomes where possible.

5. **`/vector/missions/`** — If `invest-crew` has been run, task manifests exist with specific implementation tasks. These inform the deliverable breakdown.

If no PRD or scope file exists, prompt:

```
No PRD or scope decomposition found. The deliverable manifest is most specific when derived from prior planning.

You can:
1. Run /invest-prd first, then re-run /invest-contract
2. Describe the engagement scope now (I'll generate the manifest from your description + VECTOR.md)

Choice:
```

If the operator chooses option 2, accept a free-text description of the engagement scope.

## Step 2: Identify Phases

If scope decomposition exists, use its phases directly. Each phase becomes a section of the manifest.

If no scope decomposition exists, derive phases from the PRD or engagement description:
- **Phase 1:** Foundation — Setup, architecture, core infrastructure
- **Phase 2:** Core features — The features that deliver the primary value proposition
- **Phase 3:** Polish and handoff — Quality, testing, documentation, knowledge transfer

Adjust phase count and themes based on the actual scope. Three is a default, not a rule.

## Step 3: Define Deliverables per Phase

For each phase, identify concrete deliverables. A deliverable is a tangible artifact or capability that the client can inspect, test, or use.

**Types of deliverables:**
- **Code deliverables:** Features, endpoints, integrations, migrations — things that exist in the codebase
- **Documentation deliverables:** Architecture docs, API docs, runbooks, handoff documents
- **Process deliverables:** CI/CD pipeline, test suites, monitoring setup
- **Artifact deliverables:** PRDs, design briefs, compliance mappings, risk registers
- **Knowledge transfer deliverables:** Onboarding sessions, recorded walkthroughs, team training

For each deliverable, define:

### Acceptance Criteria

Acceptance criteria must be **binary** — they are met or not met. No subjective language.

**Good acceptance criteria:**
- "User can log in with email and password and see their dashboard within 3 seconds"
- "API endpoint returns paginated results with correct total count header"
- "WCAG 2.1 AA automated scan passes with zero violations on all public pages"
- "Architecture document covers all layers defined in ARCHITECTURE.md"
- "Test suite covers all critical paths identified in the PRD with passing results"

**Bad acceptance criteria (never use these):**
- "Feature works well" (subjective)
- "Code is clean" (subjective)
- "Client is satisfied" (unmeasurable)
- "Performance is acceptable" (undefined threshold)

Derive acceptance criteria from:
- VECTOR.md quality gates (these are the project's own definition of "done")
- PRD success criteria (these are feature-level definitions of success)
- Metrics framework thresholds (if available)

## Step 4: Define Out-of-Scope

Explicitly list what is NOT included in this manifest. This is not a formality — it is the first line of defense against scope creep.

Derive from:
- PRD "out of scope" sections
- Scope decomposition "future phases" items
- VECTOR.md constraints that limit what can be delivered

Each out-of-scope item should be specific enough that both sides can agree on whether a request falls within or outside scope.

## Step 5: Define the Acceptance Process

Describe how the client reviews and approves deliverables:

1. **Review period:** How long does the client have to review each deliverable? (Suggest 5 business days as default.)
2. **Feedback format:** How should feedback be provided? (Suggest: GitHub issues, structured document, or email with specific references.)
3. **Acceptance:** What constitutes formal acceptance? (Suggest: written confirmation — email is sufficient — that acceptance criteria are met.)
4. **Dispute resolution:** If criteria are met but client is not satisfied, what happens? (Suggest: documented change request for next phase, not rework of current phase.)

## Step 6: Produce the Manifest

### Checklist format (default)

```markdown
# Deliverable Manifest

**Generated:** [today's date]
**Project:** [from VECTOR.md or directory name]
**Engagement scope:** [brief description]
**Phases:** [N]

---

## Phase 1: [Phase Name]

**Timeline:** [from scope decomposition if available, or "TBD"]
**Theme:** [one-sentence description of what this phase accomplishes]

### Deliverables

#### 1.1 [Deliverable Name]
**Type:** [code / documentation / process / artifact / knowledge transfer]
**Description:** [1-2 sentences — what it is and why it matters]

**Acceptance Criteria:**
- [ ] [Binary criterion 1]
- [ ] [Binary criterion 2]
- [ ] [Binary criterion 3]

**Definition of Done:** [from VECTOR.md quality gate that applies to this deliverable]

#### 1.2 [Deliverable Name]
[Same structure]

### Phase 1 Handoff
**What the client receives:** [list of artifacts/capabilities delivered at phase completion]
**Format:** [how it's delivered — PR, deployed URL, document, recorded session]

---

## Phase 2: [Phase Name]
[Same structure]

---

## Phase 3: [Phase Name]
[Same structure]

---

## Out of Scope

The following items are explicitly NOT included in this engagement:

- [Item 1] — [brief reason, or "deferred to Phase N"]
- [Item 2]
- [Item 3]

Requests for out-of-scope items are handled as change requests with separate scoping and approval.

---

## Acceptance Process

1. **Review period:** [N] business days from deliverable submission
2. **Feedback:** [format]
3. **Acceptance:** Written confirmation that acceptance criteria are met
4. **Changes:** Requests outside the manifest are documented as change requests for future phases

---

*Generated by Investiture `/invest-contract`. Derived from: [list sources — VECTOR.md, PRD, scope decomposition, metrics framework].*
```

### SOW format (`--format sow`)

Same content but with more formal language suitable for contract attachment:
- Section numbering (1.1, 1.2, etc.)
- "The Contractor shall deliver..." phrasing
- "The Client shall review and accept or provide written objections within..." phrasing
- Definitions section for key terms
- No checkboxes — full prose acceptance criteria

## Step 7: Output

**Print the full manifest to the terminal AND save it to `/vector/contracts/deliverable-manifest-[date].md`.**

Use today's date. Do NOT overwrite prior manifests — scope may change between phases. Create `/vector/contracts/` if it does not exist.

**If `--dry-run` was passed:** Print to terminal only.

After writing, output:

```
Deliverable manifest written to /vector/contracts/deliverable-manifest-[date].md

Phases: [N]
Total deliverables: [N]
Total acceptance criteria: [N]
Out-of-scope items: [N]

Feeds into: invest-status (status reports reference deliverable completion), invest-trace (deliverables map to traced requirements).
```

## Arguments

- **No arguments:** Full manifest, checklist format, all phases
- **`--phase [N]`:** Single phase manifest
- **`--format [sow|checklist]`:** Output format
- **`--dry-run`:** Generate and display without writing

## Output

`/vector/contracts/deliverable-manifest-[date].md`

## When to Run

- Before a consulting engagement begins — define what the client is paying for
- At the start of each phase — confirm deliverables before work starts
- When scope creep is suspected — reference the manifest to clarify boundaries
- When a client asks "what exactly are we getting?"
- After `invest-scope` produces a phase decomposition — the manifest operationalizes the scope

## Principles

- **Binary criteria or nothing.** If an acceptance criterion cannot be evaluated as pass/fail by both the builder and the client, it is not a criterion — it is a wish. Rewrite until it is testable.
- **Out of scope is protective for both sides.** The client is protected from paying for work they didn't ask for. The builder is protected from delivering work they didn't scope. Neither side benefits from ambiguity.
- **Derived from doctrine.** Quality gates in VECTOR.md are the project's own standards. Acceptance criteria should reference them. This means the client is not held to arbitrary standards — they are held to standards the project itself declared.
- **The manifest is not the contract.** It is an attachment to a contract. It does not include pricing, payment terms, IP ownership, or liability. Those belong in the legal agreement. The manifest defines WHAT is delivered and HOW it is evaluated.
- **Change requests are normal.** The manifest should not make the client feel trapped. Out-of-scope items are deferred, not refused. The process for adding scope is documented and straightforward. Rigidity breeds resentment; structure breeds trust.
