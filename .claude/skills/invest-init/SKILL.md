---
name: invest-init
description: "Initializes Investiture on a new project with guided setup. Smarter than backfill — asks upfront questions about the project, audience, and constraints, then generates all three doctrine files and scaffolds the /vector/ directory. Use on new projects or when starting fresh. For existing codebases with code already written, use /invest-backfill instead."
argument-hint: "[--minimal] [--dry-run]"
---

# Investiture Skill: Guided Initialization

You are setting up Investiture on a project for the first time. This is different from `/invest-backfill`, which surveys an existing codebase and infers doctrine. This skill asks the operator questions and builds doctrine from their answers. It is for projects that are starting fresh or projects where the operator wants to declare intent before writing code.

**The first-run experience matters.** If initialization is confusing or produces boilerplate that doesn't match the project, the operator loses trust in the methodology before it starts. Every question you ask must earn its place by producing meaningfully different output. No busywork.

## Step 0: Check Existing State

Before starting, check whether Investiture is already initialized:

- If `VECTOR.md` exists and contains substantive content (not just template brackets): "This project already has Investiture doctrine. Running `/invest-init` will overwrite existing files. Are you sure? (yes/no)" On "no," suggest `/invest-doctrine` to audit what exists instead.
- If `VECTOR.md` exists but is template-only (all sections are bracket placeholders): Proceed — the operator initialized but never filled it in.
- If `VECTOR.md` does not exist: Proceed normally.

Also check for `ARCHITECTURE.md` and `CLAUDE.md`. Report which exist and which will be created.

## Step 1: Ask About the Project

Ask questions in a conversational flow. Do not dump all questions at once — group them into phases so the operator can think about one topic at a time.

### Phase 1: What is this?

```
Let's set up Investiture for your project. I'll ask a few questions to generate your doctrine files.

First — what is this project?

1. What does it do? (1-3 sentences — what problem does it solve?)
2. Who is it for? (Describe the primary user in a sentence.)
3. What stage is it at? (idea / discovery / alpha / beta / launched)
```

Wait for answers before proceeding.

### Phase 2: What are the boundaries?

```
Good. Now let's define the boundaries.

4. What are the hard constraints? (Things that absolutely cannot change — budget, platform, regulatory, timeline.)
   Examples: "Must run offline," "No external services," "HIPAA compliant," "Ship by April."
   (If none, say "none" — that's fine.)

5. What should this project NOT become? (The anti-goals.)
   Examples: "Not a social network," "Not a general-purpose tool," "Not something that requires a tutorial."
   (If unsure, skip — we can add these later.)
```

Wait for answers.

### Phase 3: How is it built?

```
Now the technical side.

6. What's the stack? (Framework, language, styling, state management, backend, deployment.)
   Example: "Next.js, TypeScript, Tailwind, Supabase, Vercel"
   (If you haven't decided yet, say so — I'll note it as an open decision.)

7. Are there naming or structural conventions you want enforced?
   Examples: "PascalCase for components," "kebab-case for files," "co-located tests."
   (If none yet, skip.)

8. What absolutely should NOT be done in this codebase?
   Examples: "No inline styles," "No direct database queries from UI components," "No console.log in production."
   (Even 1-2 is valuable.)
```

Wait for answers.

### Phase 4: Who works here?

```
Last section.

9. Who will be contributing? (Just you? A team? AI agents? Mix?)

10. Is there anything non-obvious about this project that a new contributor would get wrong?
    Examples: "The CSS file is intentionally 15,000 lines," "All content lives in /content, never in components."
    (These become the Key Context in CLAUDE.md.)
```

Wait for answers.

**For `--minimal` mode:** Ask only questions 1, 2, 3, and 6. Generate doctrine with reasonable defaults for everything else, clearly marked as `[TO BE DEFINED]` so the operator knows what needs filling in later.

## Step 2: Generate VECTOR.md

Using the answers, generate a complete VECTOR.md:

```markdown
# [Project Name] — Product Doctrine

This file is the source of truth for what this project is, who it serves, and what constrains it. Read this before touching code.

---

## Problem

[From answer 1 — expanded into 2-4 sentences describing the pain that exists and who feels it.]

## Value Proposition

[Derived from answers 1 and 2 — what this project uniquely provides to its audience. One clear sentence.]

## Target Audience

[From answer 2 — expanded into a brief description. If the operator gave enough detail, structure as a proto-persona.]

### Primary Audience
- **Who:** [description]
- **Context:** [when/where they encounter the problem]
- **Current behavior:** [what they do today without this product]

## Project Stage

**[answer 3]**

[Brief description of what this stage means for decision-making: what is appropriate to invest in now, what should wait.]

## Constraints

[From answer 4 — each constraint as a bullet with brief explanation.]

- [Constraint 1] — [why it's a hard limit]
- [Constraint 2]

[If none: "No hard constraints declared. Add constraints here as they are discovered."]

## Design Principles

[Derived from answers 1, 4, and 5. 3-5 principles that should guide every decision. Each principle should be specific to THIS project, not generic good practice.]

1. **[Principle]** — [one-sentence explanation]
2. **[Principle]** — [explanation]
3. **[Principle]** — [explanation]

## Anti-Goals

[From answer 5 — what this project deliberately avoids becoming.]

- [Anti-goal 1]
- [Anti-goal 2]

[If skipped: "Anti-goals not yet defined. Add them when you notice scope pressure from directions you don't want to go."]

## Quality Gates

[Derived from constraints and stage. What must be true before any release.]

- [ ] [Gate 1 — e.g., "All declared constraints are respected"]
- [ ] [Gate 2 — e.g., "Primary audience can complete core workflow"]
- [ ] [Gate 3 — e.g., "No accessibility violations on critical paths"]

## Ship Criteria

[Derived from stage and scope. What must be true for the first meaningful release.]

- [ ] [Criterion 1]
- [ ] [Criterion 2]

## Open Questions

[Anything from the conversation that was uncertain, undecided, or flagged for later.]

1. [Question — derived from "haven't decided yet" or "unsure" answers]

## Assumptions

[Beliefs embedded in the answers that haven't been validated. Surface 3-5.]

1. [Assumption] — Status: unvalidated
2. [Assumption] — Status: unvalidated
```

## Step 3: Generate ARCHITECTURE.md

Using answers 6, 7, and 8:

```markdown
# [Project Name] — Architecture

This file is the single technical authority. When in doubt about where a file goes, how to name it, or what patterns to use, this file decides.

---

## Stack

| Concern | Technology | Notes |
|---------|-----------|-------|
| [e.g., Framework] | [e.g., Next.js 14] | [any version constraints or rationale] |
| [Styling] | [Tailwind] | |
| [State] | [Zustand] | |
| [Backend] | [Supabase] | |
| [Deployment] | [Vercel] | |

[If undecided items exist: mark as "[UNDECIDED — see VECTOR.md Open Questions]"]

## Layers

[Derive from stack. Define the project's layer structure with ownership rules.]

| Layer | Directory | Responsibility | Can Import From |
|-------|-----------|---------------|----------------|
| [e.g., UI] | [src/components/] | [Rendering, user interaction] | [Services, Utils] |
| [e.g., Services] | [src/services/] | [Business logic, API calls] | [Utils] |
| [e.g., Utils] | [src/utils/] | [Pure functions, helpers] | [Nothing] |

[If the operator didn't describe enough structure to define layers: "Layer structure not yet defined. Run `/invest-architecture` after the first significant code is written to derive layers from the actual codebase."]

## Naming Conventions

[From answer 7.]

| File Type | Convention | Example |
|-----------|-----------|---------|
| [Components] | [PascalCase] | [UserProfile.tsx] |
| [Utilities] | [camelCase] | [formatDate.ts] |

[If skipped: "Naming conventions not yet declared. Add them once patterns emerge."]

## What Not to Do

[From answer 8. The most important prohibitions.]

1. **[Prohibition 1]** — [why]
2. **[Prohibition 2]** — [why]
3. **[Prohibition 3]** — [why]

[If none: "No prohibitions declared yet. Add the first one after the first mistake you don't want repeated."]
```

## Step 4: Generate CLAUDE.md

Using answers 9 and 10:

```markdown
# [Project Name] — Contributor Onboarding

This file is for anyone — human or AI — who is about to work in this codebase. Read it after VECTOR.md, before ARCHITECTURE.md.

---

## Reading Order

1. **VECTOR.md** — Project doctrine. Why this project exists, who it serves, what the constraints are.
2. **CLAUDE.md** — This file. What you need to know before touching code.
3. **ARCHITECTURE.md** — Technical specification. Layers, stack, conventions, structure, import rules.

Read ARCHITECTURE.md and follow it. It is the single technical authority.

---

## Stack Summary

[Condensed from ARCHITECTURE.md stack table.]

| Layer | Technology |
|-------|-----------|
| [concern] | [tech] |

---

## Key Context

[From answer 10 — things that aren't obvious from the code.]

- [Non-obvious thing 1]
- [Non-obvious thing 2]

[If none provided: "Key context not yet defined. Add bullets here as you discover things that trip up new contributors."]

---

## What Not to Do

[Top 3 from ARCHITECTURE.md, surfaced here for visibility.]

1. [Prohibition 1]
2. [Prohibition 2]
3. [Prohibition 3]

---

## Commit Format

```
Co-Authored-By: [Agent or Model Name] <noreply@anthropic.com>
```

---

## Contributors

[From answer 9.]

[Description of who works here — solo dev, team, agents, mix.]
```

## Step 5: Scaffold /vector/ Directory

Create the `/vector/` directory structure:

```
vector/
├── research/
│   ├── personas/
│   ├── jtbd/
│   ├── assumptions/
│   └── interviews/
├── decisions/
├── audits/
├── briefs/
├── captures/
├── prds/
├── missions/
├── reports/
├── compliance/
├── contracts/
└── changelog/
```

Create each directory. Do not create placeholder files in empty directories — empty directories with purpose are better than dummy files.

Also create a `/vector/research/README.md`:

```markdown
# Research

This directory holds research artifacts for the project.

- `personas/` — User persona definitions
- `jtbd/` — Jobs to Be Done mappings
- `assumptions/` — Tracked assumptions with validation status
- `interviews/` — Interview guides and session notes

Run `/invest-interview` to generate discussion guides.
Run `/invest-validate` to prioritize assumption testing.
Run `/invest-synthesize` to update doctrine from research findings.
```

## Step 6: Present and Confirm

Show all three generated files to the operator. Then:

```
Three doctrine files generated:
- VECTOR.md ([N] sections filled, [N] marked for later)
- ARCHITECTURE.md ([N] sections filled, [N] marked for later)
- CLAUDE.md ([N] sections filled)

Plus /vector/ directory scaffolded with [N] subdirectories.

Write all files? (yes / no / let me review [filename])
```

If the operator asks to review a specific file, show it again and accept edits before writing.

**If `--dry-run` was passed:** Show all files. Do not write. Do not ask for confirmation.

## Step 7: Write and Report

On confirmation, write all files. Then:

```
Investiture initialized.

Written:
- VECTOR.md
- ARCHITECTURE.md
- CLAUDE.md
- /vector/ directory (12 subdirectories)
- /vector/research/README.md

Next steps:
1. Read through the generated files and refine anything that doesn't match your intent
2. Run /invest-doctrine to verify internal consistency
3. Start building — run /invest-capture after your first session to begin the capture loop
```

## Arguments

- **No arguments:** Full guided initialization with all questions
- **`--minimal`:** Abbreviated — 4 questions, reasonable defaults, [TO BE DEFINED] markers
- **`--dry-run`:** Generate and display without writing

## Output

- `VECTOR.md`
- `ARCHITECTURE.md`
- `CLAUDE.md`
- `/vector/` directory tree
- `/vector/research/README.md`

## When to Run

- On a brand new project before any code is written
- When starting a consulting engagement on a greenfield project
- When an existing project wants to adopt Investiture but has no code worth surveying (use `/invest-backfill` if code exists)
- When the operator wants to be intentional about doctrine from day one

## Principles

- **Every question earns its place.** If a question doesn't change the output, don't ask it. The operator's time is the scarcest resource during initialization.
- **Defaults over blanks.** When the operator doesn't know or skips a question, generate a reasonable default and mark it clearly. An imperfect starting point is better than an empty template. The operator can refine later.
- **Init is not backfill.** Init asks questions and builds from answers. Backfill surveys code and infers from evidence. They are complements, not substitutes. If significant code exists, recommend backfill instead.
- **The first impression sets the tone.** If the generated doctrine feels generic, boilerplate, or disconnected from the operator's answers, they will not trust the rest of the methodology. Make every generated sentence specific to what they told you.
- **Scaffold for the future.** The `/vector/` directory has subdirectories for everything — even things the operator won't use today. That's intentional. When they run `/invest-capture` next week, the directory is already there. When they run `/invest-compliance` next month, same. The structure invites adoption of the full skill chain over time.
