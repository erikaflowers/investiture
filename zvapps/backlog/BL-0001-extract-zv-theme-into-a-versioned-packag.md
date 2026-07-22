---
id: BL-0001
title: Extract ZV theme into a versioned package
status: parked
priority: p2
created-by: "agent:heavy"
owner: lee
created-date: 2026-07-22
updated-date: 2026-07-22
---

Once two codebases consume the theme, cut a versioned package so the sites stay in sync instead of drift-by-copy.

Today the theme lives as a clean in-repo skin in the zerovector repo; Investiture carries a verbatim copy in `zvapps/control-panel/src/styles/shared/` plus a small mirrored accent layer in `panel.css` (`--zv-*`). Two consumers, one source of truth by convention only — the package makes it enforceable.

Seeded per Addendum A as the proof-run of the write layer: the first agent-authored card on the board.