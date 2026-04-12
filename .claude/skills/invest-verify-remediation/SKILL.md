---
name: invest-verify-remediation
description: After a remediation plan has been executed, verify that findings were resolved without introducing new issues. Updates AUDIT.md with resolution status, cleans up REMEDIATION.md, and confirms the codebase is ready to resume building.
version: 1.0.0
created: 2026-03-21
updated: 2026-03-21
author: Qin
disable-model-invocation: true
allowed-tools: Glob, Grep, Read, Bash, Agent, Write
argument-hint: [path-to-repo]
---

# Verify Remediation

You are verifying that a remediation plan was executed correctly. You are not re-auditing the entire codebase — you are checking the specific files that were changed, confirming findings are resolved, and flagging anything new that was introduced.

This is a focused re-scan, not a full audit. Speed matters. 10-15 minutes, not an hour.

## Target

The codebase at `$ARGUMENTS`. If no argument is provided, use the current working directory.

## Prerequisites

- `AUDIT.md` must exist in the repo root (from a prior `/invest-repo-audit`)
- `REMEDIATION.md` must exist in the repo root (from a prior `/invest-remediate`)
- The remediation phases must have been executed (commits exist)

## Process

### 1. Identify what changed

Read REMEDIATION.md to understand what phases were planned. Then check git history to see what was actually done:

```bash
# Find commits since the remediation plan was created
git log --oneline --since="$(git log --format='%ai' -- REMEDIATION.md | head -1)" -- . ':!MANIFEST.md' ':!AUDIT.md' ':!REMEDIATION.md'
```

Build a list of every file that was modified, created, or deleted as part of remediation.

### 2. Verify each finding

Read AUDIT.md. For every finding (Critical, Significant, Minor):

**If the finding was addressed by a remediation phase:**
- Read the modified file(s)
- Confirm the fix matches what REMEDIATION.md specified
- Check that the fix doesn't introduce new issues (e.g., an extracted component missing an import, a split file with broken references)
- Mark as `RESOLVED`

**If the finding was explicitly deferred in REMEDIATION.md ("What This Plan Does NOT Cover"):**
- Confirm it is still present (not accidentally fixed or worsened)
- Mark as `DEFERRED` with brief reason from REMEDIATION.md

**If the finding was in a remediation phase but NOT addressed:**
- Confirm it is still present
- Mark as `OPEN`

### 3. Check for regressions

For every file that was modified during remediation:
- Does it still build? (Run `npm run build` or equivalent)
- Are there new lint errors?
- Are there new files over 500 lines?
- Are there new functions over 80 lines?
- Did the fix introduce any patterns the original audit flagged as problems? (e.g., fixing one god file by creating another)

### 4. Check for orphaned artifacts

- Are there any new unused imports?
- If files were split (e.g., tool-registry), do all consumers import from the new locations?
- If files were deleted, are there any dangling references?

### 5. Update AUDIT.md

Rewrite AUDIT.md in place with resolution status. Keep the exact same structure but add status to each finding:

**For resolved findings, update the heading:**
```markdown
### C1. tool-registry.mjs — 1065-Line God File — RESOLVED
```
Add a resolution note at the end of the finding:
```markdown
**Resolution:** Split into 7 files in `netlify/functions/lib/tools/`. Aggregator at `tools/index.mjs` maintains same export API. Commit: [hash]. Verified: imports updated, build passes, tool execution confirmed.
```

**For deferred findings:**
```markdown
### S9. useAuth.jsx — Token Refresh Race Condition — DEFERRED
```
Add:
```markdown
**Status:** Deferred — requires auth flow redesign, scoped as separate initiative.
```

**For open findings (should have been fixed but weren't):**
```markdown
### S6. Stale Stream Auto-Resolution Race Condition — OPEN
```
Add:
```markdown
**Status:** Open — not addressed in remediation. Original finding still applies.
```

**Update the Summary Metrics table** to include resolution counts:

```markdown
| Metric | Count |
|--------|-------|
| Files audited | 137 |
| Critical findings | 3 (X resolved, Y deferred, Z open) |
| Significant findings | 10 (X resolved, Y deferred, Z open) |
| Minor findings | 8 (X resolved, Y deferred, Z open) |
```

**Update the overall classification** if warranted. If all critical findings are resolved and most significant findings are resolved, the classification may improve (e.g., SIGNIFICANT DEBT → MINOR DEBT).

### 6. Clean up REMEDIATION.md

Delete REMEDIATION.md from the repo. It has served its purpose. The resolution status now lives in AUDIT.md. Keeping both creates confusion about what's current.

### 7. Verify MANIFEST.md accuracy

Spot-check MANIFEST.md against the changes:
- If files were added, are they in the manifest?
- If files were deleted, are they removed from the manifest?
- If files were renamed or split, is the manifest updated?

If MANIFEST.md is stale, update it to reflect the current state. Do NOT re-run a full manifest — just patch the sections that changed.

## Output Format

Output directly to the conversation (do NOT write a separate report file):

```
VERIFICATION COMPLETE
═══════════════════════════════════════════════════════════════

Remediation phases executed: [N of M]
Files modified: [count]
Files created: [count]
Files deleted: [count]

Findings resolved: [count]
Findings deferred: [count]
Findings still open: [count]

Regressions detected: [count, or "None"]
New issues introduced: [count, or "None"]

Classification change: [OLD] → [NEW] (or "No change")

AUDIT.md: Updated with resolution status
REMEDIATION.md: Deleted
MANIFEST.md: [Updated / Already current / Needs manual update]

Build status: [passes / fails — details if fails]

Verdict: [CLEAR TO RESUME BUILDING | ISSUES REMAIN — details]
═══════════════════════════════════════════════════════════════
```

## Commit

After updating AUDIT.md and deleting REMEDIATION.md:

```
docs: verify remediation — [N] findings resolved, classification [OLD] → [NEW]
```

## Rules

- **Do NOT re-audit the entire codebase.** Only check files that changed and findings that were targeted.
- **Do NOT fix anything.** If you find a regression or new issue, report it. Do not repair it. Your job is to verify, not to build.
- **Be honest about partial completion.** If only 4 of 6 phases were executed, report that clearly. Do not mark unexecuted phases as resolved.
- **Trust the build.** If `npm run build` passes and the modified files look correct, that's sufficient. Do not invent hypothetical failure scenarios.
- **Keep the updated AUDIT.md concise.** Add resolution notes, don't rewrite findings. The original finding text stays — you're adding status, not replacing content.
