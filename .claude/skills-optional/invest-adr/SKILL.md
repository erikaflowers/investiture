---
name: invest-adr
description: "Generates a numbered Architecture Decision Record from a decision description, using VECTOR.md constraints, ARCHITECTURE.md stack context, and existing ADRs to avoid contradictions. Use when making an architectural or product decision that should be documented and stored."
argument-hint: "[decision description] [--status proposed|accepted|deprecated|superseded] [--dry-run]"
---

# Investiture Skill: Decision Record

You are capturing a decision before it becomes invisible. Architecture decisions made without records cause confusion months later when no one remembers why a choice was made — or worse, when the same decision gets relitigated. This skill takes a decision in flight and turns it into a permanent, numbered, cross-referenced ADR.

**This skill runs on demand.** It does not depend on `invest-doctrine` or `invest-architecture` having run first, but it reads doctrine files to inform the ADR. It writes to `/vector/decisions/`, which `invest-backfill` initializes. If doctrine files are missing, the skill flags what context is absent and continues.

## Step 0: Get the Decision Description

If a decision description was passed as an argument, use it directly.

If no argument was provided, prompt the operator:

```
What decision are you capturing? Describe it as a question or a choice:
Examples:
  "Should we add Supabase or stay local-first with IndexedDB?"
  "Use React Query vs. manual fetch + useEffect for data loading"
  "Deploy as Cloudflare Worker vs. Netlify serverless function"
```

## Step 1: Read Doctrine

Read the following files. They define the constraints and context within which this decision lives.

1. **`VECTOR.md`** — Extract: constraints (hard limits), value proposition (what this product must do), design principles (philosophy that should guide decisions), project stage.
2. **`ARCHITECTURE.md`** — Extract: current stack (what is already in use), declared preferences, existing patterns, "What Not to Do" prohibitions.
3. **`/vector/decisions/`** — List all existing ADR files. Read their titles and decisions. You need this to:
   - Number the new ADR correctly (next in sequence after the highest existing number)
   - Identify prior decisions this new one must not contradict
   - Find prior decisions this one supersedes or relates to

If VECTOR.md or ARCHITECTURE.md is missing, flag it and continue — you can still write a useful ADR, but note which context is missing.

If `/vector/decisions/` does not exist, create it. The new ADR will be the first: `ADR-001`.

## Step 2: Determine the ADR Number and Slug

**Numbering:** Find the highest existing ADR number in `/vector/decisions/`. The new ADR is that number + 1, zero-padded to three digits: `001`, `002`, `031`, `100`.

If no ADRs exist, start at `ADR-001`.

**Slug:** Derive from the decision description. Lowercase, hyphenated, 3-6 words:
- "Should we add Supabase or stay local-first with IndexedDB?" → `supabase-vs-indexeddb`
- "Use React Query vs. manual fetch" → `react-query-vs-manual-fetch`
- "Deploy as Cloudflare Worker vs. Netlify" → `cloudflare-worker-vs-netlify`

**Filename:** `ADR-[NNN]-[slug].md`

## Step 3: Analyze the Decision

Before writing the ADR, think through the decision using the doctrine context:

**Options identification:** What are the real alternatives? There are almost always at least two, sometimes three. Name them clearly. "Do nothing / keep the current approach" is always a valid option and often worth including.

**Constraint filtering:** Which options are ruled out by VECTOR.md constraints or ARCHITECTURE.md prohibitions? For example, if VECTOR.md says "no external dependencies," cloud-hosted databases are eliminated. State this explicitly — eliminating options based on declared constraints is faster than evaluating them.

**Stack compatibility:** Which options fit the existing stack without friction? Which require new dependencies, new patterns, or new expertise?

**Value prop alignment:** Does one option better serve the core value proposition in VECTOR.md? If yes, that's a meaningful signal, not just a technical preference.

**Prior ADR cross-reference:** Does any existing ADR constrain this decision? For example, a prior ADR establishing "local-first architecture" would weigh heavily against a cloud-hosted option. If a prior ADR is directly relevant, reference it by number.

## Step 4: Draft the ADR

Write a complete ADR using this structure:

```markdown
# ADR-[NNN]: [Decision Title — present tense, descriptive]

**Date:** [today's date]
**Status:** [proposed | accepted | deprecated | superseded by ADR-NNN]
**Deciders:** [OPERATOR: List who was involved in this decision, or remove this line]

## Context

[2-4 sentences. What is the situation that requires a decision? What problem are we solving? What constraints apply from VECTOR.md or ARCHITECTURE.md? What is the cost of not deciding?]

## Decision Drivers

[Bullet list of the factors that matter most for this decision. These come from VECTOR.md constraints, ARCHITECTURE.md preferences, and project stage. Be specific — not "performance" but "must render under 100ms on low-end devices."]

- [Driver 1 — sourced from doctrine if possible]
- [Driver 2]
- [Driver 3]

## Options Considered

### Option A: [Name]

[1-2 sentences describing this option.]

**Pros:**
- [Concrete advantage — specific to this project, not generic]
- [Another advantage]

**Cons:**
- [Concrete disadvantage or risk]
- [Another disadvantage]

### Option B: [Name]

[Same structure]

### Option C: [Name, if applicable]

[Same structure]

## Decision

**We will [chosen option].**

[2-3 sentences explaining why this option was chosen. Reference the decision drivers that it best satisfies. If a constraint from VECTOR.md or a prior ADR was the deciding factor, say so explicitly.]

## Consequences

**Positive:**
- [What gets better or easier]
- [What new capability this enables]

**Negative:**
- [What this forecloses — options that are now off the table]
- [Technical debt or tradeoffs this introduces]
- [What will need to be revisited if circumstances change]

**Neutral:**
- [Side effects that aren't good or bad, just worth knowing]

## Related Decisions

[List any ADRs that this decision relates to, supersedes, or is constrained by. Format: `ADR-NNN: [Title]`. Or "None." if this is the first ADR.]
```

**On the `[OPERATOR: ...]` bracket in Deciders:** Leave it exactly as written. Do not guess or fill in who was involved — that's for the operator to provide. If you do not know who made the decision, leave the bracket.

**Status field:**
- `proposed` — Decision is being considered, not yet finalized. Default if no `--status` flag was passed.
- `accepted` — Decision is final.
- `deprecated` — The decision is no longer in effect but wasn't superseded by a specific newer ADR.
- `superseded by ADR-NNN` — A newer decision replaced this one.

If `--status` was passed as an argument, use that value.

## Step 5: Present for Confirmation

**Output the drafted ADR to the terminal in full.** Then ask:

```
ADR-[NNN]-[slug].md drafted above.
Write to /vector/decisions/ADR-[NNN]-[slug].md? (yes/no)
```

**If `--dry-run` was passed:** Output the ADR to the terminal and stop. Do not write the file, do not ask for confirmation.

## Step 6: Write the File

On confirmation, write to `/vector/decisions/ADR-[NNN]-[slug].md`.

Create `/vector/decisions/` if it does not exist.

**Output the final ADR to the terminal and save it to `/vector/decisions/ADR-[NNN]-[slug].md`.** Each ADR is a new sequential file — do not overwrite existing ADRs.

After writing, output:

```
ADR-[NNN] written to /vector/decisions/ADR-[NNN]-[slug].md

[If this supersedes a prior ADR:]
Note: You may want to update ADR-[prior NNN] to set its status to "superseded by ADR-[NNN]."
```

## Arguments

- **No arguments:** Interactive — prompts for decision description, uses `--status proposed` by default
- **`[decision description]`:** Uses the argument as the decision description, skips the prompt
- **`--status [proposed|accepted|deprecated|superseded]`:** Sets the ADR status field
- **`--dry-run`:** Drafts and displays the ADR without writing the file

## Output

`/vector/decisions/ADR-[NNN]-[slug].md`

## When to Run

- Before committing to a new dependency or external service
- Before adopting a new architectural pattern that will propagate across the codebase
- Before making a choice that is hard to reverse
- When the same decision keeps coming up — record it so it stops being relitigated
- After a significant pivot — record what changed and why

## Principles

- **One decision, one ADR.** Don't bundle multiple choices into a single record. If you're deciding both the state management library AND the data fetching strategy, write two ADRs.
- **Constraints are filters, not opinions.** If VECTOR.md rules something out, say so clearly. You're not making a judgment call — you're applying declared doctrine.
- **"Do nothing" is always an option.** Including the status quo as an evaluated option makes the decision more honest.
- **Specificity over generality.** "Fast enough for our users" is not a decision driver. "Must render initial content under 200ms on a 3G connection" is.
- **Consequences matter as much as the decision.** The point of an ADR is not just to record the choice — it's to record what it forecloses. Future contributors need to know what they're inheriting.
