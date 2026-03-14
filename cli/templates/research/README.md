# Research Artifacts

This directory holds structured research output created from the Zero Vector schemas.

## How to populate

### Path A: Harvest from existing work
If you already did the research (in Miro, Figma, Notion, a Google Doc, wherever), use the Box to transform it into structured artifacts:

```
vector harvest --input transcript.txt --schema zv-interview
```

### Path B: Create natively
Use the schema definitions in /vector/schemas/ as templates. Create JSON files in the appropriate subdirectory:

```
/research/interviews/INT-001.json
/research/jtbd/JTBD-001.json
/research/personas/PER-001.json
```

### Validation
Run `vector validate` to check schema conformance, reference integrity, and coverage gaps.

## Status convention
- **draft** — AI-generated or first pass. Needs human review.
- **confirmed** — Human-reviewed and approved. Canonical.
- **invalidated** — Was confirmed, but later evidence disproved it. Keep for history.
