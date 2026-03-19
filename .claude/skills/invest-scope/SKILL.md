---
name: invest-scope
description: "Decompose a PRD or feature set into phased scope with MVP boundaries, dependency mapping, and effort sizing. Separates must-have from nice-to-have with evidence. Use before sprint planning or when stakeholders ask what is in v1."
argument-hint: "[prd-name or feature-area, e.g. 'auth-system' or 'voice-pipeline']"
---

# Investiture Skill: Scope Decomposition

You are turning a wall of features into a plan. A scope document is not a wish list with labels — it is a phased commitment that says: here is the minimum that delivers value, here is what comes next, here is what depends on what, and here is what we are deliberately not doing. When a client or stakeholder reads this document, they should see a path through the work, not a pile of it.

**This skill is the bridge between PRD and execution.** The PRD says what is being built and why. The scope document says in what order, at what cost, and with what risks. It is the artifact that makes sprint planning possible and keeps stakeholders from asking "why isn't feature X in the first release?" — because the answer is written down, with a reason.

## Step 0: Get the Scope Target

If a PRD name or feature area was passed as an argument, use it directly.

If no argument was provided, prompt:

```
What are you scoping?
Provide a PRD filename (from /vector/prds/) or a feature area name.

Examples:
  "auth-system" — matches prd-auth-system-*.md or scopes auth as a feature area
  "voice-pipeline" — matches prd-voice-pipeline-*.md or scopes voice as a feature area
  "prd-onboarding-flow-2026-03-15.md" — exact PRD filename
```

## Step 1: Read Doctrine and Research

Read the following. Scope is grounded in what the project already knows — not invented from scratch.

1. **`/vector/prds/`** — Search for a PRD matching the argument. Match on slug (e.g., "auth-system" matches `prd-auth-system-*.md`). If an exact filename was given, use it directly. If multiple PRDs match, list them and ask the operator to choose. If no PRD matches, proceed with the argument as a feature area name — scope can be written without a PRD, but note the gap.

2. **`VECTOR.md`** — Extract: problem statement, value proposition, target audience, personas, JTBD, constraints, design principles, quality gates, ship criteria, project stage. MVP is defined by the JTBD and personas — the minimum scope is whatever delivers the core job for the primary persona.

3. **`ARCHITECTURE.md`** — Read for technical layers, stack, conventions, and constraints. Architecture constrains what is feasible in Phase 1 versus what requires infrastructure work first. Layer boundaries affect dependency ordering.

4. **`/vector/research/assumptions/`** — Read validated and unvalidated assumptions. Unvalidated assumptions make scope estimates unreliable — features that depend on unvalidated assumptions get flagged with reduced confidence. Validated assumptions provide evidence for scope decisions.

5. **`/vector/decisions/`** — Read architecture decision records. Past decisions constrain scope options — an ADR that chose technology X means features requiring technology Y are out of scope or require a new ADR.

6. **`/vector/research/personas/`** — If persona files exist, read them. Every feature in every phase must trace to a persona. Features that serve no declared persona are candidates for "Out of Scope."

7. **`/vector/research/jtbd/`** — If JTBD files exist, read them. MVP is defined as the minimum that delivers the core JTBD. Features that serve secondary JTBDs are Phase 2 candidates.

8. **`/vector/scope/`** — Read any existing scope documents to avoid overlap and maintain consistent format.

If VECTOR.md is missing: "Cannot generate a scope document without VECTOR.md. Scope derives from your project's stated goals, personas, and JTBD. Run `/invest-backfill` or create VECTOR.md first."

## Step 2: Analyze the Feature Set

Before writing, decompose the feature set using doctrine context:

**Feature extraction:** If a PRD exists, extract every capability from the "In Scope" section. If working from a feature area name, identify the core capabilities required to deliver value in that area.

**JTBD mapping:** For each feature, identify which JTBD it serves. Features that serve the primary JTBD are MVP candidates. Features that serve secondary JTBDs are Phase 2 candidates. Features that serve no JTBD are "Out of Scope" candidates.

**Persona mapping:** For each feature, identify which persona needs it. If a feature serves no declared persona, it is a scope question — flag it.

**Dependency analysis:** For each feature, identify what it depends on — other features, infrastructure, external services, design assets, third-party integrations, API access, data availability. Dependencies determine ordering.

**Assumption check:** For each feature, identify which assumptions must be true for it to be built as scoped. If those assumptions are unvalidated, the feature's effort estimate carries reduced confidence.

**Architecture check:** For each feature, identify which architecture layers it touches. Features that require new layers or significant infrastructure changes are costlier and should be sequenced accordingly.

**Effort sizing:** Assign S/M/L to each feature based on complexity, not hours. S = a single focused contributor can complete in a short sprint. M = requires coordination or spans multiple concerns. L = significant effort, cross-cutting, or involves unknowns.

## Step 3: Draft the Scope Document

Write a complete scope document using this structure. The language must be accessible to non-technical stakeholders for the overview sections and precise enough for engineering to plan sprints from the phase breakdowns.

```markdown
# Scope: [Feature Area or PRD Title]

**Source:** [PRD filename if exists, or "Feature area — no PRD"]
**Date:** [today's date]
**Version:** 1.0
**Status:** Draft | In Review | Approved

---

## Scope Overview

[1 paragraph. What is being scoped, why it matters, and what doctrine context grounds the decisions. Reference the core JTBD and primary persona. If this scope derives from a PRD, reference it. If assumptions are unvalidated, note that scope confidence is reduced.]

---

## MVP (Phase 1)

The minimum that delivers the core JTBD. Nothing in this phase is here because it is easy — it is here because without it, the product does not solve the user's problem.

| # | Feature | Justification | Effort | Dependencies |
|---|---------|--------------|--------|-------------|
| 1 | [Concrete, testable capability] | [Which persona + which JTBD it serves] | [S/M/L] | [What must exist first — "none" if independent] |
| 2 | [Feature] | [Justification] | [S/M/L] | [Dependencies] |
| 3 | [Feature] | [Justification] | [S/M/L] | [Dependencies] |

[After the table: 1-2 sentences on what the user can do when Phase 1 is complete. Frame as outcome: "After Phase 1, [persona] can [accomplish core JTBD] without [current pain]."]

---

## Phase 2

Features that enhance MVP but are not required for first value delivery. These make the product better — they do not make the product exist.

| # | Feature | Justification | Effort | Dependencies | Blocked By |
|---|---------|--------------|--------|-------------|-----------|
| 1 | [Feature] | [Which persona + JTBD] | [S/M/L] | [External deps] | [Phase 1 item # if applicable, or "none"] |
| 2 | [Feature] | [Justification] | [S/M/L] | [Dependencies] | [Blocked by] |

[After the table: 1-2 sentences on what changes for the user when Phase 2 is complete.]

---

## Phase 3 / Future

Features that require external dependencies, significant infrastructure investment, or rest on unvalidated assumptions. These are real features with real value — they are sequenced here because their prerequisites do not yet exist.

| # | Feature | Justification | Effort | Blocker |
|---|---------|--------------|--------|--------|
| 1 | [Feature] | [Which persona + JTBD] | [S/M/L] | [What must change before this is buildable — external dep, infrastructure, unvalidated assumption] |
| 2 | [Feature] | [Justification] | [S/M/L] | [Blocker] |

---

## Explicitly Out of Scope

Features that were discussed, considered, or appear in adjacent PRDs but are NOT included in any phase. Out of scope is a decision, not an omission.

| Feature | Reason |
|---------|--------|
| [Feature that was considered] | [Why it is excluded: does not serve a declared JTBD, blocked by unresolvable dependency, requires separate PRD, deferred pending research, etc.] |
| [Feature] | [Reason] |

---

## Dependency Map

What blocks what — both internal sequencing and external prerequisites.

### Internal Dependencies

[Feature-to-feature dependencies within the scope. Format as a list showing the chain.]

- Phase 1 #[X] ([name]) → blocks Phase 2 #[Y] ([name]) — [why]
- Phase 1 #[X] ([name]) → blocks Phase 2 #[Z] ([name]) — [why]
- Phase 2 #[Y] ([name]) → blocks Phase 3 #[A] ([name]) — [why]

[If no internal dependencies: "All items within each phase are independent and can be parallelized."]

### External Dependencies

[Things outside the team's control that affect scope or timeline.]

- [Dependency] — Owner: [who controls this]. Status: [known/unknown/in progress]. Affects: [which phase/feature].
- [Dependency] — Owner: [who]. Status: [status]. Affects: [what].

[If no external dependencies: "No external dependencies identified."]

---

## Assumption Risks

Features whose scope or effort estimate depends on unvalidated assumptions. If the assumption is wrong, the scope changes.

| Feature | Assumption | If Wrong | Impact |
|---------|-----------|----------|--------|
| [Feature from any phase] | [What must be true] | [What happens to scope if it is false] | [Effort change: S→M, M→L, feature moves to Phase 3, feature becomes out of scope, etc.] |
| [Feature] | [Assumption] | [Consequence] | [Impact] |

[If all relevant assumptions are validated: "All features in this scope rest on validated assumptions. No assumption-driven risk identified." — but this is rare. Push yourself to surface at least one.]

---

## Effort Summary

| Phase | S | M | L | Total Items |
|-------|---|---|---|------------|
| MVP (Phase 1) | [count] | [count] | [count] | [total] |
| Phase 2 | [count] | [count] | [count] | [total] |
| Phase 3 / Future | [count] | [count] | [count] | [total] |
| **Total** | **[count]** | **[count]** | **[count]** | **[total]** |

**Rough timeline guidance:**
- Phase 1 (MVP): [estimate based on effort distribution — e.g., "2-3 sprints for a single contributor" or "1 sprint for a team of 3"]
- Phase 2: [estimate]
- Phase 3: [estimate, noting that external dependencies make this less predictable]

[Effort sizing is S/M/L, not hours. False precision is worse than honest ranges. These estimates assume validated assumptions — if assumptions fail, revisit.]

---

*Generated by Investiture `/invest-scope`. Grounded in VECTOR.md doctrine, PRD artifacts, and assumption research.*
```

## Step 4: Present for Confirmation

Output the drafted scope document to the terminal in full. Then ask:

```
Scope document drafted above.

Before writing:
- Does the MVP contain the minimum that delivers the core JTBD — nothing less, nothing more?
- Are there features in Phase 2 that should be in MVP, or MVP features that could wait?
- Are the dependency chains accurate — does anything block something it shouldn't?
- Are the effort estimates (S/M/L) reasonable?
- Is anything missing from "Explicitly Out of Scope"?

Write to /vector/scope/[name]-scope.md? (yes/no/revise)
```

If the operator says "revise," ask what to change and redraft the affected sections.

## Step 5: Write the File

On confirmation, write to `/vector/scope/[name]-scope.md`.

**Slug:** Derived from the PRD slug or feature area name. Lowercase, hyphenated.

Create `/vector/scope/` if it does not exist.

After writing, output:

```
Scope written to /vector/scope/[name]-scope.md

Phases: 3 (MVP + Phase 2 + Phase 3/Future)
MVP items: [N]
Phase 2 items: [N]
Phase 3 items: [N]
Out of scope items: [N]
External dependencies: [N]
Assumption risks: [N]

Effort distribution:
  S: [N] | M: [N] | L: [N]

Next steps:
- Review with stakeholder — MVP boundary is the critical decision
- Run /invest-contract to generate deliverable manifest from MVP scope
- Run /invest-proposal to include scope in client proposal
- Address assumption risks before committing to effort estimates
- Use phase tables as sprint planning input — each row is a candidate ticket
```

## Arguments

- **No arguments:** Interactive — prompts for PRD name or feature area
- **`[prd-name or feature-area]`:** Uses the argument to find a matching PRD or as a feature area name

## Output

`/vector/scope/[name]-scope.md`

## When to Run

- After writing a PRD (`invest-prd`) — the PRD defines what, the scope defines when and in what order
- When a stakeholder asks "what's in v1?" — the scope document is the answer
- Before sprint planning — each phase table is a candidate backlog
- When scope creep threatens — the scope document shows what was agreed and why
- Before `invest-proposal` — the proposal's phases section draws from scope
- When assumptions are validated or invalidated — scope may need to shift features between phases

## Principles

- **MVP is defined by JTBD, not by what's easiest to build.** The minimum is "minimum that solves the job." If the easiest features do not deliver the core JTBD, they are not MVP — they are Phase 2 enhancements to an MVP that does not yet exist. Resist the temptation to fill Phase 1 with quick wins that do not add up to a working product.
- **Unvalidated assumptions make scope estimates unreliable.** Flag them, do not hide them. A feature sized as M that rests on an unvalidated assumption could be an L or could be out of scope entirely. The scope document must make this visible so stakeholders accept the risk knowingly.
- **Every feature in every phase must trace to a persona or JTBD.** If it does not serve a user need, it is not in scope. This is the filter that prevents "wouldn't it be cool if..." from becoming "why did we spend three sprints on this?"
- **Dependencies are the number one schedule risk.** Map them explicitly so nothing is "blocked by surprise." A dependency that is discovered during implementation is a schedule slip. A dependency that is documented in the scope document is a planning input.
- **Effort sizing is S/M/L, not hours.** False precision is worse than honest ranges. Saying "this will take 47 hours" implies a confidence that does not exist. Saying "this is a Medium — it requires coordination across two concerns" communicates useful information without promising accuracy you cannot deliver.
- **Out of scope is a decision, not an omission.** Name what you are NOT doing and why. Every feature in "Explicitly Out of Scope" is a future argument you will not have, because the answer is already written down with a reason.
- **The scope document should be usable as a sprint planning input.** Each item in each phase table is concrete enough to become a ticket. If a scope item is too vague to estimate or assign, it is not ready for the scope document — break it down further.
