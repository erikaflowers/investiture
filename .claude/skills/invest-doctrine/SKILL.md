---
name: invest-doctrine
description: "Audit the doctrine files themselves — VECTOR.md, CLAUDE.md, ARCHITECTURE.md — for completeness, internal consistency, cross-document contradictions, and drift from the actual codebase. Run this before invest-architecture. The doctrine must be sound before you enforce it."
argument-hint: "[path/to/specific-doctrine-file]"
---

# Investiture Skill: Doctrine Audit

You are auditing the foundation. Before any architecture skill can enforce the operator's rules, those rules must be complete, consistent, and grounded in reality. This skill checks the doctrine files themselves — not the code.

**This skill runs first.** `invest-architecture` assumes the doctrine is sound. This skill verifies that assumption.

## Step 1: Read All Doctrine Files

Read every doctrine file from the project root:

1. **`VECTOR.md`** — Project identity, audience, problem, constraints, design principles, quality gates.
2. **`CLAUDE.md`** — Agent persona, behavioral rules, overrides.
3. **`ARCHITECTURE.md`** — Layers, stack, conventions, naming, import rules, structure.

If any file is missing, flag it immediately as **critical** and note which downstream checks cannot run without it.

If a specific file path was passed as an argument, audit only that file — but still read the others for cross-reference checks.

## Step 2: Check VECTOR.md

VECTOR.md is the project's identity. It answers *what*, *who*, and *why*. Check:

### Completeness

- **Problem Statement** — Is it filled in or still the template placeholder? A real problem statement names a specific user and a specific pain. Template text like "What problem does this project solve?" means it hasn't been written.
- **Target Audience** — Is it specific? "Developers" is too vague. "Fiction authors managing 100K+ word manuscripts" is specific.
- **Core Value Proposition** — Is it one sentence about an outcome, not a feature list?
- **What This Is Not** — Are there explicit boundaries? This section prevents scope creep. Empty means unguarded scope.
- **Design Principles** — Are there at least two? Do they actually guide decisions, or are they generic platitudes? "Write clean code" is a platitude. "Explicit over clever" guides decisions.
- **Constraints** — Are hard constraints declared? Budget, timeline, platform requirements. If none exist, flag as a gap — every project has constraints.
- **Quality Gates** — Is "Definition of Done" filled in? Are ship criteria declared?

### Substance

- **Research status** — Are all artifacts "Not started"? That's fine for discovery stage, but if the project stage is "development" or later, research gaps are a risk worth flagging.
- **Key Assumptions** — Are there at least two? Are any marked as validated or invalidated, or are they all still hypotheses?
- **Open Questions** — Are there questions? A project with no open questions is either very mature or hasn't thought hard enough.
- **Project stage vs. content depth** — A project in "development" stage with an entirely template VECTOR.md is a mismatch. Flag it.

## Step 3: Check ARCHITECTURE.md

ARCHITECTURE.md is the technical authority. It tells the agent where everything goes. Check:

### Structural Requirements

These sections must exist and contain real content (not template placeholders):

- **Layer table** — Must have at minimum: layer name, directory location, and boundary rule for each layer. Every declared directory must exist on disk.
- **Naming conventions** — Must declare at least one convention with: file type, casing rule, and example.
- **Stack section** — Must name the technologies in use. Framework, state management, styling approach, testing framework.
- **Import direction** — Must explicitly declare which layers can import from which. Unidirectional flow must be clear.
- **Project structure tree** — Must be present. Declared directories must exist on disk, and directories on disk should be declared in the tree.

### Internal Consistency

- **Layer rules don't contradict each other.** If the UI layer says "imports from other layers," and a specific layer says "imported by none," that's a contradiction.
- **Stack matches layers.** If the stack says "React" but the layer table refers to `.vue` files, something drifted.
- **"What Not to Do" doesn't contradict conventions.** If conventions say "CSS variables from tokens.css" but the prohibitions don't mention hardcoded colors, that's a gap (not a contradiction, but worth noting).
- **Conventions are complete enough to audit against.** If invest-architecture were to run right now, would it have enough information to check every file? If naming conventions only cover `.jsx` files but the project also has `.ts` files, that's a gap.

### Reality Check — Structure vs. Disk

Read the declared project structure tree in ARCHITECTURE.md. Then check the actual filesystem.

- **Declared but missing:** Directory listed in the structure tree but doesn't exist on disk. Flag as **high** — the doctrine promises something that isn't there.
- **Exists but undeclared:** Directory on disk that isn't in the structure tree. Flag as **medium** — the doctrine doesn't account for something real.
- **Empty declared directories:** Directory exists but is empty. Flag as **info** — expected in early projects, worth noting in mature ones.

Do not flag `node_modules`, `.git`, `.claude`, `dist`, `build`, or other tooling/output directories as undeclared. Only check source directories.

## Step 4: Check CLAUDE.md

CLAUDE.md defines the agent persona. It's the lightest of the three — but it can override conventions, and overrides must not create contradictions.

- **Exists and is non-empty.**
- **If it declares convention overrides** (e.g., "use Tailwind instead of CSS variables"), verify that ARCHITECTURE.md either agrees or explicitly notes the override. An unacknowledged contradiction between CLAUDE.md and ARCHITECTURE.md means one of them is wrong.
- **If it references files or paths** (e.g., "always check /docs before answering"), verify those paths exist.

## Step 5: Cross-Doctrine Consistency

Check relationships between files:

- **VECTOR.md constraints vs. ARCHITECTURE.md stack.** If VECTOR.md says "no external dependencies," ARCHITECTURE.md should not list third-party libraries in its stack. If VECTOR.md says "must work offline," the services layer should account for that.
- **VECTOR.md design principles vs. ARCHITECTURE.md conventions.** If a design principle says "simplicity over features," but ARCHITECTURE.md describes six layers and a plugin system, flag the tension.
- **VECTOR.md stage vs. ARCHITECTURE.md completeness.** A project in "discovery" stage with a fully detailed ARCHITECTURE.md is fine (good planning). A project in "development" stage with placeholder ARCHITECTURE.md is a problem.
- **CLAUDE.md persona vs. ARCHITECTURE.md explanation depth.** If CLAUDE.md says "ship fast, minimal narration" but ARCHITECTURE.md defaults to teaching mode, note the mismatch so the operator can resolve it.

## Step 6: Drift Detection

This is the hard check. Doctrine says one thing; the codebase does another; and neither is necessarily wrong — the doctrine may have just fallen behind.

Scan the codebase for patterns that contradict declarations:

- **Stack drift** — ARCHITECTURE.md says React but the codebase has Svelte imports. ARCHITECTURE.md says Context for state but the codebase uses Zustand.
- **Layer drift** — ARCHITECTURE.md defines four layers but a fifth directory with source files has appeared.
- **Convention drift** — Naming conventions say PascalCase for components but 60% of component files use camelCase. The majority practice has drifted from the declared convention.
- **Token drift** — Design system tokens are declared but unused, or the codebase uses tokens that don't exist in the token file.

**Drift is not a violation.** Frame it as: "The doctrine says X. The codebase does Y. One of them should be updated." Do not assume which one is wrong.

## Step 7: Produce the Report

**Output the report to the terminal AND save it to `/vector/audits/invest-doctrine.md`.** Overwrite the file on each run — the current state is what matters, git has the history. Create the `/vector/audits/` directory if it does not exist.

```
## Doctrine Audit

**Files audited:** [list]
**Project stage:** [from VECTOR.md, or "not declared"]

### Findings

#### MISSING — critical
- `[filename]` — Doctrine file not found. [which downstream checks are blocked].

#### INCOMPLETE — high
- `VECTOR.md` — Problem Statement is template placeholder. Not yet written.
- `ARCHITECTURE.md` — No import direction rules declared. invest-architecture cannot check imports.

#### CONTRADICTION — high
- `VECTOR.md:constraints` says "no external dependencies." `ARCHITECTURE.md:stack` lists Zustand.

#### STRUCTURE — high/medium
- `ARCHITECTURE.md` declares `services/` but directory does not exist on disk.
- `src/hooks/` exists on disk but is not declared in ARCHITECTURE.md structure tree.

#### DRIFT — medium
- `ARCHITECTURE.md:stack` says Context + useReducer. Codebase uses Zustand in 4 files. Doctrine or code should be updated.

#### GAP — low
- `ARCHITECTURE.md:naming` only covers `.jsx` and `.js` files. Project also contains `.ts` files with no declared convention.
- `VECTOR.md:constraints` section is empty. Every project has constraints.

#### PLACEHOLDER — info
- `VECTOR.md:Key Assumptions` — All entries are template text. Expected in discovery stage.

### Summary
- Critical: N | High: N | Medium: N | Low: N | Info: N
- Doctrine health: [SOUND | GAPS FOUND | UNSOUND]

### Recommended Actions
[1-3 specific, actionable recommendations. Not generic advice. Name the file and section to fix.]
```

**Severity key:**

| Severity | Meaning |
|----------|---------|
| **Critical** | Doctrine file missing entirely. Other skills cannot run. |
| **High** | Incomplete section that blocks auditing, or contradiction between files. |
| **Medium** | Structure mismatch with disk, or codebase drift from declared patterns. |
| **Low** | Gaps in coverage — conventions that don't address all file types, empty constraint sections. |
| **Info** | Template placeholders. Expected early in a project's life. |

**Report rules:**
- Omit categories with zero findings.
- One sentence per finding. Name the file and section.
- "Recommended Actions" is limited to three items. Prioritize what unblocks invest-architecture from running cleanly.
- If the doctrine is sound, say so: "Doctrine health: SOUND. All files present, consistent, and grounded."

## Principles

- **The doctrine audits the doctrine.** You are checking documents against each other and against reality. You are not checking code quality — that's invest-architecture's job.
- **Drift is not failure.** Codebases evolve. Doctrine sometimes lags. Flag the gap. Don't assign blame.
- **Placeholders are fine in early stages.** A project in "discovery" with template VECTOR.md is normal. A project in "development" with template VECTOR.md is a problem. Stage matters.
- **Three recommendations, maximum.** The operator does not need a laundry list. They need to know what to fix first so the rest of the chain can run.
- **This skill protects the chain.** If doctrine is unsound, say so clearly. invest-architecture, invest-alignment, and every skill downstream depends on this verdict.
