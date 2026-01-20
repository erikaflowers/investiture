# Investiture Changelog

A running log of changes to the scaffold.

---

## 2025-01-19 (Night) - Character System, Cascade Detection & Architecture Docs

### Major Features
- **Character System**: Full CRUD with 6 role-based slots
  - Pyramid layout: 2 Drivers (protagonist, antagonist), 4 Supports (mirror, ally, skeptic, wildcard)
  - Character edit modal with 2-column form layout
  - AI-powered character generation from story context
  - Per-field re-roll buttons with loading animations

- **Cascade System**: Downstream coherence checking
  - Within-character cascade: checks field consistency after re-rolls
  - Project-wide cascade: checks story concept and other characters after save
  - Toast notifications for cascade check status
  - Unified cascade confirmation modal with checkbox selection
  - Story concept suggestions banner with editable diff view and "Apply Changes"

- **Loading Screen**: Thematic splash screen on page load
  - "Every story begins somewhere" with quill icon
  - Hides ugly progressive CSS/HTML loading
  - Smooth fade-out transition when app ready

### Documentation
- **ARCHITECTURE.md**: Comprehensive 600+ line technical document
  - System overview and user journey
  - Data model with all tables and relationships
  - All 7 AI functions with triggers, inputs, outputs
  - Cascade system flows and UI components
  - Design decisions and rationale

### New Netlify Functions
- `generate-character.js` - AI character generation and field re-roll
- `cascade-character.js` - Within-character and project-wide impact analysis

### UI Improvements
- Two-width layout system (.stc-narrow for focused content, wider for characters)
- Toast notification system in bottom-right corner
- Global STC text color fix for placeholder visibility

### Commits
- `3af3f0b` Add character system with AI generation and cascade impact detection

---

## 2025-01-19 (Evening) - Brief Extraction, Project Titles & Bug Fixes

### Major Features
- **Brief Extraction**: AI-powered extraction of core concept, premise, and world/tone from braindump
  - "Extract Brief" button triggers Claude to analyze braindump
  - Re-extract and Accept flow (similar to other sections)
  - Inline editing for each brief field
  - Brief locks to database once accepted, won't re-extract

- **Project Titles**: AI-generated memorable titles for each braindump
  - Auto-generates 2-5 word title after saving braindump
  - Editable in both list view and dive view (click to edit)
  - Regenerate button to get fresh AI title
  - Saves to database, persists across sessions

- **Genome Ready State**: Visual display after applying genome
  - Shows all genome selections as pills/tags
  - Big "Generate Story Concept" call-to-action button
  - "Apply Genome" button text changes to "Apply Genome Changes" after first save

### Bug Fixes
- **Story concept not persisting**: Fixed key mismatch (was saving as `text`, reading as `concept`)
- **Genome pills showing [object Object]**: Now properly extracts label from hydrated objects

### UI Tweaks
- Changed "Brief locked" to "Brief saved"
- Fixed "Dive in" button wrapping to 2 lines (removed arrow)

### New Netlify Functions
- `extract-brief.js` - Extracts brief from braindump using Claude
- `generate-title.js` - Generates short title using Claude Haiku

### Commits
- `fc76577` Add Brief extraction, project titles, and UI improvements

---

## 2025-01-19 (Continued) - STC Concept View Toggle & Copy

### Changes
- **Combined View Toggle**: Added toggle between "Sections" and "Combined" views for story concept
  - Sections view shows editable cards with edit/refine buttons (default)
  - Combined view shows full concept as single text block
- **Copy to Clipboard**: Added copy button in combined view for easy sharing
  - Click copies formatted concept text
  - Visual feedback shows "Copied!" confirmation
- Combined view auto-updates when switching if sections were edited

---

## 2025-01-17 (Evening) - Eleventy & CI/CD

### Major Changes
- **Eleventy Integration**: Refactored vanilla view from static HTML to Nunjucks templating
  - Created `eleventy.config.cjs` for static site generation
  - Added `_includes/` partials (base, head, nav, footer)
  - Added `_data/` for site config and navigation
  - Environment-based path prefixing (dev vs production)

- **GitHub Actions**: Auto-deploy to GitHub Pages on every push to `main`
  - Removed manual `docs/` folder commits
  - CI builds fresh on each deploy

- **Cosmere Reference Page**: Added `/cosmere/` with all magic systems
  - Footer link: "What is Investiture?"

### Commits
- `1329328` Update CLAUDE.md comprehensively and fix dev/build scripts
- `48fba9c` Add Cosmere magic systems reference page
- `68ce20e` Fix passthrough copy paths for GitHub Actions compatibility
- `341831a` Add clean step before Eleventy build in GitHub Actions
- `493c803` Remove css.map passthrough to fix GitHub Actions build
- `b1967e5` Add favicon
- `18e3f2c` Remove app.js from homepage - core services are stubs
- `4cbfdb0` Add GitHub Actions for auto-deploy to GitHub Pages
- `42d1637` Fix production build paths for GitHub Pages
- `d76d431` Fix Eleventy templates to render content correctly
- `f36508f` Refactor vanilla view to use Eleventy for static site generation

---

## 2025-01-17 (Afternoon) - Navigation & Polish

### Changes
- Standardized navigation across all pages
- Fixed anchor link navigation on docs page (hash handling after dynamic load)
- Added mobile hamburger menu
- Added "Explore the Scaffold" section to homepage
- Removed auth demo (core services are stubs)
- Added GitHub repo link to header

### Commits
- `602ac4b` Standardize navigation across all pages
- `0482e45` Fix anchor link navigation on docs page
- `d518727` Add mobile nav, remove auth demo, add Explore the Scaffold section
- `80d386f` Add GitHub repo link to header navigation on all pages

---

## 2025-01-17 (Morning) - Initial Setup

### Changes
- Initial scaffold structure created
- Design system with tokens (colors, typography, spacing)
- Content layer with JSON strings
- Core services layer (stubs for auth, database, AI)
- Vanilla view implementation
- Getting Started guide and Starter page
- Documentation page with architecture overview
- Ethos messaging for designer audience

### Commits
- `5a34f09` Add ethos messaging for designer audience
- `57ea3f2` Add root index.html redirect for GitHub Pages
- `b39e0f2` Add getting started guide, starter page, and navigation
- `58de5fd` faq page
- `97aaba3` de-gender
- `c1d5fa2` Add briefing section to CLAUDE.md
- `2acb267` Fix content loading to use fetch instead of import attributes
- `d6ffa9d` Initial commit: Investiture scaffold

---

*Updated: 2025-01-17*
