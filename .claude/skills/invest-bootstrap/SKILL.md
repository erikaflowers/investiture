# invest-bootstrap

Make the agent aware of Investiture. Updates CLAUDE.md so the agent knows to read doctrine files and invoke skills periodically.

This is the "make it stick" skill. Without it, agents generate code but ignore the doctrine sitting in the repo. This skill writes the instructions that make agents follow the methodology.

---

## When to run

- After `/invest-backfill` generates doctrine files
- When an agent keeps ignoring VECTOR.md or ARCHITECTURE.md
- When onboarding a new agent or persona to an existing Investiture project
- When CLAUDE.md exists but doesn't reference the doctrine system

## What it does

1. **Read existing CLAUDE.md** (if it exists). Note what's already there — never destroy existing content.

2. **Check for doctrine files.** Verify that VECTOR.md, CLAUDE.md, and ARCHITECTURE.md exist. If any are missing, tell the operator which ones are missing and suggest running `/invest-backfill` first. Do not proceed without at least VECTOR.md and ARCHITECTURE.md.

3. **Check for an Investiture section in CLAUDE.md.** Look for a section titled "## Investiture" or "## Doctrine" or "## Skills". If one already exists, report what's there and ask the operator if they want to update it. Do not overwrite without asking.

4. **Add the Investiture section to CLAUDE.md.** Append (do not replace existing content) a section that includes:

```markdown
## Investiture

This project uses [Investiture](https://github.com/erikaflowers/investiture) for structured doctrine and agent-first design.

### Reading order

Before writing any code, read these files in order:

1. **VECTOR.md** — Project doctrine. Why this exists, who it serves, constraints.
2. **CLAUDE.md** — This file. Contributor onboarding.
3. **ARCHITECTURE.md** — Technical authority. Layers, naming, imports, conventions.

ARCHITECTURE.md is the single technical authority. When in doubt about where a file goes or how to name it, ARCHITECTURE.md decides.

### Skills

Run these as needed — they are not meant to be run all at once:

| Skill | When to use |
|-------|-------------|
| `/invest-doctrine` | After editing any doctrine file. Validates completeness and consistency. |
| `/invest-architecture` | Before a commit or PR. Checks code follows declared conventions. |
| `/invest-check` | Quick preflight before starting work. Confirms doctrine is loaded and current. |

### Working with doctrine

- **Before starting a task:** Read VECTOR.md to understand why. Read ARCHITECTURE.md to understand how.
- **Before committing:** Run `/invest-architecture` to verify conventions.
- **When unsure about a decision:** Check if VECTOR.md or ARCHITECTURE.md already answers it. If not, make the decision and record it in `/vector/decisions/`.
- **Do not ignore doctrine files.** They exist because someone made deliberate decisions about this project. Follow them.
```

5. **Verify the section was added.** Re-read CLAUDE.md and confirm the Investiture section is present and well-formed.

6. **Report what changed.** Show the operator:
   - What was added to CLAUDE.md
   - Whether doctrine files were found
   - Any missing files or incomplete sections
   - Suggested next step (usually: "Run `/invest-doctrine` to validate your doctrine")

## Arguments

- No arguments. This skill reads the project state and acts accordingly.

## Rules

- **Never overwrite existing CLAUDE.md content.** Append only.
- **Never create VECTOR.md or ARCHITECTURE.md.** That's `/invest-backfill`'s job.
- **If CLAUDE.md doesn't exist at all,** create it from the Investiture template (see the CLAUDE.md template in this repo) and add the Investiture section.
- **Be explicit about what you changed.** The operator should be able to review the diff.
- **This skill is idempotent.** Running it twice should not duplicate the section.
