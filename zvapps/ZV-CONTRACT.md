# ZV-CONTRACT — Investiture 2.0 Sidecar Contract

**Version:** 2.0.0-draft.1
**Status:** Awaiting Samantha's review (Milestone 1 deliverable)
**Scope:** This document is the single authority for the Investiture 2.0 sidecar: file formats, directory layout, the write API, the telemetry event contract, and the onboarding data flow. Milestones 2–5 implement this document. If implementation and contract disagree, the contract wins; if the contract is silent, park the question — do not improvise.

The telemetry event contract (§5) is **public API**: downstream consumers (Telltale) depend on it. Changes after review require a version bump and migration notes.

---

## 0. Principles (inherited from the build brief, restated as constraints)

1. **Markdown is the source of truth.** Every durable artifact — backlog items, PRD, doctrine, project config — is a markdown file, human-readable and hand-editable. The GUI is a view. The only non-markdown store is the telemetry log, which is append-only JSONL (still human-readable, one event per line).
2. **The API owns safety, not the UI.** Path allowlisting, snapshotting, and non-destructive onboarding are enforced at the API layer. A malicious or buggy client must not be able to write out of bounds.
3. **Last-write-wins.** This is a local, single-user tool. No locking, no merge resolution. Stated openly here and in user docs.
4. **Two territories, no more.** The API reads and writes (a) the `zvapps/` directory and (b) the doctrine files at repo root, by exact filename (§3). Nothing else, ever.

---

## 1. Backlog

### 1.1 Location and naming

- Directory: `zvapps/backlog/`
- One file per item: `BL-NNNN-short-slug.md`
  - `NNNN` — zero-padded sequence number, allocated by the API as (highest existing + 1). Never reused, never renumbered.
  - `short-slug` — kebab-case from the title, max 40 chars, `[a-z0-9-]` only.
  - Example: `BL-0007-kanban-drag-reorder.md`
- The file name is cosmetic after creation; the `id` front-matter field is canonical. Renaming the slug is allowed; changing `id` is not.

### 1.2 Front-matter schema

```yaml
---
id: BL-0007            # required, unique, immutable
title: Kanban drag reorder
status: proposed       # required, enum below
priority: p2           # required: p0 | p1 | p2 | p3
created-by: agent:heavy # required: "human" or "agent:<name>"
owner: heavy           # optional, free text (who will do it)
created-date: 2026-07-22  # required, YYYY-MM-DD
updated-date: 2026-07-22  # required, YYYY-MM-DD, maintained by the API on every write
---
```

Body below the front-matter is free-form markdown (description, acceptance criteria, notes).

### 1.3 Status enum

`proposed` → `queued` → `in-progress` → `done`, with `parked` reachable from any state. These five values are exhaustive. The kanban board (Milestone 4) renders one column per status in this order: proposed, queued, in-progress, done, parked. Any other `status` value renders the card in an "invalid" tray with a repair affordance — it is never silently hidden or coerced.

### 1.4 Authorship

`created-by` is exactly `human` or `agent:<name>` (e.g. `agent:heavy`, `agent:decker`). The UI derives the human/agent visual distinction from this prefix alone. Unknown formats render as human.

---

## 2. PRD

- Location: `zvapps/PRD.md`. Exactly one PRD per project.
- Required H2 sections, in order. The API validates presence on full write and rejects a PRD missing any of them (`INVALID_INPUT`):
  1. `## Overview`
  2. `## Goals`
  3. `## Non-Goals`
  4. `## Milestones`
  5. `## Open Questions`
  6. `## Changelog`
- **Humans edit anywhere** via the full-content write (`PUT /api/zv/prd`).
- **Agents append, never rewrite.** Agents use `POST /api/zv/prd/append`, which adds a dated bullet to the end of `## Changelog` or `## Open Questions` only. Agent entries are formatted by the API as:
  `- **2026-07-22** (agent:heavy) — entry text`
- Extra sections beyond the required six are allowed and preserved.

---

## 3. Doctrine allowlist

The doctrine files are exactly these four, at repo root, matched by exact filename:

| File | Role |
|------|------|
| `VECTOR.md` | Project doctrine — why, who, constraints |
| `CLAUDE.md` | Contributor/agent onboarding |
| `ARCHITECTURE.md` | Technical authority |
| `DESIGN.md` | Design system source |

This list is closed. `README.md`, `invest.md`, and everything else at root are **not** writable through the API. Adding a sibling to this list is a contract change.

---

## 4. Write API

### 4.1 General

- Served by Vite middleware plugins in `zvapps/control-panel/server/` (same mechanism as v1.5), on the control panel dev server.
- **Port: 3067** (2.0 canonical; the v1.5 config's 3003 changes to 3067 in Milestone 2).
- Namespace: everything in this contract lives under `/api/zv/`. The v1.5 endpoints (`/api/doctrine/*`, `/api/home/*`, `/api/vector/*`) remain during migration and are retired when Milestones 3–4 land.
- All requests and responses are JSON, UTF-8. All timestamps are ISO 8601 UTC.

### 4.2 Error shape

Every non-2xx response has this body:

```json
{ "error": { "code": "OUT_OF_BOUNDS", "message": "Path resolves outside allowed territories" } }
```

| HTTP | Code | Meaning |
|------|------|---------|
| 400 | `INVALID_INPUT` | Malformed body, bad enum value, missing required field, PRD missing required section |
| 403 | `OUT_OF_BOUNDS` | Path allowlist rejection (§4.5) |
| 404 | `NOT_FOUND` | Unknown id, file, or snapshot |
| 405 | `METHOD_NOT_ALLOWED` | Wrong HTTP method |
| 500 | `IO_ERROR` | Filesystem failure |

### 4.3 Read endpoints

| Endpoint | Returns |
|----------|---------|
| `GET /api/zv/state` | `{ project: { name, description, onboarded, onboardedDate }, recency: { lastAudit, lastStabilityPass, lastContextCatchup, lastSessionEnd }, backlogCounts: { proposed, queued, "in-progress", done, parked } }`. Project fields come from `PROJECT.md` (§6); recency fields are the `ts` of the most recent matching telemetry event (§5.4), `null` if none. |
| `GET /api/zv/backlog` | `{ items: [ { ...front-matter, path } ] }` — front-matter only, no bodies. Items with unparseable front-matter appear as `{ path, invalid: true }`. |
| `GET /api/zv/backlog/:id` | `{ ...front-matter, path, body }` |
| `GET /api/zv/doctrine` | `{ files: [ { name, exists, mtime, size, snapshots } ] }` for the four allowlisted files (`snapshots` = count) |
| `GET /api/zv/doctrine/:name` | `{ name, content, exists }` — `:name` must be on the allowlist (§3) else 403 |
| `GET /api/zv/prd` | `{ content, exists, sections: { overview: true, ... } }` |
| `GET /api/zv/telemetry?limit=50&type=skill-invoked` | `{ events: [...] }` newest first; both params optional, default limit 100 |
| `GET /api/zv/history?file=CLAUDE.md` | `{ file, snapshots: [ { id, ts, size } ] }` newest first — `file` must be a doctrine name (§3) |
| `GET /api/zv/history/content?file=CLAUDE.md&snapshot=<id>` | `{ file, snapshot, content }` |

### 4.4 Write endpoints

| Endpoint | Body | Behavior |
|----------|------|----------|
| `POST /api/zv/backlog` | `{ title, body?, priority?, owner?, createdBy }` | Allocates next id, writes `BL-NNNN-slug.md` with `status: proposed`, today's dates. Returns 201 `{ id, path }`. `priority` defaults to `p2`. |
| `PUT /api/zv/backlog/:id` | `{ title?, status?, priority?, owner?, body? }` | Merge-patch: only provided fields change; `updated-date` set to today; `id`, `created-by`, `created-date` immutable (`INVALID_INPUT` if the body tries). Status must be in the enum. |
| `PUT /api/zv/prd` | `{ content }` | Full replace after section validation (§2). Human editing path. |
| `POST /api/zv/prd/append` | `{ section: "changelog" \| "open-questions", entry, actor }` | Appends a dated bullet (§2). Agent path. Creates the PRD from the seed template (§6.3) if missing. |
| `PUT /api/zv/doctrine/:name` | `{ content }` | **Snapshot first** (§4.6), then write. Returns `{ name, snapshot }`. |
| `POST /api/zv/restore` | `{ file, snapshot }` | Snapshots the **current** version, then restores the named snapshot. Restore is therefore always undoable. Returns `{ file, restoredFrom, preRestoreSnapshot }`. |
| `POST /api/zv/telemetry` | `{ event, actor, payload }` | Validates against §5, appends one line to the JSONL log. Returns 201. |
| `POST /api/zv/onboarding` | `{ name, description }` | See §6.4. Never destructive; safe to re-run. |

### 4.5 Allowlist enforcement

Enforced in one shared server-side function used by every endpoint that touches disk. The UI is never trusted.

1. Clients never send raw filesystem paths. They send ids (`BL-0007`), doctrine names (`CLAUDE.md`), or fixed resources (PRD, telemetry). The server maps these to paths.
2. Every server-constructed path is canonicalized with `path.resolve` and must satisfy exactly one of:
   - inside `<repoRoot>/zvapps/` (after resolution — `..` segments, absolute-path smuggling, and symlink escapes via `fs.realpathSync` of the containing directory all fail this test), or
   - exact string equality with one of the four doctrine paths (§3).
3. Anything else → 403 `OUT_OF_BOUNDS`, and the attempt is logged to stderr.
4. Milestone 2 ships tests proving rejection of: `../` traversal in ids/names, absolute paths, doctrine-lookalike names (`CLAUDE.md.bak`, `./CLAUDE.md/..`), symlinks inside `zvapps/` pointing outside, and writes to `node_modules`, dotfiles, and source directories.

### 4.6 Snapshots

- Directory: `zvapps/.zv-history/<filename>/` — one subdirectory per doctrine file (e.g. `zvapps/.zv-history/CLAUDE.md/`).
- Snapshot id/filename: compact UTC timestamp, `20260722T110500Z.md`. Collisions within the same second append `-2`, `-3`, ….
- Written **before** every successful doctrine write and before every restore. If the target file does not exist yet, no snapshot is taken (there is nothing to save).
- Snapshots live inside `zvapps/`, so they are inside territory (a) and covered by the update-manifest `preserve` rules — upstream updates never touch project history. `zvapps/.zv-history/` is gitignored by default; the doctrine files themselves are in git, which remains the long-term history.
- Retention: keep everything. These are small text files. Pruning is a future contract change, not an implementation liberty.

---

## 5. Telemetry event contract (PUBLIC API)

### 5.1 Transport and location

- Append-only JSONL file: `zvapps/telemetry/events.jsonl`. One event per line. Never rewritten, never sorted, never compacted.
- Events enter via `POST /api/zv/telemetry`, or by a well-behaved agent appending a line directly (same schema) when the panel is not running. Both are legal; the file is the contract, not the endpoint.

### 5.2 Envelope

```json
{ "ts": "2026-07-22T18:05:00Z", "event": "skill-invoked", "actor": "agent:heavy", "payload": { } }
```

- `ts` — ISO 8601 UTC, required.
- `event` — one of the six types in §5.3, required.
- `actor` — `human` or `agent:<name>`, required.
- `payload` — object, required (may be `{}`), typed per event below.

### 5.3 Event types and payloads

| Event | Payload | Emitted when |
|-------|---------|--------------|
| `session-start` | `{ "agent": "heavy" }` | An agent session begins in this repo |
| `session-end` | `{ "agent": "heavy", "summary": "one-line what-happened" }` | Session shutdown ritual |
| `skill-invoked` | `{ "skill": "invest-repo-audit" }` | Any `/invest-*` skill runs |
| `file-updated` | `{ "file": "CLAUDE.md", "via": "api" \| "agent", "snapshot": "20260722T110500Z" \| null }` | Any write to doctrine, PRD, or backlog. **The write API emits this server-side on every successful write** — clients and agents must not double-emit for API-mediated writes. |
| `audit-run` | `{ "skill": "invest-repo-audit", "result": "pass" \| "issues" \| "unknown" }` | An audit-chain skill completes |
| `context-catchup-written` | `{ "agent": "heavy" }` | The context catchup section is rewritten at shutdown |

### 5.4 Derived recency (consumed by `GET /api/zv/state`)

- `lastAudit` ← newest `audit-run`
- `lastStabilityPass` ← newest `audit-run` with `result: "pass"`
- `lastContextCatchup` ← newest `context-catchup-written`
- `lastSessionEnd` ← newest `session-end`

### 5.5 Compatibility rules (for Telltale and any other consumer)

1. Consumers MUST ignore unknown event types and unknown envelope/payload fields — future versions add, never remove or rename.
2. Producers MUST NOT emit types outside §5.3 without a contract version bump.
3. A malformed line (unparseable JSON) is skipped by consumers, never fatal.

---

## 6. Zero state, project config, and onboarding

### 6.1 Project config

- File: `zvapps/PROJECT.md`. Markdown with front-matter — no JSON config store.

```yaml
---
name: My Project
description: One line on what this is.
onboarded: true
onboarded-date: 2026-07-22
---
```

Body below the front-matter is free space for the human; the panel does not manage it.

### 6.2 Zero state definition

The panel is in **zero state** when `PROJECT.md` is absent or `onboarded` is not `true`. In zero state, every page renders its explainer ("this is where you will view your project…") instead of empty views, plus the entry point to the wizard. The shipped template repo is in zero state by construction: no `PROJECT.md`, no `PRD.md`, no `zvapps/backlog/` items, no telemetry log.

### 6.3 Seed PRD template

Onboarding seeds `zvapps/PRD.md` with the six required sections (§2): Overview pre-filled from the wizard's description; Goals, Non-Goals, Milestones, Open Questions as placeholder prompts; Changelog with one entry: `- **<date>** (human) — Project onboarded.`

### 6.4 Onboarding data flow (`POST /api/zv/onboarding`)

Input: `{ name, description }`. Steps, all through the same allowlist/snapshot machinery as every other write:

1. Write `zvapps/PROJECT.md` front-matter (`onboarded: true`, today's date). If it already exists, only `name` and `description` are updated — `onboarded-date` is preserved.
2. Seed `zvapps/PRD.md` from §6.3 **only if it does not exist**. Never overwrite an existing PRD.
3. Create `zvapps/backlog/` **only if it does not exist**. Never touch existing items.
4. Create `zvapps/telemetry/` and emit a `file-updated` event for each file actually written in steps 1–2.

Re-running the wizard is therefore always safe: it can rename the project, but it cannot destroy a PRD, backlog, or history. The wizard UI (Milestone 5) is a thin client over this one endpoint — it is the proof-run of the write layer.

---

## 7. Out of scope (decided, not open)

- No databases, no JSON content stores, no locking/conflict resolution (last-write-wins).
- No Box integration; no hooks left for it.
- No remote/multi-user anything. The API binds to localhost via the Vite dev server.
- No writes outside the two territories, including "just this once."
