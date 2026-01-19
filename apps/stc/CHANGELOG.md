# Save the Cat Builder - Changelog

## 2025-01-18

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
