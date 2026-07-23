# Investiture

A project scaffold with a sidecar brain. Clean architecture, structured doctrine, a skill chain that enforces it — and a local control panel that tracks your project's past, present, and future in plain markdown files. Built for Claude Code.

---

## Start here: use this template

Investiture is a **GitHub template repository**. You don't clone it as a product — you generate your own repo from it and replace everything visible.

1. Click **Use this template** on GitHub (or `gh repo create my-project --template erikaflowers/investiture`)
2. `cd my-project && bash install.sh` — installs dependencies, including Claude Code itself
3. `npm run zvapps` and open **http://localhost:3067** — the control panel opens in zero state and walks you through naming your project (two questions; it seeds your PRD and an empty backlog)
4. `npm start` — your app at http://localhost:3000, currently a hello-world start page that exists to be deleted
5. Open the project in Claude Code and build

### Prerequisites

- A Mac, Linux machine, or Windows PC with an internet connection
- **[VS Code](https://code.visualstudio.com/)** — free code editor
- **[GitHub account](https://github.com/signup)** — free; version control and a backup of everything you build
- **Windows users:** run the install script from [Git Bash](https://git-scm.com/download/win) or [WSL](https://learn.microsoft.com/en-us/windows/wsl/install)

The install script detects your platform and handles the rest (Homebrew/Node on Mac, apt/dnf/pacman/zypper on Linux, winget/choco on Windows).

---

## The sidecar

The control panel at `zvapps/` is the flagship of the scaffold: a stable, non-AI companion that tracks:

- **Past** — doctrine edit history (every save snapshots to `.zv-history/`, one-click restore), audit runs, context catch-ups
- **Present** — a session activity feed from the telemetry log, skills inventory with last-used staleness
- **Future** — your PRD and a backlog kanban board

**Everything is markdown.** Backlog cards are markdown files with YAML front-matter; the board is just a view of them. The PRD is a markdown file. The telemetry log is human-readable JSONL. No databases — the files are the source of truth, hand-editable, and yours. The panel's write API touches exactly two territories (the `zvapps/` folder and the four doctrine files) and rejects everything else at the API layer.

Panel pages: **Overview** (recency + staleness cues), **Activity** (telemetry feed), **Board** (kanban — drag a card, the file changes), **Editor** (doctrine + PRD, with visible snapshot/restore), **Files** (rendered markdown browser), plus **Skills**, Doctrine, Design System, and Health from the workbench.

Agents participate through two rituals — read the PRD and backlog before working, log the session when they stop — defined in [CLAUDE.md](CLAUDE.md). Two honest limitations about telemetry: it reflects agent compliance with those rituals, not automatic instrumentation (if an agent skips the ritual, the activity feed and recency cards won't know the session happened); and the log is **advisory, not authoritative** — actors are self-reported and the local endpoint is unauthenticated, so recency should inform, never certify. Downstream consumers (Telltale) must treat it the same way. The full file formats, API surface, and telemetry event contract live in [`zvapps/ZV-CONTRACT.md`](zvapps/ZV-CONTRACT.md). Concurrency is last-write-wins: this is a local, single-user tool.

---

## Add to an existing project

Already have a codebase? Inject the skill chain and research schemas without touching your code:

```bash
npx investiture init
```

This adds:
- `.claude/skills/` — eight skills: doctrine chain (backfill, validate, enforce) + audit chain (scan, inventory, audit, remediate, verify)
- `vector/schemas/` — six research schemas (persona, JTBD, assumption, interview, competitive, blue ocean)
- `vector/research/`, `vector/decisions/`, `vector/audits/` — directory structure for structured findings

Then open Claude Code and run `/invest-backfill`. It surveys your codebase and generates VECTOR.md, CLAUDE.md, and ARCHITECTURE.md.

**Alternative (no npm):**

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/erikaflowers/investiture/main/inject.sh)
```

**Then add the control panel:**

```bash
npx investiture install-zvapps
npm run zvapps          # → http://localhost:3067
```

---

## Pull updates from upstream

```bash
npx investiture update --dry-run    # see what would change
npx investiture update              # apply
```

Updates replace the panel's code and merge new skills. They never touch what's yours: doctrine files (VECTOR.md, ARCHITECTURE.md, CLAUDE.md, DESIGN.md), `vector/` artifacts, your PRD, backlog, project config, telemetry log, doctrine snapshots, and `.env`. The rules are declarative in [`cli/update-manifest.json`](cli/update-manifest.json); the installed version is stamped in `.investiture-version.json`.

**Coming from 1.x?** See [docs/MIGRATION-2.0.md](docs/MIGRATION-2.0.md).

---

## What you get

### Doctrine

Three files that define your project before a line of code is written, plus one for its look:

1. **VECTOR.md** — project doctrine: why this exists, who it serves, what you know, what you still need to learn
2. **CLAUDE.md** — contributor onboarding for humans and agents, including the sidecar rituals
3. **ARCHITECTURE.md** — technical specification: layers, stack, conventions, naming, import rules
4. **DESIGN.md** — your design system as markdown, editable in the panel with live preview

### Architecture

Four layers. Claude knows to use them:

```
src/                    Your app (the start page lives here — delete it)
design-system/          tokens.css — colors, spacing, typography as CSS variables
core/                   Pure business logic (utils, state — no side effects, no DOM)
services/               External integrations (API client — swap for your backend)
```

### Research

The `/vector` directory holds structured research artifacts in machine-readable schemas:

```
vector/
  schemas/              6 JSON schemas (persona, JTBD, assumption, interview, competitive, blue ocean)
  research/             Your structured findings
  decisions/            Architecture Decision Records
  audits/               Skill chain audit reports
```

### Skills

Eight active skills in two chains, auto-discovered by Claude Code from `.claude/skills/` (eight more in `.claude/skills-optional/`).

**Doctrine chain:** `/invest-backfill` · `/invest-doctrine` · `/invest-architecture`
**Audit chain:** `/invest-preflight` · `/invest-manifest` · `/invest-repo-audit` · `/invest-remediate` · `/invest-verify-remediation`

**Existing projects:** run `/invest-backfill`, then `/invest-preflight`.
**Greenfield:** fill in the doctrine files, then run `/invest-doctrine` to validate.

See [invest.md](invest.md) for the full skill chain reference.

---

## What to do next

Open the project in Claude Code (`claude` in terminal) and try these, each teaches part of the system:

1. **"Add a todo list that uses design tokens, core logic, and localStorage"** — the four layers working together
2. **"Fetch data from a public API and display it in cards"** — the service layer, async, loading states
3. **"Add 'dark mode support' to the backlog and start on it"** — watch the card land on the board, then move as the agent works
4. **"Run /invest-preflight"** — your first audit; the Overview page's recency card notices

---

## The reading order

VECTOR.md → CLAUDE.md → ARCHITECTURE.md. Onboarding for humans and agents alike. CLAUDE.md is read automatically by Claude Code when it opens your project.

---

## Project structure

```
investiture/
├── VECTOR.md              Project doctrine (read first)
├── CLAUDE.md              Contributor onboarding + agent rituals (read second)
├── ARCHITECTURE.md        Technical guide (read third)
├── DESIGN.md              Design system as markdown
├── invest.md              Skill chain reference
├── .claude/
│   ├── skills/            Active skills (8: doctrine + audit chains)
│   └── skills-optional/   Available but not enabled (8 more)
├── cli/                   npm package — the `npx investiture` CLI
│   ├── bin/               init, install-zvapps, update
│   ├── templates/         What `npx investiture init` copies in
│   └── update-manifest.json   Declarative replace/merge/preserve rules
├── zvapps/                The sidecar
│   ├── ZV-CONTRACT.md     File formats, API, telemetry contract (public API)
│   ├── PRD.md             Your product plan (seeded by onboarding)
│   ├── PROJECT.md         Project config (name, description — front-matter)
│   ├── backlog/           One markdown file per backlog item
│   ├── telemetry/         events.jsonl — append-only session log (gitignored)
│   ├── .zv-history/       Doctrine snapshots (gitignored)
│   ├── control-panel/     React + Vite app, port 3067
│   │   ├── src/pages/zv/  Overview, Activity, Board, Editor, Files, Skills
│   │   ├── server/        Vite middleware plugins (zvApi + legacy)
│   │   └── core/zv/       Front-matter, allowlist, backlog, PRD, telemetry logic + tests
│   └── zv-ui/             Shared base design system (Labrador themes)
├── src/                   Your app — ships as a disposable ZV start page
├── design-system/         CSS tokens (yours)
├── core/                  Pure logic (yours)
├── services/              Integrations (yours)
├── vector/                Research and decisions
└── package.json           npm start · npm run zvapps · npm test
```

---

## Links

- [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Investiture on Zero Vector](https://zerovector.design/investiture)
- [Changelog](https://zerovector.design/investiture/changelog)

---

## License

MIT
