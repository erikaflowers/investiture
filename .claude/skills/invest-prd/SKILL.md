---
name: invest-prd
description: "Generates a Product Requirements Document from VECTOR.md, personas, JTBD, and validated assumptions. Produces the artifact that gets passed between builder and stakeholder — structured for async collaboration, editable by non-technical people. Use when scoping a new feature, starting a new engagement, or when a stakeholder needs to review and approve scope."
argument-hint: "[feature or initiative description] [--format full|lean] [--dry-run]"
---

# Investiture Skill: Product Requirements Document

You are writing the contract between intent and execution. A PRD is not documentation — it is the artifact that forces clarity before code is written. It captures what is being built, for whom, why it matters, what success looks like, and what is deliberately excluded. When this document is handed to a stakeholder, they should be able to read it without technical knowledge and say "yes, this is what I want" or "no, you misunderstood."

**This skill is the keystone of async collaboration.** The PRD is what gets passed back and forth between builder and stakeholder. It must be readable, editable, and specific enough that disagreements surface before implementation, not after.

## Step 0: Get the Feature Description

If a feature or initiative description was passed as an argument, use it directly.

If no argument was provided, prompt:

```
What feature or initiative are you writing a PRD for?
Describe it in 1-3 sentences — what is being built and why.

Examples:
  "Offline mode for field workers who lose connectivity for hours at a time"
  "Admin dashboard showing team usage metrics and billing"
  "Migrate auth from session tokens to JWTs for compliance"
```

## Step 1: Read Doctrine and Research

Read the following. The PRD is grounded in what the project already knows — not invented from scratch.

1. **`VECTOR.md`** — Extract: problem statement, value proposition, target audience, constraints, design principles, quality gates, ship criteria, project stage. The PRD must align with the value proposition and respect the constraints.

2. **`/vector/research/personas/`** — If persona files exist, read them. The PRD must name which personas this feature serves. If the feature doesn't serve any declared persona, flag it — that's a scope question.

3. **`/vector/research/jtbd/`** — If JTBD files exist, read them. Map the feature to specific jobs. A feature that doesn't map to a job is a feature without a user — flag it.

4. **`/vector/research/assumptions/`** — Read validated and unvalidated assumptions. The PRD should reference validated assumptions as evidence and flag unvalidated assumptions as risks.

5. **`ARCHITECTURE.md`** — Read lightly. The PRD is not a technical document, but architecture constraints may affect what is feasible or how scope is bounded.

6. **`/vector/metrics-framework.md`** — If exists (from `invest-metrics`), reference relevant metrics for success criteria.

7. **Existing PRDs in `/vector/prds/`** — Read any existing PRDs to avoid overlap and maintain consistent format.

If VECTOR.md is missing: "Cannot generate a PRD without VECTOR.md. The PRD derives from your project's stated goals. Run `/invest-backfill` or create VECTOR.md first."

## Step 2: Analyze the Feature

Before writing, think through the feature using doctrine context:

**Audience:** Which personas from VECTOR.md does this serve? If none, who does it serve and should they be a documented persona?

**Job mapping:** Which JTBD does this address? What is the user trying to accomplish, and what is currently failing or painful about how they do it?

**Value alignment:** Does this feature serve the core value proposition? Is it additive (expands value), supportive (enables existing value), or tangential (nice but not core)?

**Constraint check:** Do any VECTOR.md constraints affect this feature's scope? Does ARCHITECTURE.md impose technical boundaries?

**Assumption inventory:** What must be true for this feature to succeed? Which of those assumptions are validated, and which are not?

## Step 3: Draft the PRD

Write a complete PRD using this structure. The language must be accessible to non-technical stakeholders — no code references, no implementation details, no jargon.

```markdown
# PRD: [Feature/Initiative Title]

**Author:** [OPERATOR: your name or team]
**Date:** [today's date]
**Status:** Draft | In Review | Approved | Superseded
**Version:** 1.0

---

## Problem

[2-4 sentences. What pain exists today? Who feels it? What happens if we do nothing? Ground this in VECTOR.md's problem statement and research evidence.]

[If validated assumptions support this problem, cite them: "Research confirms that [finding] (validated assumption [ID])."]

[If the problem rests on unvalidated assumptions, flag them: "This assumes [belief] — not yet validated. Recommend testing via [method] before full investment."]

## Audience

[Who is this for? Name specific personas from the research if they exist.]

| Persona | Relevant Job | Current Pain |
|---------|-------------|-------------|
| [Persona name] | [JTBD they're trying to do] | [What's broken or painful now] |

[If no personas exist: describe the target user in 2-3 sentences. Note that formal persona research has not been done — this is a risk.]

## Proposed Solution

[3-6 sentences. What are we building? Describe the experience from the user's perspective — what they see, what they do, what changes for them. No technical implementation details.]

[Frame as user outcomes, not features: "Users will be able to [accomplish X] without [current pain Y]" rather than "We will build a REST endpoint that..."]

## Scope

### In Scope

[Bullet list of specific capabilities included in this version. Each item should be concrete and testable.]

- [Capability 1 — specific enough to verify]
- [Capability 2]
- [Capability 3]

### Out of Scope

[Bullet list of things that are deliberately NOT included. This section is as important as In Scope. Every item here is a potential future enhancement — not a rejection, a deferral.]

- [Excluded item 1] — [brief reason: "v2 consideration," "blocked by [dependency]," "not justified by current research"]
- [Excluded item 2]

### Dependencies

[What must exist or be true for this feature to be built? External services, other features, data availability, access requirements.]

- [Dependency 1 — who owns it, current status]
- [Dependency 2]

[If no dependencies: "No external dependencies identified."]

## Success Criteria

[How will we know this feature is working? Each criterion must be specific and measurable. These feed directly into acceptance criteria if `invest-contract` is run.]

| Criterion | Metric | Target | How to Measure |
|-----------|--------|--------|---------------|
| [What we're measuring] | [Specific metric] | [Threshold] | [Data source or method] |

[If `invest-metrics` has been run, reference the relevant metrics from the framework.]

[If metrics are not yet instrumentable (pre-launch), define qualitative success criteria: "5 of 7 usability test participants complete [task] without assistance."]

## Open Questions

[Things that need answers before or during implementation. Each question should name who can answer it and what decision it blocks.]

1. [Question] — Blocks: [what decision or scope item]. Ask: [who].
2. [Question] — Blocks: [what]. Ask: [who].

[If no open questions: "No open questions at this time." — but this is rare for a draft PRD. Push yourself to surface at least one.]

## Assumptions & Risks

### Validated Assumptions
[List assumptions that have evidence supporting them. Reference assumption IDs if they exist in `/vector/research/assumptions/`.]

- [Assumption] — Evidence: [source]

### Unvalidated Assumptions
[List assumptions this PRD rests on that have NOT been validated. Each one is a risk.]

- [Assumption] — Risk if wrong: [consequence]. Recommend: [validation method].

### Key Risks
[Risks specific to this feature, beyond assumption risk. Technical risk, timeline risk, adoption risk.]

- [Risk] — Likelihood: [H/M/L]. Impact: [H/M/L]. Mitigation: [action or "accept"].

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | [today] | [OPERATOR] | Initial draft |
```

**Format variations:**

**`--format full`** (default): Complete PRD as above.

**`--format lean`**: Abbreviated version with only: Problem, Proposed Solution, Scope (In/Out), Success Criteria, Open Questions. Suitable for small features or early-stage ideation where a full PRD is premature.

## Step 4: Present for Confirmation

Output the drafted PRD to the terminal in full. Then ask:

```
PRD drafted above.

Before writing:
- Does the problem statement match your understanding?
- Is anything in "In Scope" that shouldn't be?
- Is anything missing from "Out of Scope"?
- Are the success criteria measurable and agreed upon?

Write to /vector/prds/prd-[slug]-[date].md? (yes/no/revise)
```

If the operator says "revise," ask what to change and redraft the affected sections.

## Step 5: Write the File

On confirmation, write to `/vector/prds/prd-[slug]-[date].md`.

**Slug:** Derived from the feature title. Lowercase, hyphenated, 3-6 words.

Create `/vector/prds/` if it does not exist.

**If `--dry-run` was passed:** Output to terminal only. Do not write. Do not ask for confirmation.

After writing, output:

```
PRD written to /vector/prds/prd-[slug]-[date].md

Sections: [N]
In-scope items: [N]
Out-of-scope items: [N]
Open questions: [N]
Unvalidated assumptions: [N]

Next steps:
- Share with stakeholder for review (change status to "In Review")
- Run /invest-scope to decompose into phases
- Run /invest-contract to generate deliverable manifest
- Address open questions before implementation begins
```

## Arguments

- **No arguments:** Interactive — prompts for feature description
- **`[feature description]`:** Uses the argument as the feature description
- **`--format [full|lean]`:** Control PRD depth. Default: full.
- **`--dry-run`:** Draft and display without writing

## Output

`/vector/prds/prd-[slug]-[date].md`

## When to Run

- Before building any feature that takes more than a day
- When a stakeholder asks "what are we building?"
- At the start of a consulting engagement — the PRD is the first shared artifact
- When scope is unclear or contested — the PRD forces the conversation
- Before `invest-scope` or `invest-contract` — they read PRD output

## Principles

- **Readable by non-technical stakeholders.** If someone without engineering background cannot read and evaluate the PRD, it has failed. No code. No implementation. No jargon. User outcomes only.
- **Out of scope is half the document.** Saying what you're NOT building is as important as saying what you are. Every out-of-scope item prevents a future "but I thought..." conversation.
- **Assumptions are visible.** A PRD that hides its assumptions is a trap. Unvalidated assumptions are risks. Surface them so the stakeholder can accept the risk or demand validation first.
- **Success criteria are contracts.** When the stakeholder approves the PRD, they are agreeing to the success criteria. Make them specific enough that both sides can later agree on whether they were met.
- **The PRD is alive.** It has a version and a revision history because it will change. The first draft is not the final draft. Async collaboration means the PRD goes back and forth — that's the process working, not the process failing.
- **One feature, one PRD.** Do not bundle multiple features into a single document. If two features can be scoped, built, and evaluated independently, they get separate PRDs.
