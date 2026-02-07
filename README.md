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
./install.sh
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
src/              — YOUR APP (start here)
  App.jsx         — Your main component
  App.css         — Your styles

design-system/    — Visual foundation
  tokens.css      — Colors, spacing, typography as CSS variables

content/          — User-facing strings
  en.json         — All text in one place (no hardcoded strings)

core/             — Pure business logic
  utils.js        — Helper functions (no side effects)

services/         — External integrations
  api.js          — API client (swap for your backend)

examples/         — Reference implementations
  App.jsx         — Counter, theme toggle, animations
```

---

## What to do next

Open this project in Claude Code and try these prompts:

1. **"Add a todo list that saves to localStorage"**
   Teaches: state, arrays, useEffect, persistence

2. **"Add a dark mode toggle using the design tokens"**
   Teaches: CSS variables, theme switching, data attributes

3. **"Fetch data from an API and display it"**
   Teaches: async/await, services layer, loading states

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
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.html
├── design-system/        ← CSS variables and tokens
│   └── tokens.css
├── content/              ← User-facing strings
│   └── en.json
├── core/                 ← Pure business logic
│   └── utils.js
├── services/             ← External integrations
│   └── api.js
├── examples/             ← Reference demos
│   └── App.jsx
├── CLAUDE.md             ← Created by install.sh
├── install.sh            ← One-time setup
├── package.json          ← Dependencies and scripts
└── README.md             ← You are here
```

---

## Links

- [Friday livestream recording](TODO_LIVESTREAM_URL)
- [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Investiture documentation site](https://erikaflowers.github.io/investiture/)

---

## License

MIT
