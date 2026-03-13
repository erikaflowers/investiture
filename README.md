# Investiture

A React scaffold with clean architecture for learning to build with Claude Code.

---

## Prerequisites

- A Mac, Linux machine, or Windows PC
- An internet connection
- **[VS Code](https://code.visualstudio.com/)** — Free code editor. You'll use this to see what Claude Code is doing and to browse your project files. Download and install it before the workshop.
- **[GitHub account](https://github.com/signup)** — Free. This is how you'll save your work, undo mistakes, and experiment safely. Think of it as version control for your code — unlimited undo, branches to try ideas without breaking what works, and a backup of everything you build. If you don't have an account, create one now. It takes 2 minutes.
- **Windows users:** Run the install script from [Git Bash](https://git-scm.com/download/win) or [WSL](https://learn.microsoft.com/en-us/windows/wsl/install).

The install script handles everything else — including Claude Code itself.

---

## Setup

```bash
git clone https://github.com/erikaflowers/investiture.git
cd investiture
bash install.sh
```

The script detects your platform and installs the right dependencies:
- **Mac:** Homebrew and Node.js via brew
- **Linux/WSL:** Git and Node.js via your package manager (apt, dnf, pacman, zypper)
- **Windows (Git Bash):** Node.js via winget or choco

It also installs project dependencies and creates a CLAUDE.md file that tells
Claude Code about your project.

---

## Run

```bash
npm start
```

Your app opens at http://localhost:3000

To see the interactive examples: `npm run examples` (opens at :3001)

---

## What just happened?

When you ran `install.sh`, it:

1. **Detected your platform** — Mac, Linux, WSL, or Windows (Git Bash)
2. **Ensured Git is available** — Xcode CLT on Mac, package manager on Linux, or checked for it on Windows
3. **Ensured Node.js is available** — via Homebrew, your Linux package manager, or winget/choco on Windows
4. **Installed dependencies** — React and Vite (a fast dev server)
5. **Installed Claude Code** — the AI coding assistant (if not already installed)
6. **Created CLAUDE.md** — a file that briefs Claude Code on your project structure and rules

Your app is a React component in `src/App.jsx` with styles in `src/App.css`.
When you edit these files, the browser updates automatically.

---

## Why Git and GitHub matter

Git is version control — it tracks every change to your code so you can undo mistakes, save checkpoints, and try things without risk. GitHub is where your code lives online.

You don't need to be a Git expert. Here's what matters:

- **Save your work:** `git add . && git commit -m "describe what changed"` — takes a snapshot you can return to
- **Undo a mistake:** `git checkout .` — throws away changes since your last commit
- **Try something risky:** `git checkout -b experiment` — creates a branch (a parallel copy). If it works, merge it back. If not, delete it.
- **Push to GitHub:** `git push` — backs up your code online

Claude Code can run Git commands for you. Ask it: *"commit my work"* or *"create a branch called dark-mode"* — it knows how.

---

## Architecture

Investiture has four layers. Claude knows to use them:

```
src/                    — YOUR APP (start here)
  App.jsx               — App shell (layout, routing)
  App.css               — Global styles
  components/           — Reusable UI components
    Home.jsx            — Home page
    About.jsx           — About page
    ErrorBoundary.jsx   — Error handling wrapper

design-system/          — Visual foundation
  tokens.css            — Colors, spacing, typography as CSS variables

content/                — User-facing strings
  en.json               — All text in one place (no hardcoded strings)

core/                   — Pure business logic
  utils.js              — Helper functions (no side effects)
  store.jsx             — App state management (React Context)

services/               — External integrations
  api.js                — API client (swap for your backend)

examples/               — Reference implementations
  App.jsx               — Demos using all four architecture layers
```

---

## Skills

Investiture includes a skill chain that reads your doctrine at runtime and enforces it. Skills are Claude Code agent skills — copy them into any project's `.claude/skills/` directory.

| Skill | Purpose |
|-------|---------|
| `/invest-backfill` | Bootstrap VECTOR.md, CLAUDE.md, and ARCHITECTURE.md from an existing codebase |
| `/invest-doctrine` | Validate doctrine files for completeness, consistency, and drift |
| `/invest-architecture` | Audit codebase against declared conventions — layers, imports, naming, tokens |

**Existing projects:** Run `/invest-backfill` first. It surveys your code and generates starter doctrine.
**Greenfield projects:** Fill in the three doctrine files, then run `/invest-doctrine` to validate.

See [invest.md](invest.md) for the full skill chain reference.

---

## What to do next

Open this project in Claude Code (`claude` in terminal) and try these prompts — each one teaches a different architecture layer:

1. **"Change the app title and tagline using content/en.json"**
   Teaches: the content layer

2. **"Add a dark mode toggle using the design tokens"**
   Teaches: CSS variables, theme switching, data attributes

3. **"Add a todo list that uses content strings, design tokens, core logic, and localStorage"**
   Teaches: all four layers working together

4. **"Fetch data from a public API and display it in cards"**
   Teaches: the service layer, async/await, loading states

---

## The CLAUDE.md file

CLAUDE.md is your AI assistant's briefing document. Claude Code reads it
automatically when it opens your project. It contains:

- Architecture rules (where to put what)
- Do-not rules (patterns to avoid)
- Project structure
- Starter prompts

The starter CLAUDE.md enforces clean architecture. Customize it as you learn.

---

## Project structure

```
investiture/
├── src/                  ← Your app (start here)
│   ├── App.jsx           ← App shell with routing
│   ├── App.css
│   ├── main.jsx
│   ├── index.html
│   └── components/       ← Your UI components
│       ├── Home.jsx
│       ├── About.jsx
│       └── ErrorBoundary.jsx
├── design-system/        ← CSS variables and tokens
│   └── tokens.css
├── content/              ← User-facing strings
│   └── en.json
├── core/                 ← Pure business logic
│   ├── utils.js
│   ├── utils.test.js     ← Example tests
│   └── store.jsx         ← State management
├── services/             ← External integrations
│   └── api.js
├── examples/             ← Reference demos
│   └── App.jsx
├── .env.example          ← Environment variable template
├── CLAUDE.md             ← Created by install.sh
├── install.sh            ← One-time setup
├── package.json          ← Dependencies and scripts
└── README.md             ← You are here
```

---

## Links

- [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Investiture on Zero Vector](https://zerovector.design/investiture)

---

## License

MIT
