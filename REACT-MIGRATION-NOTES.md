# React Migration Notes

This document tracks decisions, issues, and progress during the React migration of the STC app.

## Setup Summary

### Branch
- Working branch: `react-migration`
- Will be merged to `main` once migration is complete and tested

### Installed Packages
- **React 19.2.3** - Latest React version
- **React DOM 19.2.3** - DOM rendering
- **Vite 7.3.1** - Build tool and dev server
- **@vitejs/plugin-react 5.1.2** - Vite plugin for React

### Directory Structure

**Investiture-level (shared across all apps):**
```
/views/react/
├── components/     # Shared UI components (Modal, Toast, etc.)
├── hooks/          # Shared hooks (useSupabase, useAI, etc.)
└── utils/          # Shared utilities
```

**STC app-specific:**
```
/apps/stc/views/react/
├── components/     # STC-specific components
├── pages/          # STC page components
├── vite.config.js  # Vite configuration
├── index.html      # Entry HTML
├── main.jsx        # React entry point
└── App.jsx         # Root component (placeholder)
```

### NPM Scripts Added
- `npm run stc:react:dev` - Start Vite dev server for STC (port 3000)
- `npm run stc:react:build` - Build STC React for production
- `npm run stc:react:preview` - Preview STC React production build

---

## Architecture Decisions

### 1. Parallel View Layers (Not Replacement)

**Decision:** Keep Eleventy for vanilla views, add Vite for React views as a parallel system.

**Rationale:** This aligns with Investiture's philosophy of swappable view layers. Both can coexist:
- Eleventy continues to serve: homepage, docs, getting-started, cosmere, history
- Vite/React will serve: STC app (`/stc/`)

**Trade-off:** More complex build setup, but maintains the decoupled architecture.

### 2. Vite as Build Tool

**Decision:** Use Vite instead of Create React App or webpack.

**Rationale:**
- Faster development with native ES modules
- Better integration with existing project structure
- Smaller bundle sizes
- Active development and modern features

### 3. Side-by-Side Development

**Decision:** Vanilla and React run simultaneously during migration.

**URLs during development:**
- `http://localhost:8888/stc/` → Vanilla STC (unchanged, via Netlify dev)
- `http://localhost:3000/` → React STC (via Vite dev server)

**URLs after production build:**
- `/stc/` → Vanilla STC
- `/stc-react/` → React STC

**Rationale:**
- Vanilla continues working untouched throughout migration
- React can be developed and tested independently
- Switch over only after React is fully working
- Vite proxies `/.netlify/functions/*` to Netlify dev for API calls

**Local Dev Workflow:**
```bash
# Terminal 1: Start Netlify dev server (vanilla + functions)
netlify dev
# Vanilla STC available at http://localhost:8888/stc/

# Terminal 2: Start Vite dev server (React STC)
npm run stc:react:dev
# React STC available at http://localhost:3000/
# API calls proxy to localhost:8888
```

### 4. Import Aliases

**Decision:** Use path aliases for cleaner imports with clear Investiture vs app separation.

```javascript
// Investiture-level (shared)
import { Modal } from '@investiture/components';
import { useSupabase } from '@investiture/hooks';
import { api } from '@core';
import tokens from '@design/tokens';
import content from '@content/en';

// App-level (STC-specific)
import { GenomeSelector } from '@stc/components';
import { ProjectDashboard } from '@stc/pages';
```

---

## Potential Issues & Mitigations

### Issue 1: Shared Styles
- **Problem:** Vanilla view uses SCSS, React will need a styling approach
- **Options to discuss:**
  - CSS Modules
  - Styled Components
  - Tailwind CSS
  - Import existing compiled CSS
- **Decision:** TBD during component planning

### Issue 2: Supabase Client
- **Problem:** Currently imported directly in vanilla JS
- **Mitigation:** Already wrapped in `/core/services/database.js` - React will use the same wrapper

### Issue 3: Environment Variables
- **Problem:** Vite uses `VITE_` prefix for env vars
- **Mitigation:** May need to duplicate some env vars with `VITE_` prefix, or use Vite's `define` config

---

## Component Migration Plan

**STATUS: NOT STARTED - Awaiting planning session**

The component structure will be planned before any migration begins. Key considerations:
- Which vanilla components map to React components?
- What state management approach? (Context, Zustand, Redux?)
- How to handle the cascading/impact system?
- Form handling approach (controlled vs uncontrolled, form library?)

---

## Open Questions

1. **Styling approach:** CSS Modules vs Styled Components vs Tailwind?
2. **State management:** React Context sufficient, or need Zustand/Redux?
3. **Routing:** Single page or multiple routes within React app?
4. **Testing:** What testing framework? (Vitest pairs well with Vite)
5. **Build output:** Should React build integrate with Eleventy output?

---

## Next Steps

1. ✅ Branch created
2. ✅ Directory structure created
3. ✅ React + Vite installed and configured
4. ✅ Migration notes documented
5. ⏳ **WAITING:** Component migration planning session
6. ⏸️ Component migration (blocked on #5)

---

*Last updated: 2025-01-20*
