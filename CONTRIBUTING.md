# Contributing to Investiture

## Before you start

1. Read **VECTOR.md** — project doctrine, constraints, and assumptions.
2. Read **CLAUDE.md** — contributor onboarding.
3. Read **ARCHITECTURE.md** — layers, stack, conventions.

All PRs are reviewed before merge. Write clear descriptions — the reviewer should understand what changed and why without reading every file.

## Adding or modifying skills

Skills live in `.claude/skills/invest-*/SKILL.md`. Each skill needs:

- Frontmatter: `name`, `description`, `argument-hint`, `disable-model-invocation: true`
- A clear step-by-step instruction set
- An `## Arguments` section
- An `## Output` section (where artifacts are written)
- A `## When to Run` section
- A `## Principles` section

### Skill naming

- Prefix: `invest-`
- Use lowercase, hyphen-separated names
- The name should describe what the skill does, not who uses it

### Skill groups

Skills belong to one of six groups:

| Group | Skills |
|-------|--------|
| **Getting Started** | invest-start, invest-init, invest-backfill |
| **Foundation** | invest-doctrine, invest-architecture |
| **Research** | invest-interview, invest-synthesize, invest-validate, invest-capture |
| **Planning** | invest-prd, invest-scope, invest-brief, invest-adr, invest-metrics, invest-crew |
| **Client** | invest-proposal, invest-contract, invest-status, invest-handoff, invest-changelog |
| **Governance** | invest-benchmark, invest-risk, invest-compliance, invest-dependency, invest-trace, invest-retro |

When adding a skill, place it in the correct group and update the README skill table.

## Pull request requirements

Use the PR template (auto-loaded by GitHub). Every PR that touches skills must:

1. **State the before/after skill count.** Example: "11 existing + 3 new = 14 total."
2. **List every new or modified skill** in a table with one-line descriptions.
3. **Update these docs in the same PR:**
   - `README.md` — skill tables, skill count in intro and project structure
   - `vector/skill-chain.md` — dependency map, if the new skill chains to/from others
   - `invest.md` — full skill chain reference, if it exists
4. **Verify all numbers** in the PR description against the actual diff before opening.
5. **Keep PRs reviewable.** If adding more than ~5 skills, split into themed PRs.

### Commit messages

Use conventional commits:

```
feat: add invest-risk and invest-compliance governance skills
fix: invest-capture handles empty diff gracefully
docs: update README skill tables for v1.5
```

Include the co-authored trailer:

```
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

## Running skills against a test codebase

Before opening a PR, validate new skills against a real codebase:

```bash
# Clone a test target
git clone https://github.com/celanthe/clarion /tmp/clarion-test
cd /tmp/clarion-test

# Run the skill chain
claude "/invest-backfill"
claude "/invest-doctrine"
claude "/invest-architecture"
```

Check that outputs land in the correct `/vector/` paths and contain no template placeholders.

## What not to do

- Don't open a PR with a description written mid-development. Rewrite it from scratch after the last commit.
- Don't claim a skill count without counting the actual files.
- Don't reference workflow paths, integrations, or concepts without explaining them.
- Don't leave the README out of date. If you added skills, the README must reflect it in the same PR.
