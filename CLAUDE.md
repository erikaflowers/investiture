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

## Directory Structure
```
/core           → Business logic, pure functions, state management
/design-system  → Tokens, themes, component definitions
/content        → All user-facing strings, i18n ready
/views          → UI implementations (vanilla, react, etc.)
/shared         → SCSS utilities that consume design tokens
/config         → Configuration for swappable layers
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

### View Work (`/views`)
- Import from `/core/index.js` for logic and state
- Import from `/design-system/tokens` for styling
- Import from `/content/[locale]` for copy
- Never hardcode strings or colors
- Each view folder is self-contained and deletable

### Services Work (`/core/services`)
- Wrap external services (Supabase, Firebase, OpenAI)
- Expose consistent interface regardless of provider
- Swapping providers should only require changing service internals

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

## Content Flow
```
/content/en/common.json
     │
     └──→ Imported by views
          └──→ Rendered with interpolation
```

Example:
```javascript
import content from '@content/en/common.json';
button.textContent = content.actions.submit; // "Submit"
```

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

## Git Workflow

- Work directly on `main` for solo development
- Use feature branches for experimental view frameworks
- Commit frequently with clear messages
- Never commit hardcoded secrets

## Common Commands
```bash
# Start local development
npm run dev

# Compile SCSS
npm run sass:watch

# Build tokens from JSON
npm run build:tokens

# Run on localhost
npx serve views/vanilla
```

## What NOT to Do

- Hardcode colors in views - use tokens
- Hardcode strings in views - use content
- Import Supabase directly in views - use core services
- Put business logic in views - belongs in core
- Put DOM manipulation in core - belongs in views
- Create framework-specific code in /core
- Skip the interface layer

## Starting a New App from Investiture

1. Clone or use as template
2. Update `tokens.json` with your brand
3. Update `/content/en/` with your copy
4. Build your core logic in `/core/state/`
5. Connect services you need in `/core/services/`
6. Implement your UI in `/views/[choice]/`

The scaffold handles the rest.

## Briefing Other Claude Instances

When asked, generate a concise summary of recent work for sharing with other Claude chats. Include:

- **What was built** - Files created/modified, features implemented
- **Key architecture decisions** - Why things were done a certain way
- **Current state** - What works, what's stubbed, how to run it
- **Next steps** - What's ready to be built next

Format as markdown with clear sections. Be specific about file paths and technical details so the receiving Claude can pick up where you left off.

---

*"The most important step a man can take is the next one."*
*— Dalinar Kholin*
