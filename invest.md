# Investiture Skills

**Active skills for this project.** Each skill reads your doctrine files and enforces what you've written.

## The Chain

Skills run in order. Each one depends on the one before it.

```
/invest-backfill       →  Bootstrap: creates doctrine from an existing project
/invest-doctrine       →  Is the doctrine sound?
/invest-architecture   →  Does the code follow the doctrine?
```

Backfill creates the doctrine. Doctrine validates it. Architecture enforces it.

For greenfield projects (created from the Investiture template), start at `/invest-doctrine` — the templates are already there. For existing projects being retrofitted, start at `/invest-backfill`.

## Active Skills

| Skill | Purpose | Invocation |
|-------|---------|------------|
| `invest-backfill` | Surveys an existing codebase and generates VECTOR.md, CLAUDE.md, and ARCHITECTURE.md by combining Investiture defaults with inferred project patterns | `/invest-backfill` |
| `invest-doctrine` | Audits VECTOR.md, CLAUDE.md, and ARCHITECTURE.md for completeness, consistency, contradictions, and drift from reality | `/invest-doctrine` |
| `invest-architecture` | Audits the codebase against layers, naming, imports, tokens, and conventions declared in ARCHITECTURE.md | `/invest-architecture` |

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

### When to Run Each Skill

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

## Forthcoming

| Skill | Purpose | Depends On | Version |
|-------|---------|------------|---------|
| `invest-alignment` | Traces features to user needs defined in VECTOR.md | `invest-doctrine` | v1.3 |
| `invest-provenance` | Links design decisions to research artifacts in /vector | `invest-doctrine` | v1.3 |
| `invest-onboarding` | Ensures doctrine stack is read before contributing | `invest-doctrine` | v1.3 |

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

This copies three skill directories into your project:
- `.claude/skills/invest-backfill/` — generates doctrine from your existing code
- `.claude/skills/invest-doctrine/` — validates doctrine files
- `.claude/skills/invest-architecture/` — enforces code against doctrine

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

The `/vector/` directory (research artifacts, schemas, decision records) is optional. Backfill does not create it — add it when you begin structured research.

## How Skills Work

Skills live in `.claude/skills/` and follow the [Agent Skills open standard](https://agentskills.io). They are automatically discovered by Claude Code (and 30+ other tools that support the standard).

Each skill reads your project's doctrine files — `VECTOR.md`, `CLAUDE.md`, `ARCHITECTURE.md` — and audits your codebase against what YOU declared. The rules aren't ours. They're yours. We just enforce them.

### Customize

Skills respect your customizations. If you change the stack, swap conventions, add layers, or rewrite your design principles — the skills adapt to YOUR doctrine, not a preset. `invest-backfill` infers from your actual project. `invest-doctrine` checks that your doctrine is internally consistent. `invest-architecture` checks that your code follows it.

## The Metaphor

In the Cosmere, Investiture is the raw magical energy that fuels every magic system. A Windrunner's Surges, an Allomancer's metals, a Lightweaver's illusions — all powered by Investiture, all bound by oaths.

Here, your doctrine is the oath. Skills are the Surges. They only work because you declared what you believe about your project. The more specific your doctrine, the more powerful your Skills become.

The reading order is the first oath.
