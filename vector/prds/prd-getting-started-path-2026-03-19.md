# PRD: Getting Started Path

**Author:** Zero Vector
**Date:** 2026-03-19
**Status:** Draft
**Version:** 1.0

---

## Problem

Investiture ships 25 skills. A new user opening the skill listing for the first time sees a wall of capabilities with no guidance on where to begin. VECTOR.md names this directly as an open question: "What is the minimum number of skills needed for a new adopter to get value? (Is the 25-skill chain intimidating?)" and "Should Investiture ship a 'getting started' path that sequences skills for new users?" The answer to both: yes.

The target audience -- solo developers and small teams who build with AI agents -- wants to move fast (VECTOR.md, Target Audience). They are drawn to Investiture because it promises low-friction knowledge capture, not because they want to study a 25-skill methodology. If the first experience is "figure out which of these 25 skills to run and in what order," the core value proposition ("you code how you want to, and Investiture captures what you learned") never lands. The user churns before the capture loop begins.

If we do nothing, adoption depends on users either reading all 25 SKILL.md files to self-sequence (violating Design Principle 3: "capture over ceremony -- the methodology should cost less time than the knowledge it produces") or stumbling into the right starting point by luck.

## Audience

Investiture has not yet completed formal persona research (all persona, JTBD, interview, and assumption research artifacts are at "Not started" status per VECTOR.md's Knowledge Map). This is a risk -- the audience description below is derived from VECTOR.md's Target Audience section, not from validated research.

| Persona | Relevant Job | Current Pain |
|---------|-------------|-------------|
| Solo developer using Claude Code | Set up Investiture on a new or existing project and start getting value from it | Confronted with 25 skills, no sequence, no indication of which 3-5 produce immediate value. Defaults to skipping methodology entirely. |
| Small team lead adopting Investiture | Onboard the team onto a shared methodology without a multi-day learning curve | Cannot hand a teammate a single command that says "start here." Has to write their own onboarding doc or explain the skill chain verbally -- exactly the kind of tribal knowledge Investiture exists to eliminate. |
| Consultant running a client engagement | Stand up Investiture on a client project quickly during an engagement | Time spent figuring out skill order is time not spent on delivery. Needs a fast path to doctrine files, first capture, and first audit. |

## Proposed Solution

A new skill -- `invest-start` or `invest-guide` -- that gives new users a curated, sequenced entry point into Investiture. When a user runs this skill, they receive a guided walkthrough of the first 5 skills they should run, in order, with context about why each one matters and what it produces. The skill does not replace the individual skills -- it orchestrates them, providing the "reading order" for actions the way Principle 6 ("The reading order is the onboarding") provides the reading order for documents.

The experience: a user runs one command, gets a clear sequence with rationale, and is guided through initial setup to their first knowledge capture. By the end of the path, they have doctrine files, an architecture audit, and their first captured session -- the capture loop (Assumption 4: "the capture loop is the primary adoption driver for non-consulting users") is running, and the methodology is demonstrating value instead of demanding study.

The skill respects the constraint that skills are self-contained (Design Principle 1: "Each skill is a single SKILL.md file. No external dependencies, no shared state between skills except the /vector/ directory and doctrine files"). It does not create hidden coupling between skills -- it provides sequencing guidance and invokes existing skills, producing no artifacts of its own beyond the guided experience.

## Scope

### In Scope

- A single SKILL.md file (`invest-start` or `invest-guide`) that lives in `.claude/skills/` alongside all other skills
- Detection of project state: new project (no doctrine files) vs. existing project (has code, no doctrine) vs. already initialized (doctrine files exist) -- to route the user to the correct starting point
- A `--bundle` flag that selects a skill bundle tailored to the user's context. If no bundle is specified, the skill asks: "What best describes how you'll use Investiture?" and presents the options.
- **Skill bundles** — curated sequences of 5-8 skills, each grounded in a specific workflow:
  - **`solo`** — Solo developer / indie: `invest-init` → `invest-doctrine` → `invest-architecture` → `invest-capture` → `invest-prd`. The core loop: set up doctrine, code, capture what you learned, scope what's next.
  - **`consulting`** — Consulting firm / agency: `invest-init` → `invest-proposal` → `invest-scope` → `invest-contract` → `invest-status` → `invest-handoff`. Client-facing artifact chain: from pitch to delivery.
  - **`enterprise`** — Enterprise / regulated industry: `invest-init` → `invest-doctrine` → `invest-compliance` → `invest-risk` → `invest-trace` → `invest-architecture` → `invest-audit`. Governance-first: compliance, risk, and traceability before building.
  - **`team`** — Small team / startup: `invest-init` → `invest-doctrine` → `invest-crew` → `invest-prd` → `invest-capture` → `invest-retro`. Collaboration loop: define doctrine, assign work, build, capture, reflect.
  - **`open-source`** — Open source maintainer: `invest-backfill` → `invest-doctrine` → `invest-changelog` → `invest-architecture` → `invest-capture`. Existing codebase path: document what exists, then start capturing.
- Each bundle detects project state (new vs. existing vs. initialized) and adjusts the first skill accordingly (`invest-init` vs. `invest-backfill` vs. skip)
- Brief, non-technical explanation before each skill in the sequence: what it does, why it matters for this bundle's workflow, and what it produces
- A progress indicator showing where the user is in the bundle path
- Ability to resume the path if the user stops partway through (by detecting which artifacts already exist in `/vector/`)
- A completion message that names the next 3-5 skills worth exploring based on the bundle, bridging from the guided path to self-directed use

### Out of Scope

- **Automating skill execution in a single command** -- the user should run each skill individually so they understand what each one does. Bundling them into one mega-command would violate the principle that skills are self-contained and would hide the methodology instead of teaching it. v2 consideration.
- **Covering all 25 skills** -- each bundle surfaces 5-8 skills, not the full chain. Users who want everything can explore beyond the bundle.
- **Interactive tutorial or walkthrough UI** -- Investiture is Claude Code skills, not a separate application (Constraint: "Claude Code skill format only. No separate application, no server, no database."). The guide is markdown instructions interpreted by Claude Code, consistent with every other skill.
- **Custom bundles** -- v1 ships 5 predefined bundles. User-defined bundles are a v2 consideration after validating that the defaults cover the primary use cases.
- **Telemetry or usage tracking** -- measuring adoption is a separate open question in VECTOR.md ("How do we measure adoption beyond GitHub stars?"). This skill does not instrument itself.

### Dependencies

- **All skills referenced by bundles must exist and be functional.** The 5 bundles reference 16 unique skills: `invest-init`, `invest-backfill`, `invest-doctrine`, `invest-architecture`, `invest-capture`, `invest-prd`, `invest-proposal`, `invest-scope`, `invest-contract`, `invest-status`, `invest-handoff`, `invest-compliance`, `invest-risk`, `invest-trace`, `invest-crew`, `invest-retro`, `invest-changelog`. All are currently shipped (validated — 25 skills shipped per Assumption 2).
- **The `/vector/` directory structure must be consistent across skills** -- the getting-started skill detects state by checking for doctrine files and `/vector/` subdirectories. This depends on all skills writing to the documented paths in ARCHITECTURE.md.

No external dependencies. No npm dependencies (Constraint: "No npm dependencies in skills. Skills are pure markdown instructions.").

## Success Criteria

| Criterion | Metric | Target | How to Measure |
|-----------|--------|--------|---------------|
| New user reaches first `invest-capture` | Completion rate of the 5-step path | 4 of 5 steps completed in the first session | Qualitative: user testing with 3-5 new Investiture adopters. Check if doctrine files + first capture report exist after one session. |
| Time from install to first captured session | Minutes from running `invest-start` to having a capture report in `/vector/` | Under 30 minutes for a small existing codebase | Timed observation during user testing |
| User understands why each skill matters | Comprehension of the skill sequence rationale | User can explain in their own words why doctrine audit precedes architecture audit | Post-session interview question during user testing |
| Path correctly detects project state | Routing accuracy | Correct path selected for all 3 states (new, existing, initialized) in testing | Manual verification across 3 test scenarios: empty project, existing codebase without doctrine, project with doctrine files |
| Skill follows Investiture format standards | Compliance with Definition of Done | Passes all 5 quality gates from VECTOR.md | `invest-doctrine` audit of the new skill's SKILL.md against the standard frontmatter and structure |

Metrics are not yet instrumentable (no telemetry exists per VECTOR.md constraints). All success criteria are qualitative, measured through user testing. If `invest-metrics` is run in the future, completion rate and time-to-first-capture should be added to the metrics framework.

## Open Questions

1. **`invest-start` or `invest-guide`?** -- The name affects discoverability. `invest-start` implies a one-time action (which it is for a given project). `invest-guide` implies ongoing reference (which it could be if users re-run it to check progress). Blocks: skill naming and SKILL.md creation. Ask: Zero Vector maintainers and 2-3 early adopters for preference.

2. **Should the skill invoke other skills directly, or only print instructions?** -- Invoking skills in sequence provides a smoother experience but creates implicit coupling between the guide skill and the 5 sequenced skills. Printing instructions keeps skills fully independent but adds friction (the user has to copy-paste commands). Blocks: SKILL.md implementation approach. Ask: Zero Vector maintainers, informed by Design Principle 1 (skills are self-contained).

3. **What constitutes "already initialized"?** -- If a user has VECTOR.md but no ARCHITECTURE.md, are they initialized or not? The state detection logic needs clear thresholds. Blocks: Step 0 routing logic. Ask: review the outputs of `invest-init` and `invest-backfill` to define the minimum artifact set that constitutes "initialized."

4. **Does the completion message create a maintenance burden?** -- The "next skills to explore" recommendation at the end of the path means updating the guide skill whenever the skill chain changes. Blocks: long-term maintainability. Ask: Zero Vector maintainers -- is this acceptable, or should the completion message be generic?

## Assumptions & Risks

### Validated Assumptions

- The Claude Code skill format is sufficient to deliver this feature -- 25 skills are already shipped and functional in this format (VECTOR.md Assumption 2, status: validated).
- The `/vector/` directory and doctrine files provide enough state information to detect project status -- all existing skills already read from and write to these paths consistently (evidenced by ARCHITECTURE.md's project structure and the existing skill implementations).

### Unvalidated Assumptions

- **The capture loop is the right "finish line" for the getting-started path** -- this assumes Assumption 4 from VECTOR.md ("the capture loop is the primary adoption driver for non-consulting users") is correct. If the real adoption driver is something else (e.g., the PRD workflow for consultants, or the architecture audit for teams), the path ends at the wrong skill. Risk if wrong: users complete the path but do not feel they got value. Recommend: validate Assumption 4 through user interviews before committing to the path sequence.

- **5 skills is the right number** -- this assumes that 5 steps is enough to demonstrate value but not so many that users drop off. No research supports this specific number. Risk if wrong: path is too short (user doesn't reach value) or too long (user drops off before completing). Recommend: user testing with 3-5 adopters, measuring drop-off point.

- **Users will voluntarily run a guided path instead of diving in** -- this is a variant of VECTOR.md Assumption 5 ("Users will run invest-capture after sessions voluntarily if the friction is low enough"). Some users -- especially experienced developers -- may skip the guide entirely and go straight to individual skills. Risk if wrong: the skill exists but is rarely used. Recommend: accept this risk. The guide is additive -- it does not replace direct skill usage, so low adoption of the guide itself is not harmful.

- **State detection by checking for file existence is reliable** -- assumes that the presence of VECTOR.md, CLAUDE.md, and ARCHITECTURE.md accurately indicates project initialization state. A user could have a VECTOR.md from a different methodology or a hand-written ARCHITECTURE.md that is not Investiture-formatted. Risk if wrong: the guide routes the user to the wrong path. Recommend: check for Investiture-specific markers (e.g., `vector_version` in VECTOR.md frontmatter) rather than just file existence.

### Key Risks

- **Maintenance coupling** -- the guide skill references 5 other skills by name and describes their behavior. If those skills change (renamed, restructured, or deprecated), the guide becomes stale. Likelihood: M. Impact: M. Mitigation: include the guide skill in the Ship Criteria checklist ("Skill chain is documented") so it is reviewed whenever the chain changes.

- **Scope creep toward a tutorial** -- the guide could easily expand from "here are 5 skills in order" to "let me teach you the entire Investiture philosophy." This would violate Design Principle 3 (capture over ceremony) and Principle 2 (read the room on explanation depth -- the guide should default to coworker mode, not teaching mode). Likelihood: M. Impact: H. Mitigation: strict scope boundary -- the guide provides one sentence of rationale per skill, not a philosophy lesson. Users who want depth are pointed to VECTOR.md per Principle 6.

- **The guide answers the wrong question** -- the open question in VECTOR.md is "is the 25-skill chain intimidating?" The guide assumes the answer is yes and that sequencing solves the problem. But the real issue might be that users do not know Investiture exists, not that they find it intimidating once they do. Likelihood: L. Impact: H. Mitigation: this PRD scopes only the sequencing solution. Discovery and marketing are separate concerns.

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-19 | Zero Vector | Initial draft |
