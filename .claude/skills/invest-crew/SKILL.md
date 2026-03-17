---
name: invest-crew
description: "Decompose a feature into scoped agent tasks before a multi-agent sprint. Reads ARCHITECTURE.md layer ownership, CLAUDE.md agent model, and VECTOR.md constraints to generate a structured task manifest with branch names, commit prefixes, and explicit scope boundaries."
argument-hint: "[feature description] [--dry-run] [--format flat]"
---

# Investiture Skill: Crew Manifest

You are doing pre-flight. Before a multi-agent sprint begins, someone has to break the work into pieces — deciding which layer owns what, which agent touches which file, and where each task stops. Without this, agents collide, scope bleeds, and the same file gets edited twice. This skill generates that decomposition before the first branch is cut.

**This skill runs before multi-agent execution.** Runtime fleet management — sessions, dispatch, relay chains — is a separate concern. This skill handles pre-flight: what work exists, who owns it, and what each task must not touch. Run this first, then use the manifest to brief and dispatch your agents.

**Depends on doctrine.** Run `/invest-doctrine` before running this if you're not sure the doctrine is current. This skill reads ARCHITECTURE.md layer ownership to assign tasks — if that file is stale, the manifest will be wrong.

## Step 0: Get the Feature Description

**If a feature description was passed as an argument:** Use it directly.

**If no argument was passed:** Prompt the operator:

```
What feature are you decomposing?
Describe it in plain terms — what the user will be able to do when it ships.

Example: "Allow users to export an agent profile as a portable JSON file and import it on another device"
```

## Step 1: Read Doctrine

Read all three doctrine files. You need them for different parts of the manifest:

1. **`ARCHITECTURE.md`** — Extract:
   - Layer table: every layer name, its directory, and its boundary rule
   - Import direction: which layers can call which
   - Naming conventions: file naming rules per layer
   - Stack: what technologies each layer uses
   - "What Not to Do" prohibitions

2. **`CLAUDE.md`** — Extract:
   - Agent model (if defined): are there named agents with assigned responsibilities?
   - Commit format: prefix conventions (`feat:`, `fix:`, layer-specific prefixes)
   - Branch naming: declared convention if any
   - Any task decomposition guidance the operator has written

3. **`VECTOR.md`** — Extract:
   - Constraints: what the feature must not violate (no external dependencies, must work offline, etc.)
   - Design principles: what the feature must honor
   - Quality gates: ship criteria that apply to this feature

If any doctrine file is missing, flag it and continue with reduced context. Note which layer assignments or conventions you couldn't verify.

## Step 2: Decompose the Feature

Break the feature into atomic tasks. An atomic task is one that:
- Can be completed by a single agent without requiring changes from another agent first
- Touches a single layer (or at most two adjacent layers that must change together)
- Has a clear, testable done state
- Can be described in one sentence

**Decomposition approach:**

1. **Identify the user-facing change** — what does the user see or do differently? This is typically a UI layer task.
2. **Trace the data path** — what data does this feature create, read, update, or delete? Trace from UI → services → domain → storage/API. Each hop that requires new code is a task candidate.
3. **Identify cross-cutting concerns** — does this feature require new types, schemas, or shared utilities? Those are separate tasks that other tasks may depend on.
4. **Check for agent-assigned layers** — if CLAUDE.md defines named agents with layer ownership, assign each task to the appropriate agent.

For each task, produce:

| Field | Content |
|-------|---------|
| **Task ID** | Short identifier: `T1`, `T2`, `T3` |
| **Name** | One sentence: what this task accomplishes |
| **Layer** | The ARCHITECTURE.md layer this task lives in |
| **Owner** | Agent name (from CLAUDE.md) or "unassigned" if no agent model is defined |
| **Branch** | Branch name following declared convention, e.g., `feat/export-agent-profile-domain` |
| **Commit prefix** | Conventional commit prefix for this layer's work |
| **Inputs** | What this task needs from other tasks before it can start (dependencies) |
| **Outputs** | What this task produces that other tasks depend on |
| **Scope boundary** | Explicit statement of what this task does NOT touch |

## Step 3: Check for Constraint Violations

Before finalizing the manifest, check each task against:

- **VECTOR.md constraints** — does any task introduce an external dependency the project prohibits? Does any task require network access in a context that must work offline?
- **ARCHITECTURE.md prohibitions** — does any task violate the "What Not to Do" rules? (data fetching in UI layer, hardcoded values outside token files, etc.)
- **Import direction** — does the task's layer assignment respect the declared import direction? A task in the domain layer must not import from the UI layer.

Flag any violations before proceeding. A task that violates doctrine should not be in the manifest — it should be redesigned.

## Step 4: Determine Task Order

Produce a dependency graph. Some tasks must complete before others can start; others can run in parallel.

Format:

```
Parallel (can start immediately):
  T1, T3

Sequential dependencies:
  T2 requires: T1 (needs exported type from domain layer)
  T4 requires: T2, T3 (UI task, needs both service and domain complete)
```

Identify the critical path — the longest sequential chain. That chain determines the minimum sprint length.

## Step 5: Write the Manifest

**Output the manifest to the terminal AND save it to `/vector/missions/[feature-slug].md`.**

Create the `/vector/missions/` directory if it does not exist.

Use a slug derived from the feature description: lowercase, hyphenated, 3-6 words.

Manifest format:

```markdown
# Mission: [Feature Name]

**Feature:** [one-sentence description of what the user can do when this ships]
**Date:** [today's date]
**Doctrine source:** ARCHITECTURE.md, CLAUDE.md, VECTOR.md

## Constraint Check

[List any constraints from VECTOR.md that apply to this feature, or "No constraints flagged."]
[List any doctrine violations found and how they were resolved, or "No violations found."]

## Tasks

### T1: [Task name]
**Layer:** [layer name] (`[directory path]`)
**Owner:** [agent name or "unassigned"]
**Branch:** `[branch-name]`
**Commit prefix:** `[prefix]:`
**Inputs:** [what this task needs, or "None — can start immediately"]
**Outputs:** [what this task produces for downstream tasks]
**Scope boundary:** This task does NOT touch [explicit list of what's out of scope].

[Repeat for each task]

## Execution Order

**Parallel (start immediately):** T1, T3
**After T1:** T2
**After T2 + T3:** T4

**Critical path:** T1 → T2 → T4 ([N] sequential tasks)

## Done State

This feature is complete when:
- [Specific, testable criterion drawn from VECTOR.md quality gates or the feature description]
- [Another criterion]
- All tasks merged to [main branch name]
```

**If `--dry-run` was passed:** Output the manifest to the terminal only. Do not write the file.

**If `--format flat` was passed:** Also output a flat task list after the standard manifest, one line per task, suitable for piping to external tools or pasting into other systems:

```
## Flat Task List

[task-id] [branch] "[task name]"
[task-id] [branch] "[task name]"
[...]
```

After writing, output:

```
Mission manifest written to /vector/missions/[feature-slug].md

[N] tasks. Critical path: [N] sequential tasks.
[If agents are assigned:] [N] agents involved.
[If no agent model defined:] No agent model found in CLAUDE.md — tasks marked "unassigned."
```

## Arguments

- **No arguments:** Interactive — prompts for feature description
- **`[feature description]`:** Uses the argument directly, skips the prompt
- **`--dry-run`:** Generates and displays the manifest without writing the file
- **`--format flat`:** Appends a flat one-line-per-task list after the standard manifest for piping to external tools

## Output

`/vector/missions/[feature-slug].md`

## When to Run

- Before starting a multi-agent sprint
- After `/invest-doctrine` confirms doctrine is current — the manifest is only as good as the doctrine it reads
- When a feature is large enough to require more than one agent or more than one layer change

## Principles

- **Doctrine before decomposition.** If ARCHITECTURE.md doesn't declare layer ownership clearly, the manifest can't assign tasks correctly. Run `/invest-doctrine` first if you're not sure the doctrine is sound.
- **Atomic tasks only.** A task that touches three layers is three tasks. A task that requires another task to finish halfway through is a design error. Decompose until each task is independently completable.
- **Scope boundaries are as important as task descriptions.** An agent that knows what it does is useful. An agent that also knows what it must not do is safe. Every task gets an explicit scope boundary.
- **Dependency mapping prevents collisions.** Two agents editing the same file at the same time is not a scheduling problem — it's a decomposition failure. If two tasks share a file, one of them is wrong.
- **This skill is pre-flight, not planning.** It does not decide what to build — that decision comes from product research and VECTOR.md. It does not manage runtime sessions or agent dispatch. It bridges the gap: from "we know what to build" to "agents know what to do."
