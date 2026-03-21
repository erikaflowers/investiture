---
name: invest-metrics
description: "Generates a success metrics framework that maps doctrine goals to specific, trackable metrics with data source recommendations. Derives North Star, leading indicators, and guardrail metrics from VECTOR.md — not generic SaaS benchmarks. Use when defining what success looks like before building, or when a client asks how you will measure outcomes."
argument-hint: "[--tier north-star|leading|guardrail] [--dry-run]"
disable-model-invocation: true
---

# Investiture Skill: Metrics Framework

You are defining what success looks like before anyone writes a line of code. Projects without explicit success criteria drift — the team builds what feels right, the client measures something different, and six months in nobody agrees on whether the thing is working. This skill reads the project's own stated goals, audience, and value proposition and generates a measurement framework that is specific to THIS project, not a generic dashboard.

**This skill reads VECTOR.md as its primary source.** The quality of the framework depends directly on the quality of the doctrine. If VECTOR.md has a vague value proposition, the metrics will be vague. Flag this rather than inventing specificity that doesn't exist.

## Step 0: Determine Scope

- **No arguments:** Full three-tier metrics framework.
- **`--tier [north-star|leading|guardrail]`:** Generate only one tier.
- **`--dry-run`:** Generate and display without writing the file.

## Step 1: Read Doctrine

Read the following files:

1. **`VECTOR.md`** — Extract: problem statement (what pain exists), value proposition (what this project uniquely solves), target audience (who experiences the pain), quality gates (what "good" means to the operator), ship criteria (what must be true before shipping), constraints, project stage, JTBD (jobs to be done, if present).

2. **`/vector/research/jtbd/`** — If JTBD files exist, read them. Jobs map directly to success metrics — a completed job is a measurable outcome.

3. **`/vector/research/assumptions/`** — Read validated assumptions. Validated assumptions are claims about user behavior that have evidence — they become the basis for metric targets.

4. **`/vector/research/personas/`** — If persona files exist, read them. Different personas may have different success indicators.

If VECTOR.md is missing, stop: "Cannot generate metrics framework without VECTOR.md. The framework derives from your stated goals — run `/invest-backfill` or create VECTOR.md first."

## Step 2: Derive the North Star Metric

The North Star is the single metric that best captures whether the product is delivering on its core value proposition. It is NOT revenue (that's a business metric). It measures the value users receive.

**Process:**
1. Read the value proposition from VECTOR.md.
2. Identify the core user action that proves value was delivered. Example: if the value prop is "helps teams capture decisions before they become invisible," the core action might be "ADR created and referenced by a subsequent decision."
3. Express this as a measurable metric with a clear unit. Example: "Weekly active ADRs referenced in subsequent decisions."

**Constraints on the North Star:**
- Must be measurable with instrumentation the team can reasonably build
- Must reflect user value, not vanity (not page views, not signups)
- Must be a leading indicator of long-term success, not a lagging one
- Must be understandable by non-technical stakeholders

If the value proposition is too vague to derive a meaningful North Star, flag it:

```
VECTOR.md value proposition is too broad to derive a specific North Star metric.
Current: "[quoted value prop]"
Consider narrowing to: [2-3 specific alternatives that would be measurable]
```

## Step 3: Derive Leading Indicators

Leading indicators are metrics that predict whether the North Star will move. They are earlier in the user journey and more actionable.

**Derive from the user journey implied by VECTOR.md and JTBD:**

For each stage of the user's interaction with the product, identify what a healthy signal looks like:

1. **Activation** — What does a user do that signals they "got it"? Derive from the value proposition and any onboarding context in VECTOR.md.
2. **Engagement** — What repeated behavior signals ongoing value? Derive from JTBD — what jobs are they coming back to do?
3. **Retention** — What signals that users stick around? Derive from the problem statement — if the pain is recurring, returning users means the product is addressing it.
4. **Expansion** — What signals that value is growing? Derive from personas — are additional user types adopting, or are existing users going deeper?

For each leading indicator, specify:
- **What it measures** (specific action or state)
- **Why it matters** (linked to VECTOR.md goal or JTBD)
- **How to instrument** (what event to track, where in the code)
- **Target threshold** (based on validated assumptions if available, or industry-appropriate defaults with explicit caveat)
- **Review cadence** (daily / weekly / monthly)

If the project is in discovery or alpha stage, note which metrics cannot yet be measured and what must ship before they can be.

## Step 4: Derive Guardrail Metrics

Guardrails are metrics that must NOT get worse as the team optimizes the North Star and leading indicators. They prevent pathological optimization.

**Derive from VECTOR.md constraints and quality gates:**

- If VECTOR.md has performance constraints, derive performance guardrails (load time, response time, error rate).
- If VECTOR.md has accessibility requirements, derive accessibility guardrails (WCAG conformance level, automated scan pass rate).
- If VECTOR.md has reliability constraints, derive availability guardrails (uptime, error budget).
- If the product affects user data, derive data quality guardrails.

For each guardrail:
- **What it protects** (which constraint or quality gate from VECTOR.md)
- **Threshold** (the line that must not be crossed)
- **Alert condition** (when should someone be notified)

## Step 5: Produce the Framework

```markdown
# Metrics Framework

**Generated:** [today's date]
**Derived from:** VECTOR.md[, JTBD files][, validated assumptions][, personas]
**Project stage:** [from VECTOR.md]

## North Star Metric

**[Metric name]**

[1-2 sentences: what it measures and why it captures the core value proposition.]

- **Unit:** [what is counted]
- **Source:** [where to instrument — specific product surface or event]
- **Doctrine link:** VECTOR.md → [quoted value proposition or goal]
- **Target:** [threshold, with basis — validated assumption, industry benchmark, or "to be established after [milestone]"]
- **Review cadence:** [weekly / monthly]

## Leading Indicators

### Activation: [Metric name]
- **What it measures:** [specific user action]
- **Why it matters:** [link to VECTOR.md or JTBD]
- **How to instrument:** [specific event or state to track]
- **Target:** [threshold]
- **Review cadence:** [cadence]

### Engagement: [Metric name]
[Same structure]

### Retention: [Metric name]
[Same structure]

### Expansion: [Metric name]
[Same structure]

## Guardrail Metrics

### [Guardrail name]
- **Protects:** [VECTOR.md constraint or quality gate]
- **Threshold:** [the line]
- **Alert condition:** [when to notify]
- **Current baseline:** [if measurable now, or "not yet instrumented"]

[Repeat per guardrail]

## Instrumentation Readiness

| Metric | Instrumentable Now? | Blocker |
|--------|-------------------|---------|
| [metric] | Yes / No | [what needs to ship first, or "ready"] |

## Metrics Not Included (and Why)

[List 2-3 obvious metrics that were deliberately excluded and why. This shows the framework is intentional, not incomplete. Example: "Revenue — excluded because this framework measures user value, not business outcomes. Revenue is a business metric tracked separately."]
```

## Step 6: Output

**Print the full framework to the terminal AND save it to `/vector/metrics-framework.md`.**

Overwrite on each run — git has the history. Create `/vector/` if it does not exist.

**If `--dry-run` was passed:** Print to terminal only.

After writing, output:

```
Metrics framework written to /vector/metrics-framework.md

North Star: [metric name]
Leading indicators: [N]
Guardrails: [N]
Instrumentable now: [N of total]

Feeds into: invest-prd (PRDs reference success metrics), invest-retro (retros compare against targets), invest-status (status reports include metric trends), invest-contract (deliverables reference measurable outcomes).
```

## Arguments

- **No arguments:** Full three-tier framework
- **`--tier [north-star|leading|guardrail]`:** Generate only one tier
- **`--dry-run`:** Generate and display without writing

## Output

`/vector/metrics-framework.md`

## When to Run

- Before writing PRDs — success criteria should be defined before features
- At project kickoff — define what winning looks like before building
- When a client asks "how will we know this is working?"
- After major pivot — the old metrics may no longer apply
- After `invest-synthesize` updates validated assumptions — targets may need recalibration

## Principles

- **Derived, not generic.** Every metric traces to a specific claim in VECTOR.md or a specific JTBD. If it doesn't, it doesn't belong in the framework. "DAU" is not a metric — it's a vanity number. "Users who completed at least one [core action] in the past 7 days" is a metric.
- **Honest about gaps.** If the doctrine is too vague to derive meaningful metrics, say so. A framework with caveats is more useful than one with false precision.
- **Stage-appropriate.** A discovery-stage project cannot instrument engagement metrics. Acknowledge what can be measured now and what requires shipping first.
- **Guardrails are non-negotiable.** The whole point of guardrails is that they don't move. If the team wants to relax a guardrail, that's an ADR, not a metrics update.
- **The framework is a contract.** When you hand this to a client, you are saying "this is how we will measure whether the thing we build is working." Be precise enough that both sides can agree on whether a target was hit.
