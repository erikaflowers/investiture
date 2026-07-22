# Migrating from Investiture 1.x to 2.0

2.0 turns the control panel from a workbench into a **sidecar brain**: your
project's past (doctrine snapshots, audits), present (session telemetry,
skill usage), and future (PRD, backlog board), all stored as markdown and
JSONL files under `zvapps/`. The GUI is a view; the files are the truth.

## How to update

```bash
npx investiture update --dry-run    # preview
npx investiture update              # apply
```

The update replaces the panel's code (`zvapps/control-panel/src`, `server`,
`core`, config) and `zvapps/zv-ui`, merges new/updated skills, and preserves
everything user-owned — including the new 2.0 paths, which are declared in
`cli/update-manifest.json`:

| Path | What it is | Update behavior |
|------|-----------|-----------------|
| `zvapps/PROJECT.md` | Project config (name, description) | preserved |
| `zvapps/PRD.md` | Your product plan | preserved |
| `zvapps/backlog/` | Backlog items (one markdown file each) | preserved |
| `zvapps/telemetry/` | Append-only session log | preserved |
| `zvapps/.zv-history/` | Doctrine snapshots | preserved |
| `zvapps/ZV-CONTRACT.md` | The 2.0 contract document | replaced (upstream-owned) |
| VECTOR / ARCHITECTURE / CLAUDE / DESIGN `.md` | Doctrine | preserved, as always |

Because `zvapps/backlog/` is not part of any replace or merge rule, existing
1.x installs do **not** receive the template's seed backlog item — new repos
generated from the template do.

## What's new

- **Write API** at `/api/zv/*` — backlog CRUD, PRD write/append, doctrine
  write with snapshot-on-save, restore, telemetry, onboarding. Path
  allowlist enforced at the API layer (two territories: `zvapps/` and the
  four doctrine files). See `zvapps/ZV-CONTRACT.md` — the telemetry event
  schema is public API for downstream consumers.
- **Sidecar pages** — Overview (recency/staleness), Activity (telemetry
  feed), Board (kanban over backlog front-matter), Editor (doctrine + PRD
  with snapshot/restore rail), Files (rendered markdown browser).
- **Zero state + onboarding wizard** — before onboarding, every sidecar page
  explains itself; the wizard (two questions) seeds PROJECT.md and the PRD.
  Re-running it is never destructive.
- **Agent rituals** — CLAUDE.md now defines a startup ritual (read PRD +
  backlog) and shutdown ritual (update statuses, write catch-up, emit
  session events). See the "Agent Rituals" section of CLAUDE.md.
- **ZV start page** — the root `src/` app ships as a minimal branded
  placeholder. Updates never touch `src/`, so existing projects are
  unaffected.

## Breaking changes

- **Port: 3003 → 3067.** The panel dev server and HMR both move. Update
  bookmarks and any tooling that assumed 3003.
- **The Box is retired.** Its page is no longer routed; the panel replaces
  it with the sidecar pages. (`/api/write-vector` and the Anthropic proxy
  remain in this release but are deprecated and will be removed.)
- **`/api/doctrine/write` is removed.** It wrote doctrine files without
  snapshotting. The Doctrine and Design pages now save through
  `PUT /api/zv/doctrine/:name`, which snapshots the prior version to
  `zvapps/.zv-history/` first. `/api/doctrine/read` is unchanged.
- **Panel visual base is unchanged** (zv-ui + Labrador themes) with Zero
  Vector brand accents on the sidecar pages. If you customized panel code
  directly, your changes live in replaced paths — copy them out before
  updating (panel code is upstream territory; doctrine and `vector/` are
  yours).

## Version stamp

After updating, `.investiture-version.json` records 2.0.0. Verify with the
Home page's version card or `npx investiture update --dry-run` (should
report nothing to change).
