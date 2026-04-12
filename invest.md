# Investiture Skills

An eight-skill harness for Claude Code that takes any codebase from "nothing documented" to "doctrine enforced, code audited, and issues remediated" in a structured, repeatable sequence.

Each skill is a standalone slash command. They can be run independently, but they are designed as two pipelines where each step feeds into the next.

---

## The Chain at a Glance

```
Doctrine Chain:
/invest-backfill ──> /invest-doctrine ──> /invest-architecture
   (generate)          (validate)           (enforce)

Audit Chain:
/invest-preflight ──> /invest-manifest ──> /invest-repo-audit ──> /invest-remediate ──> /invest-verify-remediation
     (scan)              (inventory)          (judge)               (plan)                (confirm)
```

| Step | Command | Input | Output | Time |
|------|---------|-------|--------|------|
| 1 | `/invest-backfill` | A codebase with no doctrine | VECTOR.md, CLAUDE.md, ARCHITECTURE.md | 10-20 min |
| 2 | `/invest-doctrine` | Doctrine files | `/vector/audits/invest-doctrine.md` | 5-10 min |
| 3 | `/invest-architecture` | Doctrine + codebase | `/vector/audits/invest-architecture.md` | 10-20 min |
| 4 | `/invest-preflight` | A repo path | Conversation summary | ~2 min |
| 5 | `/invest-manifest` | A repo path | `MANIFEST.md` at repo root | 10-30 min |
| 6 | `/invest-repo-audit` | A repo path (uses MANIFEST.md if present) | `AUDIT.md` at repo root | 15-45 min |
| 7 | `/invest-remediate` | Path to AUDIT.md | `REMEDIATION.md` at repo root | 5-15 min |
| 8 | `/invest-verify-remediation` | A repo path (requires AUDIT.md + REMEDIATION.md) | Updated AUDIT.md, deletes REMEDIATION.md | 10-15 min |

---

## Doctrine Chain

The doctrine chain establishes what your project is, validates that the documentation is sound, and enforces it against the codebase. Run this first on any project adopting Investiture.

### Step 1: invest-backfill

**Command:** `/invest-backfill [--dry-run] [--only vector|claude|architecture]`

Surveys an existing codebase and generates the three Investiture doctrine files — VECTOR.md, CLAUDE.md, and ARCHITECTURE.md — by combining Investiture defaults with patterns inferred from the project. Run this once on a project that does not yet have doctrine.

#### What it does

- Reads package manifests, README, config files, directory structure, entry points, git history
- Identifies framework, language, architecture patterns, naming conventions, state management
- Surveys across 14 signal categories (identity, architecture, convention, agent, process)
- Combines inferred patterns with Investiture defaults (Seven Principles, Core Relationship, layer system)
- Presents a survey report for operator confirmation before writing anything
- Generates VECTOR.md (project doctrine), CLAUDE.md (contributor onboarding), ARCHITECTURE.md (technical spec)
- Initializes the `/vector/` directory structure with research scaffolding

#### What it produces

- `VECTOR.md` at repo root — project identity, audience, problem, constraints, principles
- `CLAUDE.md` at repo root — contributor onboarding, stack summary, key context
- `ARCHITECTURE.md` at repo root — layers, conventions, stack, import rules, structure
- `/vector/` directory — research, decisions, and audit scaffolding
- `/vector/audits/invest-backfill.md` — summary of what was inferred and generated

#### When to use it

- First contact with a project that has no doctrine files
- After adopting Investiture on an existing codebase
- To understand what Investiture would infer about your project (`--dry-run`)

#### Key rules

- Infers from reality, not Investiture defaults. The project as it is, not as it should be.
- Never overwrites existing files. If VECTOR.md already exists, skips it.
- Flags confidence levels on inferred sections. Low-confidence sections get `[OPERATOR: ...]` prompts.
- Includes Investiture defaults (Seven Principles, Core Relationship) regardless of what is inferred.

---

### Step 2: invest-doctrine

**Command:** `/invest-doctrine [path/to/specific-doctrine-file]`

Audits the three doctrine files for completeness, internal consistency, cross-document contradictions, and drift from the actual codebase. The doctrine must be sound before you enforce it.

#### What it does

- Checks VECTOR.md for completeness (Problem Statement, Target Audience, Value Prop, Principles, Constraints, Quality Gates)
- Checks ARCHITECTURE.md for structural requirements (layer table, naming, stack, import direction, project structure)
- Reality-checks declared structure against the actual filesystem
- Checks CLAUDE.md for existence, override consistency with ARCHITECTURE.md
- Cross-references all three files for contradictions (constraints vs. stack, principles vs. conventions, stage vs. completeness)
- Scans the codebase for patterns that contradict doctrine declarations

#### What it produces

`/vector/audits/invest-doctrine.md` — a severity-classified report covering:
- Missing files (Critical)
- Incomplete sections or contradictions (High)
- Structure mismatches (Medium)
- Gaps and placeholders (Low/Info)

#### When to use it

- After editing any doctrine file
- After `/invest-backfill` generates files, to validate them
- When you suspect doctrine has drifted from the codebase
- Before running `/invest-architecture` for the first time

#### Key rules

- Drift is not failure. Doctrine evolves. But undocumented drift is debt.
- Placeholders are fine in early stages — severity is stage-aware.
- This skill checks the doctrine, not the code. `/invest-architecture` checks the code.

---

### Step 3: invest-architecture

**Command:** `/invest-architecture [--fix] [path/to/scope]`

Audits the codebase against ARCHITECTURE.md. Reads your doctrine at runtime and checks whether the code follows what you declared — layers, naming, imports, tokens, conventions.

#### What it does

- Reads ARCHITECTURE.md, VECTOR.md, and CLAUDE.md to extract all declared rules
- Builds a token inventory if a design token system is declared
- Audits every file in scope across six categories:
  - **LAYER** — code belongs to the correct layer
  - **IMPORT** — import direction rules followed
  - **TOKENS** — no hardcoded design values outside the token file
  - **NAMING** — filenames match declared conventions
  - **STATE** — state management rules followed
  - **SIZE** — file length limits observed
- Suggests specific fixes for each violation
- Optional auto-fix for safe mechanical changes (`--fix`)

#### What it produces

`/vector/audits/invest-architecture.md` — a severity-classified report:
- High: structural violations (wrong layer, import direction violations)
- Medium: convention violations (naming, token usage)
- Low: style violations (file size, minor patterns)
- Info: advisory notes

#### When to use it

- After `/invest-doctrine` confirms the doctrine is sound
- Before a commit or PR, as a structural check
- After significant refactoring
- Periodic health checks on conventions

#### Key rules

- Doctrine is law. The audit checks code against what you declared, not a preset.
- Audit, don't rewrite. Report violations with suggestions. Do not modify code unless `--fix` is passed.
- No false positives. If uncertain, classify as Info, not High.
- The `--fix` flag only handles safe mechanical changes (file renames, import reordering). Structural changes require human judgment.

---

## Audit Chain

The audit chain takes any codebase from "I've never seen this before" to "audited, remediated, and verified" in a structured, repeatable sequence. Run this on any codebase you need to assess or improve.

### Step 4: invest-preflight

**Command:** `/invest-preflight [path-to-repo]`

The reconnaissance pass. A fast, non-invasive scan that answers five questions: What is this? What's it made of? How big is it? What's the tech stack? What should I watch out for?

#### What it does

- Reads package manifests (`package.json`, `Cargo.toml`, `pyproject.toml`, etc.)
- Identifies framework, language, database, auth approach, and hosting
- Counts files by extension, measures scale
- Detects testing, CI/CD, linting, state management patterns
- Scans for hazards: monorepo structures, secrets in code, files over 1000 lines, generated code, multiple languages

#### What it produces

A structured summary printed directly to the conversation. No files written. Covers: project identity, scale metrics, structure map, git activity, hazards, and recommended next steps.

#### When to use it

- First contact with an unfamiliar codebase
- Before deciding whether to run the full chain
- Quick orientation before any work session

#### Key rules

- Speed over completeness. This is a 2-minute scan, not a deep dive.
- No files written. Output to conversation only.
- The Hazards section is the most valuable part — flag anything that would surprise someone.
- Be honest about unknowns. "Not detected" is better than a guess.

---

### Step 5: invest-manifest

**Command:** `/invest-manifest [path-to-repo]`

The complete inventory. Reads every source file in the codebase and produces a structured document describing what exists — every file, route, endpoint, database table, component, hook, and feature.

#### What it does

- Discovers project type from dependency manifests
- Maps the full file tree (excluding node_modules, .git, dist, etc.)
- Reads every source file to describe it accurately (uses parallel subagents for speed)
- Produces a multi-section inventory document

#### What it produces

`MANIFEST.md` at the repo root, containing:

1. **File Tree** — every file with a one-line description
2. **Architecture Overview** — tech stack, patterns, entry points
3. **Pages & Routes** — every client-side route (if applicable)
4. **API Endpoints** — method, path, auth, request/response shapes (if applicable)
5. **Database Schema** — tables, columns, relationships (if applicable)
6. **Components** — every UI component with purpose, props, state (if applicable)
7. **Hooks / Services / Utilities** — shared logic modules (if applicable)
8. **Configuration & Environment** — env vars, config files, build settings
9. **Feature Inventory** — every user-facing feature with working/partial/stub status

#### When to use it

- Before auditing (gives the audit a map to work from)
- When onboarding to a project you will be working in long-term
- When you need to understand the full scope before planning work

#### Key rules

- Sections adapt to the project type. A CLI tool will not have routes. A static site will not have a database.
- Read before describing. Never guess from filenames.
- Descriptions must be precise: not "handles authentication" but "verifies Google JWT, checks ADMIN_EMAIL, returns user role from ops_users table."

---

### Step 6: invest-repo-audit

**Command:** `/invest-repo-audit [path-to-repo]`

The quality assessment. Scans the codebase across 8 vectors, classifies every finding by severity, and produces a prioritized report.

#### What it does

Performs 8 parallel audit scans:

1. **Dead Code** — files imported nowhere, functions exported but never called, orphaned CSS
2. **Spaghetti & Complexity** — files over 500 lines, circular imports, god files, prop drilling
3. **Error Handling** — uncaught API errors, missing loading/error/empty states, silent failures
4. **Security** — secrets in source, auth bypass vectors, unsanitized input, CORS misconfig
5. **Consistency** — naming conventions, API patterns, import styles
6. **Feature Completeness** — half-implemented features, TODO density, commented-out code
7. **Performance** — unnecessary re-renders, unbatched API calls, N+1 queries, bundle bloat
8. **Documentation Gaps** �� uncommented complex logic, stale README

#### What it produces

`AUDIT.md` at the repo root, containing:

- Summary metrics (files audited, finding counts by severity)
- Critical, Significant, and Minor findings (file paths, line numbers, descriptions)
- Dead code inventory
- Commendations (things done well)
- Recommended remediation priority
- Per-file classification table

#### Classification system

| Level | Meaning |
|-------|---------|
| **CRITICAL** | Broken in production, data loss risk, security vulnerability |
| **SIGNIFICANT DEBT** | Works but fragile — will break under growth or change |
| **MINOR DEBT** | Suboptimal but functional — fix when convenient |
| **CLEAN** | No issues found |

#### When to use it

- After shipping a milestone, before starting the next
- Before a major refactor to understand what you are working with
- Periodic health checks on active projects

#### Key rules

- CRITICAL means broken or vulnerable. Architectural preferences are not critical findings.
- Every finding is verified by reading the file. No guessing from grep results.
- No false alarms. Uncertainty is stated as uncertainty, not classified as critical.
- Always finds at least 3 commendations. Credibility requires balance.

#### Dependency on previous steps

Uses `MANIFEST.md` as a map if it exists. Running `/invest-manifest` first produces a more thorough audit.

---

### Step 7: invest-remediate

**Command:** `/invest-remediate [path-to-audit-md]`

The planning step. Reads AUDIT.md and generates a phased remediation plan — a sequence of self-contained, agent-executable prompts ordered from lowest risk to highest risk.

#### What it does

- Parses every finding from AUDIT.md
- Groups findings into phases by risk level
- Generates a standalone prompt for each phase that an agent (or human) can execute without reading the original audit
- Adds cross-phase dependency notes, risk checkpoints, and bail points

#### Phase ordering (lowest risk first)

| Order | Phase Type | Risk Level |
|-------|-----------|------------|
| 1 | Delete dead code | Zero |
| 2 | Fix naming & consistency | Near-zero |
| 3 | Add error boundaries / handling | Low |
| 4 | Add validation / security fixes | Low-medium |
| 5 | Extract components / split monoliths | Medium |
| 6 | Performance fixes | Medium |
| 7 | Architecture changes | High |
| 8 | Feature completion | Variable |

#### What it produces

`REMEDIATION.md` at the repo root, containing:

- All phase prompts in sequence, each with: header, context, numbered tasks (file paths, line numbers, acceptance criteria), verification steps, rollback guidance
- Cross-phase notes: execution order, risk checkpoints, bail points
- "What This Plan Does NOT Cover" section

#### When to use it

- Immediately after `/invest-repo-audit` when you intend to fix the findings
- When you want to hand off fixes to other agents or developers
- When you want a structured plan before touching code

#### Key rules

- Every task references a specific file. No vague instructions.
- Preserves the audit's commendations — marks well-implemented code as "do NOT modify."
- Does not invent findings. Only generates tasks for things in AUDIT.md.
- Includes rollback guidance for medium and high risk phases.

---

### Step 8: invest-verify-remediation

**Command:** `/invest-verify-remediation [path-to-repo]`

The confirmation pass. After remediation phases have been executed, this skill verifies that findings were actually resolved without introducing new issues.

#### What it does

1. **Identifies what changed** — reads REMEDIATION.md, cross-references git history
2. **Verifies each finding** — reads modified files, confirms fixes match spec
3. **Checks for regressions** — build status, new lint errors, patterns the audit originally flagged
4. **Checks for orphaned artifacts** — unused imports, dangling references from deleted files
5. **Updates AUDIT.md** — adds resolution status to each finding, updates summary metrics
6. **Deletes REMEDIATION.md** — it has served its purpose; resolution status lives in AUDIT.md
7. **Patches MANIFEST.md** — spot-checks and updates for added/deleted/renamed files

#### Finding statuses

| Status | Meaning |
|--------|---------|
| **RESOLVED** | Fix confirmed, matches spec, no regressions |
| **DEFERRED** | Intentionally skipped, documented in remediation plan |
| **OPEN** | Was in a remediation phase but not addressed |

#### What it produces

- Conversation summary with counts (phases executed, files modified, findings resolved/deferred/open, regressions)
- Updated `AUDIT.md` with resolution status on every finding
- Updated `MANIFEST.md` (patched, not regenerated)
- `REMEDIATION.md` deleted

Ends with a verdict: **CLEAR TO RESUME BUILDING** or **ISSUES REMAIN** with details.

#### When to use it

- After completing some or all remediation phases
- Before resuming feature work on a repo that went through the audit chain

#### Key rules

- Does NOT re-audit the entire codebase. Only checks files that changed and findings that were targeted.
- Does NOT fix anything. Reports regressions without repairing them.
- Honest about partial completion. If only 4 of 6 phases ran, it says so.

---

## Running the Chains

### Doctrine chain (existing project, no doctrine)

```bash
/invest-backfill                # Generate doctrine from your codebase
# Review the generated files, fill in [OPERATOR: ...] sections
/invest-doctrine                # Validate the doctrine is sound
/invest-architecture            # Check code against doctrine
```

### Doctrine chain (greenfield project)

```bash
# Fill in VECTOR.md, CLAUDE.md, ARCHITECTURE.md manually
/invest-doctrine                # Validate
/invest-architecture            # Enforce
```

### Audit chain (full sequence)

```bash
/invest-preflight               # 2 min — orient yourself
/invest-manifest                # 10-30 min — inventory everything
/invest-repo-audit              # 15-45 min — assess quality
/invest-remediate               # 5-15 min — generate fix plan
# ... execute the remediation phases ...
/invest-verify-remediation      # 10-15 min — confirm fixes
```

### Partial runs

You do not always need every step:

| Situation | Run |
|-----------|-----|
| Quick orientation on a new repo | `/invest-preflight` only |
| Need to understand what exists | `/invest-preflight` then `/invest-manifest` |
| Quality check before a release | `/invest-preflight` then `/invest-repo-audit` |
| Full audit with remediation | All five audit chain steps |
| Re-verify after more fixes | `/invest-verify-remediation` again |
| New project, establish doctrine | `/invest-backfill` then `/invest-doctrine` |
| Check code follows your rules | `/invest-architecture` |

### Both chains together

```bash
# Establish doctrine first
/invest-backfill
/invest-doctrine
/invest-architecture

# Then audit the codebase
/invest-preflight
/invest-manifest
/invest-repo-audit
/invest-remediate
# ... execute phases ...
/invest-verify-remediation
```

---

## Files Created by the Chain

| File | Created by | Used by | Lifecycle |
|------|-----------|---------|-----------|
| `VECTOR.md` | `/invest-backfill` | `/invest-doctrine`, `/invest-architecture` | Persists — project doctrine |
| `CLAUDE.md` | `/invest-backfill` | `/invest-architecture` | Persists — contributor onboarding |
| `ARCHITECTURE.md` | `/invest-backfill` | `/invest-doctrine`, `/invest-architecture` | Persists — technical spec |
| `/vector/audits/` | `/invest-doctrine`, `/invest-architecture` | Operator reference | Overwritten on each run |
| `MANIFEST.md` | `/invest-manifest` | `/invest-repo-audit`, `/invest-verify-remediation` | Persists, updated by verify |
| `AUDIT.md` | `/invest-repo-audit` | `/invest-remediate`, `/invest-verify-remediation` | Persists, updated by verify |
| `REMEDIATION.md` | `/invest-remediate` | `/invest-verify-remediation` | Temporary — deleted after verification |

---

## Optional Skills

Research, design, fleet coordination, and release skills from v1.4 are available in `.claude/skills-optional/`. To activate any optional skill, copy its directory into `.claude/skills/`:

```bash
cp -r .claude/skills-optional/invest-changelog .claude/skills/
```

Available optional skills:

| Skill | Purpose |
|-------|---------|
| `invest-validate` | Prioritize unvalidated assumptions by risk |
| `invest-interview` | Generate structured user research discussion guides |
| `invest-synthesize` | Take raw research and propose doctrine patches |
| `invest-brief` | Generate design briefs from research and doctrine |
| `invest-adr` | Generate numbered Architecture Decision Records |
| `invest-crew` | Decompose features into scoped agent tasks |
| `invest-handoff` | Generate role-specific onboarding docs |
| `invest-changelog` | Write user-facing release notes from git log |

---

## Design Principles

**Separation of concerns.** Each skill does one thing. Backfill generates. Doctrine validates. Architecture enforces. Preflight scans. Manifest inventories. Audit judges. Remediate plans. Verify confirms. No skill crosses into another's domain.

**Read before judging.** No skill classifies, describes, or assesses a file it has not read. Grep results are verified by opening the file.

**Doctrine is the oath.** The doctrine chain establishes what you believe about your project. The audit chain assesses the reality. Both chains derive their rules from your declarations, not presets.

**Lowest risk first.** Remediation phases are ordered so that the safest changes happen first. If you bail out midway, you have done the easy wins and have not broken anything.

**Self-contained phases.** Each remediation phase prompt can be handed to an agent that has never seen the audit. It includes all context needed to execute.

**Credibility through balance.** Every audit includes commendations. Every remediation plan preserves things flagged as well-done. False alarms and inflated severity are treated as failures.

**Artifacts are temporary.** REMEDIATION.md is deleted after verification. The resolution status is folded back into AUDIT.md. One source of truth, not three.

---

## Adopting Investiture on an Existing Project

### Quick start

```bash
npx investiture init
```

Or without npm:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/erikaflowers/investiture/main/inject.sh)
```

This adds `.claude/skills/` (eight skills), `vector/schemas/` (six research schemas), and the `vector/` directory structure.

### Then

1. Open Claude Code in your project
2. Run `/invest-backfill` to generate doctrine from your codebase
3. Fill in the operator prompts (the parts only you know)
4. Run `/invest-doctrine` to validate
5. Run `/invest-architecture` to enforce
6. Run `/invest-preflight` to scan the codebase

### How skills work

Skills live in `.claude/skills/` and follow the Agent Skills open standard. They are automatically discovered by Claude Code. Each skill reads your project's doctrine files and audits your codebase against what you declared. The rules are yours. The skills enforce them.
