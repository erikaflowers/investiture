# Investiture Skills

**Active skills for this project.** Each skill reads your doctrine files and enforces what you've written.

## The Chain

The foundation skills run in order. Each one depends on the one before it.

```
/invest-backfill       →  Bootstrap: creates doctrine from an existing project
/invest-doctrine       →  Is the doctrine sound?
/invest-architecture   →  Does the code follow the doctrine?
```

The v1.4 skills extend the chain into research, design, fleet coordination, and release:

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

**Foundation chain:** Backfill creates the doctrine. Doctrine validates it. Architecture enforces it.

**Research loop:** Validate plans what to test → Interview generates the guide → Synthesize records what you learned → feeds back into Validate.

**On demand:** Brief, ADR, Crew, Handoff, and Changelog run independently whenever needed. All read doctrine; none modify the foundation chain.

For greenfield projects (created from the Investiture template), start at `/invest-doctrine` — the templates are already there. For existing projects being retrofitted, start at `/invest-backfill`.

## Active Skills

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

# 2. Validate the generated doctrine
/invest-doctrine

# 3. Check the code against doctrine
/invest-architecture
```

**Greenfield project (from Investiture template):**

```bash
# 1. Check the doctrine itself
/invest-doctrine

# 2. If doctrine is sound, check the code against it
/invest-architecture

# Scope either skill to a specific file
/invest-doctrine ARCHITECTURE.md
/invest-architecture src/components

# Auto-fix simple architecture violations
/invest-architecture --fix
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

This copies eleven skill directories into your project:

**Foundation:**
- `.claude/skills/invest-backfill/` — generates doctrine from your existing code
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

## The Metaphor

In the Cosmere, Investiture is the raw magical energy that fuels every magic system. A Windrunner's Surges, an Allomancer's metals, a Lightweaver's illusions — all powered by Investiture, all bound by oaths.

Here, your doctrine is the oath. Skills are the Surges. They only work because you declared what you believe about your project. The more specific your doctrine, the more powerful your Skills become.

The reading order is the first oath.
