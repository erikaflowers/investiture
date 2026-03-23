---
name: invest-benchmark
description: "Scores the project's Investiture adoption and process maturity across seven dimensions. Produces a maturity scorecard with specific next actions to improve. Use during sales calls to demonstrate value on a prospect's codebase, monthly on active engagements to show progress, or when evaluating how well Investiture has been adopted."
argument-hint: "[--dimension doctrine|research|architecture|decisions|risk|delivery|capture] [--dry-run]"
disable-model-invocation: true
---

# Investiture Skill: Process Maturity Benchmark

You are measuring the methodology itself. Investiture is a system — its value compounds when all parts are used, and it underdelivers when adopted partially. This skill assesses how fully and how well a project has adopted Investiture, scores it across seven dimensions, and produces a concrete roadmap for improvement. For prospects, it shows exactly where they are and what they're missing. For active engagements, it shows measurable progress over time.

**This skill reads everything.** It assesses the presence, completeness, and quality of all Investiture artifacts. It is the "methodology about the methodology."

## Step 0: Determine Scope

- **No arguments:** Full benchmark across all seven dimensions.
- **`--dimension [name]`:** Score only one dimension in detail.
- **`--dry-run`:** Generate and display without writing.

## Step 1: Read Everything

Read every Investiture artifact that exists. For each, note: does it exist? When was it last updated? Is it complete or a template with placeholders?

**Core doctrine:**
- `VECTOR.md` — Exists? Complete (filled sections vs. template brackets)? Last modified?
- `CLAUDE.md` — Exists? Complete? Last modified?
- `ARCHITECTURE.md` — Exists? Complete? Last modified?

**Research artifacts (`/vector/research/`):**
- `/vector/research/personas/` — Any files? How many? Complete or stubs?
- `/vector/research/jtbd/` — Any files?
- `/vector/research/assumptions/` — Any files? What percentage are validated vs. unvalidated?
- `/vector/research/interviews/` — Any interview guides or notes?

**Decisions (`/vector/decisions/`):**
- Any ADRs? How many? What statuses? Any superseded?

**Audits (`/vector/audits/`):**
- Any audit files? Which skills generated them? How recent?

**Missions (`/vector/missions/`):**
- Any mission manifests? Complete or in progress?

**Risk register (`/vector/risk-register.md`):**
- Exists? How many risks tracked? Trend data?

**Reports (`/vector/reports/`):**
- Any status reports? How frequent?

**Compliance (`/vector/compliance/`):**
- Any compliance mappings? Which frameworks?

**Metrics (`/vector/metrics-framework.md`):**
- Exists? Complete?

**Briefs and handoffs:**
- `/vector/briefs/` — Any design briefs?
- `/vector/handoffs/` — Any handoff documents?

**Changelogs:**
- `CHANGELOG.md` — Exists? Up to date?

**Git health:**
- Recent commit frequency (last 30 days)
- Conventional commit usage (do commits follow a pattern?)
- Branch hygiene (how many stale branches?)

## Step 2: Score Each Dimension

Score each dimension on a 1-5 scale:

### 1. Doctrine Health
*Are the foundational files present, complete, and consistent?*

| Score | Criteria |
|-------|----------|
| 1 — Ad Hoc | No doctrine files, or all template placeholders |
| 2 — Emerging | VECTOR.md exists with some content; other files missing or mostly template |
| 3 — Defined | All three files exist with substantive content; minor gaps |
| 4 — Managed | All files complete, internally consistent, recently updated |
| 5 — Optimizing | All files complete, audited by invest-doctrine with clean result, cross-referenced |

### 2. Research Depth
*How well does the project understand its users and validate its assumptions?*

| Score | Criteria |
|-------|----------|
| 1 — Ad Hoc | No research artifacts |
| 2 — Emerging | Some personas or assumptions exist, mostly unvalidated |
| 3 — Defined | Personas, JTBD, and assumptions documented; < 30% validated |
| 4 — Managed | Research artifacts complete; 30-70% of assumptions validated; interview guides exist |
| 5 — Optimizing | > 70% validated; synthesis has updated doctrine; validation is ongoing |

### 3. Architecture Compliance
*Does the code match what the doctrine declares?*

| Score | Criteria |
|-------|----------|
| 1 — Ad Hoc | No ARCHITECTURE.md, or never audited |
| 2 — Emerging | ARCHITECTURE.md exists; never audited or last audit had critical violations |
| 3 — Defined | Audited; high violations resolved, medium violations documented |
| 4 — Managed | Most recent audit clean or near-clean; violations tracked and trending down |
| 5 — Optimizing | Clean audit; dependency audit also clean; architecture actively maintained |

### 4. Decision Documentation
*Are architectural and product decisions recorded and referenced?*

| Score | Criteria |
|-------|----------|
| 1 — Ad Hoc | No ADRs |
| 2 — Emerging | 1-3 ADRs, may be inconsistent in format |
| 3 — Defined | 4+ ADRs covering major decisions; consistent format |
| 4 — Managed | ADRs cross-reference each other; superseded decisions are marked |
| 5 — Optimizing | ADRs referenced in commits and PRs; traceability to requirements exists |

### 5. Risk Management
*Are project risks identified, tracked, and managed?*

| Score | Criteria |
|-------|----------|
| 1 — Ad Hoc | No risk tracking |
| 2 — Emerging | Risks mentioned informally in docs but no register |
| 3 — Defined | Risk register exists with categorized risks |
| 4 — Managed | Risk register updated regularly; burn-down trend visible |
| 5 — Optimizing | Risks feed into sprint planning; compliance mapping exists; mitigation is tracked |

### 6. Delivery Cadence
*Is the team shipping regularly with visible, documented progress?*

| Score | Criteria |
|-------|----------|
| 1 — Ad Hoc | Infrequent commits, no changelog, no status reports |
| 2 — Emerging | Regular commits but no structured reporting |
| 3 — Defined | Regular commits + changelog maintained |
| 4 — Managed | Commits + changelog + status reports + mission manifests |
| 5 — Optimizing | All of above + retros run + metrics tracked + visible GitHub activity |

### 7. Knowledge Capture
*Is the project capturing what it learns and making it reusable?*

| Score | Criteria |
|-------|----------|
| 1 — Ad Hoc | No synthesis, no capture artifacts |
| 2 — Emerging | Some notes exist but not structured |
| 3 — Defined | Synthesis has been run; doctrine updated from research at least once |
| 4 — Managed | Regular capture loop; handoff documents exist; briefs generated |
| 5 — Optimizing | Capture is habitual; every sprint produces updated doctrine; knowledge is transferable |

## Step 3: Determine Overall Maturity Level

Average the seven dimension scores and map to a level:

| Average | Level | Description |
|---------|-------|-------------|
| 1.0-1.9 | **Ad Hoc** | Investiture is not meaningfully adopted. Work happens but is not structured. |
| 2.0-2.5 | **Emerging** | Basic doctrine exists. The foundation is laid but not built on. |
| 2.6-3.5 | **Defined** | Core practices are in place. The methodology is visible in daily work. |
| 3.6-4.5 | **Managed** | Practices are consistent, audited, and improving. Suitable for client-facing engagements. |
| 4.6-5.0 | **Optimizing** | Full adoption. The methodology is self-reinforcing and produces compounding value. |

## Step 4: Generate Next Actions

For each dimension scoring below 4, identify the single most impactful action to raise the score by one level. Be specific — name the Investiture skill to run, the file to create, or the practice to adopt.

## Step 5: Produce the Scorecard

```markdown
# Process Maturity Benchmark

**Generated:** [today's date]
**Project:** [from VECTOR.md or directory name]

## Overall Maturity: [Level] ([average score]/5.0)

## Dimension Scores

| Dimension | Score | Level | Trend |
|-----------|-------|-------|-------|
| Doctrine Health | [N]/5 | [level] | [↑ improving / → stable / ↓ declining / — first run] |
| Research Depth | [N]/5 | [level] | [trend] |
| Architecture Compliance | [N]/5 | [level] | [trend] |
| Decision Documentation | [N]/5 | [level] | [trend] |
| Risk Management | [N]/5 | [level] | [trend] |
| Delivery Cadence | [N]/5 | [level] | [trend] |
| Knowledge Capture | [N]/5 | [level] | [trend] |

## Dimension Details

### Doctrine Health: [N]/5

**Evidence:**
- VECTOR.md: [exists/missing] — [complete/partial/template] — last modified [date]
- CLAUDE.md: [exists/missing] — [complete/partial/template] — last modified [date]
- ARCHITECTURE.md: [exists/missing] — [complete/partial/template] — last modified [date]
- Last doctrine audit: [date and result, or "never"]

**To reach next level:** [specific action]

### Research Depth: [N]/5

[Same structure — evidence + action]

[Repeat for all 7 dimensions]

## Improvement Roadmap

[Prioritized list of actions to raise overall maturity, ordered by impact:]

1. **[Action]** — Raises [dimension] from [N] to [N]. Run: `[skill command]`
2. **[Action]** — Raises [dimension] from [N] to [N]. Run: `[skill command]`
3. **[Action]** — Raises [dimension] from [N] to [N].

**Projected maturity after completing top 3:** [level] ([projected average]/5.0)

## Comparison to Investiture Baseline

[What a well-adopted project looks like at each level — gives the reader a target to aim for.]

- **Emerging (2.0):** Doctrine files exist with real content. Some research done. Code roughly matches declared architecture.
- **Defined (3.0):** All doctrine complete. Research ongoing. Audits run periodically. ADRs capture major decisions. Changelog maintained.
- **Managed (4.0):** Audits clean. Risk register active. Status reports generated from data. Assumptions mostly validated. Visible delivery cadence.
- **Optimizing (5.0):** Full skill chain in use. Capture loop running every sprint. Metrics tracked. Compliance mapped. Traceability verified. The methodology produces artifacts that sell the next engagement.

---

*Benchmark based on artifact presence, completeness, and recency. Scores reflect methodology adoption depth, not code quality.*
```

## Step 6: Output

**Print the full scorecard to the terminal AND save it to `/vector/audits/invest-benchmark.md`.**

Overwrite on each run. Create `/vector/audits/` if it does not exist.

**If `--dry-run` was passed:** Print to terminal only.

After writing, output:

```
Benchmark written to /vector/audits/invest-benchmark.md

Overall maturity: [Level] ([average]/5.0)
Strongest: [dimension] ([score])
Weakest: [dimension] ([score])
Top action: [one-line recommendation]
```

## Arguments

- **No arguments:** Full benchmark across all seven dimensions
- **`--dimension [name]`:** Deep-dive on one dimension
- **`--dry-run`:** Generate and display without writing

## Output

`/vector/audits/invest-benchmark.md`

## When to Run

- **Sales calls:** Run on a prospect's codebase to demonstrate value. "You're at Emerging — here's how to get to Defined."
- **Monthly on active engagements:** Show measurable improvement. The trend arrows matter.
- **After major Investiture adoption milestones:** Run backfill → run benchmark → see the before. Run all skills → run benchmark again → see the after.
- **When evaluating if a project is "ready" for a client review or milestone gate.**

## Principles

- **Presence, not perfection.** A score of 3 ("Defined") is strong. Most projects never get past 2. The benchmark should motivate, not demoralize.
- **Specificity in next actions.** "Improve documentation" is not an action. "Run `/invest-doctrine` to audit VECTOR.md completeness" is an action.
- **Trends matter more than snapshots.** A project at 2.5 trending up is in better shape than a project at 3.5 trending down. The trend column is not decoration.
- **The benchmark sells itself.** When a prospect sees their codebase scored and a clear path to improvement, the engagement sells itself. The benchmark is both an assessment tool and a sales tool — by design.
- **Honest scoring.** Do not inflate scores. If VECTOR.md is a template with brackets, doctrine health is 1. If there are no ADRs, decision documentation is 1. The client trusts the methodology because it tells the truth about their codebase.
