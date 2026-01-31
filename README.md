# Investiture

A learning scaffold for designers who want to use Claude Code to build real applications.

---

## What is this?

Investiture is engineering knowledge pre-loaded into a scaffold your AI can read. Work inside a system with guardrails built in. You don't have to become an engineer — just build inside structure that already knows the rules.

The name comes from Brandon Sanderson's Cosmere: Investiture is the underlying magical energy that manifests differently on each world. Same power source, different expressions.

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or higher

---

## Quick Start

```bash
git clone https://github.com/erikaflowers/investiture.git
cd investiture
npm install
npm run dev
```

The documentation site runs at `http://localhost:8080`.

For the React demo:
```bash
npm run dev:demo
```

---

## Project Structure

```
investiture/
├── _data/              # Site data (nav, config)
├── _includes/          # Nunjucks templates
├── demo/               # React demo app
│   ├── App.jsx         # Demo component
│   ├── App.css         # Styles with CSS variables
│   ├── main.jsx        # React mount
│   └── index.html      # Entry point
├── index.njk           # Home page
├── demo.njk            # Demo showcase page
├── docs.njk            # Documentation
├── getting-started.njk # Setup guide
├── eleventy.config.cjs # Eleventy config
├── package.json        # Dependencies
└── styles.css          # Site styles
```

---

## The React Demo

The demo showcases minimal React patterns:

- **Counter** — useState hook, click handler
- **Theme toggle** — CSS variables, state-driven classes
- **Reveal card** — CSS transitions, conditional rendering

Open the demo in Claude Code and try:

> **"Add a color picker that changes the background."**

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the documentation site |
| `npm run dev:demo` | Start the React demo in dev mode |
| `npm run build` | Build everything for production |
| `npm run build:demo` | Build just the React demo |

---

## Philosophy

- **Learn by doing** — Not tutorials, actual building
- **AI-readable** — Clean structure Claude can navigate
- **Minimal by design** — No auth, no database, no complexity
- **Taste matters** — Dark theme, subtle animations, considered spacing

---

## License

MIT
