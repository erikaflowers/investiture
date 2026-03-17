---
name: invest-handoff
description: "Generate a single condensed onboarding document for a human collaborator or cold agent session, tailored to a specific role. Reads VECTOR.md, CLAUDE.md, ARCHITECTURE.md, and current /vector/ state to tell someone exactly what they need to know to contribute without reading everything."
argument-hint: "[--role engineer|designer|agent|client] [--dry-run]"
---

# Investiture Skill: Generate Handoff

You are writing the document that saves someone an hour of reading. VECTOR.md, CLAUDE.md, and ARCHITECTURE.md are comprehensive — but a contractor who needs to ship a feature this week, or an agent starting a cold session, does not need all of it. They need the right 20%. This skill reads the full doctrine and distills it into a role-specific brief that tells someone what this project is, what layer to touch, what not to do, and where to find answers.

**This skill runs on demand.** It does not depend on other skills having run first, but it reads all three doctrine files. The richer the doctrine, the more useful the handoff. If doctrine is sparse, the handoff will be sparse — run `/invest-backfill` or fill in doctrine files first.

## Step 0: Determine the Role

**If `--role [role]` was passed:** Use that role. Valid values: `engineer`, `designer`, `agent`, `client`.

**If no role was passed:** Generate a generic handoff suitable for any contributor. Skip role-specific sections.

Role definitions:
- **engineer** — A developer who will write or review code. Needs layer map, conventions, what not to do, and where things live. Less context on product vision.
- **designer** — A designer who will work on UI, UX, or visual decisions. Needs design principles, token system, component structure, and product goals. Less context on technical layers.
- **agent** — A Claude Code session starting cold. Needs a complete operational brief: reading order, what to do, what not to do, current status, and where to find everything.
- **client** — A stakeholder who needs project context without implementation detail. Needs product goals, current stage, what has been built, and what's in progress. No technical depth.
- **generic** — No role passed. Covers all bases at a moderate depth suitable for any contributor.

## Step 1: Read Doctrine

Read all three doctrine files:

1. **`VECTOR.md`** — Extract: project name, problem statement, target audience, value proposition, current project stage, design principles, key constraints, quality gates, open questions, key assumptions and their status.
2. **`CLAUDE.md`** — Extract: what the agent or contributor needs to know before touching code, stack summary, key context (non-obvious decisions), what not to do, commit format, standup format.
3. **`ARCHITECTURE.md`** — Extract: layer table (names, locations, rules), import direction, naming conventions, stack, project structure tree, "What Not to Do."

Also read the current `/vector/` state:
4. **`/vector/audits/`** — List recent audit files. Read the most recent `invest-doctrine.md` and `invest-architecture.md` if they exist. Extract: current doctrine health, open violations, recent findings.
5. **`/vector/decisions/`** — List ADR files. Note the count and read the titles. Recent ADRs signal active architectural decisions the contributor should know about.
6. **`/vector/missions/`** — If this directory exists, list mission manifest files and note any active missions — this signals an in-progress sprint. If it does not exist, skip this section silently.

If any doctrine file is missing, note it prominently in the handoff: "VECTOR.md not found — project identity section is incomplete."

## Step 2: Write the Role-Specific Handoff

Use the appropriate template for the role.

---

### For `--role engineer`

```markdown
# [Project Name] — Engineer Handoff
**Date:** [today's date]

## What This Is
[2-3 sentences. Problem + solution + one distinguishing fact.]

## Stack
[Abbreviated stack table from CLAUDE.md — framework, styling, state, backend, deployment]

## Layer Map
[Condensed layer table: layer name, directory, one-sentence rule]

## Import Direction
[One-line summary: "UI → Services → Domain → [storage/API]. No reverse imports."]

## Naming Conventions
[2-3 most important conventions from ARCHITECTURE.md]

## Do Not
[The 3-5 most important prohibitions from ARCHITECTURE.md "What Not to Do" + CLAUDE.md]

## Current Status
[Project stage from VECTOR.md. Recent audit health if available. Any active missions from /vector/missions/.]

## Where to Find Things
- Doctrine: VECTOR.md → CLAUDE.md → ARCHITECTURE.md
- Research: /vector/research/
- Decisions: /vector/decisions/ ([N] ADRs)
- Audits: /vector/audits/
```

---

### For `--role designer`

```markdown
# [Project Name] — Designer Handoff
**Date:** [today's date]

## What This Is
[2-3 sentences. Problem, audience, core value. What is the user's job?]

## Design Principles
[From VECTOR.md design principles — the philosophy that should drive every decision]

## Token System
[From ARCHITECTURE.md: where tokens live, how to reference them, any naming conventions]

## Component / UI Layer
[Layer name and directory for UI components. File naming convention. Where to put new components.]

## Do Not
[Design-relevant prohibitions: hardcoded values, going outside the token system, layout decisions that contradict declared principles]

## Current Status
[Project stage. What is designed vs. what is still TBD. Any design-relevant open questions from VECTOR.md.]

## Where to Find Things
- Product goals: VECTOR.md
- Technical constraints: ARCHITECTURE.md
- Design research: /vector/research/personas/, /vector/research/jtbd/
```

---

### For `--role agent`

```markdown
# [Project Name] — Agent Session Brief
**Date:** [today's date]

## Reading Order
VECTOR.md → CLAUDE.md → ARCHITECTURE.md. Read all three before touching code.

## What This Project Is
[3-4 sentences. Problem, audience, value proposition, current stage. Everything an agent needs to orient itself.]

## Stack
[Full stack table]

## Layer Map
[Full layer table with directories and boundary rules]

## Import Direction
[Explicit: which layers import from which. Violations are high severity.]

## Naming Conventions
[All declared conventions]

## Do Not
[Complete list of prohibitions from ARCHITECTURE.md and CLAUDE.md]

## Commit Format
[From CLAUDE.md]

## Standup Format
[From CLAUDE.md]

## Current Status
[Project stage. Doctrine health from most recent /vector/audits/invest-doctrine.md. Open violations from invest-architecture.md. Active missions if any.]

## Open Questions
[From VECTOR.md open questions — things the project is still uncertain about]

## Where to Find Things
- Assumptions: /vector/research/assumptions/
- Decisions: /vector/decisions/
- Audits: /vector/audits/
- Active missions: /vector/missions/
```

---

### For `--role client`

```markdown
# [Project Name] — Project Brief
**Date:** [today's date]

## What We're Building
[3-4 sentences. Problem, audience, solution, why it matters. No technical detail.]

## Who It's For
[Target audience from VECTOR.md — specific, not generic]

## Where We Are
[Project stage in plain language: "We're in early testing with a small group of users" not "alpha stage"]

## What's Working
[Capabilities that are complete or stable — drawn from recent ADR decisions and project stage]

## What's In Progress
[Active missions if any. Current sprint focus in plain terms.]

## What We're Still Learning
[Open questions from VECTOR.md, framed as open questions not gaps]

## Next Milestone
[Quality gates or ship criteria from VECTOR.md, if filled in]
```

---

### For generic (no role)

```markdown
# [Project Name] — Contributor Handoff
**Date:** [today's date]

## What This Is
[3-4 sentences. Problem, audience, value proposition, stage.]

## Stack
[Abbreviated stack table]

## Layer Map
[Condensed layer table]

## Do Not
[Top 5 most important prohibitions]

## Current Status
[Stage, doctrine health, active missions]

## Where to Find Things
- Full doctrine: VECTOR.md → CLAUDE.md → ARCHITECTURE.md
- Research: /vector/research/
- Decisions: /vector/decisions/
- Audits: /vector/audits/
```

---

## Step 3: Output

**Print the handoff to the terminal AND save it to `/vector/handoffs/[role]-[date].md`.**

Use the role name in the filename. If no role was specified, use `generic`. Use today's date in YYYY-MM-DD format.

Create the `/vector/handoffs/` directory if it does not exist.

Do not overwrite existing handoffs for the same role and date — if the file exists, append `-2`, `-3`, etc. Handoffs are point-in-time snapshots, unlike audit files which reflect current state.

**If `--dry-run` was passed:** Print the handoff to the terminal only. Do not write the file.

After writing, output:

```
Handoff written to /vector/handoffs/[role]-[date].md

[If any doctrine files were missing:]
Warning: [filename] not found — [section] is incomplete in the handoff.

[If doctrine audit showed violations:]
Note: Most recent architecture audit found [N] high-severity violations. See /vector/audits/invest-architecture.md.
```

## Arguments

- **No arguments:** Generic handoff suitable for any contributor
- **`--role [engineer|designer|agent|client]`:** Role-specific handoff with appropriate depth and framing
- **`--dry-run`:** Generates and displays the handoff without writing the file

## Output

`/vector/handoffs/[role]-[date].md`

## When to Run

- When onboarding a contractor or new team member — give them this before the doctrine files
- Before starting a new agent session — use `--role agent` to generate the cold-start brief
- Before a client check-in — use `--role client` for a stakeholder-ready summary
- When handing off work between designers and engineers — `--role designer` and `--role engineer` give each side what they need without what they don't

## Principles

- **The right 20%, not everything.** A handoff that contains everything is not a handoff — it's the documentation. The value is in what it omits. Distill ruthlessly.
- **Role determines depth.** An engineer needs layer boundaries and naming conventions. A client needs none of that. A cold agent session needs everything. The same project, four different documents.
- **Current status matters as much as structure.** A handoff that describes the architecture but not the current health is missing half its value. Include audit findings and active missions.
- **Doctrine is the source; handoff is the index.** The handoff tells you where to look, not everything you'll find. It points at VECTOR.md, ARCHITECTURE.md, and `/vector/` — it doesn't replace them.
- **Sparse doctrine produces sparse handoffs.** If VECTOR.md is full of template placeholders, the handoff will be incomplete. That's honest — but flag it. An incomplete handoff is still better than no handoff.
