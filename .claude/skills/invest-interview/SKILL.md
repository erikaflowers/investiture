---
name: invest-interview
description: "Generates a structured user research discussion guide from unvalidated assumptions and open questions in /vector/. Produces targeted questions, probing techniques, and explicit validation signals per assumption. Use before any user research session."
argument-hint: "[--assumption id] [--theme topic] [--format [script|guide]] [--dry-run]"
disable-model-invocation: true
---

# Investiture Skill: Interview Guide

You are preparing someone to have a useful research conversation. A user interview without a guide wastes the participant's time and produces data you can't act on. This skill reads the project's open assumptions and questions, identifies what most needs testing, and produces a structured guide — specific questions, probing techniques, and clear criteria for what you're listening for — that a designer, PM, or researcher can pick up and run.

**This skill runs before user research sessions.** It pairs with `/invest-validate`, which plans *what* to test and *how* (method selection). This skill produces the *actual guide* for conducting the session. After sessions, use `/invest-synthesize` to record what you learned.

## Step 0: Determine Scope

**If `--assumption [id]` was passed:** Scope the guide to validating that specific assumption. Build every question around probing it from multiple angles.

**If `--theme [topic]` was passed:** Scope the guide to a specific topic area (e.g., "onboarding", "export flow", "pricing"). Include all assumptions and open questions relevant to that theme.

**If no argument was passed:** Generate a general-purpose guide covering the highest-priority unvalidated assumptions across the full project.

## Step 1: Read Research Context

Read the following to understand what the project needs to learn:

1. **`VECTOR.md`** — Extract:
   - **Target audience** — who to recruit for research. This becomes the screener criteria.
   - **Project stage** — informs appropriate session format and depth
   - **Open questions** — things the project is explicitly uncertain about
   - **Key assumptions** — if listed directly in VECTOR.md, note them

2. **`/vector/research/assumptions/`** — Read all assumption files. For each, extract:
   - ID and assumption text
   - Validation status (`unvalidated`, `validated`, `invalidated`, `partial`)
   - Risk level if declared
   - Any existing evidence or notes

   Focus on `unvalidated` and `partial` assumptions. Skip `validated` and `invalidated` unless the `--assumption` flag targets one specifically.

3. **`/vector/research/personas/`** — Read all persona files. Extract:
   - Relevant behaviors and context for the participant profile
   - Known frustrations or pain points (these often make good interview entry points)
   - What a representative participant looks like

4. **`/vector/research/jtbd/`** — Read JTBD files relevant to the scope. Jobs provide the best interview structure — asking about the job surfaces context, obstacles, and workarounds naturally.

5. **`/vector/research/interviews/`** — Scan existing interview files to understand what has already been asked. Avoid duplicating questions that have already produced clear answers.

If `/vector/research/` does not exist, flag it: "Research directory not found. Run `/invest-backfill` to initialize the research structure." Continue using VECTOR.md open questions only.

## Step 2: Select and Prioritize Assumptions to Probe

If `--assumption [id]` was passed, use only that assumption. Skip this step.

Otherwise, select the assumptions to include in the guide. Prioritize by risk:

- **Include:** High-risk unvalidated assumptions (high impact + low confidence)
- **Include:** Partial assumptions that need more data
- **Include:** Open questions from VECTOR.md that map to the scope
- **Skip:** Low-risk assumptions — not worth interview time
- **Skip:** Already validated with strong evidence

A single 45-60 minute session can meaningfully probe 3-5 assumptions. A 30-minute session: 2-3. Do not overload the guide.

State the selected assumptions at the top of the guide output so the interviewer knows what they're trying to learn.

## Step 3: Choose the Session Format

**If `--format script` was passed:** Produce a word-for-word script. Every question is written out in full, including transitions and probes. Best for: first-time interviewers, high-stakes sessions, or when consistency across multiple sessions matters.

**If `--format guide` was passed:** Produce a flexible topic guide. Each assumption gets a goal statement and 2-3 question options, not a rigid script. Best for: experienced interviewers who want structure but prefer to adapt in the moment.

**If no format was passed:** Default to `guide` for projects in discovery or alpha stage. Default to `script` if: VECTOR.md lists multiple team members who might run sessions, CLAUDE.md describes the operator as a designer or developer (not a researcher), or the project stage is beta or later where session consistency matters more. When in doubt, default to `guide` — it is easier to follow rigidly than a script is to adapt flexibly.

## Step 4: Write the Guide

### Opening (all formats)

```markdown
## Opening (~5 minutes)

**Goal:** Build rapport, set expectations, get the participant talking.

"Thank you for making time. Before we start, a few things: I'm going to ask you about your experiences — there are no right or wrong answers. I'm not testing you; I'm trying to understand how you think about [topic area]. Please feel free to say 'I don't know' or 'that doesn't apply to me.' The more honest you are, the more useful this is.

Do you mind if I take notes? [If recording:] Do you have any objections to me recording this for my own reference?

To start — can you tell me a bit about how you [relevant activity related to the product domain]?"
```

### Per-assumption section

For each assumption in scope, write a section:

```markdown
## [Assumption ID or theme name]

**What we're trying to learn:** [The assumption in plain language — what the team believes and needs to test]
**Why it matters:** [What goes wrong if this assumption is false]
**Listen for:** [Specific signals that indicate the assumption is true or false — behaviors, language, emotions]

### Questions

**Entry question** (open-ended, no leading):
"[Question that gets the participant talking about the relevant domain without revealing what you're looking for]"

Example entry questions:
- "Walk me through the last time you had to [relevant task]."
- "Tell me about how you currently handle [problem area]."
- "What does [activity] look like for you day-to-day?"

**Probing questions** (follow wherever the entry question leads):
- "Can you say more about that?"
- "What happened next?"
- "How did that make you feel?"
- "What did you do instead?"
- "Has that always been the case, or did something change?"

**Targeted probes** (use only if the entry question didn't surface relevant context):
- "[Specific question targeted at the assumption — only ask if the topic hasn't come up naturally]"
- "[Another specific probe]"

**What validates:** [Specific observable signals — what the participant says or describes that would confirm the assumption]
Example: "Participant describes unprompted frustration with [X]" or "Participant uses a workaround that implies [pain]"

**What invalidates:** [Specific signals that contradict the assumption]
Example: "Participant has no awareness of [X] as a problem" or "Participant already has a satisfying solution"

**Ambiguous signal:** [What to note if the response is mixed or unclear — and what follow-up question to ask]
```

### Closing (all formats)

```markdown
## Closing (~5 minutes)

**Goal:** Catch anything missed, leave on a positive note.

"We're coming up on time. Before we finish — is there anything about [topic area] that you wish I had asked about? Anything you've been thinking about while we talked that we haven't covered?

[If appropriate:] Would you be open to a follow-up conversation as we continue this work?

Thank you — this has been genuinely useful."
```

### Session logistics block

Add at the end of the guide:

```markdown
## Session Logistics

**Participant profile:** [Who to recruit — drawn from personas and VECTOR.md target audience. Be specific: role, experience level, relevant behaviors.]
**Session length:** [Recommended time based on assumption count]
**Format:** [In-person / video call / contextual inquiry]
**Recording:** [Yes/No — note any consent requirements]
**Materials needed:** [Any prototype, screenshots, or artifacts to show]

## After the Session

- Take notes within 30 minutes while memory is fresh
- Note: which assumptions got signal, what the signal was (quote or observation), and what is still unclear
- Run /invest-synthesize with your notes to update assumption files and VECTOR.md
```

## Step 5: Output

**Print the guide to the terminal AND save it to `/vector/research/interviews/guide-[slug]-[date].md`.**

Use a slug derived from the scope: the assumption ID, theme name, or `general`. Use today's date in YYYY-MM-DD format.

Create `/vector/research/interviews/` if it does not exist.

Do not overwrite existing guides for the same slug and date — if the file exists, append `-2`, `-3`, etc. Each guide is a snapshot for a specific session round.

**If `--dry-run` was passed:** Print the guide to the terminal only. Do not write the file.

After writing, output:

```
Interview guide written to /vector/research/interviews/guide-[slug]-[date].md

Assumptions covered: [N] ([list IDs])
Recommended session length: [N] minutes
Format: [script | guide]

Run /invest-synthesize after sessions to record findings and update assumptions.
```

## Arguments

- **No arguments:** Full guide covering highest-priority unvalidated assumptions, flexible guide format
- **`--assumption [id]`:** Guide scoped to one specific assumption
- **`--theme [topic]`:** Guide scoped to a topic area across all related assumptions and open questions
- **`--format [script|guide]`:** Override the default format selection
- **`--dry-run`:** Generate and display the guide without writing the file

## Output

`/vector/research/interviews/guide-[slug]-[date].md`

## When to Run

- Before any user research session — do not run sessions without a guide
- After `/invest-validate` identifies which assumptions to test — this produces the guide for the sessions that plan recommends
- When onboarding a non-researcher to run interviews — use `--format script` for word-for-word guidance
- After a product pivot — regenerate guides for assumptions that the pivot affected

## Principles

- **Open questions before targeted probes.** The best research surfaces what you didn't know to ask about. Start every assumption section with an open entry question that doesn't reveal what you're looking for. Reserve targeted probes for when the topic hasn't come up naturally.
- **One assumption per section, not one question.** An assumption needs multiple angles — entry, probing, targeted. A single question can't validate or invalidate a belief about user behavior.
- **Define the signal before the session.** "What validates" and "what invalidates" are written before the session, not after. This prevents confirmation bias — reading what you hoped to find into ambiguous responses.
- **3-5 assumptions per session, maximum.** A guide that tries to cover eight assumptions covers none of them well. Depth beats breadth. If there are more assumptions to test, run more sessions.
- **The guide serves the session; the session serves the research.** A guide is not a questionnaire to be read aloud. It is preparation that lets the interviewer stay present, follow interesting threads, and know when they've gotten the signal they came for.
