---
name: invest-retro
description: "Generate a sprint retrospective from git activity, doctrine drift, and assumption validation changes. Analyzes what shipped, what slipped, what assumptions changed, and what the team learned. Reads git log, VECTOR.md, /vector/ state, and compares against sprint goals if available. Writes to /vector/retros/."
argument-hint: "[sprint-name or date-range, e.g. 'sprint-1' or '2026-03-01..2026-03-15']"
disable-model-invocation: true
---

# Investiture Skill: Sprint Retrospective

You are generating the artifact that turns a sprint from lived experience into organizational memory. Most retros are vibes — people remember what frustrated them, not what actually happened. This skill reads the project's actual data — git history, assumption changes, architecture decisions, audit findings — and produces an evidence-based retrospective that tells the truth about what the team shipped, what slipped, and what it learned.

**The most valuable section is Assumption Changes.** Shipping features is expected. Learning something new about the problem space is what compounds. A sprint where nothing shipped but three assumptions were invalidated was more valuable than a sprint where five features shipped on top of wrong assumptions.

## Step 0: Parse the Argument

The argument is either a **sprint name** or a **date range**.

- **Sprint name** (e.g., `sprint-1`, `growth-sprint`): Look for a matching goals document in `/vector/sprints/`, `/vector/missions/`, or the project root. If found, use it to identify planned work. Extract the date range from the document's metadata if available. If no goals doc exists, ask the operator for a date range.
- **Date range** (e.g., `2026-03-01..2026-03-15`): Use directly. Parse as `--since` and `--until` for git commands.
- **No argument:** Default to the last 14 days.

## Step 1: Read Git Activity

Get the full picture of what happened in the codebase during the sprint:

1. **Commits:** Run `git log --oneline --since="[start]" --until="[end]"` to get all commits. Count them. Group by theme (feature work, bug fixes, infrastructure, documentation, tests).
2. **PRs merged:** Run `git log --merges --since="[start]" --until="[end]"` to identify merged pull requests. Extract PR numbers and titles where visible in merge commit messages.
3. **Branches:** Run `git branch --merged` and cross-reference with the date range to identify branches that were completed during the sprint.
4. **Files changed:** Run `git diff --stat [start-ref]..[end-ref]` or `git log --stat --since="[start]" --until="[end]"` to understand the scope of changes — how many files, which areas of the codebase were active.

If the git history is empty for the period, report: "No git activity found for [period]. Nothing to retrospect." Stop.

## Step 2: Read Current Doctrine

Read the existing doctrine to measure drift and provide context:

1. **`VECTOR.md`** — Current assumptions, constraints, design principles, project stage. This is the baseline for doctrine drift analysis.
2. **`ARCHITECTURE.md`** — Current stack, layers, conventions. Compare against what the code actually did during the sprint.
3. **`CLAUDE.md`** — Agent context, prohibitions. Check if any prohibitions were violated or if key context changed.

## Step 3: Read Assumption State

Read `/vector/research/assumptions/` and compare the state of assumptions at sprint start vs. sprint end:

1. **Check file modification dates** — Which assumption files were created or modified during the sprint period?
2. **Read assumption frontmatter** — Look for `status` fields (e.g., `unvalidated`, `validated`, `invalidated`, `retired`). Identify status changes that occurred during the sprint.
3. **New assumptions** — Were new assumption files added? These represent new things the team learned it was assuming.
4. **Invalidated assumptions** — The most important finding. An invalidated assumption means the team was building on a wrong belief and corrected course.

If `/vector/research/assumptions/` does not exist, note: "No assumption tracking in place. Consider running /invest-capture after coding sessions to build the assumption library."

## Step 4: Read Audit Findings

Read `/vector/audits/` for any audit files created or modified during the sprint:

1. **Architecture audits** — From `invest-architecture`. Were there compliance violations? Were they resolved during the sprint?
2. **Doctrine audits** — From `invest-doctrine`. Was doctrine health assessed? What gaps were found?
3. **Dependency audits** — From `invest-dependency`. Were there security or health concerns surfaced?

For each audit finding from the sprint period, note whether it was resolved, deferred, or is still open.

If `/vector/audits/` does not exist or has no files from the period, note: "No audits were run during this sprint."

## Step 5: Read Architecture Decisions

Read `/vector/decisions/` for ADRs written during the sprint:

1. **New ADRs** — Decisions formalized during the sprint. Each one represents a fork in the road where the team chose a direction.
2. **ADR content** — Read the context, decision, and consequences sections. Summarize the impact of each decision.

If no ADRs exist from the period, note: "No architecture decisions were formally recorded this sprint. If significant decisions were made in code, consider running /invest-capture to surface them."

## Step 6: Compare Against Sprint Goals

If a sprint goals document was found in Step 0:

1. **List all planned items** from the goals doc.
2. **For each item:** Was it completed (evidenced by commits/PRs)? Was it started but not finished? Was it not started at all?
3. **Unplanned work:** Identify commits/PRs that don't map to any planned item. This is scope creep or reactive work — not inherently bad, but worth naming.

If no sprint goals document was found, skip the "What Slipped" analysis based on goals and instead note: "No sprint goals document found. 'What Slipped' is based on git branch state (branches started but not merged) and TODO/FIXME comments added during the period."

## Step 7: Produce the Retrospective

```markdown
# Sprint Retrospective: [sprint-name or date range]

**Period:** [start date] — [end date]
**Generated:** [today's date]
**Project stage:** [from VECTOR.md]

---

## Sprint Summary

[1 paragraph. What was this sprint about? What was the team trying to accomplish? What was the overall arc — discovery, building, stabilizing, shipping? Write this for someone who was not in the sprint but needs to understand what happened.]

---

## What Shipped

[Concrete deliverables grouped by theme. Each item references specific commits or PRs. This is the "we built this" section — factual, verifiable, no spin.]

- **[Theme 1]:** [What was delivered. PR #NNN, commits abc123..def456]
- **[Theme 2]:** [What was delivered. Reference.]
- **Infrastructure / Internal:** [Non-user-facing work that shipped. Refactors, CI changes, dependency updates.]

**Activity:** [N] commits across [N] files by [N] contributors.

---

## What Slipped

[Planned but not delivered. This is not a blame section — it is a scope and estimation calibration tool. Every item includes an honest reason: scope was larger than estimated, blocked by external dependency, deprioritized in favor of higher-impact work, etc.]

- **[Planned item 1]:** [Status — started/not started. Reason it slipped. Is it carrying over to next sprint?]
- **[Planned item 2]:** [Same.]

[If nothing slipped: "All planned work was completed. Either the sprint was well-scoped or the team had capacity to spare — worth examining which."]

[If no goals doc existed: "No sprint goals were documented, so slippage cannot be measured against a plan. Consider writing sprint goals at the start of the next sprint to enable this analysis."]

---

## Assumption Changes

[Which assumptions were validated, invalidated, or newly identified during the sprint. This is the learning section — the most valuable part of the retro.]

### Validated
- **[Assumption ID / name]:** [What was confirmed, and how. Reference the evidence — user test, analytics, code behavior, etc.]

### Invalidated
- **[Assumption ID / name]:** [What was wrong, what the team learned instead, and what changed as a result. This is the gold — it means the team course-corrected.]

### Newly Identified
- **[Assumption]:** [A belief the team discovered it was holding, now documented for future validation. Source: commit/file where it surfaced.]

[If no assumption tracking: "No assumption changes tracked. The team may have learned things this sprint that are not yet captured. Run /invest-capture on recent sessions to surface embedded assumptions."]

---

## Architecture Decisions

[ADRs written during the sprint, with a brief impact summary for each.]

- **ADR-NNN: [Title]** — [1-2 sentence summary of the decision and its consequences. Why it matters for the project's trajectory.]

[If no ADRs: "No architecture decisions were formally recorded. If the codebase changed structurally, those decisions were made implicitly — consider running /invest-capture to surface and document them."]

---

## Doctrine Drift

[Places where the codebase diverged from VECTOR.md or ARCHITECTURE.md during the sprint. Drift is normal — it means the project is evolving. The question is whether doctrine should be updated to match reality, or code should be corrected to match doctrine.]

- **[Drift item]:** Doctrine says [X]. Code now does [Y]. Source: `[file:line]`. Assessment: [doctrine is stale / code is wrong / intentional divergence needing ADR].

[If no drift detected: "No doctrine drift detected. The codebase remained consistent with VECTOR.md and ARCHITECTURE.md during this sprint."]

---

## What We Learned

[Non-obvious insights from the sprint. Not "we should plan better" — that is always true and therefore useless. Specific things the team now knows that it didn't know before.]

- **[Insight 1]:** [What the team learned, grounded in evidence. Reference the commit, PR, audit, or assumption that produced the insight.]
- **[Insight 2]:** [Same.]

[These should be things that would change how the team works, what it builds, or what it assumes. If the retro produced no new insights, say: "No non-obvious insights surfaced. This may indicate a sprint focused on execution rather than discovery — which is fine if the problem space is well-understood."]

---

## Next Sprint Recommendations

[Concrete, actionable items for the next sprint. Each one should be specific enough to become a task or goal.]

1. **[Action 1]:** [Specific deliverable, investigation, or process change. Why it matters — tie it to a finding from this retro.]
2. **[Action 2]:** [Same.]
3. **[Action 3]:** [Same.]

[Recommendations must pass the "could someone act on this tomorrow?" test. "Improve testing" fails. "Add integration tests for the payment flow, which had two regressions this sprint" passes.]

---

*Generated by Investiture `/invest-retro`. Data sourced from git history, doctrine files, assumption tracking, audit artifacts, and architecture decision records.*
```

## Step 8: Output

**Print the full retrospective to the terminal AND save it to `/vector/retros/[sprint-name]-retro.md`.**

- If the argument was a sprint name, use it: `/vector/retros/sprint-1-retro.md`
- If the argument was a date range, use it: `/vector/retros/2026-03-01--2026-03-15-retro.md`
- If no argument was given, use the date range: `/vector/retros/[start-date]--[end-date]-retro.md`

Do NOT overwrite prior retros — each one is a point-in-time snapshot. If a file already exists with that name, append a sequence number: `[name]-retro-2.md`.

Create `/vector/retros/` if it does not exist.

After writing, output:

```
Retrospective written to /vector/retros/[name]-retro.md

Period: [start] — [end]
Commits: [N] | Shipped: [N items] | Slipped: [N items] | Assumptions changed: [N]

Run /invest-capture to surface any remaining embedded knowledge from this sprint.
Run /invest-status to generate a client-facing report for the same period.
```

## Arguments

- **No arguments:** Retrospective for the past 14 days
- **Sprint name (e.g., `sprint-1`):** Looks for a matching goals document, extracts date range
- **Date range (e.g., `2026-03-01..2026-03-15`):** Uses the range directly

## Output

`/vector/retros/[sprint-name]-retro.md`

## When to Run

- **At sprint boundaries.** The retro should be generated before the next sprint starts, so findings feed into planning.
- After a major milestone — what did the team learn getting to this point?
- When the team feels stuck — the retro often reveals that the stuckness has a specific, addressable cause
- Before a client meeting — the retro provides honest internal context that informs what to share externally
- After running `/invest-capture` on recent sessions — captures feed into retros, retros feed into planning

## Principles

- **Evidence, not feelings.** Every claim in the retro cites a commit, PR, assumption file, audit finding, or doctrine artifact. "We felt rushed" is not a retro finding. "We merged 3 PRs without tests (PR #12, #15, #18) which suggests the team was prioritizing speed over confidence" is.
- **"What slipped" is calibration, not blame.** Things slip for legitimate reasons — scope was underestimated, priorities shifted, dependencies were late. Naming them honestly is how the team gets better at scoping. Blaming individuals is how you get retros where no one speaks.
- **Assumption changes are the most valuable section.** A sprint where the team invalidated a core assumption and pivoted is more valuable than a sprint where everything shipped on schedule but on top of wrong beliefs. Celebrate learning, not just output.
- **Doctrine drift is normal.** Projects evolve faster than documentation. The retro surfaces drift so it can be reconciled intentionally — either update the doctrine or correct the code. Drift only becomes a problem when it accumulates silently.
- **Recommendations must be specific and actionable.** "Improve communication" is not a recommendation. "Create a shared channel for deployment notifications after the two silent deploys this sprint" is. If a recommendation cannot be turned into a task, it is too vague.
- **The retro is documentation, not ceremony.** It should be useful to someone who wasn't in the sprint — a new team member, a future version of the team, or a stakeholder who wants to understand the project's trajectory. Write it as a document that stands on its own.
- **This skill compounds.** The first retro is thin because there is little tracked state. After five sprints of retros, the team has a narrative arc — you can see assumptions being validated over time, drift being reconciled, estimation accuracy improving. The series of retros IS the team's learning history.
