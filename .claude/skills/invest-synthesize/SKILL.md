---
name: invest-synthesize
description: "Takes raw research input — interview notes, beta feedback, assumption validation results — extracts structured insights, and proposes specific patches to VECTOR.md and /vector/ schema files. Shows a full diff before writing anything. Use after user interviews or beta feedback rounds."
argument-hint: "[--source file] [--dry-run]"
---

# Investiture Skill: Synthesize Research

You are closing the loop between what the project assumes and what you have actually learned. This skill takes raw research — interview notes, beta feedback, validation results, any qualitative or quantitative input — and turns it into doctrine updates. Not summaries. Not observations. Specific, proposed edits to the files the rest of the skill chain reads.

**This skill pairs with `/invest-validate`.** Run `/invest-validate` to plan what to test. Run `/invest-synthesize` after sessions to record what you learned. It also pairs with `/invest-backfill` — backfill seeds `/vector/` schemas at project start; this skill updates them when reality diverges from the original assumptions.

**Nothing is written without your approval.** This skill always shows a full diff of proposed changes and asks for confirmation before touching any file.

## Step 0: Get the Input Source

**If `--source [file]` was passed:** Read that file as the raw input. Accepted formats: Markdown, plain text, JSON, any readable format.

**If no argument was passed:** Prompt the operator:

```
What research are you synthesizing? Provide one of:
  1. A file path: path/to/interview-notes.md
  2. Paste content directly (end with a blank line and "END")

Types of input this skill handles:
  - User interview transcripts or summaries
  - Beta feedback (support tickets, survey responses, NPS comments)
  - Assumption validation results (from /invest-validate sessions)
  - Competitive analysis notes
  - Analytics findings with interpretive context
  - Any structured or unstructured research artifact
```

Read the input fully before doing anything else.

## Step 1: Read Current Doctrine and Research State

Read the following to understand what the project currently believes:

1. **`VECTOR.md`** — Extract: current assumptions, open questions, audience description, value proposition, design principles, key constraints. You will propose patches to this file.
2. **`/vector/research/assumptions/`** — Read all existing assumption files. Note which are validated, invalidated, or unvalidated.
3. **`/vector/research/interviews/`** — Scan for existing interview files to understand what research has already been captured and avoid duplication.
4. **`/vector/research/personas/`** — Scan for existing persona files.
5. **`/vector/research/jtbd/`** — Scan for existing JTBD files.

If `/vector/` does not exist, flag it: "The `/vector/` directory does not exist. Run `/invest-backfill` to initialize the research structure before synthesizing." Stop.

If VECTOR.md is missing, flag it and continue — you can still update schema files even without doctrine.

## Step 2: Extract Structured Insights

Read the raw input and extract the following categories. Not everything will be present in every input — extract what exists.

### 2a. Assumption Updates

For each assumption mentioned or implied in the input:
- **Confirmed:** Evidence supports an existing assumption → mark as `validated` with quote or data point as evidence
- **Contradicted:** Evidence contradicts an existing assumption → mark as `invalidated` with specific evidence
- **Partial:** Evidence is mixed or insufficient to fully validate or invalidate → mark as `partial` with notes
- **New assumption surfaced:** The research revealed a belief the team is now holding that wasn't previously documented → flag as a new assumption to add

For each update, note:
- Which assumption file it affects (by ID or filename)
- The specific evidence (direct quote, data point, or observation — not a summary)
- The proposed new status

### 2b. Persona Updates

- **Confirmed persona attribute:** Something in the research confirms a trait, behavior, or need already in a persona file
- **New persona attribute:** Research revealed something about users that isn't captured
- **New persona:** Research revealed a distinct user type not yet documented — name the file `[persona-slug].md` (lowercase, hyphenated) in `/vector/research/personas/`
- **Invalidated persona attribute:** Research contradicts something in an existing persona

When creating a new persona file, use the same structure as existing persona files in `/vector/research/personas/`. If no existing files are present, use: name, description, goals, frustrations, relevant behaviors, and evidence source.

### 2c. JTBD Updates

Jobs to Be Done surfaced in the research:
- **Confirmed JTBD:** Existing job description matches what users described
- **Refined JTBD:** Job exists but the research gives a more precise description ("manage my workflow" → "recover from an interruption without losing context")
- **New JTBD:** Research revealed a job not yet captured — name the file `[jtbd-slug].md` in `/vector/research/jtbd/`. Use the format: situation, job, outcome ("When [situation], I want to [job], so I can [outcome]"), plus evidence source.
- **Dropped JTBD:** Users don't actually have this job — the team assumed it

### 2d. Open Questions Surfaced

Questions that the research raised but did not answer. These are candidates for VECTOR.md's "Open Questions" section and for the next `/invest-validate` run.

### 2e. VECTOR.md Patches

Based on what was learned, what in VECTOR.md should change?
- **Audience description** — is it more specific now? Does it need a refinement?
- **Assumptions section** — new assumptions to add, existing ones to update status
- **Open Questions** — new questions to add, resolved questions to remove or archive
- **Value proposition** — did the research sharpen or complicate the core value claim?
- **Design principles** — did any principle prove wrong or need nuance?

Do not propose changes to VECTOR.md sections unless the research specifically warrants it. Do not update for the sake of updating.

## Step 3: Present the Extraction Summary

Before proposing any file changes, present what you extracted:

```
## Synthesis Extraction — [input source]

### Assumption Updates
- [ID]: [current status] → [proposed status] — "[specific evidence]"
- [ID]: NEW assumption — "[assumption text]"

### Persona Updates
- [file]: [what changes and why]

### JTBD Updates
- [file]: [what changes and why]

### New Open Questions
- [question]

### VECTOR.md Patches Warranted
- [section]: [what changes and why]

### No Changes Warranted
- [anything explicitly confirmed with no update needed]
```

Ask: "Does this extraction look accurate? Continue to diff?"

If the operator says no or wants to adjust, address their feedback before continuing.

## Step 4: Generate the Full Diff

For every proposed change, show the exact before/after diff.

For each file:

```
--- /vector/research/assumptions/[file].md (current)
+++ /vector/research/assumptions/[file].md (proposed)

- status: unvalidated
+ status: validated
+ evidence: "[direct quote from research input]"
+ validated_date: [today's date]
```

For VECTOR.md patches:

```
--- VECTOR.md (current)
+++ VECTOR.md (proposed)

  ### Open Questions
+ - Do users prefer inline editing or a dedicated settings panel? (surfaced in beta feedback round 2)
```

Show every proposed change before writing anything. If there are many changes, group them by file.

After presenting the full diff, ask:

```
Proposed changes shown above.
Apply all changes? Options:
  - yes — write all changes
  - no — discard all
  - select — choose which changes to apply (list the numbers)
```

**If `--dry-run` was passed:** Present the extraction summary and full diff, then stop. Do not write anything.

## Step 5: Write the Changes

On confirmation, write only the approved changes.

For each changed file:
- Write the updated content
- Do not change anything not listed in the approved diff

After writing all files, create a synthesis audit trail:

## Step 6: Write the Audit Trail

**Save to `/vector/audits/invest-synthesize.md`.** Overwrite the file on each run — the current synthesis is what matters, git has the history.

Audit trail format:

```markdown
# Synthesis Audit — [date]

**Source:** [file path or "direct input"]
**Date:** [today's date]

## Changes Made

### [filename]
- [what changed and why — one line per change]

## Evidence Summary

[2-4 sentences summarizing what the research revealed at a high level]

## Open Questions Added

[List any new open questions surfaced, or "None"]

## Next Steps

[1-3 specific recommendations: what to validate next, what to update in VECTOR.md, what assumption needs a follow-up session]
```

Create `/vector/audits/` if it does not exist.

**Print the audit trail to the terminal AND save it to `/vector/audits/invest-synthesize.md`.**

After writing, output:

```
Synthesis complete.
[N] files updated. Audit trail saved to /vector/audits/invest-synthesize.md

Run /invest-validate to reprioritize assumptions based on updated statuses.
Run /invest-doctrine to verify VECTOR.md is still internally consistent after patches.
```

## Arguments

- **No arguments:** Prompts for input source interactively
- **`--source [file]`:** Explicit input file path — skips the prompt
- **`--dry-run`:** Extract, summarize, and show the full diff without writing any files

## Output

- Updated `/vector/research/assumptions/[id].md` files (status, evidence, date)
- Updated `/vector/research/` schema files (personas, jtbd, interviews)
- Updated `VECTOR.md` (assumptions section, open questions — only where warranted)
- `/vector/audits/invest-synthesize.md` (audit trail, overwritten each run)

## When to Run

- After user interviews or usability sessions
- After a beta feedback round
- After running assumption validation experiments (post `/invest-validate` sessions)
- After any structured research activity that produces findings about your users or assumptions

## Principles

- **Evidence, not summaries.** Every proposed change must cite specific evidence from the input — a direct quote, a data point, an observation. "Users seemed confused" is not evidence. "3 of 5 users tried to click the logo to go home" is.
- **Propose, don't impose.** Always show the diff before writing. The operator decides what gets committed to doctrine.
- **Scope to what research actually warrants.** If the research only addresses two assumptions, don't touch the rest of VECTOR.md. The skill should change what the evidence changes, nothing more.
- **Invalidated is progress.** A wrong assumption updated to `invalidated` with evidence is a better outcome than leaving it `unvalidated`. Capture it.
- **The audit trail is the memory.** `/vector/audits/invest-synthesize.md` is the record of what changed and why. It protects against drift — when someone asks "why does VECTOR.md say X?", the audit trail has the answer.
