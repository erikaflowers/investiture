# 2.0 Update-Path Test — zerovector downstream

**Date:** 2026-07-22 · **Agent:** Heavy · **Result: PASS** (with one
release-blocking discovery about the published CLI, below)

## Starting state

Sacrificial full copy of the local `zerovector` repo (rsync, `node_modules`
excluded; never touched zerovector itself, nothing pushed):

- `.investiture-version.json`: **1.5.0**, ref `feature/transplant-the-box`
  (the known stale-branch stamp from the v1.5 install)
- v1.5 panel pages (BoxPage, HomePage, Doctrine, Vector, Design, Skills, Health)
- Real user content: customized VECTOR/CLAUDE/ARCHITECTURE/DESIGN.md,
  31 files under `vector/`, panel `data/`, `.env`
- Pre-existing local edits to `zvapps/control-panel/server/homeApi.js` and
  `src/pages/HomePage.jsx` (panel code — upstream territory)
- 37 user-owned files checksummed (SHA-256) before the run

## Command

```bash
INVESTITURE_REF=sprint/investiture-2-0 \
  node <investiture>/cli/bin/investiture.js update --dry-run   # previewed
INVESTITURE_REF=sprint/investiture-2-0 \
  node <investiture>/cli/bin/investiture.js update             # applied
```

The manifest is read from the fetched tarball, so the 2.0 preserve rules
applied regardless of CLI version.

## What upgraded

- `zvapps/control-panel/{src,server,core,vite.config.js,package*.json,.gitignore}`,
  `zvapps/zv-ui`, `zvapps/ZV-CONTRACT.md`, `invest.md`, 16 skills merged —
  35 replacements total, matching the dry-run exactly
- Sidecar pages present after update; port 3067 in the new vite config
- Version stamp: 2.0.0, ref `sprint/investiture-2-0`, `installedAt`
  preserved, `lastUpdatedAt` refreshed

## What was preserved

- **All 37 checksummed user files byte-identical** after the update:
  the four doctrine files, all 31 `vector/` artifacts, panel `data/`, `.env`
- `zvapps/backlog/` was correctly untouched by the update — backlog items
  are never added, removed, or modified by `update` (the template ships an
  empty backlog with only a `.gitkeep`; there is no seed card)
- The pre-existing local edits to panel code were overwritten, as
  documented (panel code is upstream territory; MIGRATION-2.0.md says to
  copy customizations out first)

## Boot verification

`npm ci` + `npm start` in the updated copy's control panel:

- Panel serves 200 on :3067
- `/api/zv/state` reports zero state (`onboarded: false`) — onboarding
  offers itself, nothing re-triggered, nothing destroyed
- `/api/zv/doctrine/CLAUDE.md` serves zerovector's own doctrine through
  the new API
- Overview renders the zero-state explainer (screenshot in session log)

## What broke

Nothing in the update path itself. One discovery outside it:

- **The npm-published `investiture` CLI is v1.3.0**, which predates the
  `update` command — `npx investiture update` fails with "Unknown command"
  for real users today. The v1.5 verification evidently ran the local CLI.
  **Publishing CLI 2.0.0 to npm is a release requirement**, not optional.

## Follow-through

- After the 2.0 merge, re-run `npx investiture update` from the real
  zerovector without `INVESTITURE_REF` to re-stamp it as tracking `main`
  (this also clears the stale `feature/transplant-the-box` ref).
