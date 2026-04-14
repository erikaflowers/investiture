---
name: invest-preflight
description: Quick reconnaissance pass on a codebase to establish project type, tech stack, structure, scale, and conventions before running deeper skills like /invest-manifest or /invest-repo-audit. Run this first on any unfamiliar repo.
version: 1.0.0
created: 2026-03-21
updated: 2026-03-21
author: Qin
disable-model-invocation: true
allowed-tools: Glob, Grep, Read, Bash
argument-hint: [path-to-repo]
---

# Preflight — Codebase Intake

You are performing a fast reconnaissance pass on an unfamiliar codebase. Your job is to orient yourself and the operator so that subsequent work (manifest, audit, feature work, debugging) starts from a position of understanding — not guessing.

This is a 2-minute scan, not a deep dive. Speed over completeness. You are answering: "What is this, what's it made of, how big is it, and what should I watch out for?"

## Target

The codebase at `$ARGUMENTS`. If no argument is provided, use the current working directory.

## Scan Sequence

Run these in parallel where possible.

### 1. Identify the project

Read whichever of these exist (check in order, stop at first match per category):

**Package manifest:**
- `package.json`, `package-lock.json` or `yarn.lock` or `pnpm-lock.yaml`
- `Cargo.toml`
- `pyproject.toml`, `setup.py`, `requirements.txt`, `Pipfile`
- `go.mod`
- `Gemfile`
- `pom.xml`, `build.gradle`
- `composer.json`
- `*.csproj`, `*.sln`

**Entry points:**
- `src/main.*`, `src/index.*`, `src/app.*`, `src/App.*`
- `main.*`, `index.*`, `app.*` at root
- `cmd/`, `bin/`, `lib/`

**Config files:**
- `tsconfig.json`, `vite.config.*`, `webpack.config.*`, `next.config.*`
- `netlify.toml`, `vercel.json`, `fly.toml`, `railway.json`, `Dockerfile`, `docker-compose.yml`
- `.env.example`, `.env.sample`

**Documentation:**
- `README.md`, `CLAUDE.md`, `CONTRIBUTING.md`
- `docs/` directory existence

### 2. Measure scale

Run these commands:
```bash
# File count by extension (top 10)
find . -type f -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/dist/*' -not -path '*/build/*' -not -path '*/target/*' -not -path '*/__pycache__/*' -not -path '*/vendor/*' | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -20

# Total source file count
find . -type f -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/dist/*' -not -path '*/build/*' -not -path '*/target/*' -not -path '*/__pycache__/*' -not -path '*/vendor/*' | wc -l

# Directory structure (2 levels deep)
find . -maxdepth 2 -type d -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/dist/*' | sort

# Git activity (if git repo)
git log --oneline -10 2>/dev/null
git shortlog -sn --no-merges 2>/dev/null | head -5
```

### 3. Detect patterns

Search for indicators of:

**Testing:**
- Glob for `*.test.*`, `*.spec.*`, `__tests__/`, `tests/`, `test/`, `spec/`
- Check for test runner config: `jest.config.*`, `vitest.config.*`, `pytest.ini`, `.rspec`, `Cargo.toml [dev-dependencies]`

**CI/CD:**
- `.github/workflows/`, `.gitlab-ci.yml`, `.circleci/`, `Jenkinsfile`, `bitbucket-pipelines.yml`

**Linting/Formatting:**
- `.eslintrc*`, `.prettierrc*`, `biome.json`, `.rubocop.yml`, `ruff.toml`, `.golangci.yml`

**Database:**
- Grep for migration directories: `migrations/`, `db/migrate/`, `alembic/`, `prisma/`
- Grep for ORM patterns: `prisma`, `drizzle`, `sequelize`, `sqlalchemy`, `activerecord`, `diesel`
- Check for schema files: `schema.prisma`, `schema.sql`, `*.migration.*`

**Auth:**
- Grep for auth patterns: `jwt`, `oauth`, `passport`, `auth0`, `clerk`, `supabase.auth`, `firebase.auth`

**State management (frontend):**
- Grep for: `redux`, `zustand`, `jotai`, `recoil`, `mobx`, `pinia`, `vuex`, `context`, `useState`

### 4. Check for hazards

Quick scan for things that will trip up subsequent work:

- **Monorepo?** Check for `workspaces` in package.json, `lerna.json`, `turbo.json`, `nx.json`, `pnpm-workspace.yaml`
- **Multiple languages?** If the file extension scan shows 3+ language types, note it
- **Generated code?** Check for `generated/`, `__generated__/`, `*.gen.*`, `codegen` in config
- **Secrets in repo?** Quick grep for `sk-`, `ghp_`, `AKIA`, `-----BEGIN`, common API key patterns in source files (not .env)
- **Large files?** Any source file over 1000 lines: `find . -type f -name '*.{js,jsx,ts,tsx,py,rb,go,rs,java}' -not -path '*/node_modules/*' | xargs wc -l 2>/dev/null | sort -rn | head -10`
- **Lock file freshness?** Compare lock file modification date to package manifest date

## Output Format

Do NOT write a file. Output directly to the conversation in this format:

```
PREFLIGHT — [project name]
═══════════════════════════════════════════════════════════════

Project:      [one-line description]
Type:         [web app | API | CLI | library | monorepo | static site | mobile app | other]
Language:     [primary language(s)]
Framework:    [framework + version, or "none"]
Database:     [database + ORM, or "none detected"]
Hosting:      [detected hosting platform, or "unknown"]
Auth:         [auth approach, or "none detected"]

Scale:
  Files:      [total source file count]
  Languages:  [breakdown by extension, top 5]
  LOC:        [approximate, if easy to determine]
  Size:       [SMALL (<50 files) | MEDIUM (50-200) | LARGE (200-500) | VERY LARGE (500+)]

Structure:
  Source:     [where source code lives — src/, lib/, app/, etc.]
  Tests:      [where tests live, or "none detected"]
  Config:     [notable config files]
  Docs:       [what documentation exists]
  CI/CD:      [what CI/CD exists, or "none"]

Git:
  Branch:     [current branch]
  Recent:     [last commit date + message]
  Authors:    [top contributors, count]
  Activity:   [active | dormant | archived]

Hazards:
  [list anything that would surprise someone working in this repo]
  [monorepo structure, generated code, missing tests, secrets in code, etc.]
  [or "None detected" if clean]

Recommended next steps:
  [ ] /invest-manifest — to inventory everything
  [ ] /invest-repo-audit — to assess quality
  [ ] [other context-specific suggestions]

═══════════════════════════════════════════════════════════════
```

## Rules

- **Fast.** This should take under 2 minutes. Don't read every file — read manifests, entry points, and READMEs. Glob and grep for everything else.
- **No files written.** Output to conversation only. This is context-setting, not a deliverable.
- **Flag surprises.** The Hazards section is the most valuable part. If there's a 3000-line god file, a checked-in .env, a missing lock file, or a monorepo with 14 packages — say so. These are the things that will waste time if discovered later.
- **Be honest about unknowns.** If you can't determine the database or auth approach from a quick scan, say "not detected" rather than guessing.
- **Suggest next steps.** Based on what you found, recommend whether /invest-manifest, /invest-repo-audit, or something else is the right next move.
