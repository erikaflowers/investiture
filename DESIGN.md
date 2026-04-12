# Design System Inspired by Investiture Light

## 1. Visual Theme & Atmosphere

Investiture's visual language is warm, grounded, and quietly confident. The interface opens on a soft cream canvas (`#faf8f5`) — not the cold white of clinical SaaS products, but a slightly warm off-white that reads as paper-like and approachable. This warmth carries through the entire neutral scale: secondary surfaces (`#f2efe9`) have the gentle yellow-beige undertone of aged linen, and borders (`#d6d0c8`) feel more like pencil lines on craft paper than the harsh gray dividers of typical developer tools.

The accent is a clear, saturated blue (`#1a6dd2`) — confident without being loud. It appears only on interactive elements: buttons, active tab indicators, focus rings, and links. In a sea of warm neutrals, this single cool accent makes every clickable element unmistakably visible. The accent hover state (`#1458b0`) darkens rather than lightens, reinforcing the sense of depth and intentionality.

Typography is built entirely on Inter, Google's workhorse sans-serif, at a comfortable 14px base. The system uses four weight stops — 400 (body), 500 (UI labels and navigation), 600 (section headings and emphasis), and 700 (page titles). JetBrains Mono serves as the monospace companion for code, filenames, and technical labels. There are no serif fonts — the personality comes from the warm color palette, not from typographic flourish.

The overall impression is a workspace that takes itself seriously without taking itself too seriously. It feels like a well-organized notebook — structured, purposeful, warm to the touch.

**Key Characteristics:**
- Warm cream background (`#faf8f5`) — not white, not gray, distinctly warm
- Single blue accent (`#1a6dd2`) used exclusively for interactive elements
- Inter for all text, JetBrains Mono for code and technical labels
- Four weight stops: 400, 500, 600, 700 — no light weights, no ultra-bold
- Soft shadows (`0 1px 4px rgba(0,0,0,0.05)`) — barely perceptible lift
- Conservative border-radius (6px–12px) — rounded but not pill-shaped
- 150ms transitions on background and color — snappy, never sluggish
- Warm neutral borders (`#d6d0c8`) with yellow-beige undertone

## 2. Color Palette & Roles

### Primary Surfaces
- **Background Primary** (`#faf8f5`): Page canvas. The base surface for all content. Warm off-white.
- **Background Secondary** (`#f2efe9`): Sidebar backgrounds, top bar, card surfaces. One step down from primary — subtle tinting that creates depth without borders.
- **Background Tertiary** (`#e9e5dd`): Hover states, active surfaces, elevated elements. The "pressed" feel.
- **Background Hover** (`#e0dbd2`): Hover surface for interactive elements. Derived from tertiary.

### Text
- **Text Primary** (`#2c2825`): Headings, body text, strong labels. Not black — a warm near-black with brown undertone.
- **Text Secondary** (`#6b6560`): Descriptions, captions, secondary content. Warm medium gray.
- **Text Muted** (`#9a948e`): Placeholders, metadata, de-emphasized labels. Light warm gray.

### Accent
- **Accent Primary** (`#1a6dd2`): Primary interactive color — buttons, links, active tab indicators, focus rings.
- **Accent Hover** (`#1458b0`): Hover state for accent elements. Darker, not lighter.
- **Accent Dim** (`#e8f1fc`): Subtle blue tint for active tab backgrounds, selected state surfaces.
- **Accent Border** (`#a8ccee`): Blue-tinted border for focused inputs and active containers.

### Border
- **Border Default** (`#d6d0c8`): Standard border for cards, dividers, panels, inputs. Warm gray.
- **Border Light** (`#c8c1b8`): Slightly stronger border for hover states and emphasis.

### Status
- **Success** (`#2d7a3e`): Green for success states, completion indicators.
- **Success Background** (`#e5f5e8`): Light green tint for success badges and alerts.
- **Error** (`#c4342b`): Red for errors, destructive actions, validation failures.
- **Error Background** (`#fce8e6`): Light red tint for error badges and alerts.
- **Warning** (`#96710a`): Amber for warnings, caution states.
- **Warning Background** (`#fdf4d8`): Light amber tint for warning badges and alerts.

### Utility
- **Button Text** (`#ffffff`): White text on accent-colored buttons.
- **Overlay Backdrop** (`rgba(0, 0, 0, 0.45)`): Modal/dialog backdrop — moderate opacity for focus isolation without harshness.

## 3. Typography Rules

### Font Family
- **Primary**: Inter, with fallback: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif
- **Monospace**: JetBrains Mono, with fallback: Fira Code, SF Mono, Menlo, monospace

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Page Title | Inter | 20px (1.25rem) | 700 | 1.3 | normal | Top of each page section |
| Section Heading | Inter | 16px (1.00rem) | 700 | 1.3 | normal | With bottom border accent |
| Subsection | Inter | 14px (0.88rem) | 600 | 1.3 | normal | Card titles, group labels |
| Category Label | Inter | 11px (0.69rem) | 600 | 1.2 | 0.05em | Uppercase, sidebar group labels, section dividers |
| Navigation | Inter | 13px (0.81rem) | 500 | 1.0 | normal | Sidebar links, tab labels |
| Body | Inter | 14px (0.88rem) | 400 | 1.6 | normal | Standard reading text, descriptions |
| Small Body | Inter | 13px (0.81rem) | 400 | 1.5 | normal | List items, secondary content |
| Caption | Inter | 12px (0.75rem) | 600 | 1.4 | 0.05em | Uppercase field labels, metadata |
| Filename | JetBrains Mono | 11px (0.69rem) | 400 | 1.4 | normal | File paths, technical identifiers |
| Code Block | JetBrains Mono | 12px (0.75rem) | 400 | 1.6 | normal | Code blocks, pre-formatted content |
| Status Bar | SF Mono / system mono | 12px (0.75rem) | 400 | 1.0 | normal | Bottom status strip |

### Principles
- **Inter everywhere**: One sans-serif family for the entire UI. Personality comes from color, not font variety.
- **Four weights only**: 400 (body), 500 (nav/UI), 600 (headings/labels), 700 (page titles). No 300, no 800.
- **Uppercase as structure**: Category labels and field labels use uppercase + letterspacing (0.05em) to create visual hierarchy without increasing size. The uppercase treatment signals "this is a structural label, not content."
- **Monospace for identity**: JetBrains Mono is used exclusively for filenames, code, and technical metadata — things that have a literal, machine-readable identity. Never for headings or body text.
- **14px base**: Comfortable reading size at 1.6 line-height. Not too large (wastes space), not too small (strains eyes).

## 4. Component Stylings

### Buttons

**Primary**
- Background: `#1a6dd2`
- Text: `#ffffff`
- Padding: 8px 16px
- Radius: 8px
- Font: 13px Inter weight 500
- Border: 1px solid `#1a6dd2`
- Hover: `#1458b0` background and border
- Use: Primary actions ("Transform", "Save")

**Secondary**
- Background: `#e9e5dd`
- Text: `#2c2825`
- Padding: 8px 16px
- Radius: 8px
- Font: 13px Inter weight 500
- Border: 1px solid `#d6d0c8`
- Hover: `#e0dbd2` background
- Use: Secondary actions ("Cancel", "Edit")

**Ghost**
- Background: transparent
- Text: `#6b6560`
- Padding: 8px 16px
- Radius: 8px
- Font: 13px Inter weight 500
- Border: 1px solid transparent
- Hover: `#e0dbd2` background, `#2c2825` text
- Use: Tertiary actions, icon buttons

### Cards & Panels
- Background: `#f2efe9`
- Border: 1px solid `#d6d0c8`
- Radius: 12px
- Padding: 20px
- No shadow — elevation through background color difference
- Title: 14px Inter weight 600, uppercase, 0.05em letterspacing

### Inputs & Forms
- Background: `#f2efe9`
- Border: 1px solid `#d6d0c8`
- Radius: 8px
- Padding: 10px 14px
- Font: 14px Inter weight 400
- Focus: border changes to `#1a6dd2`
- Placeholder: `#9a948e`

### Tabs
- Font: 13px Inter weight 500
- Color: `#6b6560` (inactive), `#1a6dd2` (active)
- Bottom border: 2px solid transparent (inactive), 2px solid `#1a6dd2` (active)
- Padding: 12px 18px
- Hover: `#e0dbd2` background

### Navigation (Sidebar)
- Width: 220px
- Background: `#f2efe9`
- Border-right: 1px solid `#d6d0c8`
- Link: 13px Inter weight 500, `#6b6560` text, 6px radius
- Active link: `#1a6dd2` text on `#e8f1fc` background
- Hover: `#e0dbd2` background

## 5. Layout Principles

### Spacing System
- Base unit: 4px
- Scale: 4px, 6px, 8px, 10px, 12px, 14px, 16px, 20px, 24px, 32px, 40px
- Dense at the small end (sidebar nav items: 9px 12px padding), generous at the large end (page content: 24px padding)

### Grid & Container
- Top bar: 44px fixed height, full width
- Sidebar: 220px fixed width, full height below top bar
- Content area: fluid, fills remaining space
- Cards and panels stack vertically with 16px gap
- No max-width constraint on content — fills the viewport

### Whitespace Philosophy
- **Warm density**: Not minimal, not cramped. The warm backgrounds create visual breathing room that pure white cannot. Cards, panels, and sections use padding (16px–24px) rather than margin to create space — the card itself IS the whitespace.
- **Structural borders**: Borders are used sparingly but deliberately. They separate concerns (sidebar from content, header from body, tab from content) rather than decorating individual elements.

### Border Radius Scale
- Small (6px): Buttons, tabs, nav links, input fields
- Standard (8px): Cards, code blocks, alerts, dropdowns
- Large (12px): Panels, modals, major containers

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Page background, inline content |
| Surface (Level 1) | Background color shift (`#f2efe9` on `#faf8f5`) | Cards, sidebar, top bar, status bar |
| Subtle (Level 2) | `0 1px 4px rgba(0, 0, 0, 0.05)` | Top bar shadow, subtle lift |
| Elevated (Level 3) | `0 8px 24px rgba(0, 0, 0, 0.25)` | Dropdowns, popovers, theme picker |
| Overlay (Level 4) | `rgba(0, 0, 0, 0.45)` backdrop | Modal overlays |

**Depth Philosophy**: Investiture prefers color-based elevation over shadow-based elevation. Most depth is communicated by shifting from the primary background (`#faf8f5`) to the secondary background (`#f2efe9`). Shadows are reserved for floating elements (dropdowns, modals) that truly leave the surface plane. This creates a flatter, calmer visual hierarchy that reduces visual noise in a tool-heavy interface.

## 7. Do's and Don'ts

### Do
- Use `#faf8f5` (warm cream) as the page background — the warmth is the identity
- Use `#1a6dd2` (blue) exclusively for interactive elements — links, buttons, active states
- Use `#2c2825` (warm near-black) for text instead of pure `#000000`
- Use uppercase + letterspacing for structural labels (category headers, field labels)
- Use Inter at 14px for body text with 1.6 line-height
- Use JetBrains Mono for all code, filenames, and technical identifiers
- Keep border-radius between 6px–12px
- Use `150ms` for transition durations
- Use background color shift for elevation rather than shadows

### Don't
- Don't use pure white (`#ffffff`) as a background — always use `#faf8f5` or `#f2efe9`
- Don't use pure black (`#000000`) for text — always use `#2c2825`
- Don't use the accent blue for decorative purposes — it's reserved for interaction
- Don't use more than 4 font weights (400, 500, 600, 700)
- Don't add serif or display fonts — Inter and JetBrains Mono are the complete type system
- Don't use large border-radius (16px+, pill shapes) — the aesthetic is rounded but not soft
- Don't use heavy shadows for cards or panels — use background color differences instead
- Don't use transitions longer than 200ms — the interface should feel immediate

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <768px | Sidebar hidden, top bar compact, content full-width with 16px padding |
| Tablet | 768–1024px | Sidebar visible, aside panel hidden, content adapts |
| Desktop | >1024px | Full layout: sidebar + content + optional aside panel |

### Touch Targets
- Navigation links: 9px 12px padding, minimum 36px touch height
- Buttons: 8px 16px padding, minimum 36px touch height
- Tabs: 12px 18px padding — generous horizontal targets

### Collapsing Strategy
- Sidebar: hidden on mobile (hamburger menu), visible on tablet+
- Aside panel: hidden below 1024px
- Top bar: brand text hidden on mobile, logo + tabs remain
- Tab labels: text hidden on mobile, icon-only
- Content padding: 24px desktop → 16px mobile

## 9. Agent Prompt Guide

### Quick Color Reference
- Page background: Warm Cream (`#faf8f5`)
- Card/panel surface: Linen (`#f2efe9`)
- Hover surface: Sand (`#e0dbd2`)
- Border: Warm Gray (`#d6d0c8`)
- Text primary: Warm Black (`#2c2825`)
- Text secondary: Warm Gray (`#6b6560`)
- Text muted: Light Gray (`#9a948e`)
- Accent/CTA: Investiture Blue (`#1a6dd2`)
- Accent hover: Deep Blue (`#1458b0`)
- Accent tint: Ice Blue (`#e8f1fc`)
- Success: Forest Green (`#2d7a3e`)
- Error: Crimson (`#c4342b`)
- Warning: Amber (`#96710a`)

### Example Component Prompts
- "Create a card: `#f2efe9` background, 1px solid `#d6d0c8` border, 12px radius, 20px padding. Title at 14px Inter weight 600, uppercase, 0.05em letterspacing, `#2c2825`. Body at 14px Inter weight 400, `#6b6560`, 1.6 line-height."
- "Create a primary button: `#1a6dd2` background, white text, 8px 16px padding, 8px radius, 13px Inter weight 500. Hover: `#1458b0`. Disabled: 0.4 opacity."
- "Create a sidebar nav: 220px width, `#f2efe9` background, 1px solid `#d6d0c8` right border. Links at 13px Inter weight 500, `#6b6560`, 6px radius, 9px 12px padding. Active: `#1a6dd2` text, `#e8f1fc` background. Hover: `#e0dbd2` background."
- "Create a tab row: 1px solid `#d6d0c8` bottom border. Tabs at 13px Inter weight 500, `#6b6560` text, 12px 18px padding. Active tab: `#1a6dd2` text, 2px solid `#1a6dd2` bottom border. Hover: `#e0dbd2` background."

### Iteration Guide
1. Background is `#faf8f5` (warm cream), never `#ffffff` — the warmth is non-negotiable
2. Accent is `#1a6dd2` — use it only for interactive elements, never decoratively
3. Text is `#2c2825` (headings) → `#6b6560` (secondary) → `#9a948e` (muted) — three tiers only
4. Cards use `#f2efe9` background with `#d6d0c8` border — no shadows, elevation through color
5. All border-radius: 6px (small interactive), 8px (inputs/buttons), 12px (panels/modals)
6. Transitions: 150ms for color/background, applied to interactive elements only
7. Uppercase labels: 11px weight 600, 0.05em letterspacing — for structural labels, not content
8. JetBrains Mono for anything with a literal file path, code snippet, or technical identifier
