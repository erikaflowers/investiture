# Investiture

A project scaffold with clean architecture, structured doctrine, and a skill chain that enforces it. Built for Claude Code.

---

## Add to an existing project

Already have a codebase? Inject the skill chain and research schemas without touching your code:

```bash
npx investiture init
```

This adds:
- `.claude/skills/` -- 26 skills that read, enforce, and extend your doctrine
- `vector/schemas/` -- Six research schemas (persona, JTBD, assumption, interview, competitive, blue ocean)
- `vector/research/`, `vector/decisions/`, `vector/audits/`, `vector/missions/`, `vector/handoffs/`, `vector/changelog/`, `vector/briefs/` -- Directory structure for structured findings

Then open Claude Code and run `/invest-backfill`. It surveys your codebase and generates VECTOR.md, CLAUDE.md, and ARCHITECTURE.md.

**Alternative (no npm):**

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/erikaflowers/investiture/main/inject.sh)
```

---

## Start a new project

Use the GitHub template for a full scaffold with React, Vite, and the doctrine system built in:

```bash
git clone https://github.com/erikaflowers/investiture.git my-project
cd my-project && bash install.sh
```

Or use `--fresh` to get starter doctrine templates without the app scaffold:

```bash
mkdir my-project && cd my-project && git init
npx investiture init --fresh
```

### Prerequisites

- A Mac, Linux machine, or Windows PC
- An internet connection
- **[VS Code](https://code.visualstudio.com/)** -- Free code editor. You'll use this to see what Claude Code is doing and to browse your project files.
- **[GitHub account](https://github.com/signup)** -- Free. Version control for your code: unlimited undo, branches to try ideas, and a backup of everything you build.
- **Windows users:** Run the install script from [Git Bash](https://git-scm.com/download/win) or [WSL](https://learn.microsoft.com/en-us/windows/wsl/install).

The install script handles everything else, including Claude Code itself.

The script detects your platform and installs the right dependencies:
- **Mac:** Homebrew and Node.js via brew
- **Linux/WSL:** Git and Node.js via your package manager (apt, dnf, pacman, zypper)
- **Windows (Git Bash):** Node.js via winget or choco

---

## Run

```bash
npm start
```

Your app opens at http://localhost:3000

---

## What you get

### Doctrine

Three files that define your project before a line of code is written:

1. **VECTOR.md** -- Project doctrine. Why this project exists, who it serves, what you know, what you still need to learn.
2. **CLAUDE.md** -- Contributor onboarding. What any human or AI needs to know before touching code.
3. **ARCHITECTURE.md** -- Technical specification. Layers, stack, conventions, naming, import rules.

### Architecture

Four layers. Claude knows to use them:

```
src/                    Your app (start here)
  App.jsx               App shell (layout, routing)
  App.css               Global styles
  components/           Reusable UI components

design-system/          Visual foundation
  tokens.css            Colors, spacing, typography as CSS variables

core/                   Pure business logic
  utils.js              Helper functions (no side effects)
  store.jsx             App state management (React Context)

services/               External integrations
  api.js                API client (swap for your backend)
```

### Research

The `/vector` directory holds structured research artifacts in machine-readable schemas:

```
vector/
  schemas/              6 JSON schemas (persona, JTBD, assumption, interview, competitive, blue ocean)
  research/             Your structured findings
  decisions/            Architecture Decision Records
  audits/               Skill chain audit reports
  missions/             Crew task manifests for multi-agent sprints
  handoffs/             Role-specific onboarding snapshots
  changelog/            Versioned release notes
  briefs/               Design briefs from research and doctrine
```

### Skills

The skill chain reads your doctrine at runtime and enforces it. 26 skills across six groups, auto-discovered by Claude Code from `.claude/skills/`.

**Getting Started:**

| Skill | What it does |
|-------|-------------|
| `/invest-start` | Detects project state, asks how you work, gives you a sequenced 5–8 skill path. Run this first. |
| `/invest-init` | Guided setup for new projects — asks questions, generates doctrine, scaffolds `/vector/`. |
| `/invest-backfill` | Survey an existing codebase and generate doctrine files from what's already there. |

**Foundation:**

| Skill | What it does |
|-------|-------------|
| `/invest-doctrine` | Audit doctrine files for completeness, consistency, and drift from the codebase. |
| `/invest-architecture` | Audit project structure against ARCHITECTURE.md declarations. |

**Research:**

| Skill | What it does |
|-------|-------------|
| `/invest-interview` | Generate user research discussion guides from unvalidated assumptions. |
| `/invest-synthesize` | Extract insights from raw research, propose patches to doctrine. |
| `/invest-validate` | Prioritize unvalidated assumptions by risk and generate a validation plan. |
| `/invest-capture` | Post-session knowledge capture — extracts assumptions, ADR candidates, and doctrine drift from git diff. |

**Planning:**

| Skill | What it does |
|-------|-------------|
| `/invest-prd` | Generate a PRD from VECTOR.md, personas, JTBD, and validated assumptions. |
| `/invest-scope` | Decompose a PRD into phased scope with MVP boundaries and effort sizing. |
| `/invest-brief` | Generate design briefs from personas, JTBD, and doctrine. |
| `/invest-adr` | Generate numbered Architecture Decision Records. |
| `/invest-metrics` | Map doctrine goals to trackable success metrics — North Star, leading indicators, guardrails. |
| `/invest-crew` | Decompose features into scoped agent tasks for multi-agent sprints. |

**Client:**

| Skill | What it does |
|-------|-------------|
| `/invest-proposal` | Generate a client-facing project proposal from doctrine, research, and audit findings. |
| `/invest-contract` | Generate a deliverable manifest with acceptance criteria. SOW-attachable. |
| `/invest-status` | Compile a client-facing status report from project data. |
| `/invest-handoff` | Generate role-specific onboarding docs (engineer, designer, agent, client). |
| `/invest-changelog` | Generate user-facing release notes from git log and VECTOR.md. |

**Governance:**

| Skill | What it does |
|-------|-------------|
| `/invest-benchmark` | Score Investiture adoption maturity across 7 dimensions. |
| `/invest-risk` | Generate a living risk register from doctrine, assumptions, ADRs, and audits. |
| `/invest-compliance` | Map doctrine and ADRs to regulatory frameworks (HIPAA, SOC 2, WCAG, GDPR). |
| `/invest-dependency` | Scan dependency tree for licensing, security, and maintenance health. |
| `/invest-trace` | Build a requirements traceability matrix from user needs through implementation. |
| `/invest-retro` | Generate sprint retrospectives from git activity and doctrine changes. |

**New to Investiture?** Run `/invest-start`. It detects your project state and tells you what to run next.
**Existing projects:** Run `/invest-backfill` → `/invest-doctrine` → `/invest-architecture`.
**New projects:** Run `/invest-init` for guided setup.

See [invest.md](invest.md) for the full skill chain reference and dependency map.

---

## How it works

Investiture is a feedback loop: you declare what your project is, the skills enforce what you declared, and knowledge captured during development flows back into the doctrine.

### The doctrine layer

Three files define your project before a line of code is written:

- **VECTOR.md** — Why this project exists, who it serves, what constraints apply, what assumptions you're making.
- **CLAUDE.md** — What any human or AI needs to know before touching code.
- **ARCHITECTURE.md** — Technical authority. Layers, stack, conventions, import rules, naming.

These files are the source of truth. Every skill reads them at runtime. When the code drifts from the doctrine, the skills catch it. When the doctrine drifts from reality, the skills catch that too.

### The skill chain

Skills are grouped by when you use them:

```
Getting Started       You're new. What do I run first?
  invest-start ──→ invest-init (new project)
                 ──→ invest-backfill (existing project)

Foundation            Is the doctrine sound? Does the code match?
  invest-doctrine ──→ invest-architecture

Research              What do we know? What are we guessing?
  invest-interview ──→ invest-synthesize ──→ invest-validate
                                         ──→ invest-capture (after coding)

Planning              What are we building? How do we scope it?
  invest-prd ──→ invest-scope ──→ invest-crew (multi-agent)
  invest-brief (design work)
  invest-adr (decisions)
  invest-metrics (success criteria)

Client                Proposals, contracts, status, handoffs.
  invest-proposal ──→ invest-contract ──→ invest-status ──→ invest-handoff
  invest-changelog (releases)

Governance            Are we healthy? Are we compliant?
  invest-benchmark ──→ invest-risk ──→ invest-compliance
  invest-dependency (supply chain)
  invest-trace (requirements coverage)
  invest-retro (sprint retrospective)
```

Skills chain naturally — the output of one becomes the input of the next. But every skill works standalone too. You don't need to run the whole chain to get value from one skill.

### The capture loop

This is where Investiture differs from static project scaffolds. After you code, `/invest-capture` reads your git diff, compares it against doctrine, and extracts:

- **New assumptions** embedded in code that aren't documented yet
- **ADR candidates** — architectural decisions made implicitly that should be recorded
- **Doctrine drift** — places where code and doctrine have diverged
- **Research gaps** — questions the code reveals that nobody has answered

This turns any coding session into structured knowledge, even vibe coding. The capture feeds back into doctrine, which feeds into the next round of skills.

### Common workflows

**"I just inherited a codebase."**
`/invest-backfill` → `/invest-doctrine` → `/invest-architecture`

**"I'm starting a new project."**
`/invest-start` → `/invest-init` → `/invest-doctrine`

**"I need to scope a feature."**
`/invest-prd` → `/invest-scope` → `/invest-crew`

**"I'm pitching a client."**
`/invest-benchmark` (on their codebase) → `/invest-proposal` → `/invest-contract`

**"I just finished a coding session."**
`/invest-capture` → review findings → update doctrine if needed

**"Is this project healthy?"**
`/invest-benchmark` → `/invest-risk` → `/invest-compliance` → `/invest-dependency`

---

## What to do next

Open this project in Claude Code (`claude` in terminal) and try these prompts, each one teaches a different architecture layer:

1. **"Change the app title and tagline using content/en.json"**
   Teaches: the content layer

2. **"Add a dark mode toggle using the design tokens"**
   Teaches: CSS variables, theme switching, data attributes

3. **"Add a todo list that uses content strings, design tokens, core logic, and localStorage"**
   Teaches: all four layers working together

4. **"Fetch data from a public API and display it in cards"**
   Teaches: the service layer, async/await, loading states

---

## The reading order

VECTOR.md, CLAUDE.md, ARCHITECTURE.md. Read them in that order. This is onboarding for both humans and agents.

CLAUDE.md is generated by `install.sh` and read automatically by Claude Code when it opens your project. It contains architecture rules, constraints, project structure, and starter prompts.

---

## Project structure

```
investiture/
├── VECTOR.md              Project doctrine (read first)
├── CLAUDE.md              Contributor onboarding (read second)
├── ARCHITECTURE.md        Technical guide (read third)
├── .claude/skills/        Skill chain (26 skills — see Skills section below)
├── src/                   Your app (start here)
│   ├── App.jsx            App shell with routing
│   ├── App.css
│   ├── main.jsx
│   ├── index.html
│   └── components/        Your UI components
│       └── ErrorBoundary.jsx
├── design-system/         CSS variables and tokens
│   └── tokens.css
├── core/                  Pure business logic
│   ├── utils.js
│   ├── utils.test.js      Example tests
│   └── store.jsx          State management
├── services/              External integrations
│   └── api.js
├── vector/                Research and decisions
│   ├── schemas/           6 research schemas
│   ├── research/          Your structured findings
│   ├── decisions/         Architecture Decision Records
│   ├── audits/            Skill audit reports
│   ├── missions/          Crew task manifests
│   ├── handoffs/          Role-specific onboarding snapshots
│   ├── changelog/         Versioned release notes
│   └── briefs/            Design briefs
├── .env.example           Environment variable template
├── invest.md              Skill chain reference
├── install.sh             One-time setup
├── package.json           Dependencies and scripts
└── README.md              You are here
```

---

## Links

- [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Investiture on Zero Vector](https://zerovector.design/investiture)
- [Changelog](https://zerovector.design/investiture/changelog)

---

## License

MIT
