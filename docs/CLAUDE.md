# Investiture

A separation-of-concerns scaffold for AI-assisted development.

---

## What This Is

Investiture enforces clean architecture so Claude Code can read, understand, and extend your app without creating spaghetti. The structure has rules. Follow them.

---

## Folder Structure

```
investiture/
├── core/           # Business logic, pure functions, state
├── services/       # External integrations (API, auth, database)
├── views/          # UI components and templates
├── content/        # User-facing strings, copy, i18n
├── design-system/  # Tokens, themes, component specs
└── demo/           # React demo app
```

---

## Rules

### Views
- UI components live in `views/`
- Components render data. They do not fetch it.
- No business logic in components — call functions from `core/`

### Core
- Pure functions only
- No side effects, no API calls, no DOM manipulation
- State management lives here
- Testable without mocking

### Services
- All external integrations wrapped here
- Database, auth, AI, analytics — one file per service
- Swap providers by changing one file

### Content
- All user-facing strings in `content/`
- Never hardcode copy in components
- i18n-ready from day one

### Design System
- Tokens define colors, spacing, typography
- Components consume tokens, never raw values
- Theme switching happens at the token level

---

## Do Not

- **Create monolithic files** — If a file exceeds 200 lines, split it
- **Mix concerns** — Views don't fetch. Core doesn't render. Services don't hold state.
- **Hardcode strings** — Copy lives in `content/`, not components
- **Skip the abstraction** — Use services, not raw fetch calls

---

## When Adding Features

1. Add content strings to `content/`
2. Add business logic to `core/`
3. Add external calls to `services/`
4. Add UI to `views/`
5. Wire them together at the component level

This order matters. Content and logic first, UI last.

---

## Demo App

The `demo/` folder contains a minimal React app demonstrating these patterns:
- `App.jsx` — Component that renders state
- `App.css` — Styles using CSS variables
- Theme toggle, counter, reveal card — just enough to show the structure

Try: "Add a color picker that changes the background."
