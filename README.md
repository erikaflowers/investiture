# Investiture

**A learning scaffold for designers who want to build real things with AI.**

> *"The most important step a man can take is the next one."* — Dalinar Kholin

## What This Is

Investiture is a starter kit for UX designers, design technologists, and creative folks who want to use Claude Code (or similar AI coding tools) to build actual applications—not just prototypes that dead-end.

This isn't a framework for startups to ship products. It's a flight simulator. A place to build the muscles you need before you're building for real.

## The Problem It Solves

You're a designer. You've got ideas. You've seen what Claude Code can do. You want in.

But when you start prompting an AI to build something, you hit walls:

- The code it generates works... until it doesn't, and you can't debug it
- You build something cool in Lovable or Bolt, then realize you can't take it anywhere
- You don't know what questions to ask because you don't know what you don't know
- Terms like "services layer" and "state management" feel like a foreign language

Meanwhile, engineers have spent years learning the fundamentals. Separation of concerns. How data flows. Why you don't hardcode strings. What happens when an API call fails. They learned it the hard way, over time, by breaking things.

**Investiture is that knowledge, pre-loaded into a scaffold your AI can read.**

## How It Works

The repo includes a `CLAUDE.md` file. When your AI assistant reads it, it understands:

- Where business logic goes (and where it doesn't)
- How to keep your UI code separate from your data code
- Why design tokens exist and how to use them
- How to structure things so you can swap pieces later

You don't have to become an engineer. You just have to work inside a system that already has the guardrails built in.

## What You'll Learn By Using It

Not from a tutorial. From doing.

- **Separation of concerns** — Why your button shouldn't know about your database
- **Service abstraction** — How to swap Supabase for Firebase without rewriting your app
- **Design tokens** — One source of truth for colors, spacing, type
- **Content separation** — Why hardcoded strings will haunt you later
- **The shape of real codebases** — Folders that make sense, files that have one job

This is the stuff senior engineers know intuitively. Investiture makes it concrete.

## What This Is NOT

- A production-ready framework (use it to learn, not to ship to millions)
- A replacement for understanding code (you'll still need to read what your AI writes)
- Magic (you still have to think—this just gives you better defaults)

## Who It's For

- UX designers who want to build, not just wireframe
- Design technologists leveling up their AI-assisted workflow
- Anyone who's been "vibe-coding" and wants to understand why things work
- Creative folks who are tired of hitting walls they can't see

---

## Quick Start

```bash
# Clone it
git clone git@github.com:erikaflowers/investiture.git my-app
cd my-app

# Install dependencies
npm install

# Compile SCSS and watch for changes
npm run sass:watch

# In another terminal, serve the app
npx serve -p 3000

# Open http://localhost:3000/views/vanilla/
```

## Architecture

**Core + Shell** — Every layer is hot-swappable.

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

- The view layer doesn't know about the database
- The core doesn't know about React
- They communicate through clean interfaces

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

### Services

Services in `/core/services/` wrap external providers:

- **auth.js** — Authentication (Supabase-ready)
- **database.js** — Database operations
- **ai.js** — AI/LLM completions

To swap providers (e.g., Supabase → Firebase), only change the service internals.

## Commands

```bash
npm run dev              # Watch SCSS changes
npm run build:tokens     # Regenerate tokens from JSON
npm run sass:build       # Compile SCSS once
npx serve -p 3000        # Serve the app
```

## The Name

In Brandon Sanderson's Cosmere, Investiture is the underlying magical energy that manifests differently on each world. Same power source, different expressions.

That's this scaffold. The architecture stays constant. What you build with it is up to you.

---

## Contributing

See [CLAUDE.md](./CLAUDE.md) for detailed contribution guidelines and AI assistant instructions.

## License

MIT

---

*"Investiture" borrowed with gratitude from [Brandon Sanderson's](https://www.brandonsanderson.com/) Cosmere universe.*
