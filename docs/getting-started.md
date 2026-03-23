# Getting Started

## Two paths

### Path A: Add to an existing project

```bash
npx investiture init
```

Then open Claude Code:

```bash
claude
```

Run the core chain in order:

```bash
/invest-backfill          # Survey your project, generate doctrine files
# Review generated files. Fill in [OPERATOR: ...] sections.
/invest-bootstrap         # Write Investiture instructions into CLAUDE.md
/invest-doctrine          # Validate doctrine is complete and consistent
/invest-architecture      # Check code against declared conventions
```

On future sessions:

```bash
/invest-check             # Quick preflight — is doctrine loaded?
# ... work ...
/invest-architecture      # Verify before committing
```

### Path B: Start a new project

```bash
git clone https://github.com/erikaflowers/investiture.git my-project
cd my-project && bash install.sh
npm run start
```

Then:

1. **Edit VECTOR.md** — Fill in your project identity, audience, and constraints
2. **Edit CLAUDE.md** — Add your stack summary, key context, what not to do
3. **Edit ARCHITECTURE.md** — Define your layers, conventions, naming rules

Open Claude Code and run:

```bash
/invest-bootstrap         # Write Investiture instructions into CLAUDE.md
/invest-doctrine          # Validate your filled-in doctrine
```

## File reading order

For humans and AI agents alike:

1. `VECTOR.md` — *Why* this project exists, *who* it serves, *what* we know
2. `CLAUDE.md` — *How* the AI agent should behave in this project
3. `ARCHITECTURE.md` — *What* the technical implementation looks like
4. `README.md` — Public-facing documentation

## Why `/invest-bootstrap` matters

Doctrine files are passive. Your agent reads CLAUDE.md when it opens the project, but it doesn't re-read VECTOR.md or ARCHITECTURE.md every time it writes code.

`/invest-bootstrap` solves this by writing explicit instructions into CLAUDE.md that tell the agent:
- Read the doctrine files before starting work
- Follow ARCHITECTURE.md as the technical authority
- Run `/invest-check` at session start
- Run `/invest-architecture` before committing

Without this step, you have doctrine files sitting in your repo that agents ignore.

## What if my agent still ignores doctrine?

1. Run `/invest-check` — it will tell you if doctrine is missing, incomplete, or if the agent hasn't loaded it
2. Run `/invest-bootstrap` again — it re-establishes the instructions in CLAUDE.md
3. Make sure CLAUDE.md has the Investiture section — without it, the agent has no reason to check the other files

## Skill tiers

Not every skill is for every project. See [invest.md](../invest.md) for the full breakdown:

- **Core** (5 skills) — bootstrapping, validation, enforcement. Every project needs these.
- **Extended** (21+ skills) — planning, research, governance, team workflows. Pick what fits.

## Project structure

See ARCHITECTURE.md for the full breakdown.
