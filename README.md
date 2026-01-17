# Investiture

> *"Investiture is the underlying power that manifests differently on each world."*

A decoupled, enterprise-ready application scaffold designed for building browser apps, SaaS products, and extensions.

## Philosophy

**Core + Shell Architecture** — Every layer is hot-swappable.

- The view layer doesn't know about the database
- The core doesn't know about React
- They communicate through clean interfaces

A backend dev, a designer, and a content writer can all work on different layers without stepping on each other.

## Quick Start

```bash
# Install dependencies
npm install

# Compile SCSS and watch for changes
npm run sass:watch

# In another terminal, serve the vanilla view
npx serve views/vanilla

# Open http://localhost:3000
```

## Architecture

```
VIEW LAYER (vanilla, React, Svelte, extension, etc.)
     │
     ├── DESIGN SYSTEM (tokens, themes)
     ├── CONTENT LAYER (copy, i18n)
     └── INTERFACE (contracts)
              │
         CORE LAYER (business logic, state)
              │
         SERVICES LAYER (auth, db, ai)
```

## Project Structure

```
investiture/
├── core/                    # Business logic layer
│   ├── services/           # Auth, database, AI wrappers
│   ├── state/              # State management
│   ├── types/              # Type definitions / contracts
│   └── index.js            # Public API
│
├── design-system/          # Visual design layer
│   ├── tokens/             # Design tokens (JSON, SCSS, CSS)
│   ├── primitives/         # Component definitions
│   └── themes/             # Theme configurations
│
├── content/                # Content layer
│   ├── en/                 # English content
│   └── schema/             # Content validation schemas
│
├── views/                  # UI implementations
│   └── vanilla/            # Vanilla JS implementation
│
├── shared/                 # Shared utilities
│   └── scss/               # SCSS mixins, variables, reset
│
└── config/                 # Configuration files
```

## Key Concepts

### Design Tokens

All visual design values live in `design-system/tokens/tokens.json`. This generates:

- `_tokens.scss` — SCSS variables
- `tokens.css` — CSS custom properties

Never hardcode colors, spacing, or typography. Always use tokens.

### Content Layer

All user-facing strings live in `/content/[locale]/`. This enables:

- Easy i18n (copy the `en` folder to `es`, `fr`, etc.)
- CMS integration (point to an API instead of local JSON)
- Content validation via JSON schema

Use `{{variable}}` syntax for interpolation.

### Services

Services in `/core/services/` wrap external providers:

- **auth.js** — Authentication (Supabase-ready)
- **database.js** — Database operations
- **ai.js** — AI/LLM completions

To swap providers (e.g., Supabase → Firebase), only change the service internals.

### Views

Each view implementation is self-contained in `/views/[framework]/`. The vanilla implementation shows the pattern:

1. Import from `/core/index.js` for all logic
2. Import from `/content/` for all copy
3. Style with design tokens

## Commands

```bash
# Development
npm run dev              # Start dev server
npm run sass:watch       # Watch SCSS changes

# Build
npm run build:tokens     # Regenerate tokens from JSON
npm run sass:build       # Compile SCSS once

# Serve
npx serve views/vanilla  # Serve vanilla view
```

## Adding a New View Framework

1. Create `/views/[framework]/`
2. Import core: `import { api, state } from '../../core/index.js'`
3. Import content: `import content from '../../content/en/common.json'`
4. Consume design tokens via CSS or SCSS
5. Add a README with framework-specific setup

## Enterprise Integration

### Custom Design System

1. Create `/design-system/themes/[client].json`
2. Update `/config/design-system.config.js`
3. Run `npm run build:tokens`

### CMS for Content

1. Update `/config/content.config.js` with CMS endpoint
2. Content loader fetches from CMS instead of local JSON

## Contributing

See [CLAUDE.md](./CLAUDE.md) for detailed contribution guidelines.

## License

MIT

---

*"The most important step a man can take is the next one."* — Dalinar Kholin
