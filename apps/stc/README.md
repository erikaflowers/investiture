# Save the Cat Beat Sheet Builder

A self-contained app module for Investiture that helps novelists structure their stories using Blake Snyder's Save the Cat beat sheet methodology.

## What is Save the Cat?

Save the Cat! is a storytelling methodology created by Blake Snyder for screenwriters, later adapted for novelists by Jessica Brody. It breaks down story structure into 15 "beats" (with the Finale containing 5 sub-beats, for 19 total fillable sections).

## Features

- **All 15 beats** with descriptions and writing prompts
- **Finale sub-beats** visually nested under the Finale section
- **Progress tracking** - see how many beats you've completed
- **Auto-save** - your work persists in localStorage
- **Export** - download your beat sheet as a markdown file
- **Content-driven** - all copy comes from JSON files, never hardcoded

## Architecture

This module follows Investiture's layered architecture:

```
/apps/stc/
├── README.md                 ← You are here
├── core/
│   ├── index.js              ← Public API (re-exports logic + state)
│   ├── logic/
│   │   ├── index.js          ← Logic exports
│   │   ├── beat-definitions.js ← Beat structure (IDs, order, acts)
│   │   └── validators.js     ← Validation functions
│   └── state/
│       ├── index.js          ← State exports
│       ├── beats.js          ← Beat entry storage (localStorage)
│       └── project.js        ← Project metadata storage
├── content/
│   └── en/
│       ├── beats.json        ← Beat names, descriptions, prompts
│       ├── common.json       ← UI labels, button text
│       └── guidance.json     ← Help text, tips
└── views/
    └── vanilla/
        └── stc.css           ← App-specific styles
```

**Note:** The main template (`stc.njk`) lives in `/views/vanilla/` because that's Eleventy's input directory. All other app files live here in `/apps/stc/`.

## Integration with Investiture

This module reaches UP to consume shared Investiture resources:

- **Design tokens** via CSS custom properties (`var(--color-accent-primary)`)
- **Base styles** via the main `styles.css`
- **Layout** via the `base.njk` template

The module does NOT modify any Investiture core files. You can delete `/apps/stc/` and Investiture continues to work (after removing the nav entry).

## Running Locally

From the Investiture root:

```bash
npm run dev
# Visit http://localhost:8080/stc/
```

## The 15 Beats

| # | Beat | Act |
|---|------|-----|
| 1 | Opening Image | 1 |
| 2 | Theme Stated | 1 |
| 3 | Setup | 1 |
| 4 | Catalyst | 1 |
| 5 | Debate | 1 |
| 6 | Break Into Two | 1 |
| 7 | B Story | 2 |
| 8 | Fun and Games | 2 |
| 9 | Midpoint | 2 |
| 10 | Bad Guys Close In | 2 |
| 11 | All Is Lost | 2 |
| 12 | Dark Night of the Soul | 2 |
| 13 | Break Into Three | 2 |
| 14 | Finale | 3 |
| 14a | — Gathering the Team | 3 |
| 14b | — Executing the Plan | 3 |
| 14c | — High Tower Surprise | 3 |
| 14d | — Dig Deep Down | 3 |
| 14e | — Execution of New Plan | 3 |
| 15 | Final Image | 3 |

## Transplanting to Its Own Repo

To move this app to a standalone repository:

1. Copy the entire `/apps/stc/` folder
2. Copy `/views/vanilla/stc.njk` (the main template)
3. Set up your own build system (or adapt Investiture's Eleventy config)
4. Copy the design tokens you need from `/design-system/tokens/`
5. Update import paths as needed

The module is designed to be self-contained except for:
- Design tokens (CSS custom properties)
- Base layout template
- Eleventy build configuration

## Future Enhancements

Potential improvements (not yet implemented):
- AI-assisted beat suggestions
- Multiple project support
- Cloud sync (swap localStorage for real backend)
- Print-friendly export
- Genre-specific beat variations

## Credits

- **Save the Cat!** methodology by Blake Snyder
- **Save the Cat! Writes a Novel** adaptation by Jessica Brody
- Built with [Investiture](https://github.com/erikaflowers/investiture)
