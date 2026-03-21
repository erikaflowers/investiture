---
name: invest-capture
description: "Post-session knowledge capture. Runs against git diff and doctrine to extract new assumptions, ADR candidates, doctrine drift, and research gaps from recent work. Turns vibe coding into structured Investiture output. Use after any coding session, pairing session, or spike to capture what was learned before it evaporates."
argument-hint: "[--since commit|tag|time|last-capture] [--scope path/] [--quick] [--dry-run]"
disable-model-invocation: true
---

# Investiture Skill: Knowledge Capture

You are closing the loop between doing and knowing. Every coding session produces knowledge — new assumptions about users, architecture decisions made implicitly, patterns that emerged, constraints discovered. Most of this knowledge evaporates because no one stops to capture it. This skill reads the diff from a recent work session, compares it against existing doctrine, and extracts structured insights that feed back into the Investiture system.

**This is the hook.** Investiture's value proposition for vibe coders is: "You code the way you want to, and we capture what you learned." This skill is the mechanism. It runs after the session, not during it. Zero friction while working, full capture after.

## Step 0: Determine Scope

- **`--since [commit|tag|time]`:** Capture changes since the specified reference point. Accepts a commit hash, tag name, or relative time (e.g., `yesterday`, `2h`, `3d`). Default: changes since the last commit on the current branch vs. the branch's base (e.g., `main..HEAD`).
- **`--since last-capture`:** Automatically find the most recent capture file in `/vector/captures/`, extract the git range or date from its metadata, and use that as the reference point. If no previous capture exists, fall back to branch base. This makes "capture everything since I last captured" a single command.
- **`--scope [path/]`:** Limit capture to changes within a specific directory.
- **`--quick`:** Lightweight mode — only runs Category 1 (New Assumptions) and Category 3 (Doctrine Drift). Skips ADR candidates, research gaps, and patterns. Use after short sessions where a full capture is overkill.
- **`--dry-run`:** Generate and display without writing any files.

## Step 1: Read the Diff

Get the changes that happened during the session:

1. **If `--since last-capture` was provided:** Read `/vector/captures/` directory. Sort capture files by date in filename (format: `capture-YYYY-MM-DD.md`). Read the most recent capture's metadata header to extract the git range (the `**Session:**` field). Use that range's endpoint as the new `--since` reference. If no captures exist, report: "No previous captures found. Falling back to branch base." and proceed as if no `--since` was given.

2. **If `--since [reference]` was provided:** Run `git diff [reference]..HEAD` and `git log --oneline [reference]..HEAD`.

3. **If no `--since`:** Detect the branch base and diff against it. If on `main`, diff the last commit (`HEAD~1..HEAD`). If on a feature branch, diff against the branch point (`main..HEAD` or equivalent).

4. **If `--scope` was provided:** Filter the diff to only include files within the specified path.

Also read `git log --oneline` for the relevant range to understand commit messages and intent.

### Uncommitted Changes

After collecting the committed diff, also check for work-in-progress:

- Run `git diff` for unstaged changes.
- Run `git diff --cached` for staged but uncommitted changes.

If uncommitted changes exist, include them in the analysis. Add a note to the capture report header: `**Uncommitted changes:** [N] files with unstaged changes, [N] files staged but not committed.`

Uncommitted changes often contain the freshest knowledge — decisions made minutes ago that haven't been committed yet. Including them ensures nothing is lost between the coding session and the capture.

If there are no changes anywhere (clean working tree, no new commits), report: "No changes found since [reference]. Nothing to capture." Stop.

## Step 2: Read Current Doctrine

Read the existing doctrine to compare against:

1. **`VECTOR.md`** — Current assumptions, constraints, design principles, target audience, project stage.
2. **`ARCHITECTURE.md`** — Current stack, layers, conventions, import rules, prohibitions.
3. **`CLAUDE.md`** — Current agent context, key context bullets, prohibitions.
4. **`/vector/research/assumptions/`** — Existing assumption files, to avoid duplicating known assumptions.
5. **`/vector/decisions/`** — Existing ADRs, to detect decisions that were made implicitly in code but not recorded.

## Step 3: Analyze the Diff

Read through the changes and extract insights. In `--quick` mode, run only Categories 1 and 3. In full mode, run all five.

### Category 1: New Assumptions

Look for code that embeds beliefs about users, behavior, or context that are not yet documented as assumptions.

**Signals:**
- Default values that assume user behavior (e.g., `pageSize = 20` assumes users browse in pages of 20)
- Conditional logic that assumes a user state (e.g., `if (user.plan === 'pro')` assumes a plan hierarchy)
- Error messages that assume what the user was trying to do
- Data models that assume relationships between entities
- Feature flags or config values that assume deployment context

For each new assumption found:
- State the assumption in plain language
- Reference the file and line where it's embedded
- Assess confidence: is this grounded in research, or is it a guess baked into code?
- Note whether it exists in `/vector/research/assumptions/` already

### Category 2: ADR Candidates

*Skipped in `--quick` mode.*

Look for architectural or product decisions that were made implicitly — through code, not through an explicit decision record.

**Signals:**
- New dependencies added (a package was chosen — why that one?)
- New patterns introduced (a new way of doing something that differs from existing patterns)
- Significant refactoring (the old approach was replaced — what was wrong with it?)
- New files in unexpected locations (does this match ARCHITECTURE.md's layer structure?)
- New API endpoints or data models (these are structural decisions)

For each ADR candidate:
- State the decision that was made
- Reference the file(s) where it's visible
- Note whether an ADR already exists for this decision
- Suggest whether this needs a formal ADR or is minor enough to skip

### Category 3: Doctrine Drift

Look for changes that contradict or extend what's declared in VECTOR.md, ARCHITECTURE.md, or CLAUDE.md.

**Signals:**
- Code in a layer that ARCHITECTURE.md doesn't define
- Import patterns that violate declared import direction
- New technologies not listed in the stack declaration
- Features that serve a user not described in any persona
- Behavior that contradicts a VECTOR.md constraint

For each drift instance:
- State what the doctrine says
- State what the code now does
- Assess: is the doctrine out of date, or is the code wrong?
- Recommend: update doctrine, or fix code?

### Category 4: Research Gaps

*Skipped in `--quick` mode.*

Look for places where the code reveals that the team doesn't know something it should.

**Signals:**
- TODO comments about user behavior ("TODO: figure out if users actually want this")
- Placeholder logic awaiting data ("// using dummy data until we know the real format")
- Feature toggles with no clear activation criteria
- Multiple approaches tried and abandoned (visible in diff as added-then-removed code)
- Error handling that catches everything generically (suggests unknown failure modes)

For each research gap:
- State the question the code reveals
- Reference where it's visible
- Suggest what kind of research would answer it (interview, analytics, usability test, spike)

### Category 5: Patterns Worth Documenting

*Skipped in `--quick` mode.*

Look for positive patterns that emerged — things the team did well that should be captured for consistency.

**Signals:**
- Clean abstractions that other parts of the codebase could reuse
- Error handling patterns that are thorough and consistent
- Testing patterns that provide good coverage
- Naming conventions that clarify intent

For each pattern:
- Describe the pattern
- Reference where it appears
- Suggest where it should be documented (ARCHITECTURE.md conventions, CLAUDE.md key context)

## Step 4: Produce the Capture Report

```markdown
# Knowledge Capture

**Session:** [git range — e.g., "main..HEAD (5 commits)"]
**Generated:** [today's date]
**Scope:** [full project or scoped path]
**Mode:** [full / quick]
**Files changed:** [N]
**Commits:** [N]
**Uncommitted changes:** [N files unstaged, N files staged — or "none"]
**Previous capture:** [filename of last capture, or "none — first capture"]
**Changes since previous:** [N new commits, N files changed — or "N/A"]

---

## New Assumptions Found

[For each assumption:]

### ASSUMPTION: [Plain language statement]
- **Source:** `[file:line]`
- **Confidence:** [Low / Medium / High — based on whether evidence exists]
- **Already documented:** [Yes (ID) / No]
- **Action:** [Add to /vector/research/assumptions/ / Already tracked / Skip — trivial]

---

## ADR Candidates

[Omit this section in `--quick` mode.]

[For each decision:]

### DECISION: [What was decided]
- **Source:** `[file(s)]`
- **Existing ADR:** [Yes (ADR-NNN) / No]
- **Significance:** [High — structural / Medium — notable / Low — minor]
- **Action:** [Run /invest-adr / Document informally / Skip]

---

## Doctrine Drift

[For each drift instance:]

### DRIFT: [What diverged]
- **Doctrine says:** [quote from VECTOR.md / ARCHITECTURE.md]
- **Code does:** [what actually happened]
- **Source:** `[file:line]`
- **Assessment:** [Doctrine is stale — update it / Code is wrong — fix it / Intentional divergence — needs ADR]

---

## Research Gaps

[Omit this section in `--quick` mode.]

[For each gap:]

### GAP: [What we don't know]
- **Source:** `[file:line]` — [the signal that revealed the gap]
- **Suggested research:** [method — interview, analytics, spike, etc.]
- **Blocks:** [what decision or feature this gap affects]

---

## Patterns Worth Documenting

[Omit this section in `--quick` mode.]

[For each pattern:]

### PATTERN: [Description]
- **Source:** `[file(s)]`
- **Document in:** [ARCHITECTURE.md / CLAUDE.md / New convention]

---

## Capture Summary

| Category | Found | Actionable |
|----------|-------|-----------|
| New assumptions | [N] | [N need documenting] |
| ADR candidates | [N or "—" if quick] | [N need formal ADRs or "—"] |
| Doctrine drift | [N] | [N need resolution] |
| Research gaps | [N or "—" if quick] | [N need investigation or "—"] |
| Patterns | [N or "—" if quick] | [N worth documenting or "—"] |

**Total actionable items:** [N]
```

## Step 5: Offer Follow-Up Actions

After presenting the report, offer to take immediate action:

```
Capture complete. [N] actionable items found.

I can take the following actions now:
1. Create assumption files for [N] new assumptions → /vector/research/assumptions/
2. Draft ADRs for [N] decisions → /vector/decisions/
3. Update doctrine files to resolve [N] drift items

Which actions should I take? (all / 1,2,3 / none)
```

In `--quick` mode, only offer actions 1 and 3 (assumptions and drift). ADRs are not captured in quick mode.

If the operator selects actions:

**Assumptions:** Create individual assumption files in `/vector/research/assumptions/` using this format:

```markdown
# ASSUMPTION: [plain language statement]

**ID:** A-[NNN]
**Status:** unvalidated
**Confidence:** [Low / Medium / High]
**Source:** `[file:line]` — discovered via invest-capture on [date]
**Impact if wrong:** [what changes — scope, effort, feasibility]
**Validation method:** [suggested approach — interview, analytics, spike, usability test]
```

- **ID:** Auto-increment by reading existing assumption files in `/vector/research/assumptions/`. Find the highest `A-NNN` number and increment. If no assumptions exist, start at `A-001`.
- **Filename:** `A-[NNN]-[slug].md` where slug is 2-4 words from the assumption statement, lowercase, hyphenated.
- This format is consumed by `/invest-validate` (for prioritization) and `/invest-synthesize` (for doctrine updates).

**ADRs:** Run the equivalent of `/invest-adr` for each candidate — either invoke the skill directly or produce the ADR inline.

**Doctrine updates:** Show the proposed changes to VECTOR.md or ARCHITECTURE.md as diffs before applying.

If `--dry-run` was passed, show the report only. Do not offer actions.

## Step 6: Output

**Print the full capture report to the terminal AND save it to `/vector/captures/capture-[date].md`.**

Use today's date in YYYY-MM-DD format. If multiple captures happen on the same day, append a sequence number: `capture-[date]-2.md`.

Create `/vector/captures/` if it does not exist.

After writing, output:

```
Capture written to /vector/captures/capture-[date].md

[N] assumptions, [N] ADR candidates, [N] drift items, [N] research gaps, [N] patterns.

Run /invest-validate to prioritize the new assumptions.
Run /invest-doctrine to check full doctrine health after updates.
Run /invest-prd --from-capture to turn research gaps into PRD candidates.
```

## Arguments

- **No arguments:** Capture from branch base to HEAD, full mode
- **`--since [commit|tag|time]`:** Capture from a specific reference point
- **`--since last-capture`:** Capture from where the previous capture left off
- **`--scope [path/]`:** Limit to changes within a directory
- **`--quick`:** Lightweight capture — assumptions and doctrine drift only
- **`--dry-run`:** Generate and display without writing or offering actions

## Output

`/vector/captures/capture-[date].md`

## When to Run

- **After every coding session.** This is the intended cadence. Code for an hour, capture for two minutes. Use `--since last-capture` to pick up exactly where the last capture left off.
- **Quick capture after a short session.** Use `--quick` when you only coded for 20 minutes and a full capture is overkill. Assumptions and drift are still caught.
- After a pairing session — two people made decisions, capture them before they diverge on what was decided
- After a spike or prototype — the spike produced knowledge, not just code
- After merging a large PR — what assumptions and decisions just entered the codebase?
- Before a sprint retro — capture feeds into retrospective analysis
- Before `/invest-prd --from-capture` — captures provide the raw material for PRD candidate generation

## Principles

- **Zero friction during, full capture after.** This skill never interrupts the coding session. It runs after. The developer should not think about documentation while coding — they should think about the problem. Capture happens when the work is done.
- **The diff is the source of truth.** The capture is grounded in what actually changed, not what someone remembers changing. Git doesn't forget, people do.
- **Not everything is actionable.** Some findings are informational. The skill distinguishes between "this needs a formal ADR" and "this is a minor pattern to note." Do not overwhelm the operator with action items for trivial findings.
- **Doctrine drift is not always bad.** Sometimes the code is right and the doctrine is stale. The skill's job is to surface the divergence, not to judge it. The operator decides whether to update doctrine or fix code.
- **Captures are a chain, not a pile.** Each capture references the previous one and tracks what changed between them. Over time, the chain tells the story of the project's evolution — what was learned, what shifted, what compounded. A single capture is a snapshot. The chain is the narrative.
- **This skill compounds.** The first capture is thin because doctrine is sparse. After ten captures, the assumption file is rich, the ADR library is growing, and doctrine drift is caught early instead of discovered during a crisis. The value is in the habit, not any single run.
