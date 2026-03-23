---
name: invest-prd
description: "Generates a Product Requirements Document from VECTOR.md, personas, JTBD, and validated assumptions. Produces the artifact that gets passed between builder and stakeholder — structured for async collaboration, editable by non-technical people. Use when scoping a new feature, starting a new engagement, or when a stakeholder needs to review and approve scope."
argument-hint: "[feature or initiative description] [--format full|lean] [--update prd-file] [--from-capture] [--dry-run]"
disable-model-invocation: true
---

# Investiture Skill: Product Requirements Document

You are writing the contract between intent and execution. A PRD is not documentation — it is the artifact that forces clarity before code is written. It captures what is being built, for whom, why it matters, what success looks like, and what is deliberately excluded. When this document is handed to a stakeholder, they should be able to read it without technical knowledge and say "yes, this is what I want" or "no, you misunderstood."

**This skill is the keystone of async collaboration.** The PRD is what gets passed back and forth between builder and stakeholder. It must be readable, editable, and specific enough that disagreements surface before implementation, not after.

## Step 0: Determine Mode

- **No arguments or `[feature description]`:** New PRD mode. Proceed to Step 1.
- **`--update [prd-file]`:** Revision mode. Proceed to Step 0a.
- **`--from-capture`:** Candidate generation mode. Proceed to Step 0b.
- **`--format [full|lean]`:** Controls PRD depth. Default: full.
- **`--dry-run`:** Generate and display without writing.

### Step 0a: Revision Mode (`--update`)

Read the specified PRD file from `/vector/prds/`. If the filename doesn't include a path, look in `/vector/prds/` for a match.

If the file is not found, report: "PRD not found: [filename]. Check `/vector/prds/` for available PRDs." Stop.

If found, read the full PRD and prompt:

```
Updating: [PRD title] (v[current version])
Status: [current status]

What feedback did the stakeholder give?
Paste their comments, or describe what needs to change.
```

Wait for the operator's response. Then:

1. Parse the feedback into specific section changes.
2. Increment the version number (1.0 → 1.1 for minor changes, 1.0 → 2.0 for scope changes).
3. Update the Status field if appropriate (e.g., "In Review" → "Draft" if scope changed significantly).
4. Apply the changes to the affected sections.
5. Append a row to the Revision History table with today's date and a summary of what changed.
6. Present a **diff summary** before writing:

```
PRD revision summary (v[old] → v[new]):

Changed:
- [Section]: [what changed]
- [Section]: [what changed]

Unchanged:
- [list of sections not modified]

Revision history entry:
| [new version] | [today] | [OPERATOR] | [summary] |

Write updated PRD to [same filename]? (yes/no/revise)
```

On confirmation, overwrite the existing file. The revision history inside the document tracks all versions.

After writing, output:

```
PRD updated: /vector/prds/[filename]
Version: [old] → [new]
Sections changed: [N]
Status: [new status]

Next steps:
- Share updated PRD with stakeholder (change status to "In Review")
- If scope changed, re-run /invest-scope to update phase decomposition
- If success criteria changed, re-run /invest-contract to update deliverable manifest
```

### Step 0b: Candidate Generation Mode (`--from-capture`)

Read recent capture files from `/vector/captures/`. Sort by date, read the 3 most recent.

From the captures, identify PRD candidates by looking for:

- **Research gaps** that cluster around a theme — multiple gaps pointing at the same unserved user need suggest a feature worth scoping.
- **Assumption clusters** — groups of related unvalidated assumptions that, if validated, would justify a new feature.
- **Doctrine drift patterns** — repeated drift in the same direction suggests the product is evolving toward something not yet formally scoped.
- **Patterns worth documenting** — if the same pattern keeps emerging, it may deserve a feature PRD rather than just a convention.

Present 1-3 candidates:

```
PRD candidates from recent captures:

1. [Candidate title] — [one sentence describing the need]
   Based on: [which capture(s), which findings]
   Confidence: [High — clear pattern / Medium — emerging signal / Low — single data point]

2. [Candidate title] — [one sentence]
   Based on: [sources]
   Confidence: [level]

3. [Candidate title] — [one sentence]
   Based on: [sources]
   Confidence: [level]

Which should I develop into a full PRD? (1 / 2 / 3 / none)
```

If the operator selects a candidate, use its description as the feature input and proceed to Step 1.

If no captures exist: "No capture files found in `/vector/captures/`. Run `/invest-capture` after a coding session first, then use `--from-capture` to identify PRD candidates from what was learned."

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

## Step 4: Present and Collaborate

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

### Async Collaboration Workflow

Once the PRD is written, it becomes the communication channel between builder and stakeholder. The workflow:

1. **Draft** — Builder generates the PRD. Status: `Draft`.
2. **Share** — The PRD file lives in `/vector/prds/`. Share via PR, direct file access, or by sending the rendered markdown. The stakeholder reads it as a standalone document — no meeting required.
3. **In Review** — Change status to `In Review` when shared. The stakeholder's job is to read and respond with specific feedback: "Section X is wrong because Y" or "Missing Z from scope."
4. **Revise** — When feedback comes back, run `/invest-prd --update [filename]` to apply changes. The revision history tracks every round. Each version is a snapshot of the conversation.
5. **Approved** — When the stakeholder confirms the PRD reflects their intent, change status to `Approved`. This is the green light for implementation. Run `/invest-scope` and `/invest-contract` against the approved PRD.
6. **Superseded** — If requirements change fundamentally after approval, create a new PRD and mark the old one `Superseded` with a reference to the replacement.

The PRD is the async conversation — not Slack, not email, not a meeting recap. Comments and feedback are captured in the revision history, not scattered across communication channels. When someone asks "what did we agree to?", the PRD is the answer, and the revision history shows how we got there.

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
- When feedback returns, run /invest-prd --update [filename] to revise
```

## Arguments

- **No arguments:** Interactive — prompts for feature description
- **`[feature description]`:** Uses the argument as the feature description
- **`--format [full|lean]`:** Control PRD depth. Default: full.
- **`--update [prd-file]`:** Revise an existing PRD with stakeholder feedback. Reads the file, prompts for feedback, generates a new version with diff summary.
- **`--from-capture`:** Generate PRD candidates from recent `/vector/captures/` reports. Identifies research gaps and assumption clusters that suggest features worth scoping.
- **`--dry-run`:** Draft and display without writing

## Output

`/vector/prds/prd-[slug]-[date].md`

## When to Run

- Before building any feature that takes more than a day
- When a stakeholder asks "what are we building?"
- At the start of a consulting engagement — the PRD is the first shared artifact
- When scope is unclear or contested — the PRD forces the conversation
- Before `invest-scope` or `invest-contract` — they read PRD output
- After `/invest-capture` surfaces research gaps — use `--from-capture` to turn capture findings into PRD candidates
- When stakeholder feedback arrives — use `--update` to revise the PRD and keep the conversation in the document

## Principles

- **Readable by non-technical stakeholders.** If someone without engineering background cannot read and evaluate the PRD, it has failed. No code. No implementation. No jargon. User outcomes only.
- **Out of scope is half the document.** Saying what you're NOT building is as important as saying what you are. Every out-of-scope item prevents a future "but I thought..." conversation.
- **Assumptions are visible.** A PRD that hides its assumptions is a trap. Unvalidated assumptions are risks. Surface them so the stakeholder can accept the risk or demand validation first.
- **Success criteria are contracts.** When the stakeholder approves the PRD, they are agreeing to the success criteria. Make them specific enough that both sides can later agree on whether they were met.
- **The PRD is alive.** It has a version and a revision history because it will change. The first draft is not the final draft. Async collaboration means the PRD goes back and forth — that's the process working, not the process failing.
- **One feature, one PRD.** Do not bundle multiple features into a single document. If two features can be scoped, built, and evaluated independently, they get separate PRDs.
- **The document is the conversation.** Feedback, revisions, and approvals live in the PRD's revision history — not in Slack threads, email chains, or meeting notes. When someone asks "what did we agree to and how did we get there?", the PRD answers both questions.
