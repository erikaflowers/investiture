# Save the Cat Builder - Changelog

## 2025-01-18

### Story Concept Polish & Bug Fixes

**Story DNA Display**
- Added genome tags at top of story concept showing all selected vertebrae
- "Story DNA" label with colored tags for each category
- Category colors: genre (brown), archetype (green), theme (purple), tone (tan), stakes (red), humor (blue)

**Bug Fixes**
- Fixed empty concept display: `formatConceptAsHtml` was filtering out all headers
- Fixed text color: concept content now uses dark brown (#2C2416) instead of inheriting gray from body
- Added graceful error when Netlify function unavailable (guides user to run `netlify dev`)

### Claude API Integration - Story Concept Generation

**Netlify Serverless Function**
- Created `netlify/functions/generate-concept.js` for secure API calls
- Uses `ANTHROPIC_API_KEY` environment variable (no client-side exposure)
- Calls Claude Sonnet 4 with structured prompt for story concept generation

**Genome Hydration**
- Converts genome ID arrays to full definitions (name + description)
- Provides Claude with rich context about selected vertebrae
- Handles all vertebrae types: genre, archetype, theme, tone, stakes, humor

**Story Concept UI**
- "Generate Story Concept" button appears when braindump + genome exist
- Loading state with spinner animation
- Result display with formatted markdown (headings, paragraphs, emphasis)
- "Regenerate" button for trying again
- Error display for API failures

**Prompt Structure**
- Logline: 25-35 word dramatic question
- Premise: "What if" hook (2-3 sentences)
- Thematic Core: Underlying truth/question
- Tonal Compass: Emotional texture with comparable works
- The Promise: What makes this story unique

**Persistence**
- Saves generated concept to Supabase `story_concept` JSONB column
- Stores raw text, model info, usage stats, and timestamp

### Late Night Session - Combobox UX Overhaul

**Custom Combobox Component**
- Replaced native `<select>` elements with custom accessible combobox
- Type-ahead filtering: type to narrow options (searches name and description)
- Keyboard navigation: ↓/↑ arrows, Enter to select, Escape to close, Tab to move
- Selected options removed from dropdown (can't select twice)
- Search match highlighting in dropdown options
- Custom styled to match novelist hovel theme:
  - Warm cream backgrounds
  - Terracotta accent on focus
  - Subtle shadows and scrollbars
  - Option descriptions shown in dropdown

**Vertebrae Data Structure**
- Refactored vertebrae.js: each vertebra now an object with label, description, options
- UI pulls labels and descriptions from data file (no hardcoding)
- Renamed `humorPresence` → `humorRole` with expanded options

**Visual Consistency**
- Humor Role (single-select) now displays as tag like multi-selects
- Click × on tag to remove selection

### Evening Session - Spine Builder & Routing

**Vertebrae System**
- Imported vertebrae configuration from `/apps/stc/core/logic/vertebrae.js`
- 5 main vertebrae: Genre, Story Archetype, Theme, Tone, Stakes
- Each option has id, name, and description (with hover tooltips)
- Humor modifier with conditional logic:
  - Humor Presence: single-select (Played Straight, Accent, Structural)
  - Humor Style: multi-select, only enabled when presence is not "Played Straight"

**URL Routing**
- Hash-based routing: `#list`, `#dive/[braindump-id]`
- Back/forward browser buttons work correctly
- Page refresh maintains current view
- Deep link support with auth preservation:
  - Bookmark a braindump URL while logged out
  - After login, automatically navigates to that braindump

**UI Improvements**
- Rainbow color cycling for tags (10 muted colors)
- Disabled state styling for conditional humor style selector

### Afternoon Session - Google OAuth & Homepage

**Authentication**
- Google OAuth login via Supabase Auth
- "Sign in with Google" button with official Google logo
- User bar shows email and sign out button when logged in
- Braindump list/textarea gated behind authentication
- Braindumps filtered to only show current user's data

**Homepage Changes**
- Removed STC from main Investiture nav (will be accessed via Netlify)
- Added Proof of Concept section (currently hidden until ready)

**Netlify Deployment**
- Added `build:netlify` script for root-path deployment
- Separate from GitHub Pages build which uses `/investiture/` prefix

### Morning Session - Supabase Integration

**Database Connection**
- Connected to Supabase with browser-compatible CDN import
- Created service layer in `/core/services/`:
  - `supabase.js` - Client initialization
  - `database.js` - CRUD operations for all STC tables
  - `auth.js` - Supabase Auth integration

**Database Tables**
- projects, braindumps, premise_spine, story_shells
- checkpoints, high_concepts, characters
- beat_entries, parking_lot

**Braindump Flow**
- "Okay, what's your big idea?" textarea input
- Save to Supabase with project creation
- Recent Braindumps table with timestamps
- "Dive in" button to view full braindump
- Edit mode with save/cancel

**Brief Section (Stubbed)**
- Core Concept, Premise, World & Tone cards
- Placeholder text for future AI extraction

---

## Initial Setup (Prior Sessions)

- Created STC app module structure in `/apps/stc/`
- Novelist's Hovel theme with warm, literary aesthetic
- Custom header/footer for STC pages
- STC-specific base layout template
