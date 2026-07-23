# Investiture — Contributor Onboarding

This file is for anyone — human or AI — about to work in this codebase. Read it after VECTOR.md, before ARCHITECTURE.md.

Investiture is a scaffold. It's also its own project. The `.claude/skills/` chain, the CLI at `cli/`, and the Control Panel at `zvapps/` are all built here and shipped to downstream consumers. When you work in this repo, you're working on the thing other projects will install.

---

## Reading Order

1. **VECTOR.md** — Project doctrine. Why Investiture exists, who it serves, what the constraints are.
2. **CLAUDE.md** — This file. What you need to know before touching code.
3. **ARCHITECTURE.md** — Technical specification. Layers, stack, conventions, structure, import rules.
4. **invest.md** — The skill chain reference. What each `/invest-*` skill does.

---

## Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend (app template) | React 19 + Vite 6 |
| Control Panel | React 19 + Vite 6 + react-markdown + remark-gfm |
| State | React Context + useReducer (no Redux, no Zustand) |
| Styling | CSS variables in `design-system/tokens.css` (no Tailwind, no CSS-in-JS) |
| Theme engine (zv-ui) | JS-driven CSS variable injection via `applyTheme()`, localStorage persistence, no `data-theme` attribute |
| Testing | Vitest |
| CLI | Plain Node.js, zero deps, published to npm as `investiture` |
| Skills | `.claude/skills/<name>/SKILL.md` with YAML frontmatter |
| Backend | None by default. Vite middleware plugins for control-panel APIs. |

---

## Key Context

Things that aren't obvious from the code but will cause wrong assumptions:

- **This repo is BOTH a scaffold and an active project.** `npx investiture init` ships the contents of `cli/templates/` to other projects. `npx investiture install-zvapps` fetches and copies the `zvapps/` directory. Changes to the root templates become changes to every downstream project on the next update.
- **The Control Panel is a sub-app at `zvapps/control-panel/`, not the main app.** It has its own `package.json`, Vite config, and node_modules. Run it with `npm run zvapps` from the repo root.
- **zv-ui (`zvapps/zv-ui/`) is consumed via Vite alias.** The control panel resolves `zv-ui` → `../zv-ui/src`. There's no npm publish step for zv-ui; it's always consumed via the alias from within the same `zvapps/` tree.
- **The CLI at `cli/bin/` is plain CommonJS Node with no dependencies.** It shells out to `curl` and `tar` instead of using libraries. Don't add npm deps to `cli/package.json`.
- **`cli/update-manifest.json` is the boundary.** It declares which paths get replaced, merged, preserved, or create-if-missing when a downstream runs `npx investiture update`. Adding a new user-owned file (like a new doctrine template) means updating this manifest.
- **Skills live in two places:** `.claude/skills/` (active) and `.claude/skills-optional/` (available but not enabled). The Control Panel's Skills page scans both. Upstream updates replace SKILL.md files in both directories per the merge rule.
- **Doctrine files are user-owned, never replaced by updates.** VECTOR.md, ARCHITECTURE.md, CLAUDE.md, DESIGN.md, and everything under `vector/` belong to the downstream project after install. The update command will not touch them.
- **The backlog and PRD are meant to be committed by downstream projects** — they are git-diffable markdown, deliberately NOT in the shipped `.gitignore`. The template ships an empty backlog (only `zvapps/backlog/.gitkeep`). **Investiture's own five internal cards are excluded on the maintainer machine via `.git/info/exclude`, which is local and never ships.** Because that exclusion makes them untracked, git operations offer them no protection — `git stash` in particular will drop them from the working tree without warning (it did, once; they were recovered from history). The system of record for the framework's own backlog is the Notion Roadmap, not this repo.

---

## What Not to Do

1. **Don't add npm dependencies to `cli/package.json`.** The CLI is intentionally dep-free so `npx investiture` is fast and reliable. Shell out to curl/tar if you need system tools.
2. **Don't commit changes to doctrine files in downstream installs of Investiture.** Work on the source files here in the Investiture repo. Downstreams are the test — they should NEVER push their content back upstream.
3. **Don't silently change the `update-manifest.json` categories.** Moving a path from `preserve` to `replace` (or vice versa) is a breaking change for every existing downstream. Document it, test it in a dry-run against zerovector first.
4. **Don't edit zvapps/control-panel/data/** — that's runtime state (skill tracking JSON). It's gitignored implicitly via the preserve rule; don't check changes in.
5. **Don't break the four-layer architecture** (`design-system/`, `core/`, `services/`, `src/`). The `/invest-architecture` skill enforces this for downstream projects — if it's broken here in the source, every downstream inherits the broken pattern.

---

## Commit Format

```
Co-Authored-By: [Agent Name] (Claude) <noreply@anthropic.com>
```

As of 2026-04-14, each agent handles their own commits, PRs, squash-merges, and release tags for micro-sprint work. Sellivan is reserved for big-picture cross-repo coordination.

---

## Release Process

1. Branch name: `feature/<short-description>`
2. Commit work on the feature branch
3. Open a PR via `gh pr create --base main`
4. Squash-merge: `gh pr merge <num> --squash`
5. Tag the release: `git tag -a v<x.y.z> -m "..."` and push
6. Delete the feature branch (local + remote)
7. Bump `cli/package.json` and `cli/update-manifest.json` versions in lock-step

---

## Standup Format

When asked for status:

```
Where we left off: [last task completed]
What is working: [current stable state]
Concerns: [anything requiring attention]
Blockers: [anything stopping progress]
```

---

## Agent Rituals — the Sidecar Contract

The control panel (`npm run zvapps`, port 3067) is this project's memory.
Its files — `zvapps/PRD.md`, `zvapps/backlog/`, `zvapps/telemetry/events.jsonl` —
are the source of truth; the GUI is a view. Every agent session follows two
rituals. The full schema is in `zvapps/ZV-CONTRACT.md`; concurrency is
last-write-wins.

### Startup ritual (before any work)

1. **Read the PRD** (`zvapps/PRD.md`) and **scan the backlog** (`zvapps/backlog/*.md`
   front-matter) so you know the plan and what is queued or in progress.
2. **Emit a session-start event** by appending one line to
   `zvapps/telemetry/events.jsonl` (create the directory if missing):

   ```bash
   echo '{"ts":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'","event":"session-start","actor":"agent:<name>","payload":{"agent":"<name>"}}' >> zvapps/telemetry/events.jsonl
   ```

### Shutdown ritual (end of session)

1. **Update backlog statuses** for anything you moved — edit the `status:`
   front-matter (enum: proposed / queued / in-progress / done / parked) or
   `PUT /api/zv/backlog/:id` if the panel is running. New commitments become
   new backlog files (`created-by: agent:<name>`).
2. **Append to the PRD changelog** when you shipped something a reader of the
   plan should know about (`## Changelog`, dated bullet, or `POST /api/zv/prd/append`).
3. **Write your context catch-up** wherever your agent config keeps it, then
   emit `context-catchup-written` and `session-end` events (same append
   pattern; `session-end` payload takes a one-line `summary`).

Skills that run audits should emit `audit-run` events — the Overview page's
recency cards read them.

---

## Current Release

**v2.0.0 (in review)** — "The Companion Sidecar Brain," on `sprint/investiture-2-0`
pending merge. The panel becomes a sidecar: `/api/zv/*` write API with
path allowlist and snapshot-on-write, telemetry event contract (public API —
see `zvapps/ZV-CONTRACT.md`), Board/Editor/Activity/Overview/Files pages,
zero state + onboarding wizard, ZV start page, agent rituals. Port 3067.
Migration notes: `docs/MIGRATION-2.0.md`.

Previous: **v1.5.0 (2026-04-14)** — Control Panel + zv-ui + update mechanism
(PR #6, tag v1.5.0), verified against zerovector as a live downstream.

---

## Links

- [Investiture on Zero Vector](https://zerovector.design/investiture)
- [Changelog](https://zerovector.design/investiture/changelog)
- [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code)
