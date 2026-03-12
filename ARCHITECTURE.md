# Architecture

**Last Updated:** 2026-03-03

This file is the technical specification. Layers, stack, conventions, structure, and import rules are defined here.

For the philosophy behind these decisions — the Core Relationship, the Seven Principles, and design constraints — see VECTOR.md.

---

## Four Layers

| Layer | Location | Rule |
|-------|----------|------|
| **Design System** | `design-system/tokens.css` | All visual decisions live here. No hardcoded colors, spacing, or font sizes anywhere else. |
| **Core Logic** | `core/` | Pure functions and state. No API calls, no DOM, no side effects. Testable without mocking. |
| **Services** | `services/` | All communication with the outside world. API calls, auth, storage, analytics. |
| **UI** | `src/` | Renders data. Imports from the other three layers. Does not own business logic. |

Every file belongs to exactly one layer. If you are unsure, it goes in `core/`.

### How to Add a Feature

Follow this order every time:

1. **Design tokens** — New colors, spacing, or visual properties go in `design-system/tokens.css`.
2. **Core logic** — Business logic (validation, transformation, calculation) goes in `core/`. Write tests.
3. **Service** — External communication goes in `services/`.
4. **UI last** — Build the component in `src/`, importing from the other three layers.

### What Not to Do

- **API calls in components** — Use `services/`. Components render, they do not fetch.
- **Hardcoded colors or spacing** — Use `var(--token-name)` from `design-system/tokens.css`.
- **Business logic in components** — Move it to `core/`. If it does not touch the DOM, it does not belong in `src/`.
- **Heavy dependencies** — Do not install a library when 20 lines of code will do.
- **Files over 200 lines** — Split them.

### Import Direction

Layers import in one direction only:

```
UI (src/)        → imports from → core/, services/, design-system/
Services         → imports from → core/
Core (core/)     → imports from → nothing (pure)
Design System    → imported by all via CSS variables (no JS imports)
```

Violations: `core/` importing from `src/`, `services/`, or `design-system/`. `services/` importing from `src/` or `design-system/`.

---

## Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 19 + Vite 6 | Fast builds, hot reload, ES modules native |
| **State** | Context + useReducer | No dependency. Scales until it does not, then upgrade deliberately |
| **Styling** | CSS variables (tokens.css) | No build step. Theme switching via data attribute. Framework-agnostic |
| **Testing** | Vitest | Vite-native. Same config, same transforms. Zero friction |
| **Backend** | None (add when needed) | Scaffold ships frontend-only. Add `/api` when the project requires it |

---

## Project Structure

```
[project-name]/
├── VECTOR.md              # Project doctrine (read first)
├── CLAUDE.md              # Agent persona (read second)
├── ARCHITECTURE.md        # This file (read third)
├── start.sh               # Launch dev server + Claude Code
├── /src                   # UI layer
│   ├── main.jsx           # Entry point (StrictMode + ErrorBoundary + AppProvider)
│   ├── App.jsx            # Root component
│   ├── App.css            # Global styles (uses design tokens)
│   └── /components        # UI components (one per file)
├── /core                  # Pure logic layer
│   ├── store.jsx          # State management (Context + useReducer)
│   ├── utils.js           # Utility functions (no side effects)
│   └── utils.test.js      # Tests (vitest)
├── /services              # External integration layer
│   └── api.js             # Fetch wrapper (get, post, put, del)
├── /design-system         # Visual foundation layer
│   └── tokens.css         # CSS variables (colors, spacing, typography, themes)
└── /vector                # Zero Vector knowledge artifacts
    ├── /schemas           # zv-*.json schema definitions
    ├── /research          # Structured research artifacts
    └── /decisions         # Architecture Decision Records
```

---

## Conventions

### File Organization
- **core/** — Pure functions and state. Testable without mocking. No API calls, no DOM.
- **services/** — Anything that talks to the outside world.
- **src/components/** — React components. UI only. Business logic lives in core/.
- **design-system/** — CSS variables. Change tokens.css to change the entire theme.

### Naming
- Components: `PascalCase.jsx`
- Utilities: `camelCase.js`
- CSS: `kebab-case.css`
- Schemas: `zv-[type].json`

### State Management
- `core/store.jsx` (Context + useReducer) for shared state
- `useState` for UI-only state
- No Redux, no Zustand unless the project outgrows Context
- State context and dispatch context are split intentionally (performance)

### Styling
- CSS variables from `design-system/tokens.css`
- No Tailwind. No CSS-in-JS. Plain CSS with variables.
- Dark theme is the default. Light is the override.
- Theme switching: `data-theme` attribute on `document.documentElement`

### API Pattern
- All API calls go through `services/api.js`
- Environment variables in `.env` (never committed)
- Backend URL via `VITE_API_URL` (defaults to `/api`)

### Testing
- Tests live next to the code: `core/utils.test.js`
- `npm test` to run all, `npm run test:watch` for watch mode
- Pure functions are easy to test — no mocking needed. Prefer pure functions.

---

## Flexible Preferences

These defaults can be overridden by the operator in CLAUDE.md or this file:

- **Commit granularity** — Default: one commit per logical change.
- **Testing expectations** — Default: test critical logic in core/.
- **Comment density** — Default: comments on non-obvious logic only.
- **Voice and personality** — Default: warm, professional, brief. Operator defines persona in CLAUDE.md.
- **Stack choices** — Default: React, Vite, CSS variables, Context. Operator can swap components here.

---

## Decisions

Architecture Decision Records live in `/vector/decisions/`.

| ADR | Decision | Date | Status |
|-----|----------|------|--------|
| 000 | [Template] | — | Template |

When you make a significant technical choice, document it as an ADR.
