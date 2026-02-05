# Investiture

A starter React app for learning to build with Claude Code.

---

## Prerequisites

- A Mac
- An internet connection

That's it. The install script handles everything else.

---

## Setup

```bash
git clone https://github.com/erikaflowers/investiture.git
cd investiture
./install.sh
```

This installs Homebrew (if needed), Node.js (if needed), project dependencies,
and creates a CLAUDE.md file that tells Claude Code about your project.

---

## Run

```bash
npm start
```

Your app opens at http://localhost:3000

---

## What just happened?

When you ran `install.sh`, it:

1. **Checked for Homebrew** — a Mac package manager that installs developer tools
2. **Checked for Node.js** — the JavaScript runtime that runs your app
3. **Installed dependencies** — React and Vite (a fast dev server)
4. **Created CLAUDE.md** — a file that briefs Claude Code on your project

Your app is a React component in `demo/App.jsx` with styles in `demo/App.css`.
When you edit these files, the browser updates automatically.

---

## What to do next

Open this project in Claude Code and try these prompts:

1. **"Add a color picker that changes the page background"**
   Teaches: state, event handlers, CSS variables

2. **"Add a todo list with add and delete"**
   Teaches: arrays in state, list rendering, forms

3. **"Add a dark/light mode toggle that remembers my preference"**
   Teaches: localStorage, useEffect, conditional styling

---

## The CLAUDE.md file

CLAUDE.md is your AI assistant's briefing document. Claude Code reads it
automatically when it opens your project. Customize it to:

- Describe your architecture
- Set coding rules
- Give Claude a persona
- List things to avoid

The starter CLAUDE.md has examples. Make it yours.

---

## Project structure

```
investiture/
├── demo/
│   ├── App.jsx       ← Your React component (start here)
│   ├── App.css       ← Your styles
│   ├── main.jsx      ← React mount point
│   └── index.html    ← HTML shell
├── CLAUDE.md         ← Claude Code reads this (created by install.sh)
├── install.sh        ← One-time setup
├── package.json      ← Dependencies and scripts
└── README.md         ← You are here
```

---

## Links

- [Friday livestream recording](TODO_LIVESTREAM_URL)
- [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Investiture documentation site](https://erikaflowers.github.io/investiture/)

---

## License

MIT
