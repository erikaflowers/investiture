---
name: invest-brief
description: "Generates a design brief for a specific feature or flow from existing project research. Reads personas, JTBD, VECTOR.md principles and constraints, and quality gates to give a designer actionable direction grounded in real evidence. Use before design work begins on a feature or flow."
argument-hint: "[feature description] [--dry-run]"
disable-model-invocation: true
---

# Investiture Skill: Design Brief

You are turning research into direction. A designer sitting down to work on a feature needs to know who they're designing for, what job that person is trying to do, what principles should guide every decision, and what success looks like. This skill reads the project's accumulated research and doctrine and assembles that information into a brief a designer can act on immediately — without having to read through multiple files or ask someone.

**This skill runs on demand, before design work begins.** It reads what has been learned (personas, JTBD, assumptions) and what has been declared (design principles, constraints, quality gates). The richer those sources are, the more specific the brief. If research is sparse, the brief will say so clearly — which is itself useful signal.

## Step 0: Get the Feature or Flow Description

**If a description was passed as an argument:** Use it directly.

**If no argument was passed:** Prompt the operator:

```
What are you designing?
Describe the feature, flow, or surface — what the user will do or experience.

Examples:
  "Onboarding flow for a first-time user who has never used the product"
  "Settings panel for managing notification preferences"
  "Empty state for a dashboard with no data yet"
  "Export flow for saving a project as a file"
```

## Step 1: Read Research and Doctrine

Read the following sources. Extract only what is relevant to the described feature or flow.

**If `/vector/research/` does not exist:** Note it prominently and continue using VECTOR.md only: "Research directory not found. Run `/invest-backfill` to initialize the research structure. Brief will be based on VECTOR.md doctrine only — persona, JTBD, and assumption sections will be inferred or incomplete."

1. **`VECTOR.md`** — Extract:
   - **Target audience** — who the product is for. This defines who you're designing for.
   - **Design principles** — the philosophy that should guide every design decision
   - **Value proposition** — what the product delivers. The brief should reinforce this, not contradict it.
   - **Constraints** — anything that limits what is possible (platform, performance, accessibility requirements, offline support)
   - **Quality gates** — ship criteria that apply to this feature. These become the brief's success criteria.
   - **Open questions** — anything the project is still uncertain about that is relevant to this feature

2. **`/vector/research/personas/`** — Read all persona files. For each, extract:
   - Who this person is (role, context, level of expertise)
   - Their relevant goals and motivations
   - Their known frustrations or pain points
   - Behaviors relevant to this feature or flow

   If no persona files exist, note it: "No personas documented yet — audience section will draw from VECTOR.md target audience only."

3. **`/vector/research/jtbd/`** — Read all JTBD files. Identify:
   - Jobs directly relevant to this feature or flow ("When I [situation], I want to [job], so I can [outcome]")
   - Jobs that are adjacent — what the user was doing before they reached this feature, and what they need to do after

   If no JTBD files exist, note it: "No JTBD documented yet — jobs section will be inferred from the feature description and VECTOR.md."

4. **`/vector/research/assumptions/`** — Scan for assumptions relevant to this feature. Note:
   - Validated assumptions that inform the design (confirmed beliefs about users that should shape decisions)
   - Unvalidated assumptions that introduce risk (beliefs about users that are still untested — design decisions based on these are bets)
   - Invalidated assumptions that should be avoided (things the team once believed but research disproved)

5. **`/vector/decisions/`** — Scan ADR titles for any decisions directly relevant to this feature. If found, read them. Prior architectural or product decisions may constrain or inform the design.

6. **`ARCHITECTURE.md`** — Extract only design-relevant information:
   - UI/component layer: where components live, file naming conventions
   - Token system: where design tokens are defined, how they're referenced
   - Any styling constraints declared (CSS approach, component structure)

## Step 2: Identify the Primary User

From the personas and VECTOR.md audience, determine who is most likely to use this feature or flow. If multiple personas apply, rank them:

- **Primary:** The user this design should be optimized for
- **Secondary:** Users who will also use this feature but are not the primary audience

State clearly: "This brief is optimized for [primary persona or audience description]."

If no personas exist, derive the primary user from VECTOR.md's target audience. If that is also a placeholder, flag it prominently and continue — the brief will be less specific but still useful.

## Step 3: Identify the Relevant Jobs

From the JTBD files and feature description, identify:

**The main job:** What is the user trying to accomplish when they encounter this feature? Write it in JTBD format:
> "When [situation], I want to [job], so I can [outcome]."

**The before state:** What was the user doing immediately before reaching this feature? What context are they arriving from?

**The after state:** What does success look like for the user after they complete this flow? Where do they go next?

If JTBD files are sparse or absent, infer from the feature description — but mark inferences clearly: "[inferred — no JTBD documented for this]"

## Step 4: Surface Relevant Constraints and Risks

**From VECTOR.md constraints:** List any hard limits that apply to this feature. These are non-negotiable.

**From unvalidated assumptions:** List any assumptions the design will depend on that haven't been tested yet. These are risks — the design may need to change if the assumption turns out to be wrong.

**From invalidated assumptions:** List any things the team previously believed about users that turned out to be wrong, if relevant. These are traps to avoid repeating.

**From prior ADRs:** Note any architectural decisions that constrain the design options.

## Step 5: Write the Design Brief

Assemble everything into a brief:

```markdown
# Design Brief: [Feature or Flow Name]

**Date:** [today's date]
**Designing for:** [primary persona name or audience description]
**Feature / Flow:** [one sentence — what the user does]

---

## Who You're Designing For

**Primary:** [persona name or description]
[3-5 sentences. Who is this person? What do they care about? What is their relevant context, expertise level, and goal? What frustrates them about the current state?]

**Secondary (if applicable):** [persona name or description]
[2-3 sentences.]

---

## The Job

> "When [situation], I want to [job], so I can [outcome]."

**Before this flow:** [What the user was doing. What context they're arriving from. What state they're in — rushed, focused, confused, exploratory?]

**After this flow:** [What success looks like for the user. Where they go next. What they now have or can do that they couldn't before.]

---

## Design Principles That Apply Here

[From VECTOR.md design principles — select the 2-4 most relevant to this specific feature. For each, write one sentence on how it applies here specifically.]

- **[Principle name]:** [How it applies to this feature]
- **[Principle name]:** [How it applies to this feature]

---

## Constraints

[Hard limits. These are not preferences — they cannot be violated.]

- [Constraint from VECTOR.md, ARCHITECTURE.md, or prior ADR]
- [Constraint]

---

## Success Criteria

[What does "done" look like? Draw from VECTOR.md quality gates and the after-state above.]

- [Specific, testable criterion]
- [Another criterion]

---

## What We Know (Evidence)

[Validated assumptions or research findings that should inform design decisions. Each item: the finding + source.]

- "[Finding]" — [source: persona file, interview summary, validated assumption]
- "[Finding]" — [source]

---

## What We Don't Know Yet (Risks)

[Unvalidated assumptions this design will depend on. If these turn out to be wrong, the design may need to change.]

- [Assumption] — [what would need to change if this is wrong]
- [Assumption]

[If no relevant unvalidated assumptions: "No unvalidated assumptions flagged for this feature."]

---

## Where to Look

- Personas: /vector/research/personas/
- JTBD: /vector/research/jtbd/
- Full design principles: VECTOR.md
- Technical constraints: ARCHITECTURE.md
- Prior decisions: /vector/decisions/
```

## Step 6: Output

**Print the brief to the terminal AND save it to `/vector/briefs/[feature-slug]-[date].md`.**

Use a slug derived from the feature description: lowercase, hyphenated, 3-6 words.

Create the `/vector/briefs/` directory if it does not exist.

Do not overwrite existing briefs for the same slug and date — if the file exists, append `-2`, `-3`, etc. Briefs are point-in-time documents; each represents the research state at the time it was generated.

**If `--dry-run` was passed:** Print the brief to the terminal only. Do not write the file.

After writing, output:

```
Design brief written to /vector/briefs/[feature-slug]-[date].md

Research used: [N] persona(s), [N] JTBD file(s), [N] relevant assumption(s)
[If any source was missing:] Note: [source] not found — [section] is inferred or incomplete.

Run /invest-interview to generate a discussion guide for validating the open risks above.
```

## Arguments

- **No arguments:** Interactive — prompts for feature or flow description
- **`[feature description]`:** Uses the argument directly, skips the prompt
- **`--dry-run`:** Generates and displays the brief without writing the file

## Output

`/vector/briefs/[feature-slug]-[date].md`

## When to Run

- Before starting design work on a feature or flow
- When onboarding a designer to the project — use with `/invest-handoff --role designer`
- When a feature has been in development for a while and the original design intent has drifted — regenerate the brief to check what it was based on
- After `/invest-synthesize` updates personas or JTBD — regenerate briefs for in-progress features to see if direction has changed

## Principles

- **Research before opinions.** The brief draws from documented evidence — personas, validated assumptions, JTBD. Where research doesn't exist, it says so. A gap in the brief is a signal to do more research, not a prompt to fill it with guesses.
- **Specific over general.** "Design for users" is not a brief. "Design for a solo developer who has shipped two projects and is now managing a contributor for the first time" is a brief. Specificity is the whole point.
- **Constraints are design material.** Every limit in the brief — offline support required, no external dependencies, must load under 200ms — is something to design within, not around. Surface them prominently.
- **Risks are honest.** Unvalidated assumptions that a design depends on are risks. Naming them in the brief means the designer knows what decisions are bets and can flag them before shipping.
- **The brief is a snapshot.** It reflects what the project knows today. If research changes, regenerate it. A stale brief is worse than no brief — it gives false confidence.
