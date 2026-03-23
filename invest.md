# Investiture Skills

**Active skills for this project.** Each skill reads your doctrine files and enforces what you've written.

## Skill Tiers

Not every skill is meant for every project. Investiture has a focused core and optional extensions.

### Core Skills

These handle bootstrapping, enforcement, and the ongoing work loop. Every Investiture project uses these.

| Skill | Purpose | When to run |
|-------|---------|-------------|
| `/invest-backfill` | Survey an existing codebase and generate VECTOR.md, CLAUDE.md, ARCHITECTURE.md | Once, when adopting Investiture |
| `/invest-bootstrap` | Write Investiture instructions into CLAUDE.md so agents follow doctrine | After backfill, or when agents ignore doctrine |
| `/invest-check` | Quick preflight — confirm doctrine is loaded and current | Start of session, before major work |
| `/invest-doctrine` | Validate doctrine for completeness, consistency, and drift | After editing doctrine files |
| `/invest-architecture` | Audit code against declared layers, imports, naming, tokens | Before commits and PRs |

### Extended Skills (v1.5, optional)

These add capabilities for teams that need them. They are organized into groups. Pick the ones that match your workflow — you don't need all of them.

| Group | Skills | What they cover |
|-------|--------|----------------|
| Getting Started | `invest-start`, `invest-init` | Guided onboarding for first-time users. `invest-start` detects project state and recommends a skill path. `invest-init` runs guided setup for new projects. |
| Research | `invest-interview`, `invest-synthesize`, `invest-validate`, `invest-capture` | User research loop: generate guides, extract insights, prioritize assumptions, capture learnings. |
| Planning | `invest-prd`, `invest-scope`, `invest-brief`, `invest-adr`, `invest-metrics`, `invest-crew` | Product planning: PRDs, scope decomposition, design briefs, ADRs, success metrics, multi-agent task breakdown. |
| Client | `invest-proposal`, `invest-contract`, `invest-status`, `invest-handoff`, `invest-changelog` | Client-facing artifacts: proposals, deliverable manifests, status reports, onboarding docs, release notes. |
| Governance | `invest-benchmark`, `invest-risk`, `invest-compliance`, `invest-dependency`, `invest-trace`, `invest-retro` | Maturity scoring, risk registers, regulatory mapping, dependency health, traceability, retrospectives. |

---

## The Core Chain

The five core skills run in a specific order. Each one builds on the one before it.

```
/invest-backfill       →  Survey project, generate doctrine
        ↓
/invest-bootstrap      →  Write Investiture instructions into CLAUDE.md
        ↓
/invest-check          →  Quick preflight (run anytime)
        ↓
/invest-doctrine       →  Is the doctrine sound?
        ↓
/invest-architecture   →  Does the code follow the doctrine?
```

Backfill creates the doctrine. Bootstrap makes the agent follow it. Check confirms it's loaded. Doctrine validates it. Architecture enforces it.

The v1.4+ skills extend the chain into research, design, fleet coordination, and release:

```
/invest-validate       →  Which assumptions are riskiest? What should we test?
/invest-interview      →  Generate a discussion guide for research sessions
/invest-synthesize     →  Take raw research → propose doctrine patches
/invest-brief          →  Generate a design brief from research + doctrine
/invest-adr            →  Capture an architecture decision before it becomes invisible
/invest-crew           →  Decompose a feature into scoped agent tasks
/invest-handoff        →  Role-specific onboarding doc (engineer, designer, agent, client)
/invest-changelog      →  User-facing release notes from git log + VECTOR.md
```

**Research loop:** Validate plans what to test → Interview generates the guide → Synthesize records what you learned → feeds back into Validate.

**On demand:** Brief, ADR, Crew, Handoff, and Changelog run independently whenever needed. All read doctrine; none modify the foundation chain.

After initial setup, the ongoing loop is:

```
/invest-check → work → /invest-architecture → commit
```

**New to Investiture?** Run `/invest-start` (v1.5) — it detects your project state and gives you a sequenced path.
**Greenfield projects:** Run `/invest-init` (v1.5) for guided setup, or fill in the templates and run `/invest-bootstrap`.
**Existing projects:** Run `/invest-backfill` → `/invest-bootstrap` → `/invest-doctrine`.

### Foundation (v1.3)

| Skill | Purpose | Invocation |
|-------|---------|------------|
| `invest-backfill` | Surveys an existing codebase and generates VECTOR.md, CLAUDE.md, and ARCHITECTURE.md by combining Investiture defaults with inferred project patterns | `/invest-backfill` |
| `invest-doctrine` | Audits VECTOR.md, CLAUDE.md, and ARCHITECTURE.md for completeness, consistency, contradictions, and drift from reality | `/invest-doctrine` |
| `invest-architecture` | Audits the codebase against layers, naming, imports, tokens, and conventions declared in ARCHITECTURE.md | `/invest-architecture` |

### Research (v1.4)

| Skill | Purpose | Invocation |
|-------|---------|------------|
| `invest-validate` | Reads `/vector/research/assumptions/`, prioritizes by risk (Impact x Confidence), generates a stage-appropriate validation sprint plan | `/invest-validate` |
| `invest-interview` | Generates structured user research discussion guides from unvalidated assumptions, with entry questions, probing techniques, and validation signals | `/invest-interview` |
| `invest-synthesize` | Takes raw research input, extracts structured insights, proposes specific patches to VECTOR.md and `/vector/` schema files with full diff preview | `/invest-synthesize` |

### Design & Decisions (v1.4)

| Skill | Purpose | Invocation |
|-------|---------|------------|
| `invest-brief` | Generates a design brief for a feature or flow from personas, JTBD, assumptions, and doctrine | `/invest-brief` |
| `invest-adr` | Generates numbered Architecture Decision Records from a decision description, cross-referencing existing ADRs and doctrine constraints | `/invest-adr` |

### Fleet & Release (v1.4)

| Skill | Purpose | Invocation |
|-------|---------|------------|
| `invest-crew` | Decomposes a feature into scoped agent tasks with branch names, commit prefixes, and scope boundaries | `/invest-crew` |
| `invest-handoff` | Generates role-specific onboarding docs (engineer, designer, agent, client) from doctrine and current `/vector/` state | `/invest-handoff` |
| `invest-changelog` | Reads git log since last tag and VECTOR.md value prop, writes plain-language release notes grouped by user-facing theme | `/invest-changelog` |

### Invocation Order

**Existing project (no doctrine files):**

```bash
# 1. Survey the project and generate doctrine
/invest-backfill

# Preview what would be generated without writing files
/invest-backfill --dry-run

# Generate only a specific doctrine file
/invest-backfill --only architecture

# 2. Make the agent follow doctrine
/invest-bootstrap

# 3. Validate the generated doctrine
/invest-doctrine

# 4. Check the code against doctrine
/invest-architecture
```

**Greenfield project (from Investiture template):**

```bash
# 1. Write Investiture section into CLAUDE.md
/invest-bootstrap

# 2. Check the doctrine itself
/invest-doctrine

# 3. If doctrine is sound, check the code against it
/invest-architecture

# Scope either skill to a specific file
/invest-doctrine ARCHITECTURE.md
/invest-architecture src/components

# Auto-fix simple architecture violations
/invest-architecture --fix
```

**Ongoing work sessions:**

```bash
# Quick preflight at start of session
/invest-check

# ... do your work ...

# Verify before committing
/invest-architecture
```

**Research loop:**

```bash
# 1. Prioritize which assumptions to test
/invest-validate

# Scope to a single assumption or override project stage
/invest-validate --assumption user-needs-offline
/invest-validate --stage beta

# 2. Generate a discussion guide for interviews
/invest-interview

# Scope to a specific assumption or theme
/invest-interview --assumption user-needs-offline
/invest-interview --theme onboarding
/invest-interview --format script   # word-for-word script for new interviewers

# 3. After sessions, synthesize findings into doctrine patches
/invest-synthesize --source path/to/interview-notes.md

# Preview changes without writing
/invest-synthesize --dry-run
```

**Design & decisions:**

```bash
# Generate a design brief before starting design work
/invest-brief "Onboarding flow for first-time users"
/invest-brief --dry-run

# Capture an architecture decision
/invest-adr "Use Supabase for auth instead of custom JWT"
/invest-adr --status accepted
```

**Fleet & release:**

```bash
# Decompose a feature into agent tasks before a sprint
/invest-crew "Export agent profiles as portable JSON"
/invest-crew --format flat   # also output one-line-per-task for piping

# Generate onboarding docs for a specific role
/invest-handoff --role engineer
/invest-handoff --role agent
/invest-handoff --role client

# Write a changelog entry
/invest-changelog
/invest-changelog --since v1.3.0 --version 1.4.0
/invest-changelog --dry-run
```

### When to Run Each Skill

**Foundation:**

Run `/invest-backfill` when:
- You have an existing project with no doctrine files
- You adopted Investiture but never filled in the templates
- You want to understand what Investiture would infer about your project (`--dry-run`)

Run `/invest-bootstrap` when:
- After `/invest-backfill` generates doctrine files
- When agents keep ignoring VECTOR.md or ARCHITECTURE.md
- When onboarding a new agent to an Investiture project
- When CLAUDE.md exists but doesn't reference the doctrine system

Run `/invest-check` when:
- At the start of a work session
- Before starting a new feature or significant change
- When an agent seems to be ignoring doctrine
- As a quick sanity check before a commit

Run `/invest-doctrine` when:
- You have edited any doctrine file (VECTOR.md, CLAUDE.md, ARCHITECTURE.md)
- You suspect the doctrine has drifted from the codebase
- After `/invest-backfill` generates files, to validate them
- Before running `/invest-architecture` for the first time on a project

Run `/invest-architecture` when:
- You want to verify the codebase follows declared conventions
- Before a commit or PR, as a structural check
- After significant refactoring

**Research:**

Run `/invest-validate` when:
- Starting a sprint and deciding what to test this cycle
- After `/invest-synthesize` updates assumptions — risk rankings may have changed
- Before major feature investment — validate the assumptions that justify it

Run `/invest-interview` when:
- Before any user research session — do not run sessions without a guide
- After `/invest-validate` identifies which assumptions to test
- When onboarding a non-researcher to run interviews (`--format script`)

Run `/invest-synthesize` when:
- After user interviews or usability sessions
- After a beta feedback round
- After running assumption validation experiments

**Design & Decisions:**

Run `/invest-brief` when:
- Before starting design work on a feature or flow
- When onboarding a designer to the project
- After `/invest-synthesize` updates personas or JTBD — regenerate briefs to check if direction changed

Run `/invest-adr` when:
- Before committing to a new dependency or external service
- Before adopting a new architectural pattern
- When the same decision keeps coming up — record it so it stops being relitigated

**Fleet & Release:**

Run `/invest-crew` when:
- Before starting a multi-agent sprint
- When a feature requires more than one agent or more than one layer change

Run `/invest-handoff` when:
- Onboarding a contractor or new team member
- Before starting a new cold agent session (`--role agent`)
- Before a client check-in (`--role client`)

Run `/invest-changelog` when:
- At release time, before publishing release notes
- After a sprint, to communicate what shipped
- Before tagging a release — use `--dry-run` to preview

## Forthcoming

| Skill | Purpose | Depends On | Version |
|-------|---------|------------|---------|
| `invest-alignment` | Traces features to user needs defined in VECTOR.md | `invest-doctrine` | TBD |
| `invest-provenance` | Links design decisions to research artifacts in /vector | `invest-doctrine` | TBD |

All forthcoming skills depend on `invest-doctrine`. Sound doctrine is the foundation the entire chain trusts.

## Adopting Investiture on an Existing Project

Skills are discovered from your project's `.claude/skills/` directory. They do not install globally — each project carries its own skill chain. This is intentional: skills read YOUR doctrine, so they live next to YOUR code.

### Step 1: Copy the skills into your project

```bash
# From your existing project directory
cp -r /path/to/investiture/.claude/skills/ .claude/skills/
```

If you don't have the Investiture repo locally:

```bash
# Clone it, copy the skills, clean up
git clone https://github.com/erikaflowers/investiture.git /tmp/investiture
mkdir -p .claude/skills
cp -r /tmp/investiture/.claude/skills/* .claude/skills/
rm -rf /tmp/investiture
```

This copies the skill directories into your project:

**Foundation (core):**
- `.claude/skills/invest-backfill/` — generates doctrine from your existing code
- `.claude/skills/invest-bootstrap/` — writes Investiture instructions into CLAUDE.md
- `.claude/skills/invest-check/` — quick preflight before work
- `.claude/skills/invest-doctrine/` — validates doctrine files
- `.claude/skills/invest-architecture/` — enforces code against doctrine

**Research:**
- `.claude/skills/invest-validate/` — assumption risk prioritization + validation planning
- `.claude/skills/invest-interview/` — structured user research discussion guides
- `.claude/skills/invest-synthesize/` — research intake → doctrine patches

**Design & Decisions:**
- `.claude/skills/invest-brief/` — design briefs from research + doctrine
- `.claude/skills/invest-adr/` — architecture decision records

**Fleet & Release:**
- `.claude/skills/invest-crew/` — multi-agent task decomposition
- `.claude/skills/invest-handoff/` — role-specific onboarding docs
- `.claude/skills/invest-changelog/` — user-facing release notes from git log

### Step 2: Run backfill

```bash
# Open Claude Code in your project, then:
/invest-backfill
```

Backfill will survey your codebase — README, package manifest, directory structure, config files, git history — and generate VECTOR.md, CLAUDE.md, and ARCHITECTURE.md with a mix of Investiture defaults and inferred content from your project.

### Step 3: Review, then validate

Backfill generates drafts. Review the `[OPERATOR: ...]` sections and fill in what it couldn't infer. Then:

```bash
/invest-bootstrap       # Make the agent follow doctrine
/invest-doctrine        # Validate the doctrine is sound
/invest-architecture    # Check code against doctrine
```

### What gets committed

The skills themselves (`.claude/skills/`) and the doctrine files (`VECTOR.md`, `CLAUDE.md`, `ARCHITECTURE.md`) should be committed to your repo. They are part of your project now. Future contributors and agents will discover them automatically.

The `/vector/` directory (research artifacts, schemas, decision records) is created by backfill with `.gitkeep` files and a README. Commit the structure — it gives the doctrine files' `knowledge:` references somewhere to resolve, and gives audit reports a home. If you prefer to defer directory creation, pass `--no-vector` during backfill.

### Audit reports and outputs

Skills write to `/vector/`:

| Skill | Output Location |
|-------|-----------------|
| `invest-backfill` | `/vector/audits/invest-backfill.md` |
| `invest-bootstrap` | (no report — modifies CLAUDE.md directly) |
| `invest-check` | (no report — prints to console only) |
| `invest-doctrine` | `/vector/audits/invest-doctrine.md` |
| `invest-architecture` | `/vector/audits/invest-architecture.md` |
| `invest-synthesize` | `/vector/audits/invest-synthesize.md` |
| `invest-validate` | `/vector/research/assumptions/validation-plan-[date].md` |
| `invest-interview` | `/vector/research/interviews/guide-[slug]-[date].md` |
| `invest-brief` | `/vector/briefs/[feature-slug]-[date].md` |
| `invest-adr` | `/vector/decisions/ADR-[NNN]-[slug].md` |
| `invest-crew` | `/vector/missions/[feature-slug].md` |
| `invest-handoff` | `/vector/handoffs/[role]-[date].md` |
| `invest-changelog` | `/vector/changelog/[version].md` + `CHANGELOG.md` |

Audit files are overwritten on each run — the current state is what matters, git has the history. Snapshot files (briefs, handoffs, interview guides) are never overwritten — each is a point-in-time document. The relevant directories are created automatically if they do not exist.

## How Skills Work

Skills live in `.claude/skills/` and follow the [Agent Skills open standard](https://agentskills.io). They are automatically discovered by Claude Code (and 30+ other tools that support the standard).

Each skill reads your project's doctrine files — `VECTOR.md`, `CLAUDE.md`, `ARCHITECTURE.md` — and audits your codebase against what YOU declared. The rules aren't ours. They're yours. We just enforce them.

### Customize

Skills respect your customizations. If you change the stack, swap conventions, add layers, or rewrite your design principles — the skills adapt to YOUR doctrine, not a preset. `invest-backfill` infers from your actual project. `invest-doctrine` checks that your doctrine is internally consistent. `invest-architecture` checks that your code follows it.

## First 5 Minutes

You just installed Investiture on an existing project. Here's what happens.

**Minute 0-1: Install.**
`npx investiture init` adds `.claude/skills/` and `vector/` to your project. Your code is untouched.

**Minute 1-2: Open Claude Code.**
Run `claude` in your project. Claude Code auto-discovers the skills in `.claude/skills/`.

**Minute 2-3: Backfill.**
Run `/invest-backfill`. The agent reads your README, package.json, config files, directory structure, and git history. It generates VECTOR.md, CLAUDE.md, and ARCHITECTURE.md with `[OPERATOR: ...]` prompts for things it couldn't infer.

**Minute 3-4: Review.**
Open the generated files. Fill in the `[OPERATOR: ...]` sections — who your users are, what your constraints are, what trade-offs you've made. The agent inferred what it could. You fill in the rest.

**Minute 4-5: Bootstrap.**
Run `/invest-bootstrap`. This writes an Investiture section into CLAUDE.md that tells the agent to read doctrine files and follow them. Without this step, the doctrine exists but the agent doesn't know to check it.

**You're set.** On future sessions, run `/invest-check` as a quick preflight, then work normally. Run `/invest-architecture` before committing.

---

## Why Agents Don't Follow Doctrine Automatically

Doctrine files are passive. An agent reads CLAUDE.md when it opens a project, but it doesn't re-read VECTOR.md or ARCHITECTURE.md every time it writes code. If the agent isn't explicitly told to check doctrine, it will drift.

This is why Investiture uses active skills, not just passive docs:

- **`/invest-bootstrap`** writes instructions into CLAUDE.md that tell the agent to check doctrine
- **`/invest-check`** is a quick preflight you run at the start of a session
- **`/invest-architecture`** catches drift before it gets committed

The pattern is: **tell the agent once (bootstrap), remind it periodically (check), catch mistakes (architecture).**

If your agent is ignoring doctrine, run `/invest-bootstrap` to re-establish the instructions, then `/invest-check` to confirm they're loaded.

---

## Version History

| Version | What changed |
|---------|-------------|
| v1.0 | Initial scaffold: VECTOR.md, CLAUDE.md, ARCHITECTURE.md templates |
| v1.1 | Added `invest-backfill` — retrofit doctrine onto existing projects |
| v1.2 | Added `invest-doctrine` — validate doctrine completeness and consistency |
| v1.3 | Added `invest-architecture` — audit code against declared conventions |
| v1.4 | Added `/vector` directory structure, research schemas, install script |
| v1.5 | Added `invest-bootstrap` and `invest-check` (active enforcement). Skill tiers (core vs extended). First-5-minutes guide. |

If you installed before v1.5 and only have 3 skills, run `npx investiture init` again — it adds new skills without overwriting existing doctrine files.

---

## The Metaphor

In the Cosmere, Investiture is the raw magical energy that fuels every magic system. A Windrunner's Surges, an Allomancer's metals, a Lightweaver's illusions — all powered by Investiture, all bound by oaths.

Here, your doctrine is the oath. Skills are the Surges. They only work because you declared what you believe about your project. The more specific your doctrine, the more powerful your Skills become.

The reading order is the first oath.
