# CLAUDE.md - Investiture Framework

> "Investiture is the underlying power that manifests differently on each world."
> This scaffold is the underlying power that manifests as different apps.

## Philosophy

Investiture is a **decoupled, enterprise-ready application scaffold**. Every layer is hot-swappable. The view doesn't know about the database. The core doesn't know about React. They communicate through clean interfaces.

**The rule:** Never cross the streams. Each layer has one job.

## Architecture
```
VIEW LAYER (hot-swappable: vanilla, React, Svelte, extension, etc.)
     │
     ├── DESIGN SYSTEM (tokens, themes - hot-swappable)
     ├── CONTENT LAYER (copy, i18n - hot-swappable)
     └── INTERFACE (contracts to core)
              │
         CORE LAYER (business logic, state - framework agnostic)
              │
         SERVICES LAYER (auth, db, ai - provider agnostic)
```

## Current Project State

The scaffold is fully functional with a vanilla (no-framework) view implementation:

- **Live site**: https://erikaflowers.github.io/investiture/
- **Auto-deploys**: GitHub Actions builds and deploys on every push to `main`
- **Core services**: Stubbed (auth, database, AI wrappers exist but aren't connected to real backends)
- **Design system**: Complete with tokens, SCSS variables, and CSS custom properties
- **Content layer**: JSON-based, i18n-ready structure in place

### Pages
| Page | Path | Template |
|------|------|----------|
| Homepage | `/` | `views/vanilla/index.njk` |
| Getting Started | `/getting-started/` | `views/vanilla/getting-started.njk` |
| Documentation | `/docs/` | `views/vanilla/docs.njk` |
| Starter (blank canvas) | `/starter/` | `views/vanilla/starter.njk` |
| Cosmere Reference | `/cosmere/` | `views/vanilla/cosmere.njk` |
| Changelog | `/history/` | `views/vanilla/history.njk` |

## Directory Structure
```
/
├── .github/workflows/
│   └── deploy.yml          ← GitHub Actions auto-deploy to Pages
├── core/
│   ├── index.js            ← Public API (currently stubs)
│   ├── state/              ← State management
│   └── services/           ← Service wrappers (auth, db, ai)
├── design-system/
│   └── tokens/
│       ├── tokens.json     ← Single source of truth
│       ├── tokens.css      ← CSS custom properties (generated)
│       └── _tokens.scss    ← SCSS variables (generated)
├── content/
│   └── en/
│       ├── common.json     ← UI strings, button labels
│       └── errors.json     ← Error messages
├── views/
│   └── vanilla/
│       ├── _includes/      ← Nunjucks partials
│       │   ├── base.njk    ← Base layout (uses {{ content | safe }})
│       │   ├── head.njk    ← <head> content
│       │   ├── nav.njk     ← Header navigation
│       │   └── footer.njk  ← Footer with Cosmere link
│       ├── _data/
│       │   ├── site.json   ← Site metadata (title, description)
│       │   └── nav.json    ← Navigation items array
│       ├── *.njk           ← Page templates
│       ├── styles.scss     ← Main stylesheet (imports shared/)
│       ├── styles.css      ← Compiled CSS (committed)
│       ├── nav.js          ← Mobile nav toggle
│       ├── docs.js         ← Documentation page loader
│       └── favicon.svg     ← Site favicon
├── shared/
│   └── scss/               ← Shared SCSS (reset, variables, mixins)
├── scripts/
│   └── build-tokens.js     ← Token generator script
├── eleventy.config.cjs     ← Eleventy configuration
└── package.json
```

## Eleventy (11ty) Configuration

The vanilla view uses Eleventy for static site generation. Key details:

### Config File: `eleventy.config.cjs`
- Uses `.cjs` extension because `package.json` has `"type": "module"`
- Input: `views/vanilla/`
- Output: `docs/` (for GitHub Pages)
- Path prefix: `/investiture/` in production, `/` in development

### Environment-Based Paths
```bash
# Development (paths start with /)
npm run dev

# Production (paths start with /investiture/)
ELEVENTY_ENV=production npm run html:build
```

### Template Syntax
Eleventy uses `{{ content | safe }}` NOT `{% block %}` syntax:

```njk
{# In base.njk #}
<main>
  {{ content | safe }}
</main>

{# In page.njk - content goes directly after front matter #}
---
layout: base.njk
title: Page Title
---
<section>
  Your content here...
</section>
```

### Passthrough Copy
Static assets are copied with explicit destinations (not glob patterns with `/`):
```javascript
eleventyConfig.addPassthroughCopy({ "views/vanilla/styles.css": "styles.css" });
eleventyConfig.addPassthroughCopy({ "views/vanilla/favicon.svg": "favicon.svg" });
```

### Adding a New Page
1. Create `views/vanilla/pagename.njk`:
```njk
---
layout: base.njk
title: Page Title
description: Page description for meta tags
headerTagline: Shows in header
---
<section>
  Your content here
</section>
```

2. Optionally add to `views/vanilla/_data/nav.json` for header navigation:
```json
{
  "items": [
    { "label": "New Page", "url": "/pagename/", "file": "pagename" }
  ]
}
```

3. For footer-only links, edit `views/vanilla/_includes/footer.njk`

## GitHub Actions Deployment

Auto-deploy is configured in `.github/workflows/deploy.yml`:

1. Triggers on push to `main` or manual dispatch
2. Installs dependencies with `npm ci`
3. Builds SCSS: `npm run sass:build`
4. Cleans output: `rm -rf docs`
5. Builds Eleventy: `ELEVENTY_ENV=production npm run html:build`
6. Uploads `docs/` folder as artifact
7. Deploys to GitHub Pages

**Important**: The `docs/` folder is in `.gitignore` - it's built fresh by GitHub Actions, not committed.

## Common Commands
```bash
# Start local development (SCSS + Eleventy with live reload)
npm run dev
# Opens at http://localhost:8080

# Build for production
npm run build

# Compile SCSS only
npm run sass:build

# Build HTML only (Eleventy)
npm run html:build

# Build tokens from JSON
npm run build:tokens
```

## Design Token Flow
```
tokens.json (source of truth)
     │
     ├──→ _tokens.scss (for SCSS consumers)
     ├──→ tokens.css (for CSS custom properties)
     └──→ tokens.tailwind.js (for Tailwind config)
```

To regenerate from tokens.json:
```bash
npm run build:tokens
```

## Rules for Contributors

### Design System Work (`/design-system`)
- `tokens.json` is the single source of truth
- Never hardcode colors, spacing, or typography anywhere else
- To add a client theme: create `/themes/[client].json`
- Changes here affect ALL views automatically

### Content Work (`/content`)
- All user-facing strings live here, never in code
- Use `{{variable}}` syntax for interpolation
- To add a language: copy `/en` to `/[locale]`
- Schema validation ensures consistency

### Core Work (`/core`)
- Pure functions only - no DOM, no framework imports
- All state changes go through core
- Services are wrapped - never import Supabase/Firebase directly
- Export public API through `/core/index.js` only
- **Current state**: All services are stubs returning mock data

### View Work (`/views`)
- Import from `/core/index.js` for logic and state
- Import from `/design-system/tokens` for styling
- Import from `/content/[locale]` for copy
- Never hardcode strings or colors
- Each view folder is self-contained and deletable
- Use `{{ '/path/' | url }}` filter for all internal links (handles path prefix)

### Services Work (`/core/services`)
- Wrap external services (Supabase, Firebase, OpenAI)
- Expose consistent interface regardless of provider
- Swapping providers should only require changing service internals

## What NOT to Do

- Hardcode colors in views → use tokens
- Hardcode strings in views → use content
- Import Supabase directly in views → use core services
- Put business logic in views → belongs in core
- Put DOM manipulation in core → belongs in views
- Create framework-specific code in /core
- Skip the interface layer
- Use `{% block %}` in Eleventy → use `{{ content | safe }}`
- Use glob patterns with `/` destination in passthrough copy → use explicit filenames
- Commit the `docs/` folder → it's built by GitHub Actions

## STC App Design Principles

The Save the Cat (STC) app at `/stc/` has specific design principles:

### Downstream Impact Rule

**CRITICAL:** When a user changes an upstream element (like the Story Genome), the system MUST consider and warn about downstream impacts on dependent elements (like the Story Concept).

- **Genome → Concept cascade:** When genome changes are applied, analyze how they affect each concept section and offer suggested revisions
- **Section → Section drift:** When refining one section, check if changes create inconsistencies with other sections
- **Always warn, never silently break:** If an upstream change could invalidate downstream content, surface this to the user with actionable suggestions

This principle applies to any hierarchical/dependent data structure in the app. The user should never be surprised to find their downstream content no longer aligns with upstream changes.

### Editor Persona

The AI assistant uses a specific "editor persona" defined in `/netlify/functions/shared/system-prompts.js`. This persona is warm, collaborative, and focused on helping writers discover their story - not writing it for them.

### Netlify Functions

The STC app uses serverless functions for AI operations:

| Function | Purpose |
|----------|---------|
| `generate-concept.js` | Generates story concept from braindump + genome |
| `refine-section.js` | Refines a single concept section with context awareness |
| `cascade-genome.js` | Analyzes genome changes for downstream impact |
| `extract-brief.js` | Extracts core concept, premise, world/tone from braindump |
| `generate-title.js` | Generates short memorable title (uses Haiku for speed) |

All functions require `ANTHROPIC_API_KEY` environment variable set in Netlify dashboard.

## Adding a New View Framework

1. Create `/views/[framework]/`
2. Import core: `import { api } from '../../core/index.js'`
3. Import tokens: consume from `/design-system/tokens`
4. Import content: `import content from '../../content/en/common.json'`
5. Implement UI using your framework
6. Document any framework-specific setup in `/views/[framework]/README.md`

## Enterprise Integration

### Plugging in a Client Design System
1. Obtain client's design tokens (JSON format preferred)
2. Add to `/design-system/themes/[client].json`
3. Update `/config/design-system.config.js`:
```javascript
export default { source: '[client]' }
```
4. Run `npm run build:tokens`

### Plugging in a CMS for Content
1. Update `/config/content.config.js` to point to CMS endpoint
2. Content loader will fetch from CMS instead of local JSON
3. Schema validation still applies

### Connecting Real Services
The `/core/services/` directory has stubs ready to connect:
- `auth.js` → Connect Supabase Auth, Firebase Auth, Auth0, etc.
- `database.js` → Connect Supabase, Firebase, your own API
- `ai.js` → Connect OpenAI, Anthropic, etc.

Each service exposes a consistent interface. Swap implementations without changing consuming code.

## Starting a New App from Investiture

1. Clone or use as template
2. Update `tokens.json` with your brand
3. Update `/content/en/` with your copy
4. Build your core logic in `/core/state/`
5. Connect services you need in `/core/services/`
6. Implement your UI in `/views/[choice]/`
7. Update `_data/site.json` with your site metadata
8. Update `_data/nav.json` with your navigation structure

The scaffold handles the rest.

## Troubleshooting

### Local dev shows wrong paths
Make sure you're running `npm run dev` not `npm run build`. Dev mode uses `/` prefix, production uses `/investiture/`.

### GitHub Actions failing
1. Check that `package-lock.json` is committed (required for `npm ci`)
2. Verify the `docs/` folder is NOT committed (it's in `.gitignore`)
3. Check GitHub repo Settings → Pages → Source is set to "GitHub Actions"

### Eleventy passthrough copy errors
Use explicit filenames, not glob patterns with `/`:
```javascript
// Good
{ "views/vanilla/file.js": "file.js" }

// Bad - causes EISDIR errors
{ "views/vanilla/*.js": "/" }
```

### SCSS not updating
Run `npm run sass:build` or restart the dev server. The compiled `styles.css` is committed to git.

## Git Workflow

- Work directly on `main` for solo development
- Use feature branches for experimental view frameworks
- Commit frequently with clear messages
- Never commit hardcoded secrets
- The `docs/` folder is gitignored and built by CI

## Recurring Maintenance (For Claude)

**Periodically update documentation** - not for every small change, but after significant work sessions or feature additions:

1. **CLAUDE.md** - Keep current project state accurate:
   - Update the Pages table if pages are added/removed
   - Update directory structure if it changes
   - Add new troubleshooting entries for issues encountered

2. **HISTORY.md** - Add changelog entries:
   - Date and time period (morning/afternoon/evening)
   - Brief title for the work session
   - Bullet points of what changed
   - Relevant commit hashes

3. **views/vanilla/history.njk** - Update the changelog page:
   - Add new entry to match HISTORY.md (terse version)
   - Keep entries brief - full details live in HISTORY.md

**When to update**: After completing a feature, fixing a significant bug, adding new pages, changing architecture, or at the end of a work session. Use judgment - don't update for typo fixes or minor tweaks.

---

*"The most important step a man can take is the next one."*
*— Dalinar Kholin*
