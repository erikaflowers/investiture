---
name: invest-start
description: "Guided getting-started path for new Investiture users. Detects project state, asks how you work, and gives you a sequenced 5-8 skill path with rationale for each step. Run this first if you have never used Investiture before."
argument-hint: "[--bundle solo|consulting|enterprise|team|open-source]"
disable-model-invocation: true
---

# Investiture Skill: Getting Started

You are onboarding a new user into Investiture. They have 25 skills available and no idea where to begin. Your job is to give them a curated, sequenced path — not the full skill chain, just the 5-8 skills that get them to value fastest based on how they work.

**This skill does not invoke other skills.** It prints a sequenced guide with rationale. The user runs each skill individually so they understand what each one does. You are the reading order, not the runtime.

## Step 0: Detect Project State

Check what already exists:

1. **Does `VECTOR.md` exist with substantive content** (not just template brackets)?
   - Yes → project is **initialized**. Skip foundation skills.
   - Template-only or missing → project needs initialization.

2. **Does the project have existing code?** (check for source files, package.json, Cargo.toml, pyproject.toml, go.mod, or similar)
   - Yes + no doctrine → project is **existing** (needs `invest-backfill`)
   - No code + no doctrine → project is **new** (needs `invest-init`)

3. **Does `/vector/captures/` contain any capture files?**
   - Yes → user has run captures before. They are not brand new.

Report what you found:

```
Project state:
- Doctrine files: [VECTOR.md ✓/✗] [ARCHITECTURE.md ✓/✗] [CLAUDE.md ✓/✗]
- Existing code: [yes — language/framework / no]
- Previous captures: [N captures found / none]
- State: [new / existing / initialized]
```

## Step 1: Choose a Bundle

If `--bundle` was provided, use it. Otherwise, ask:

```
How will you use Investiture? Pick the closest match:

1. solo        — Solo developer or indie. You build, you ship, you capture.
2. consulting  — Consulting firm or agency. Client artifacts from pitch to delivery.
3. enterprise  — Enterprise or regulated industry. Governance and compliance first.
4. team        — Small team or startup. Collaboration loop with shared doctrine.
5. open-source — Open source maintainer. Document what exists, then start capturing.
```

Wait for the user's answer before proceeding.

## Step 2: Present the Path

Based on the bundle and project state, present the sequenced path. Adjust the first skill based on state detection:

- **New project** → start with `invest-init`
- **Existing code, no doctrine** → start with `invest-backfill`
- **Already initialized** → skip the first skill, note what's already done

### Bundle: solo

For solo developers and indie builders. The core loop: set up doctrine, audit your architecture, code, capture what you learned, scope what's next.

```
Your path (5 skills):

  ┌─ 1. invest-init (or invest-backfill)
  │     Set up your doctrine files. This gives every other skill the context it needs.
  │     Produces: VECTOR.md, ARCHITECTURE.md, CLAUDE.md, /vector/ directory
  │
  ├─ 2. invest-doctrine
  │     Audit what you just created. Catches gaps and contradictions before you build on them.
  │     Produces: /vector/audits/invest-doctrine.md
  │
  ├─ 3. invest-architecture
  │     Check your codebase against your declared architecture. Find drift early.
  │     Produces: /vector/audits/invest-architecture.md
  │
  ├─ 4. invest-capture
  │     THE CORE SKILL. Run this after any coding session to extract what you learned.
  │     Produces: /vector/captures/capture-[date].md + assumption files
  │
  └─ 5. invest-prd
        Turn research gaps and assumptions into scoped product requirements.
        Produces: /vector/prds/prd-[name]-[date].md
```

**The loop after setup:** Code → `/invest-capture` → update doctrine → code again. That's it. Steps 1-3 are one-time setup. Steps 4-5 are the ongoing rhythm.

### Bundle: consulting

For consulting firms and agencies. Client-facing artifact chain: from pitch to delivery.

```
Your path (6 skills):

  ┌─ 1. invest-init
  │     Set up doctrine for the engagement. Captures client context, constraints, and goals.
  │     Produces: VECTOR.md, ARCHITECTURE.md, CLAUDE.md
  │
  ├─ 2. invest-proposal
  │     Generate a structured proposal from your doctrine. Grounded in what you declared, not boilerplate.
  │     Produces: /vector/briefs/proposal-[client]-[date].md
  │
  ├─ 3. invest-scope
  │     Break the proposal into scoped deliverables with effort estimates and dependencies.
  │     Produces: /vector/briefs/scope-[name]-[date].md
  │
  ├─ 4. invest-contract
  │     Generate contract structure from scope. Terms, deliverables, milestones.
  │     Produces: /vector/briefs/contract-[name]-[date].md
  │
  ├─ 5. invest-status
  │     Status reports grounded in actual git activity and doctrine, not memory.
  │     Produces: /vector/briefs/status-[date].md
  │
  └─ 6. invest-handoff
        Condensed onboarding doc for a specific role. Use when handing off to client or new team member.
        Produces: /vector/handoffs/handoff-[role]-[date].md
```

**The rhythm:** Init → proposal → scope → contract → [build + capture] → status → handoff. Each artifact feeds the next. No copy-pasting between docs.

### Bundle: enterprise

For enterprise and regulated industries. Governance and compliance before building.

```
Your path (7 skills):

  ┌─ 1. invest-init
  │     Set up doctrine with compliance constraints and regulatory context front and center.
  │     Produces: VECTOR.md, ARCHITECTURE.md, CLAUDE.md
  │
  ├─ 2. invest-doctrine
  │     Audit doctrine files for completeness. In regulated work, gaps in doctrine are audit findings.
  │     Produces: /vector/audits/invest-doctrine.md
  │
  ├─ 3. invest-compliance
  │     Map your declared constraints against regulatory requirements. Surface gaps before they become violations.
  │     Produces: /vector/audits/compliance-[date].md
  │
  ├─ 4. invest-risk
  │     Risk assessment grounded in doctrine, assumptions, and architecture. Not a generic risk matrix.
  │     Produces: /vector/audits/risk-[date].md
  │
  ├─ 5. invest-trace
  │     Traceability: requirements → decisions → code → tests. The audit trail.
  │     Produces: /vector/audits/trace-[date].md
  │
  ├─ 6. invest-architecture
  │     Audit codebase against declared architecture. In regulated environments, architecture drift is a finding.
  │     Produces: /vector/audits/invest-architecture.md
  │
  └─ 7. invest-audit (invest-doctrine --full)
        Full doctrine health check. Run periodically or before external audits.
        Produces: updated audit files
```

**The rhythm:** Doctrine → compliance → risk → trace → build → audit. Governance wraps the build cycle, not the other way around.

### Bundle: team

For small teams and startups. Collaboration loop: define doctrine, assign work, build, capture, reflect.

```
Your path (6 skills):

  ┌─ 1. invest-init
  │     Set up shared doctrine. This is what the whole team builds against.
  │     Produces: VECTOR.md, ARCHITECTURE.md, CLAUDE.md
  │
  ├─ 2. invest-doctrine
  │     Audit the doctrine before the team starts building on it. Shared foundations must be solid.
  │     Produces: /vector/audits/invest-doctrine.md
  │
  ├─ 3. invest-crew
  │     Decompose a feature into scoped agent tasks. Branch names, commit prefixes, scope boundaries.
  │     Produces: /vector/missions/mission-[name]-[date].md
  │
  ├─ 4. invest-prd
  │     Scope what you're building. Grounded in doctrine, not vibes.
  │     Produces: /vector/prds/prd-[name]-[date].md
  │
  ├─ 5. invest-capture
  │     Each team member captures after their session. Knowledge compounds across the team.
  │     Produces: /vector/captures/capture-[date].md
  │
  └─ 6. invest-retro
        Sprint retrospective grounded in captures, not memory. What actually happened vs. what was planned.
        Produces: /vector/retros/retro-[date].md
```

**The rhythm:** PRD → crew → [build + capture] → retro → PRD. The captures feed the retro, the retro feeds the next sprint.

### Bundle: open-source

For open source maintainers. Document what exists, then start capturing.

```
Your path (5 skills):

  ┌─ 1. invest-backfill
  │     Survey your existing codebase and generate doctrine from what's already there. No blank-page problem.
  │     Produces: VECTOR.md, ARCHITECTURE.md, CLAUDE.md (inferred from code)
  │
  ├─ 2. invest-doctrine
  │     Audit the generated doctrine. Backfill infers — this checks whether the inferences are right.
  │     Produces: /vector/audits/invest-doctrine.md
  │
  ├─ 3. invest-changelog
  │     Generate a user-facing changelog from git history. Grouped by what users can now do, not what files changed.
  │     Produces: /vector/changelog/changelog-[version].md
  │
  ├─ 4. invest-architecture
  │     Audit codebase against the doctrine you just validated. Find where code drifted from intent.
  │     Produces: /vector/audits/invest-architecture.md
  │
  └─ 5. invest-capture
        Start the capture habit. After every session, capture what changed and why.
        Produces: /vector/captures/capture-[date].md
```

**The rhythm:** Backfill once, then code → capture → changelog at release time. The doctrine grows with the project.

## Step 3: Show Progress and Resume State

After presenting the path, show a progress indicator based on what already exists:

```
Progress:
  [✓] invest-init        — VECTOR.md exists
  [✓] invest-doctrine    — /vector/audits/invest-doctrine.md exists
  [ ] invest-architecture — not yet run
  [ ] invest-capture      — no captures found
  [ ] invest-prd          — no PRDs found

Next step: Run /invest-architecture
```

Check for each skill's output artifacts to determine completion. A skill is "done" if its primary output file exists in the expected location.

## Step 4: Bridge to Self-Directed Use

After the path, suggest 3-5 additional skills worth exploring based on the bundle:

```
Once you've completed the path above, here are skills worth exploring next:

- /invest-validate   — Prioritize your unvalidated assumptions by risk
- /invest-interview  — Generate research discussion guides from your open questions
- /invest-synthesize — Turn research findings into doctrine updates
```

Keep this brief. One line per skill. The user can run `/invest-handoff` or read the skill chain at `/vector/skill-chain.md` for the full picture.

## Output

This skill produces no files. It prints the guide to the terminal. The user runs each skill individually.

If the user wants to save the guide for reference, suggest: "Copy this output to a file, or run `/invest-handoff --role agent` to generate a persistent onboarding doc."

## When to Run

- First time using Investiture on any project
- When onboarding a teammate who hasn't used Investiture before
- When returning to a project after a break and forgetting where you left off (the progress indicator catches you up)
- When switching workflows (e.g., you started as solo but are now onboarding a team — re-run with `--bundle team`)

## Principles

- **Guide, don't gatekeep.** The path is a recommendation, not a requirement. If the user wants to skip ahead to `invest-capture`, let them. The path exists to reduce confusion, not to enforce order.
- **One sentence of rationale, not a philosophy lesson.** Each skill in the path gets a brief "why" — what it does and what it produces. Users who want depth can read VECTOR.md or the individual SKILL.md files. Default to coworker mode, not teaching mode (VECTOR.md, Principle 2).
- **State detection over memory.** The progress indicator reads the filesystem, not a state file. If the artifacts exist, the skill was run. No hidden tracking, no separate progress database. Consistent with Design Principle 1 (skills are self-contained, no shared state except `/vector/` and doctrine).
- **The path ends at the loop, not at the methodology.** The goal is to get the user into the capture loop (code → capture → update doctrine → code) as fast as possible. Once they're in the loop, Investiture demonstrates value instead of demanding study.
- **Bundles are starting points, not cages.** A solo developer who discovers `invest-crew` later can use it. The bundles sequence the first experience — they don't limit the full experience.
