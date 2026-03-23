# invest-check

Quick preflight check before starting work. Confirms doctrine is loaded, current, and the agent knows the rules.

This is the lightweight "are we good?" skill. Run it at the start of a session, before a major task, or when you suspect the agent has drifted from the project's conventions.

---

## When to run

- At the start of a work session
- Before starting a new feature or significant change
- When an agent seems to be ignoring doctrine
- As a sanity check before a commit

## What it does

1. **Check doctrine files exist.** Look for VECTOR.md, CLAUDE.md, and ARCHITECTURE.md at the project root. Report which exist and which are missing.

2. **Check doctrine is non-empty.** A file that exists but contains only template placeholders (`[OPERATOR: ...]`) is not filled in. Flag any doctrine file that is still a template.

3. **Read ARCHITECTURE.md.** Extract:
   - Layer table (names and locations)
   - Naming conventions (casing rules)
   - Import direction rules
   - Any "What Not to Do" section

4. **Read VECTOR.md.** Extract:
   - Project name and description
   - Target audience
   - Design principles
   - Constraints

5. **Read CLAUDE.md.** Check for:
   - An Investiture section (reading order, skill references)
   - Stack summary
   - Key context
   - What not to do

6. **Spot-check the codebase.** Pick 3 files at random from `src/` (or the primary source directory declared in ARCHITECTURE.md). For each file, check:
   - Does the filename follow declared naming conventions?
   - Are imports consistent with declared direction rules?
   - Is the file in the correct layer?

   This is not a full audit — that's `/invest-architecture`. This is a quick sample to catch obvious drift.

7. **Report.** Print a concise status:

```
Investiture check — [project name]

Doctrine:
  ✓ VECTOR.md — filled in
  ✓ CLAUDE.md — has Investiture section
  ✓ ARCHITECTURE.md — 4 layers, 3 naming rules

Spot check (3 files):
  ✓ src/components/Header.jsx — correct layer, naming OK
  ✓ src/App.jsx — correct layer, naming OK
  ✗ services/api.js — imports from components/ (violates layer rule)

Status: 1 issue found. Run /invest-architecture for full audit.
```

If everything passes:

```
Investiture check — [project name]

Doctrine: all 3 files present and filled in
Spot check: 3/3 files clean
CLAUDE.md: Investiture section present

Ready to work. Doctrine loaded.
```

## Arguments

- `/invest-check` — run the full preflight
- `/invest-check --quiet` — only report problems, skip the full output if everything is clean

## Rules

- **This skill never writes files.** It is read-only. It checks, it reports, it's done.
- **Keep it fast.** Check 3 files, not the whole codebase. The point is a quick signal, not a full audit.
- **Be honest about what you found.** If doctrine is missing or stale, say so clearly.
- **Suggest the right next step.** Missing doctrine → `/invest-backfill`. Stale doctrine → `/invest-doctrine`. Code drift → `/invest-architecture`. No Investiture section in CLAUDE.md → `/invest-bootstrap`.
