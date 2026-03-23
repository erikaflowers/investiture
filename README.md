# Investiture

A project scaffold with clean architecture, structured doctrine, and a skill chain that enforces it. Built for Claude Code.

---

## Add to an existing project

Already have a codebase? Inject the skill chain and research schemas without touching your code:

```bash
npx investiture init
```

This adds:
- `.claude/skills/` -- Three skills that read and enforce your doctrine
- `vector/schemas/` -- Six research schemas (persona, JTBD, assumption, interview, competitive, blue ocean)
- `vector/research/`, `vector/decisions/`, `vector/audits/` -- Directory structure for structured findings

Then open Claude Code and run:

1. `/invest-backfill` — surveys your codebase and generates VECTOR.md, CLAUDE.md, and ARCHITECTURE.md
2. Review the generated files and fill in the `[OPERATOR: ...]` sections
3. `/invest-bootstrap` — writes Investiture instructions into CLAUDE.md so your agent follows doctrine
4. `/invest-doctrine` — validates everything is sound

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
```

### Skills

The skill chain reads your doctrine at runtime and enforces it. Skills live in `.claude/skills/` and are auto-discovered by Claude Code.

| Skill | Purpose |
|-------|---------|
| `/invest-backfill` | Survey an existing codebase and generate starter doctrine |
| `/invest-bootstrap` | Write Investiture instructions into CLAUDE.md so agents follow doctrine |
| `/invest-check` | Quick preflight — confirm doctrine is loaded and current |
| `/invest-doctrine` | Validate doctrine for completeness, consistency, and drift |
| `/invest-architecture` | Audit code against declared layers, imports, naming, tokens |

**Existing projects:** Run `/invest-backfill` first, then `/invest-bootstrap` to make the agent follow it.
**Greenfield projects:** Fill in the three doctrine files, run `/invest-bootstrap`, then `/invest-doctrine` to validate.
**Ongoing sessions:** Run `/invest-check` at session start, `/invest-architecture` before committing.

See [invest.md](invest.md) for the full skill reference, tiers, and version history.

See [invest.md](invest.md) for the full skill chain reference.

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
├── .claude/skills/        Skill chain (backfill, doctrine, architecture)
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
│   └── audits/            Skill audit reports
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
