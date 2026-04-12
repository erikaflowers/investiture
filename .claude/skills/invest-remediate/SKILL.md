---
name: invest-remediate
description: Read an AUDIT.md and generate a phased remediation plan — a sequence of self-contained, agent-executable prompts ordered from lowest-risk to highest-risk. Each phase is scoped to be completable in one session.
version: 1.0.0
created: 2026-03-21
updated: 2026-03-21
author: Qin
disable-model-invocation: true
allowed-tools: Glob, Grep, Read, Write
argument-hint: [path-to-audit-md]
---

# Remediation Plan Generator

You read an audit report and produce a phased remediation plan. Each phase is a self-contained prompt that an agent (or human) can execute independently, in order, without needing to understand the whole audit.

## Target

Read the audit at `$ARGUMENTS`. If no argument is provided, look for `AUDIT.md` in the current working directory.

## Process

### 1. Parse the audit

Read AUDIT.md and extract:
- Every finding (critical, significant, minor)
- Every dead code entry
- Every recommended remediation priority
- The per-file classification table

### 2. Group findings into phases

Group findings into phases using these rules:

**Phase ordering principle: lowest risk first, highest risk last.**

Each phase should be:
- Completable in one agent session (roughly 30-60 minutes of agent work)
- Independent — completing phase N should not break anything that phase N+1 needs to find
- Testable — there should be a way to verify the phase was done correctly

**Standard phase order:**

| Order | Category | Risk | Why this order |
|-------|----------|------|----------------|
| 1 | **Delete dead code** | Zero | Removing unused files can't break anything. Reduces noise for subsequent phases. |
| 2 | **Fix naming & consistency** | Near-zero | Renames and convention fixes. No behavior change. |
| 3 | **Add error boundaries / error handling** | Low | Additive — wrapping existing code in safety nets doesn't change behavior. |
| 4 | **Add missing validation / security fixes** | Low-medium | Tightening inputs. May surface bugs that were hidden by lax validation. |
| 5 | **Extract components / split monoliths** | Medium | Structural refactoring. Same behavior, different organization. Tests should pass before and after. |
| 6 | **Performance fixes** | Medium | Memoization, lazy loading, pagination. Behavior should be identical but faster. |
| 7 | **Architecture changes** | High | Redesigning data flow, splitting god files, changing state management patterns. Highest risk of regression. |
| 8 | **Feature completion** | Variable | Finishing half-implemented features or removing stubs. Scope depends on the feature. |

Not every audit will produce all 8 phase types. Skip phases that have no findings. Merge phases that are too small to justify a standalone session (e.g., if there's only one naming fix, fold it into dead code cleanup).

### 3. For each phase, generate a prompt

Each phase prompt must be self-contained. An agent receiving this prompt should be able to execute it without reading the original audit. The prompt must include:

**Header:**
```
## Phase [N]: [Title]
Risk: [zero | low | medium | high]
Estimated scope: [file count] files, [description of change type]
Prerequisite: [Phase N-1 completed, or "None"]
```

**Context:** 1-2 sentences explaining WHY this phase exists. What problem does it solve?

**Tasks:** Numbered list of specific changes. Each task must include:
- The exact file path
- What to do (delete, rename, extract, wrap, add, modify)
- Line numbers or function names where applicable
- What the result should look like (acceptance criteria)
- What NOT to change (scope boundaries)

**Verification:** How to confirm the phase is complete:
- Build still passes
- Tests still pass (if tests exist)
- Specific behavior unchanged
- Specific files deleted / created / modified

**Example phase prompt:**

```markdown
## Phase 1: Dead Code Cleanup
Risk: Zero
Estimated scope: 4 files, deletions only
Prerequisite: None

Remove files identified as unused in the audit. These files are not imported
by any other file and have been superseded by newer implementations.

### Tasks

1. **Delete** `src/components/KnowledgePanel.jsx` (140 lines)
   - Superseded by `src/pages/KnowledgePage.jsx`
   - Verify: grep the codebase for "KnowledgePanel" — should return 0 results after deletion

2. **Delete** `src/components/MemoryPanel.jsx` (155 lines)
   - Superseded by `src/pages/MemoriesPage.jsx`
   - Verify: grep for "MemoryPanel" — 0 results

3. **Delete** `src/labrador.css` (7348 lines)
   - Pre-refactor monolith. CSS was split into `src/css/*.css` files.
   - NOT imported by any file (verified: no import statements reference it)
   - Verify: `npm run build` still succeeds

4. **Delete** `.github/ISSUE_TEMPLATE/bug_report.md` and `.github/ISSUE_TEMPLATE/feature_request.md`
   - Superseded by `bug.yml` and `feature.yml` YAML form templates
   - Verify: remaining templates (`bug.yml`, `feature.yml`, `enhancement.yml`, `custom.md`, `config.yml`) still exist

### Verification
- [ ] `npm run build` passes (or equivalent build command)
- [ ] No new lint errors introduced
- [ ] Grep for deleted filenames returns 0 matches across codebase
- [ ] Net lines removed: ~7700
```

### 4. Write cross-phase notes

After all phases, include a section on:
- **Dependencies between phases** — which phases must be done in order, which can be parallelized
- **Risk escalation** — at what phase should the operator pause and verify before continuing
- **Bail points** — phases where it's acceptable to stop and ship what's done so far

## Output Format — REMEDIATION.md

Write the file at the same location as the audit (repo root by default).

```markdown
# Remediation Plan

**Source:** AUDIT.md
**Generated:** [timestamp]
**Overall classification from audit:** [level]
**Total phases:** [N]
**Estimated total scope:** [file count] files across [phase count] phases

---

## Phase 1: [Title]
[full prompt as described above]

---

## Phase 2: [Title]
[full prompt]

---

[...continue for all phases...]

---

## Cross-Phase Notes

### Execution Order
[which phases are sequential vs parallelizable]

### Risk Checkpoints
[where the operator should pause and verify before continuing]

### Bail Points
[phases where it's safe to stop and ship partial remediation]

### What This Plan Does NOT Cover
[anything from the audit that was intentionally excluded — e.g., feature requests,
architectural opinions, or findings the auditor flagged as uncertain]
```

## Rules

- **Every task must reference a specific file.** No vague instructions like "improve error handling across the codebase." Instead: "Add try-catch to `conversations.mjs` handler body (lines 4-57) matching the pattern in `cartridges.mjs` (lines 70-75)."
- **Preserve the audit's commendations.** If the audit says something is done well, the remediation plan should include a note: "Do NOT modify [thing] — it was flagged as well-implemented."
- **Don't invent findings.** Only generate tasks for findings that appear in the audit. Do not add your own observations. If you notice something new while reading the audit, note it in "What This Plan Does NOT Cover."
- **Size phases for one session.** A phase with 20 file changes is too large. Split it. A phase with 1 trivial change is too small. Merge it with an adjacent phase of similar risk level.
- **Include rollback guidance.** For medium and high risk phases, note what to check if something breaks and how to revert (e.g., "If the build breaks after extracting ToolRegistry, revert the commit and check import paths").

## Commit

When complete, save REMEDIATION.md and commit:

```
docs: phased remediation plan from audit
```
