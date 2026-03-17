---
name: invest-validate
description: "Read /vector/research/assumptions/, prioritize unvalidated assumptions by risk, and generate a lightweight, stage-appropriate validation plan. Turns a list of untested hypotheses into an actionable sprint."
argument-hint: "[--assumption id] [--stage discovery|alpha|beta|launched] [--dry-run]"
---

# Investiture Skill: Validate Assumptions

You are making the invisible visible. Assumptions parked in `/vector/research/assumptions/` are debt — they feel harmless until one of them is wrong in production. This skill reads every unvalidated assumption, assesses its risk, and generates a concrete plan for testing the highest-risk ones first.

**This skill pairs with `/invest-synthesize`.** Run `/invest-validate` to build the plan. Run `/invest-synthesize` after you have data to update the assumption files with what you learned. If `/invest-synthesize` is not installed, update assumption files manually after validation sessions — the plan this skill generates is useful either way.

## Step 1: Read Context

Read the following to understand the project and its research state:

1. **`VECTOR.md`** — Extract: target audience (who to test with), project stage (what validation methods are appropriate), constraints (budget, access, timeline), design principles.
2. **`/vector/schemas/`** — If this directory contains an assumption schema file (e.g., `zv-assumption.json`), read it to understand the expected structure of assumption files.
3. **`/vector/research/assumptions/`** — Read all assumption files in this directory. Assumption files may be Markdown with YAML frontmatter, plain Markdown with structured headings, or JSON. Read whatever format is present and extract the fields below. If the format is inconsistent or fields are missing, work with what exists and note gaps in the plan.

   For each assumption, extract:
   - **ID** — filename (without extension) or declared identifier field
   - **Assumption text** — the belief being held
   - **Validation status** — `unvalidated`, `validated`, `invalidated`, or undeclared (treat undeclared as `unvalidated`)
   - **Risk level** — if declared, note it; otherwise you will assess it in Step 2
   - **Evidence** — any existing validation notes, interview quotes, or data references

If `VECTOR.md` is missing, flag it and proceed using only the assumptions files.

If `/vector/research/assumptions/` does not exist or is empty, report: "No assumptions found in `/vector/research/assumptions/`. Run `/invest-backfill` to initialize the research structure, or create assumption files manually." Stop.

**If `--assumption [id]` was passed:** Scope to only that assumption. Skip all others. If the specified ID is not found in `/vector/research/assumptions/`, report: "Assumption `[id]` not found in `/vector/research/assumptions/`. Available assumptions: [list all IDs found]." Stop.

**If `--stage [stage]` was passed:** Use the provided stage to select validation methods. Otherwise, read the project stage from VECTOR.md.

## Step 2: Classify Assumptions by Risk

For each unvalidated assumption, assess risk using two dimensions:

**Impact:** If this assumption is wrong, how badly does it affect the project?
- **High:** Wrong assumption invalidates the core value proposition, causes a wasted feature build, or requires architectural rework
- **Medium:** Wrong assumption requires adjusting approach, messaging, or a feature — significant but recoverable
- **Low:** Wrong assumption causes minor friction or requires small adjustments

**Confidence:** How much evidence exists that this assumption is correct?
- **Low confidence:** No evidence, pure hypothesis, or contradicted by similar products
- **Medium confidence:** Indirect evidence (analogous products, secondary research, team intuition with basis)
- **High confidence:** Direct evidence from this product or audience (prior research, usage data, user quotes)

**Risk score = Impact × (1 - Confidence):**
- High impact + low confidence = **Critical** — test immediately
- High impact + medium confidence = **High** — test this sprint
- Medium impact + low confidence = **High** — test this sprint
- High impact + high confidence = **Medium** — monitor, no active testing needed
- Medium impact + medium confidence = **Medium** — test when sprint capacity allows
- Low impact + any confidence = **Low** — test opportunistically

Produce a risk table:

```
| ID | Assumption | Impact | Confidence | Risk | Status |
|----|-----------|--------|-----------|------|--------|
| [id] | [brief text] | High/Med/Low | Low/Med/High | Critical/High/Med/Low | unvalidated |
```

Sort by risk descending. Validated and invalidated assumptions appear at the bottom for reference.

## Step 3: Select Stage-Appropriate Validation Methods

Choose validation methods based on the project stage. Different stages have different access to users, data, and resources.

### Discovery stage
The product does not yet exist or is a prototype. Users haven't seen it.
- **Appropriate:** Problem interviews ("Tell me about the last time you..."), Jobs-to-be-Done interviews, competitor usage observation, landing page smoke test, concierge test (manual simulation of the product)
- **Avoid:** A/B tests (no traffic), analytics (no product), feature-level usability testing (no feature)

### Alpha stage
Product exists but is limited to a small, known group. Data is sparse.
- **Appropriate:** Structured usability sessions (5 users), assumption validation interviews (show the product, ask targeted questions), qualitative surveys (open-ended), support channel analysis, direct observation sessions
- **Avoid:** Quantitative A/B tests (insufficient sample), statistical significance claims

### Beta stage
Product is available to a broader audience. Enough data to detect patterns.
- **Appropriate:** Analytics instrumentation + funnel analysis, quantitative surveys (targeted), A/B tests (if sufficient traffic), support ticket theme analysis, NPS with follow-up interviews, activation funnel analysis
- **Both:** Qualitative validation still valuable for "why" context behind quantitative signals

### Launched stage
Product is in full production with a real user base.
- **Appropriate:** All of the above, plus: cohort analysis, retention curve analysis, churn interviews, feature adoption tracking, customer advisory board sessions, longitudinal studies
- **Emphasis shifts:** More quantitative, but qualitative still needed to explain anomalies

## Step 4: Generate the Validation Plan

For each **Critical** and **High** risk assumption, write a specific validation task:

```
### [Risk Level]: [Assumption ID] — [Brief assumption text]

**Why this is risky:** [1 sentence — what goes wrong if the assumption is false]

**Validation method:** [Specific method from Step 3, appropriate to project stage]

**What to test:**
[Specific question or hypothesis to test. Not "validate the assumption" — the actual thing to probe.]
Example: "Does [target audience] currently struggle with [specific pain]? Ask: 'Walk me through the last time you had to [task].'"

**Minimum signal:**
[What result counts as validated? What counts as invalidated? Be specific.]
Example: "3 of 5 interview participants describe unprompted pain with [task] → validated. Fewer than 2 → invalidated. Mixed → partial, needs follow-up."

**Effort:** [Low / Medium / High]
- Low: Can be done in < 2 hours (analytics check, 1-2 quick interviews, survey question addition)
- Medium: Half-day effort (structured interview session, dedicated survey, analytics instrumentation)
- High: Multi-day effort (usability study, experiment build, significant data analysis)

**Who can validate this:** [User type, role, or data source needed — be specific]
Example: "Existing users who have completed at least one [action]" or "Anyone in target audience — no prior product exposure needed"
```

For **Medium** risk assumptions, write briefer entries:

```
### Medium: [ID] — [Brief text]
**Method:** [1-2 sentences — what to do and with whom]
**Signal:** [What counts as validated/invalidated]
```

For **Low** risk assumptions, list them grouped:

```
### Low risk — test opportunistically
- [ID]: [Brief text] — [One-sentence method when convenient]
```

## Step 5: Write the Sprint Summary

End the plan with a prioritized sprint view:

```
## Validation Sprint Summary

**Project stage:** [from VECTOR.md or --stage flag]
**Total assumptions:** [N]
**Unvalidated:** [N] | **Validated:** [N] | **Invalidated:** [N]

### This sprint (Critical + High risk)
[List assumption IDs and one-line validation task for each]

### Next sprint (Medium risk)
[List assumption IDs and one-line validation task for each]

### Defer (Low risk)
[Count and brief description]

### Estimated effort this sprint
[Sum of effort ratings — gives a rough sense of scope]
```

## Step 6: Output

**Print the full plan to the terminal AND save it to `/vector/research/assumptions/validation-plan-[date].md`.**

Use today's date in YYYY-MM-DD format for the filename. If a validation plan for today's date already exists, overwrite it — the current assessment is what matters, git has the history.

Create `/vector/research/assumptions/` if it does not exist.

**If `--dry-run` was passed:** Print the plan to the terminal only. Do not write the file.

After writing, output:

```
Validation plan written to /vector/research/assumptions/validation-plan-[date].md

[N] Critical, [N] High, [N] Medium, [N] Low risk assumptions.
Run /invest-synthesize after your validation sessions to update the assumption files.
(If /invest-synthesize is not installed, update assumption files manually.)
```

## Arguments

- **No arguments:** Full assumption audit + validation plan for all unvalidated assumptions
- **`--assumption [id]`:** Plan for one specific assumption only
- **`--stage [discovery|alpha|beta|launched]`:** Override project stage for method selection. Useful when VECTOR.md stage is out of date or when planning ahead.
- **`--dry-run`:** Generate and display the plan without writing the file

## Output

`/vector/research/assumptions/validation-plan-[date].md`

## When to Run

- At the start of a sprint, to decide what to test this cycle
- After `/invest-synthesize` updates assumptions — new data may change risk rankings
- Before major feature investment — validate the assumptions that justify it
- After a pivot — your assumption set just changed; reprioritize

## Principles

- **Risk, not order.** High-impact, low-confidence assumptions get tested first. Not the oldest ones, not the ones easiest to test.
- **Stage-appropriate methods.** A "run an A/B test" recommendation is useless in discovery. A "do 5 hallway tests" recommendation is useless when you have 50,000 users and a data team. Match the method to the moment.
- **Specific signals, not vague validation.** "Validated" means something specific happened. Define the threshold before you test, not after.
- **Invalidated is not failure.** A wrong assumption found cheaply is a win. Surface it. The goal is to find the wrong ones before building against them.
- **This skill surfaces the debt.** After running validation sessions, update assumption files with what you learned — `/invest-synthesize` can help if installed, or do it manually. The plan is only useful if the results come back.
