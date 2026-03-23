---
name: invest-status
description: "Compiles a client-facing project status report from git activity, audit state, mission progress, risk register, and doctrine health. Produces a polished report suitable for email, Notion, or slide deck — grounded in project data, not memory. Use at sprint boundaries or whenever a client needs visibility."
argument-hint: "[--period 7d|14d|30d|custom] [--format email|full] [--dry-run]"
disable-model-invocation: true
---

# Investiture Skill: Status Report

You are generating the artifact that keeps the client relationship healthy. Status reports built from memory are unreliable — they emphasize what was memorable, not what was important. This skill reads the project's actual data — git history, audit results, mission progress, risk register — and compiles a structured, honest status report that can be sent directly to a client or stakeholder.

**This skill is most valuable when other Investiture skills have been run.** It reads their outputs. Without them, it falls back to git log and doctrine files, which still produces a useful report.

## Step 0: Determine Scope

- **`--period [7d|14d|30d|custom]`:** Time window for the report. Default: `14d` (two weeks). `custom` prompts for start and end dates.
- **`--format email`:** Produces a shorter report suitable for pasting into an email. Omits detailed tables.
- **`--format full`:** Full report with all sections. Default.
- **`--dry-run`:** Generate and display without writing.

## Step 1: Read Sources

Read the following. Each contributes a different section of the report.

1. **Git log** — Run `git log --oneline --since="[period start]"` to get all commits in the reporting period. Group by theme (feature work, bug fixes, infrastructure, documentation). Count commits, unique contributors, files changed.

2. **`VECTOR.md`** — Extract: project stage, quality gates (what must be true before shipping), ship criteria. These are the milestones the client is tracking toward.

3. **`/vector/missions/`** — If mission files exist (from `invest-crew`), read them. Extract: which missions are active, which are complete, which are blocked.

4. **`/vector/audits/`** — Read the most recent audit files. Extract: architecture health (from `invest-architecture`), doctrine health (from `invest-doctrine`), dependency health (from `invest-dependency`).

5. **`/vector/risk-register.md`** — If exists (from `invest-risk`), extract: count of open risks by severity, any risks that changed status in the reporting period, new risks identified.

6. **`/vector/research/assumptions/`** — If exists, extract: assumptions validated or invalidated in the reporting period (by checking file modification dates or validation dates in frontmatter).

7. **`/vector/metrics-framework.md`** — If exists (from `invest-metrics`), reference the North Star metric. If instrumented, report current value. If not yet instrumented, note it.

## Step 2: Compile the Report

```markdown
# Status Report: [Project Name]

**Period:** [start date] — [end date]
**Generated:** [today's date]
**Project stage:** [from VECTOR.md]

---

## Executive Summary

[3-5 sentences in plain language. What happened this period, what's the overall trajectory, are we on track. This is the section a busy stakeholder reads. No jargon. No implementation details. Just: what shipped, what's coming, are there problems.]

---

## What Shipped

[Group commits by user-facing theme. Filter out noise — internal refactors, dependency bumps, and CI changes go in a separate "Infrastructure" bucket or are omitted. Each item should be understandable by a non-technical stakeholder.]

- **[Theme 1]:** [1-2 sentences describing what was delivered and why it matters]
- **[Theme 2]:** [same]
- **Infrastructure:** [brief summary of non-user-facing work, if significant]

**Activity:** [N] commits, [N] files changed, [N] contributors active.

---

## Progress Against Milestones

[Map progress against VECTOR.md quality gates and ship criteria. For each milestone, indicate: complete / in progress / not started / blocked.]

| Milestone | Status | Notes |
|-----------|--------|-------|
| [quality gate from VECTOR.md] | [status] | [brief context] |

---

## In Progress

[From mission files or current branch state. What is actively being worked on.]

- [Work item 1] — [current state, expected completion]
- [Work item 2] — [same]

---

## Risks & Blockers

[From risk register if available, or identified from git/audit state.]

**Active risks:** [N] ([N] critical, [N] high, [N] medium)

[List any critical or high risks with one-line descriptions. If the risk register exists, reference it. If it doesn't, identify risks from audit findings and stalled work.]

**Blockers:**
- [Anything that is preventing progress — external dependency, missing information, access needed]

[If no blockers: "No blockers at this time."]

---

## Assumptions & Research

[If assumption files exist and were updated this period:]

- **Validated:** [list assumptions validated, with one-line result]
- **Invalidated:** [list, with implication]
- **Remaining unvalidated:** [count]

[If no assumption tracking: omit this section]

---

## Health Indicators

[From audit files if available]

| Dimension | Status | Last Audited |
|-----------|--------|-------------|
| Architecture compliance | [CLEAN / NEEDS ATTENTION / VIOLATIONS] | [date] |
| Doctrine completeness | [COMPLETE / GAPS / MISSING] | [date] |
| Dependency health | [HEALTHY / CONCERNS / AT RISK] | [date] |

[If no audits have been run: "No formal audits have been run this period. Consider running invest-architecture and invest-doctrine."]

---

## Next Period Plan

[What the team intends to focus on in the next reporting period. Derived from active missions, unfinished milestones, and risk mitigation actions.]

1. [Priority 1 — specific deliverable or outcome]
2. [Priority 2]
3. [Priority 3]

---

*Generated by Investiture `/invest-status`. Data sourced from git history, doctrine files, and Investiture audit artifacts.*
```

**For `--format email`:** Produce only: Executive Summary, What Shipped (abbreviated), Risks & Blockers, Next Period Plan. Skip tables, health indicators, and assumption tracking. Keep under 300 words.

## Step 3: Output

**Print the full report to the terminal AND save it to `/vector/reports/status-[date].md`.**

Use today's date in YYYY-MM-DD format. Do NOT overwrite prior status reports — each one is a point-in-time snapshot. Create `/vector/reports/` if it does not exist.

**If `--dry-run` was passed:** Print to terminal only.

After writing, output:

```
Status report written to /vector/reports/status-[date].md

Period: [start] — [end]
Commits: [N] | Milestones: [N complete / N total] | Active risks: [N]
```

## Arguments

- **No arguments:** Full report for the past 14 days
- **`--period [7d|14d|30d|custom]`:** Set the reporting window
- **`--format [email|full]`:** Control report length and detail
- **`--dry-run`:** Generate and display without writing

## Output

`/vector/reports/status-[date].md`

## When to Run

- At sprint boundaries — every 1-2 weeks for active engagements
- Before client meetings — have the report ready so the meeting is discussion, not status recitation
- When a stakeholder asks "where are we?" — generate instead of guessing
- At project milestones — document the state at each major gate

## Principles

- **Data, not memory.** Every claim in the report traces to a git commit, an audit file, or a doctrine artifact. If you cannot point to the source, do not include it.
- **Client-readable.** A non-technical stakeholder should understand every section. No file paths in the executive summary. No commit hashes in "What Shipped." Translate implementation into outcomes.
- **Honest about gaps.** If audits haven't been run, say so. If metrics aren't instrumented, say so. An honest report with gaps builds more trust than a polished report that hides them.
- **Each report is a snapshot.** Never overwrite prior reports. The series of status reports IS the project's narrative over time. A client who reads three in a row should see trajectory.
- **Brevity scales with audience.** The executive summary is for the CEO who has 30 seconds. The full report is for the project lead who needs details. Both are in the same document — the structure does the work.
