# STC Architecture Document

> This document explains the Save the Cat Builder (STC) system architecture for technical advisors who need to understand, evaluate, or advise on the system without direct codebase access.

---

## 1. System Overview

### What is STC?

Save the Cat Builder is a web application that helps novelists transform raw story ideas into structured beat sheets using Blake Snyder's "Save the Cat" methodology. It combines human creativity with AI assistance to guide writers from initial braindump to a complete story blueprint.

### What Problem Does It Solve?

Writers often have great ideas but struggle to structure them into coherent narratives. STC addresses this by:

1. **Capturing raw ideas** without judgment (braindump)
2. **Extracting structural DNA** through guided choices (genome)
3. **Generating story frameworks** that honor the writer's vision (concept)
4. **Building character ensembles** with dramatic function (characters)
5. **Maintaining coherence** as elements change (cascade system)

### High-Level User Journey

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Braindump  │ ──▶ │    Brief    │ ──▶ │   Genome    │ ──▶ │   Concept   │
│ (raw ideas) │     │ (AI extract)│     │ (5 choices) │     │(AI generate)│
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   ▼
                                        ┌─────────────┐     ┌─────────────┐
                                        │  Beat Sheet │ ◀── │ Characters  │
                                        │  (15 beats) │     │ (6 roles)   │
                                        └─────────────┘     └─────────────┘
```

1. **Braindump**: Writer pours out their raw story idea in freeform text
2. **Brief**: AI extracts core concept, premise, and world/tone
3. **Genome**: Writer makes 5 structural choices (genre, archetype, theme, tone, stakes) + humor modifier
4. **Story Concept**: AI generates a 5-section concept document
5. **Characters**: Writer/AI creates 6 characters with defined dramatic roles
6. **Beat Sheet**: (Planned) 15-beat structure following Save the Cat methodology

---

## 2. Data Model

### Database: Supabase (PostgreSQL)

#### Tables

##### `braindumps`
Stores the raw story ideas before they become projects.

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to auth.users |
| `content` | TEXT | The raw braindump text |
| `created_at` | TIMESTAMP | When created |

##### `projects`
The main entity tying everything together. One braindump can become one project.

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK to auth.users |
| `braindump_id` | UUID | FK to braindumps |
| `braindump` | TEXT | Copy of braindump content (denormalized for convenience) |
| `title` | TEXT | Project title (AI-generated or manual) |
| `brief` | JSONB | `{coreConcept, premise, worldAndTone}` |
| `genome` | JSONB | Selected genome choices (IDs only, hydrated client-side) |
| `story_concept` | JSONB | `{concept: "full markdown text", status: "generated"}` |
| `created_at` | TIMESTAMP | When created |
| `updated_at` | TIMESTAMP | Last modification |

##### `characters`
Individual characters belonging to a project.

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Primary key |
| `project_id` | UUID | FK to projects |
| `user_id` | UUID | FK to auth.users |
| `role` | TEXT | One of: protagonist, antagonist, mirror, ally, skeptic, wildcard |
| `name` | TEXT | Character name |
| `want` | TEXT | External goal (conscious desire) |
| `need` | TEXT | Internal growth (unconscious need) |
| `arc_type` | TEXT | One of: positive-change, negative-change, steadfast |
| `arc_description` | TEXT | How they change through the story |
| `connections` | TEXT | Relationships to other characters |
| `created_at` | TIMESTAMP | When created |
| `updated_at` | TIMESTAMP | Last modification |

#### Relationships

```
auth.users (Supabase Auth)
    │
    ├──▶ braindumps (1:many)
    │
    └──▶ projects (1:many)
              │
              ├──▶ braindumps (1:1 via braindump_id)
              │
              └──▶ characters (1:many via project_id)
```

#### Row Level Security (RLS)

All tables have RLS enabled. Users can only read/write their own data:
- `user_id = auth.uid()` for all operations

---

## 3. Core Concepts

### The Genome (5 Vertebrae + Humor Modifier)

The "genome" is the structural DNA of the story. It's a set of 5 required choices plus an optional humor modifier that shapes all AI generation.

**Location**: `/apps/stc/core/logic/vertebrae.js`

| Vertebra | Question | Options (examples) |
|----------|----------|-------------------|
| **Genre** | What shelf does this live on? | Literary, Fantasy, Sci-Fi, Horror, Thriller, Mystery, Romance... |
| **Archetype** | What's the deep story shape? | Overcoming the Monster, Rags to Riches, Quest, Voyage and Return, Tragedy, Rebirth... |
| **Theme** | What's it really about? | Redemption, Identity, Power & Corruption, Love & Sacrifice, Freedom vs Oppression... |
| **Tone** | How does it feel? | Dark, Hopeful, Gritty, Whimsical, Melancholic, Epic, Intimate... |
| **Stakes** | What's at risk? | Personal, Relational, Community, Societal, Existential, Cosmic |

**Humor Modifier** (optional):
- **Role**: None, Moments, Seasoning, Texture, Load-Bearing, The Point
- **Style**: Dry, Sharp/Banter, Dark Comedy, Absurdist, Satirical, Parody, Whimsical, Slapstick, Farce

The genome is stored as IDs in the database and "hydrated" client-side by mapping IDs to full objects from vertebrae.js.

### Story Concept Sections

The AI-generated story concept has 5 sections:

| Section | Purpose |
|---------|---------|
| **Logline** | 25-35 word sentence: "When [inciting incident], a [protagonist] must [goal] or else [stakes]" |
| **Premise** | 2-3 sentences on the central "what if" hook |
| **Thematic Core** | What the story is really about beneath plot |
| **Tonal Compass** | How it should feel, with reference works |
| **The Promise** | What experience readers will get |

### Character Roles

Six defined dramatic roles, displayed in a pyramid layout:

**Tier 1 - Drivers (2)**:
- **Protagonist**: The character whose journey we follow
- **Antagonist**: Opposes the protagonist's goal (not necessarily evil)

**Tier 2 - Supports (4)**:
- **Mirror**: Reflects or challenges protagonist's worldview
- **Ally**: Supports the protagonist's journey
- **Skeptic**: Questions and doubts, voice of reason
- **Wildcard**: Doesn't fit other roles, adds texture

### Arc Types

- **Positive Change**: Character grows, overcomes flaw
- **Negative Change**: Character declines, succumbs to flaw
- **Steadfast**: Character doesn't change but changes others

### Beat Sheet Structure (Planned)

The 15 Save the Cat beats:
1. Opening Image
2. Theme Stated
3. Setup
4. Catalyst
5. Debate
6. Break into Two
7. B Story
8. Fun and Games
9. Midpoint
10. Bad Guys Close In
11. All Is Lost
12. Dark Night of the Soul
13. Break into Three
14. Finale
15. Final Image

---

## 4. AI Integration Architecture

### Overview

All AI calls go through Netlify serverless functions that call Claude API. The API key is stored in Netlify environment variables, never exposed to the client.

**Location**: `/netlify/functions/`

### System Prompt (Editor Persona)

All functions (except generate-title) use a shared system prompt that defines the AI's personality:

**Location**: `/netlify/functions/shared/system-prompts.js`

Key traits:
- Warm, sharp, genuinely helpful story development partner
- Helps writers discover what their book wants to be (doesn't write it for them)
- Encouraging but honest
- Offers options, not commands
- Knows story structure cold but holds it loosely

### Function Inventory

#### 1. `extract-brief.js`

| Attribute | Value |
|-----------|-------|
| **Trigger** | Manual: "Extract Brief" button |
| **Model** | claude-sonnet-4-20250514 |
| **Input** | `{braindump}` |
| **Output** | `{coreConcept, premise, worldAndTone}` |
| **Purpose** | Extract 3 key elements from raw braindump |
| **Max Tokens** | 1024 |

#### 2. `generate-title.js`

| Attribute | Value |
|-----------|-------|
| **Trigger** | Manual: regenerate title icon |
| **Model** | claude-3-5-haiku-20241022 (fast/cheap) |
| **Input** | `{braindump}` (first 1000 chars) |
| **Output** | `{title}` |
| **Purpose** | Generate 2-5 word memorable title |
| **Max Tokens** | 50 |

#### 3. `generate-concept.js`

| Attribute | Value |
|-----------|-------|
| **Trigger** | Manual: "Generate Story Concept" button |
| **Model** | claude-sonnet-4-20250514 |
| **Input** | `{braindump, genome}` |
| **Output** | `{concept}` (full markdown with 5 sections) |
| **Purpose** | Generate complete story concept from braindump + genome |
| **Max Tokens** | 2048 |

#### 4. `refine-section.js`

| Attribute | Value |
|-----------|-------|
| **Trigger** | Manual: edit icon on concept section, OR "Apply Changes" in cascade banner |
| **Model** | claude-sonnet-4-20250514 |
| **Input** | `{sectionName, allSections[], direction, genome, braindump}` |
| **Output** | `{revisedSection, affectedSections[]}` |
| **Purpose** | Rewrite one section with user direction, flag drift |
| **Max Tokens** | 2048 |

#### 5. `cascade-genome.js`

| Attribute | Value |
|-----------|-------|
| **Trigger** | Automatic: after genome changes applied |
| **Model** | claude-sonnet-4-20250514 |
| **Input** | `{previousGenome, newGenome, allSections[], braindump}` |
| **Output** | `{summary, affectedSections[]}` |
| **Purpose** | Analyze genome change impact on story concept |
| **Max Tokens** | 4096 |

#### 6. `generate-character.js`

| Attribute | Value |
|-----------|-------|
| **Trigger** | Manual: "Generate with AI" button OR re-roll icon on field |
| **Model** | claude-sonnet-4-20250514 |
| **Input** | `{braindump, genome, storyConcept, existingCharacters[], role, currentCharacter?, rerollField?}` |
| **Output** | `{character}` with all fields |
| **Purpose** | Generate full character or regenerate single field |
| **Max Tokens** | 1024 |

#### 7. `cascade-character.js`

| Attribute | Value |
|-----------|-------|
| **Trigger** | Automatic: after character field re-roll (within-character) OR after character save (project-wide) |
| **Model** | claude-sonnet-4-20250514 |
| **Input (within-character)** | `{cascadeType: 'within-character', character, previousCharacter, changedField}` |
| **Input (project-wide)** | `{cascadeType: 'project-wide', character, previousCharacter, storyConcept, allCharacters[], genome}` |
| **Output (within-character)** | `{hasImpact, affectedFields[]}` |
| **Output (project-wide)** | `{hasImpact, storyConceptImpact, characterImpacts[]}` |
| **Purpose** | Check if changes create inconsistencies |
| **Max Tokens** | 2048 |

### Context Assembly Pattern

Each AI call assembles context from multiple sources:

```
┌─────────────────────────────────────────────────────────┐
│                    AI FUNCTION CALL                      │
├─────────────────────────────────────────────────────────┤
│  System Prompt: editorPersona (shared)                  │
│  ─────────────────────────────────────────────────────  │
│  User Prompt:                                           │
│    - Braindump (original idea)                          │
│    - Genome (structural choices, hydrated)              │
│    - Story Concept (if exists)                          │
│    - Existing Characters (if relevant)                  │
│    - Previous State (for cascade comparison)            │
│    - User Direction (if refining)                       │
│  ─────────────────────────────────────────────────────  │
│  Response Format: Specified JSON structure              │
└─────────────────────────────────────────────────────────┘
```

---

## 5. The Cascade System

### What is Downstream Coherence Checking?

When a user changes an upstream element, the cascade system analyzes whether downstream elements need updating to maintain story coherence.

**Principle**: "Always warn, never silently break."

### Cascade Types

#### 1. Genome → Concept Cascade

**Trigger**: User applies genome changes after concept exists

**Flow**:
```
User changes genome
       │
       ▼
cascade-genome.js called
       │
       ▼
AI compares old vs new genome against all concept sections
       │
       ▼
Returns {affectedSections[]} with suggested fixes
       │
       ▼
UI shows diff modal with checkboxes
       │
       ▼
User selects which to apply
       │
       ▼
Selected sections updated in DB
```

#### 2. Within-Character Cascade

**Trigger**: User re-rolls a single character field

**Flow**:
```
User re-rolls "name" field
       │
       ▼
cascade-character.js (within-character) called
       │
       ▼
AI checks if other fields (e.g., connections) reference old name
       │
       ▼
Returns {affectedFields[]} with suggested updates
       │
       ▼
UI shows cascade modal
       │
       ▼
User selects which to apply
       │
       ▼
Selected fields updated in form (not yet saved)
```

#### 3. Project-Wide Character Cascade

**Trigger**: User saves a character (create or update)

**Flow**:
```
User saves character
       │
       ▼
Toast: "Checking for downstream impacts..."
       │
       ▼
cascade-character.js (project-wide) called
       │
       ▼
AI checks:
  - Story concept references to this character
  - Other characters' connections mentioning this character
       │
       ▼
Returns {storyConceptImpact, characterImpacts[]}
       │
       ▼
If story concept affected:
  - Show suggestions banner above concept section
  - User can edit suggestions and click "Apply Changes"
  - refine-section.js called to revise concept
       │
If other characters affected:
  - Show cascade modal
  - User selects which to apply
  - Selected character fields updated in DB
```

### UI Components

#### Cascade Modal
- Checkbox per affected item
- Shows: target, field, reason, old value, new suggested value
- "Skip All" and "Apply Selected" buttons

#### Story Concept Suggestions Banner
- Appears above story concept section
- Side-by-side diff: current excerpt vs suggested changes
- Editable textarea for suggestions
- "Dismiss" and "Apply Changes" buttons

#### Toast Notifications
- Bottom-right corner
- Shows during cascade checks: "Checking for downstream impacts..."
- Success confirmation after changes applied

---

## 6. File Structure

```
/investiture/
├── apps/stc/
│   ├── core/logic/
│   │   └── vertebrae.js          # Genre, archetype, theme, tone, stakes definitions
│   └── views/vanilla/
│       └── stc.css               # STC-specific styles (width overrides)
│
├── netlify/functions/
│   ├── shared/
│   │   └── system-prompts.js     # Editor persona (shared across functions)
│   ├── extract-brief.js          # Braindump → Brief
│   ├── generate-title.js         # Braindump → Title (Haiku)
│   ├── generate-concept.js       # Braindump + Genome → Concept
│   ├── refine-section.js         # Section refinement + cascade apply
│   ├── cascade-genome.js         # Genome change → Concept impact
│   ├── generate-character.js     # Character generation + field re-roll
│   └── cascade-character.js      # Character change → Impact analysis
│
├── views/vanilla/
│   └── stc.njk                   # Main STC page (HTML, CSS, JS all-in-one)
│
├── docs/
│   ├── CLAUDE.md                 # Project documentation for AI assistants
│   └── ARCHITECTURE.md           # This file
│
└── design-system/tokens/         # Shared design tokens
```

### Key File Responsibilities

| File | Responsibility |
|------|----------------|
| `stc.njk` | All UI: HTML structure, scoped CSS, all JavaScript (auth, CRUD, AI calls, cascade logic) |
| `stc.css` | Width overrides and global STC styles that need to live outside the page |
| `vertebrae.js` | Source of truth for genome options (imported client-side) |
| `system-prompts.js` | Shared AI personality (imported by all Netlify functions) |

---

## 7. Authentication & Data Flow

### Authentication: Supabase Auth

**Provider**: Google OAuth (currently only option)

**Flow**:
```
User clicks "Sign in with Google"
       │
       ▼
supabase.auth.signInWithOAuth({ provider: 'google' })
       │
       ▼
Redirect to Google → back to app
       │
       ▼
supabase.auth.onAuthStateChange() fires
       │
       ▼
UI updates: hide auth view, show user bar + list view
       │
       ▼
Load user's braindumps and projects
```

### Data Flow: UI → Function → Database

#### Example: Generate Concept

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT (stc.njk)                                                │
├─────────────────────────────────────────────────────────────────┤
│ 1. User clicks "Generate Story Concept"                         │
│ 2. Collect braindump + genome from state                        │
│ 3. fetch('/.netlify/functions/generate-concept', {              │
│      method: 'POST',                                            │
│      body: JSON.stringify({ braindump, genome: hydratedGenome })│
│    })                                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ NETLIFY FUNCTION (generate-concept.js)                          │
├─────────────────────────────────────────────────────────────────┤
│ 1. Parse request body                                           │
│ 2. Build prompt with braindump + genome                         │
│ 3. Call Claude API with editorPersona system prompt             │
│ 4. Return { concept, model, usage }                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT (continued)                                              │
├─────────────────────────────────────────────────────────────────┤
│ 4. Receive response                                             │
│ 5. Update local state: currentProject.story_concept             │
│ 6. supabase.from('projects').update({ story_concept })          │
│ 7. Render concept sections in UI                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ SUPABASE (PostgreSQL)                                           │
├─────────────────────────────────────────────────────────────────┤
│ UPDATE projects SET story_concept = {...} WHERE id = ?          │
│ (RLS ensures user_id matches auth.uid())                        │
└─────────────────────────────────────────────────────────────────┘
```

### Project Scoping

All data is scoped to projects:
- Each project has one braindump (source)
- Each project has one genome (structural choices)
- Each project has one story concept (AI-generated)
- Each project has 0-6 characters

When user "dives into" a braindump, a project is created (if not exists) and all subsequent work is scoped to that project.

---

## 8. Design Decisions & Rationale

### Why Decoupled Architecture?

The Investiture framework philosophy: "Never cross the streams."

- **View layer** (stc.njk) doesn't know about database internals
- **Core logic** (vertebrae.js) is framework-agnostic
- **Services** (Netlify functions) wrap external APIs
- **Benefit**: Can swap Supabase for Firebase, Claude for GPT, vanilla JS for React

### Why Cascade Instead of Regenerate-Everything?

**Problem**: If genome changes, should we regenerate the entire concept?

**Decision**: No. Cascade with user confirmation.

**Rationale**:
1. **Preserves user edits**: Writer may have refined sections manually
2. **Transparency**: User sees exactly what changes and why
3. **Control**: User can reject suggestions that don't fit their vision
4. **Efficiency**: Only regenerate what's needed

### Why These Specific Character Roles?

The 6 roles come from Save the Cat and screenplay theory:
- **Protagonist/Antagonist**: The dramatic engine (conflict)
- **Mirror**: Forces protagonist self-reflection (theme)
- **Ally/Skeptic**: External support and challenge (balance)
- **Wildcard**: Flexibility for unique stories (texture)

Not all stories need all 6, but the framework provides slots for the most common dramatic functions.

### Why All-in-One stc.njk?

**Decision**: Single file with HTML, CSS, and JS (6500+ lines)

**Rationale**:
1. **Rapid iteration**: No build step, no component boundaries to manage
2. **Co-location**: Related code stays together
3. **AI-friendly**: Easier for Claude to understand full context
4. **Tradeoff accepted**: File is large but well-organized with clear sections

### Why Haiku for Titles Only?

**Decision**: Use claude-3-5-haiku for title generation, Sonnet for everything else

**Rationale**:
1. **Speed**: Title generation is simple, Haiku responds faster
2. **Cost**: Haiku is cheaper for a trivial task
3. **Quality**: Title doesn't need Sonnet's reasoning depth

### Why Automatic Cascade Checks?

**Decision**: Cascade checks fire automatically after saves and re-rolls

**Alternative considered**: Manual "Check for impacts" button

**Rationale**:
1. **User won't forget**: Coherence checked every time
2. **Non-blocking**: Check runs async, doesn't block UI
3. **Dismissable**: User can always skip suggestions
4. **Tradeoff**: More API calls, but coherence is the core value prop

---

## Appendix: AI Call Summary

| Trigger | Function | Model | Auto? |
|---------|----------|-------|-------|
| Extract Brief button | extract-brief.js | Sonnet | No |
| Regenerate title icon | generate-title.js | Haiku | No |
| Generate Concept button | generate-concept.js | Sonnet | No |
| Edit section icon | refine-section.js | Sonnet | No |
| Apply genome changes | cascade-genome.js | Sonnet | Yes |
| Generate Character button | generate-character.js | Sonnet | No |
| Re-roll field icon | generate-character.js | Sonnet | No |
| After field re-roll | cascade-character.js | Sonnet | Yes |
| After character save | cascade-character.js | Sonnet | Yes |
| Apply concept suggestions | refine-section.js | Sonnet | No |

**Automatic calls**: 3 cascade checks (genome, within-character, project-wide)
**Manual calls**: All others require explicit user action
