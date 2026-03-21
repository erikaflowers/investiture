---
name: invest-risk
description: "Generates a living risk register by scanning doctrine, assumptions, ADRs, and architecture audit findings. Classifies risks by category, severity, and likelihood, tracks mitigation status, and produces a burn-down summary. Use at sprint boundaries, before client reviews, or when project risk profile may have shifted."
argument-hint: "[--category technical|product|operational|market] [--dry-run]"
disable-model-invocation: true
---

# Investiture Skill: Risk Register

You are surfacing the things that could kill this project before they do. Risks that live in people's heads are invisible until they detonate. This skill reads the project's own doctrine and research artifacts — assumptions that haven't been validated, architecture violations that haven't been fixed, ADRs that accepted known tradeoffs — and compiles them into a structured, prioritized risk register that can be handed to a client, a board, or the team.

**This skill reads from multiple Investiture outputs.** It gets better the more skills have been run. If only doctrine files exist, it produces a useful but thinner register. If `invest-validate`, `invest-architecture`, and `invest-adr` have been run, the register is comprehensive.

## Step 0: Determine Scope

- **No arguments:** Full risk register across all categories.
- **`--category [type]`:** Scope to one risk category: `technical`, `product`, `operational`, or `market`.
- **`--dry-run`:** Generate and display the register without writing the file.

## Step 1: Read Sources

Read the following files. Each one contributes a different class of risk.

1. **`VECTOR.md`** — Extract: constraints (hard limits that create risk if violated), assumptions (beliefs that carry risk if wrong), project stage (earlier stages have more unknowns), target audience (who is harmed if risks materialize), open questions (acknowledged unknowns).

2. **`ARCHITECTURE.md`** — Extract: declared stack (vendor lock-in risks, maintenance risks), layer structure (coupling risks), "What Not to Do" section (known antipatterns the team is guarding against).

3. **`/vector/research/assumptions/`** — Read all assumption files. Every `unvalidated` assumption with high impact is a product risk. Every `invalidated` assumption that hasn't been acted on is a live risk.

4. **`/vector/audits/`** — Read the most recent `invest-architecture.md` and `invest-doctrine.md` audit reports. Every high-severity violation is a technical risk. Unresolved findings from prior audits are accumulating risk.

5. **`/vector/decisions/`** — Read all ADRs. Every ADR with negative consequences is a known, accepted risk. Every `proposed` ADR is an unresolved decision — itself a risk.

6. **`/vector/risk-register.md`** — If a prior risk register exists, read it. You will update it, not start from scratch. Preserve risks that are still open. Mark risks that have been resolved.

If any source is missing, note it and continue. A partial risk register is better than none.

## Step 2: Identify Risks

From each source, extract concrete risks. A risk is not a vague concern — it has a cause, a consequence, and a scope.

**From assumptions:** Each unvalidated high-impact assumption becomes a product risk. Format: "If [assumption] is wrong, then [consequence]."

**From architecture audits:** Each high-severity violation becomes a technical risk. Format: "Active [violation type] in [location] — risk of [consequence] if not resolved."

**From ADRs:** Each ADR's negative consequences section contains accepted risks. Format: "ADR-[NNN] accepted [tradeoff] — risk materializes if [trigger condition]."

**From doctrine gaps:** Missing or incomplete doctrine files are operational risks. Format: "[File] is [missing/incomplete] — risk of [consequence] for contributors."

**From constraints:** VECTOR.md constraints that are close to being violated (or already violated per audits) are risks. Format: "Constraint [X] under pressure from [Y] — breach would [consequence]."

**From open questions:** Acknowledged unknowns in VECTOR.md are risks until resolved. Format: "Open question: [question] — blocks [decision/progress] until answered."

Deduplicate. If the same risk appears from multiple sources, combine them into one entry and list all sources.

## Step 3: Classify Each Risk

For each risk, assign:

**Category:**
- **Technical** — Architecture, infrastructure, dependencies, performance, security
- **Product** — User needs, assumptions, market fit, feature gaps, UX
- **Operational** — Process, team, timeline, resource constraints, tooling
- **Market** — Competition, regulatory, audience shifts, pricing, positioning

**Severity:**
- **Critical** — Project viability threatened. Requires immediate action.
- **High** — Significant impact on delivery, quality, or user experience. Address this sprint.
- **Medium** — Manageable but should not be deferred indefinitely.
- **Low** — Minor impact. Monitor.

**Likelihood:**
- **High** — Evidence suggests this will happen without intervention.
- **Medium** — Plausible based on current trajectory.
- **Low** — Possible but not indicated by current evidence.

**Mitigation status:**
- **Open** — No action taken.
- **Mitigating** — Action in progress (reference the ADR, PR, or task).
- **Accepted** — Consciously accepted with no further action planned (must have rationale).
- **Resolved** — Risk eliminated. Include what resolved it.

## Step 4: Produce the Register

Write a structured risk register:

```markdown
# Risk Register

**Generated:** [today's date]
**Sources scanned:** [list which files/directories were read]
**Project stage:** [from VECTOR.md]

## Summary

| Severity | Open | Mitigating | Accepted | Resolved |
|----------|------|-----------|----------|----------|
| Critical | N | N | N | N |
| High | N | N | N | N |
| Medium | N | N | N | N |
| Low | N | N | N | N |

**Active risks:** [total open + mitigating]
**Risk trend:** [improving / stable / worsening — compare to prior register if one exists]

## Critical Risks

### RISK-[NNN]: [Risk title]
- **Category:** [technical/product/operational/market]
- **Severity:** Critical
- **Likelihood:** [high/medium/low]
- **Source:** [which file/artifact surfaced this]
- **Description:** [1-2 sentences — cause and consequence]
- **Mitigation status:** [open/mitigating/accepted]
- **Recommended action:** [specific next step]
- **Owner:** [OPERATOR: assign]

## High Risks

[Same structure per risk]

## Medium Risks

[Same structure, briefer — description and recommended action only]

## Low Risks

[List format — one line per risk]

## Resolved Since Last Register

[List risks that were in the prior register but are now resolved, with what resolved them]

## Risk Burn-Down

**Prior register:** [date, or "none — first register"]
**Risks opened since last:** [N]
**Risks resolved since last:** [N]
**Net change:** [+/-N]
```

Number risks sequentially starting from RISK-001. If updating an existing register, preserve existing numbers for open risks and append new ones.

## Step 5: Output

**Print the full register to the terminal AND save it to `/vector/risk-register.md`.**

Overwrite on each run — the current assessment is what matters, git has the history. Create `/vector/` if it does not exist.

**If `--dry-run` was passed:** Print to terminal only. Do not write the file.

After writing, output:

```
Risk register written to /vector/risk-register.md

[N] Critical, [N] High, [N] Medium, [N] Low risks.
[N] open, [N] mitigating, [N] accepted, [N] resolved.

Feeds into: invest-proposal (risk-aware proposals), invest-status (risk section in status reports), invest-compliance (compliance gaps as risks).
```

## Arguments

- **No arguments:** Full risk register across all categories
- **`--category [technical|product|operational|market]`:** Scope to one risk category
- **`--dry-run`:** Generate and display without writing

## Output

`/vector/risk-register.md`

## When to Run

- At sprint boundaries — risk profile shifts as work progresses
- Before client reviews or deliverable milestones
- After `invest-validate` updates assumptions — invalidated assumptions change the risk picture
- After `invest-architecture` finds new violations
- When the team senses something is off but can't name it

## Principles

- **Risks are specific.** "Technical debt" is not a risk. "450-line PaymentProcessor with no test coverage handling Stripe webhooks" is a risk. Name the file, name the consequence.
- **Sources, not opinions.** Every risk traces to a doctrine file, an audit finding, an assumption, or an ADR. If you cannot point to a source, it is a concern, not a risk — flag it separately.
- **Accepted is a valid status.** Not every risk needs mitigation. But accepted risks need rationale — "we accept this because [reason]" is required.
- **The register is alive.** This is not a one-time document. It improves every time it runs because more Investiture skills have produced more artifacts to scan. The first run is thin. The tenth run is comprehensive.
- **Burn-down matters.** Clients and stakeholders want to see that risk count goes down over time. The trend line is as important as the current count.
