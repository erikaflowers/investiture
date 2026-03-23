# PRD: Skill Creation Toolkit

**Author:** Zero Vector
**Date:** 2026-03-19
**Status:** Draft
**Version:** 1.0

---

## Problem

Investiture ships 25 skills covering the full lifecycle from initialization to retrospective. But the methodology is only as powerful as what its users can do with it — and right now, extending Investiture means reverse-engineering existing SKILL.md files, matching undocumented conventions (frontmatter fields, step numbering, argument patterns, output paths, principle sections), and hoping the result plays well with the rest of the skill chain. VECTOR.md's open question — "What is the minimum number of skills needed for a new adopter to get value? Is the 25-skill chain intimidating?" — points directly at this: if adoption depends on users seeing Investiture as theirs to extend, the creation path cannot be a guessing game.

Today, a user who wants a custom skill for their workflow (say, a sprint planning skill, or a client onboarding ritual) has no guided path to build one. They must read multiple existing skills, infer the conventions, and produce a valid SKILL.md by hand. This is the kind of ceremony that VECTOR.md's design principle — "Capture over ceremony. The methodology should cost less time than the knowledge it produces" — explicitly prohibits.

If we do nothing, Investiture remains a closed set of 25 skills that users consume but do not extend. The methodology stays Zero Vector's methodology instead of becoming the user's methodology. Adoption plateaus at "useful toolkit" rather than reaching "extensible engine."

## Audience

Formal persona research has not been completed for Investiture (all persona artifacts are "Not started" per VECTOR.md's Research Status). The following audience description is derived from VECTOR.md's Target Audience section and carries the risk of unvalidated assumptions about user behavior.

| Persona | Relevant Job | Current Pain |
|---------|-------------|-------------|
| Solo developer using Claude Code | Extend Investiture with a custom skill that fits their specific workflow | Must reverse-engineer existing skills, no guided path, high friction to create something that follows conventions |
| Small team lead adopting Investiture | Create team-specific skills (standup formats, deployment checklists, review rituals) that integrate with existing doctrine | No way to ensure custom skills read from VECTOR.md, follow output conventions, or chain with other skills correctly |
| Consultant running client engagements | Build client-specific skills (intake forms, deliverable templates, engagement artifacts) that feel native to Investiture | Custom artifacts live outside the skill system, losing the doctrine-grounding and structured output that make Investiture valuable |

## Proposed Solution

Users will be able to create new Investiture skills through a guided, interactive process that produces a valid SKILL.md file following all project conventions — without needing to study existing skills first. The toolkit will read the user's existing skills as examples, ask what the new skill should do, who it serves, and what it produces, then generate a complete SKILL.md that includes proper frontmatter, step structure, argument handling, output paths, and a principles section grounded in the user's own VECTOR.md doctrine.

The experience works like `invest-init` does for project setup: conversational phases that ask one topic at a time, producing meaningfully different output based on each answer. The user describes intent in plain language; the toolkit translates that intent into the structured skill format that Claude Code requires. The result is a skill that chains with existing Investiture skills, reads from doctrine files, and writes to the correct `/vector/` subdirectories.

This turns Investiture from a fixed toolkit into an extensible engine — users adopt the methodology by making it their own, not by conforming to a predetermined set of 25 skills.

## Scope

### In Scope

- Interactive, phased conversation that gathers skill purpose, target output, arguments, and intended position in the skill chain
- Reading existing skills in `.claude/skills/` as convention examples (frontmatter format, step numbering, argument patterns, output path conventions, principle structure)
- Reading VECTOR.md to ground the generated skill's principles and doctrine references in the user's actual project context
- Generating a complete, valid SKILL.md file with all required sections: frontmatter (name, description, argument-hint, disable-model-invocation), narrative preamble, numbered steps, arguments section, output section, "When to Run" section, and principles section
- Validation check against existing skills to prevent naming collisions (duplicate skill names) and output path conflicts
- Placing the generated file at `.claude/skills/[skill-name]/SKILL.md` following the established directory convention
- A `--dry-run` flag that displays the generated skill without writing it
- A `--from-existing [skill-name]` flag that uses a specific existing skill as the structural template for the new one

### Out of Scope

- Modifying or updating existing skills — this is a creation tool, not an editor. Skill revision is a v2 consideration.
- Generating skills that require external dependencies or server-side components — Investiture's constraint is "No npm dependencies in skills. Skills are pure markdown instructions" (VECTOR.md, Constraints). The toolkit enforces this, it does not bypass it.
- Automated testing of generated skills — there is no test harness for skills today. Validating that a generated skill actually works when invoked requires running it, which is outside this skill's scope.
- A skill marketplace or sharing mechanism — distribution of custom skills is a separate concern. This PRD covers creation only.
- Generating skills for platforms other than Claude Code — Investiture's constraint is "Claude Code skill format only" (VECTOR.md, Constraints).

### Dependencies

- Existing skill files in `.claude/skills/` must be readable. The toolkit uses them as convention examples. If no skills exist (e.g., on a fresh project without `invest-init`), the toolkit must fall back to hardcoded convention knowledge rather than example-based generation. This is a degraded but functional path.
- VECTOR.md must exist. Consistent with other Investiture skills, the toolkit cannot ground a new skill in doctrine that does not exist. If VECTOR.md is missing, the toolkit should direct the user to run `/invest-init` or `/invest-backfill` first.

## Success Criteria

| Criterion | Metric | Target | How to Measure |
|-----------|--------|--------|---------------|
| Generated skills follow all Investiture conventions | Convention compliance rate | 100% of generated skills pass the same structure checks as the 25 shipped skills (valid frontmatter, numbered steps, output section, principles section) | Manual audit of generated SKILL.md files against the convention checklist |
| Users can create a functional skill without reading existing skills first | Task completion without reference | 4 of 5 test users produce a working skill using only the toolkit's guided prompts | Usability observation — does the user open an existing SKILL.md during the process? |
| Generated skills reference the user's VECTOR.md doctrine | Doctrine grounding | Every generated skill's principles section references at least one constraint, design principle, or value from the user's VECTOR.md | Content audit of generated output |
| Time to create a new skill is lower than manual creation | Creation time | Under 10 minutes from invocation to written SKILL.md | Timed usability sessions |
| Generated skills chain correctly with existing skills | Chain compatibility | Generated skills that declare input from other skills (e.g., "reads PRD output") correctly reference the expected file paths and formats | Integration test: run a generated skill after the skill it depends on and verify it finds the expected input |

## Open Questions

1. Should the toolkit enforce a naming convention (e.g., `invest-` prefix) for user-created skills, or allow arbitrary names? Enforcing the prefix maintains namespace consistency but may feel restrictive for skills that are project-specific rather than methodology-generic. — Blocks: naming validation logic. Ask: Zero Vector maintainers.

2. How should the toolkit handle the `disable-model-invocation: true` frontmatter field? All 25 shipped skills set this to `true` (skills that write files). Should the toolkit always set it to `true`, or ask the user whether their skill writes files and set it accordingly? — Blocks: frontmatter generation logic. Ask: Zero Vector maintainers (this is a Claude Code platform behavior question).

3. Should generated skills be added to ARCHITECTURE.md's documentation automatically, or is that a separate manual step? The current skill chain is not documented in ARCHITECTURE.md, but VECTOR.md's Ship Criteria requires "Skill chain is documented (which skills feed into which)." — Blocks: post-generation workflow. Ask: Zero Vector maintainers.

4. What is the right behavior when a user describes a skill that substantially overlaps with an existing shipped skill? Should the toolkit warn and suggest the existing skill, refuse to generate, or generate and let the user decide? — Blocks: overlap detection logic. Ask: Zero Vector maintainers.

## Assumptions & Risks

### Validated Assumptions

- The Claude Code skill format is sufficient to deliver methodology tools without a separate application. — Evidence: 25 skills shipped and functional (VECTOR.md, Key Assumption 2, status: validated).
- Skills are self-contained markdown files that read from doctrine and write to `/vector/`. — Evidence: all 25 shipped skills follow this pattern (ARCHITECTURE.md, `/vector/` directory structure; VECTOR.md, Design Principle 1).

### Unvalidated Assumptions

- Users want to create custom skills rather than requesting them from Zero Vector. — Risk if wrong: the toolkit gets built but nobody uses it because users prefer to open issues or ask for skills to be added to the official set. Recommend: survey 5-10 current Investiture users about whether they have wanted to create a custom skill and what stopped them.
- A guided conversation can capture enough intent to generate a useful skill. — Risk if wrong: generated skills are structurally valid but functionally useless because the conversation did not surface the right details about what the skill should actually do. Recommend: prototype the conversation flow with 3 users before building the full generation logic.
- Users understand their own workflow well enough to describe a skill's purpose and output. — Risk if wrong: users invoke the toolkit but cannot articulate what they want, leading to abandonment or garbage output. Recommend: include example prompts and "skill idea" templates in the conversation flow to scaffold user thinking.
- The conventions across 25 skills are consistent enough to serve as examples. — Risk if wrong: the toolkit reads inconsistent skills and generates output that follows some conventions but violates others. Recommend: run `/invest-doctrine` audit on all 25 skills before building the toolkit to confirm convention consistency. This assumption maps to VECTOR.md's Ship Criteria: "All 25 skills have consistent format."

### Key Risks

- **Scope creep into skill editing.** Once users can create skills, they will immediately want to update them. The toolkit deliberately excludes editing (Out of Scope), but the pressure will be immediate. — Likelihood: H. Impact: M. Mitigation: document the edit workflow as a known v2 feature in the skill's own output, so users know it is coming.
- **Generated skills that look right but behave wrong.** A SKILL.md can have perfect structure and still produce bad output because the step logic is flawed. Without a test harness, there is no automated way to catch this. — Likelihood: M. Impact: H. Mitigation: include a "test your skill" checklist in the toolkit's post-generation output (manual verification steps the user should run).
- **Convention drift.** If the 25 shipped skills are not perfectly consistent today (VECTOR.md's Ship Criteria flags this as incomplete), the toolkit may learn and propagate inconsistencies. — Likelihood: M. Impact: M. Mitigation: run `/invest-doctrine` audit before shipping this skill. Block this skill's release on the Ship Criteria item "All 25 skills have consistent format."

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-19 | Zero Vector | Initial draft |
