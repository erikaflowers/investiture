---
name: invest-proposal
description: "Generate a client-facing project proposal from doctrine, research, and audit findings. Produces executive summary, methodology, scope, phases, timeline, and investment sections. Use when a client engagement moves from conversation to formal proposal."
argument-hint: "[client-or-project-name, e.g. 'surge-health' or 'acme-migration'] [--dry-run]"
disable-model-invocation: true
---

# Investiture Skill: Project Proposal

You are writing the document that turns a conversation into a contract. A proposal is not a sales pitch — it is a structured commitment that says: here is your problem as we understand it, here is how we will solve it, here is what it will cost, and here is why we are the right team. When a client reads this document, they should be able to make a decision — yes, no, or "let's talk about section X." Ambiguity in a proposal is a future dispute.

**This skill is the bridge between research and engagement.** Everything Investiture has learned — through doctrine, audits, assumptions research, architecture analysis — gets distilled into a document that a non-technical executive can read and a technical lead can trust. The proposal sells outcomes, not activities.

## Step 0: Get the Client/Project Name

If a client or project name was passed as an argument, use it directly. This becomes the slug for the output file and the framing for the proposal.

If no argument was provided, prompt:

```
What client or project is this proposal for?
Provide a short name (used for the filename) and optionally a longer description.

Examples:
  "surge-health" — Surge Health platform modernization
  "acme-migration" — Acme Corp legacy system migration
  "greenfield-app" — Greenfield mobile app for [client]
```

## Step 1: Read Doctrine and Research

Read the following. The proposal is grounded in what the project and methodology already know — not invented from scratch.

1. **`VECTOR.md`** — Extract: product vision, problem statement, value proposition, target audience, constraints, design principles, personas, JTBD, quality gates, ship criteria, project stage. The proposal must align with the methodology's stated values and demonstrate how they apply to this client's problem.

2. **`ARCHITECTURE.md`** — Read for technical stack and architecture context. The proposal may reference technical approach at a high level, but the audience is decision-makers — translate architecture into capabilities and risk reduction.

3. **`/vector/research/assumptions/`** — Read validated and unvalidated assumptions. Validated assumptions become evidence in the proposal ("our research confirms..."). Unvalidated assumptions become discovery-phase work items.

4. **`/vector/audits/`** — Read any existing audit findings from `invest-architecture`, `invest-doctrine`, `invest-audit-external`, or other audit skills. If audits have been run against the client's existing system, these findings ground the "Understanding" and "Scope" sections.

5. **`/vector/decisions/`** — Read architecture decision records. ADRs that are relevant to the client's domain show that the methodology produces documented, reasoned decisions — not ad hoc choices.

6. **`/vector/research/personas/`** — If persona files exist, reference them to demonstrate audience understanding.

7. **`/vector/research/jtbd/`** — If JTBD files exist, reference them to ground the proposal in user needs, not feature lists.

If VECTOR.md is missing: "Cannot generate a proposal without VECTOR.md. The proposal derives from your methodology's doctrine. Run `/invest-backfill` or create VECTOR.md first."

## Step 2: Analyze and Frame

Before writing, think through the proposal framing:

**Client problem:** What is the client struggling with? Frame it in their language, not yours. If audit findings exist, use them as evidence.

**Why now:** What makes this urgent? Competitive pressure, technical debt reaching a tipping point, regulatory deadline, growth outpacing infrastructure?

**Methodology fit:** How does the Investiture approach — doctrine-first, evidence-based, assumption-validated — specifically address this client's risks? Generic methodology descriptions are worthless. Map the methodology to the client's pain.

**Evidence inventory:** What shipped projects can you reference as proof? (Clarion, Everbloom, Arroyo, Foghorn, etc.) Which ones are most relevant to this client's domain or technical challenges?

**Scope boundaries:** What should this engagement include? What should it explicitly exclude? Scope exclusions prevent the two most common consulting failures: scope creep and mismatched expectations.

## Step 3: Draft the Proposal

Write a complete proposal using this structure. The language must be accessible to a non-technical executive AND credible to a technical lead — no jargon without explanation, no hand-waving without evidence.

```markdown
# Project Proposal: [Client/Project Name]

**Prepared by:** [OPERATOR: your name or organization]
**Date:** [today's date]
**Version:** 1.0
**Status:** Draft

---

## Executive Summary

[2-3 paragraphs. The problem, why it matters, and what you propose — in that order.

Paragraph 1: State the client's problem in their terms. Demonstrate that you understand what they are facing and what is at stake. Reference specific findings from audits or research if available.

Paragraph 2: Introduce the proposed approach at the highest level. What will the engagement produce? What will the client have at the end that they do not have now?

Paragraph 3: Why this approach and this team. One sentence on methodology, one on track record, one on what makes this engagement low-risk for the client.]

---

## Understanding

[Demonstrate that you understand the client's world. This is the section that earns trust — if the client reads this and thinks "they get it," the rest of the proposal sells itself.

Reference their domain, their constraints, their audience. If audit findings exist, cite specific observations. If assumption research exists, reference what has been validated about their problem space.

Do NOT make this generic. A proposal that could be sent to any client with a find-and-replace on the company name is a proposal that gets filed and forgotten.

3-5 paragraphs. Each one should contain at least one specific reference to the client's situation, domain, or constraints.]

---

## Approach: Investiture Methodology

[Explain how you work — not as theory, but as practice. The client does not care about your methodology in the abstract. They care about how it reduces their risk and increases their confidence.

Structure this as:

**Doctrine-first development:** Every engagement starts with documented constraints, principles, and quality gates. Explain what this means practically — decisions are traceable, scope is explicit, nothing is assumed.

**Evidence-based scoping:** Assumptions are identified, categorized, and validated before they become commitments. Reference specific assumption-testing methods used in prior projects.

**Auditable architecture:** Architecture decisions are recorded as ADRs with context and consequences. The client gets not just a system but a documented rationale for every structural choice.

**Proof in practice:** Reference specific shipped projects where this methodology was used. Clarion (multi-agent orchestration), Everbloom (accessible reader application), Arroyo (proof-of-concept that closed a deal), Foghorn (notification infrastructure) — pick the ones most relevant to this client's problem. Be specific: "In Clarion, doctrine-first development caught a scope conflict in week 2 that would have been a month-3 rewrite."]

---

## Scope

### Included

[Bullet list of specific deliverables and capabilities. Each item should be concrete enough that both sides can agree on whether it was delivered.

Frame as outcomes: "A working authentication system integrated with [client's identity provider]" not "Auth development."

Each bullet should answer: what will exist at the end of this that does not exist now?]

- [Deliverable 1 — specific, verifiable]
- [Deliverable 2]
- [Deliverable 3]

### Excluded

[Bullet list of things that are deliberately NOT part of this engagement. This section is as important as "Included." Every item here prevents a future "but I thought..." conversation.

Each exclusion should include a brief reason: deferred to phase 2, out of domain, requires separate expertise, client responsibility, etc.]

- [Exclusion 1] — [reason]
- [Exclusion 2] — [reason]
- [Exclusion 3] — [reason]

### Assumptions

[What must be true for this scope to hold. If any of these assumptions are violated, scope and timeline may change. Making these explicit protects both sides.]

- [Assumption 1 — e.g., "Client will provide API access to existing system within 5 business days of engagement start"]
- [Assumption 2]

---

## Phases

[Break the engagement into phases. Each phase has a clear deliverable that the client can evaluate before the next phase begins. This structure reduces client risk — they are never more than one phase away from a decision point.

Typical structure: Discovery/Audit, Foundation, Build, Delivery. Adjust to fit the engagement.]

### Phase 1: Discovery & Audit

**Duration:** [estimate]
**Objective:** [what this phase produces]

- [Activity 1 and its deliverable]
- [Activity 2 and its deliverable]

**Gate:** [What must be true before moving to Phase 2. What the client reviews and approves.]

### Phase 2: Foundation

**Duration:** [estimate]
**Objective:** [what this phase produces]

- [Activity 1 and its deliverable]
- [Activity 2 and its deliverable]

**Gate:** [Phase exit criteria]

### Phase 3: Build

**Duration:** [estimate]
**Objective:** [what this phase produces]

- [Activity 1 and its deliverable]
- [Activity 2 and its deliverable]

**Gate:** [Phase exit criteria]

### Phase 4: Delivery & Handoff

**Duration:** [estimate]
**Objective:** [what this phase produces]

- [Activity 1 and its deliverable]
- [Activity 2 and its deliverable]

**Gate:** [Final acceptance criteria]

---

## Timeline

| Phase | Duration | Dependencies | Key Deliverable |
|-------|----------|-------------|-----------------|
| Discovery & Audit | [estimate] | [prerequisites] | [deliverable] |
| Foundation | [estimate] | [Phase 1 gate] | [deliverable] |
| Build | [estimate] | [Phase 2 gate] | [deliverable] |
| Delivery & Handoff | [estimate] | [Phase 3 gate] | [deliverable] |
| **Total** | **[estimate]** | | |

[Call out dependencies explicitly. If Phase 2 cannot start until the client approves Phase 1 deliverables, say so. If an external dependency (API access, data migration, third-party contract) affects timing, name it.]

---

## Investment

[Structure the pricing model. Leave actual amounts as [AMOUNT] placeholders — pricing is a business decision made by humans, not generated by a skill. The skill provides the structure.]

### Option A: Fixed Per Phase

| Phase | Investment |
|-------|-----------|
| Discovery & Audit | [AMOUNT] |
| Foundation | [AMOUNT] |
| Build | [AMOUNT] |
| Delivery & Handoff | [AMOUNT] |
| **Total** | **[AMOUNT]** |

[Fixed pricing provides budget certainty. Each phase is independently priced so the client can evaluate ROI at each gate.]

### Option B: Retainer

[AMOUNT] per [week/month] for [duration]. Includes [scope description]. Overages billed at [AMOUNT] per [unit].

[Retainer pricing provides flexibility for engagements where scope may evolve based on discovery findings.]

### Option C: Hybrid

Discovery & Audit at fixed [AMOUNT]. Subsequent phases at [AMOUNT] per [week/month] retainer based on Discovery findings.

[Hybrid pricing reduces risk for both sides — the client gets a fixed-cost discovery phase before committing to a larger engagement.]

[OPERATOR: Choose one option or present all three. Delete the others before sending to the client.]

### What's Included

- [List what the investment covers: hours, deliverables, communication cadence, revision rounds]

### What's Not Included

- [List what would be billed separately: travel, third-party licenses, infrastructure costs, out-of-scope requests]

---

## Risk & Mitigation

[Top 3-5 project risks and how the methodology addresses each. Be honest about risks — a proposal that claims zero risk is a proposal that is not taken seriously.]

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| [Risk 1 — e.g., "Existing system documentation is incomplete or inaccurate"] | [H/M/L] | [H/M/L] | [How the methodology handles this — e.g., "Discovery phase includes independent audit; we do not rely on existing documentation alone"] |
| [Risk 2] | [H/M/L] | [H/M/L] | [Mitigation] |
| [Risk 3] | [H/M/L] | [H/M/L] | [Mitigation] |

---

## Why Us

[This section is evidence, not marketing. Every claim must reference something specific.

Structure as:

**Methodology:** The Investiture framework is not a slide deck — it is a working system used to ship production software. [Reference specific doctrine artifacts, audit processes, or research methods that the client can inspect.]

**Track record:** [Reference specific shipped projects. For each one, state what it was, what challenge it addressed, and what the outcome was. Pick 2-4 projects most relevant to this client's domain.]

**Transparency:** [Reference the audit and reporting infrastructure. The client gets visibility into progress through status reports, risk registers, and milestone tracking — not just verbal updates in meetings.]

Do NOT write generic "we are passionate about technology" copy. If you cannot point to evidence, do not make the claim.]

---

## Next Steps

[Concrete actions. Not "let's schedule a call" — that is vague. What does the first week look like if they say yes?]

1. **[Action 1]** — [e.g., "Sign engagement letter and schedule kickoff for [suggested date range]"]
2. **[Action 2]** — [e.g., "Client provides access to existing system, documentation, and key stakeholder contacts"]
3. **[Action 3]** — [e.g., "Discovery & Audit phase begins — first deliverable (audit report) within [timeframe]"]
4. **[Action 4]** — [e.g., "Phase 1 gate review — client evaluates audit findings and approves Phase 2 scope"]

---

*Generated by Investiture `/invest-proposal`. Grounded in doctrine, research, and audit artifacts.*
```

## Step 4: Present for Confirmation

Output the drafted proposal to the terminal in full. Then ask:

```
Proposal drafted above.

Before writing:
- Does the Executive Summary accurately capture the client's problem?
- Is the scope (included AND excluded) correct?
- Are the phases structured appropriately for this engagement?
- Are there risks missing from the Risk & Mitigation table?
- Does the "Why Us" section reference the right projects?

Write to /vector/proposals/[client-name]-proposal.md? (yes/no/revise)
```

If the operator says "revise," ask what to change and redraft the affected sections.

## Step 5: Write the File

On confirmation, write to `/vector/proposals/[client-name]-proposal.md`.

**Slug:** Use the client/project name argument, lowercase and hyphenated.

Create `/vector/proposals/` if it does not exist.

After writing, output:

```
Proposal written to /vector/proposals/[client-name]-proposal.md

Sections: [N]
Scope items (included): [N]
Scope items (excluded): [N]
Phases: [N]
Risks identified: [N]
Investment options: [N]

Next steps:
- Review Investment section and replace [AMOUNT] placeholders with actual pricing
- Share with client stakeholder for review
- Run /invest-contract to generate deliverable manifest from scope
- Run /invest-risk to formalize the risk register for the engagement
```

## Arguments

- **No arguments:** Interactive — prompts for client/project name
- **`[client-or-project-name]`:** Uses the argument as the client name and file slug
- **`--dry-run`:** Generate and display without writing

## Output

`/vector/proposals/[client-name]-proposal.md`

## When to Run

- When a prospective client engagement moves from conversation to "send us a proposal"
- After running discovery audits (`invest-architecture`, `invest-doctrine`, `invest-audit-external`) — the proposal references their findings
- When scope needs to be formalized before a contract is signed
- At the start of a new consulting engagement — the proposal is the first commitment artifact

## Principles

- **Proposals sell outcomes, not activities.** "You will have a working authentication system" not "we will write authentication code." The client is buying a result, not a timelog. Every scope item, every phase deliverable, every success criterion should be framed as something the client will have that they do not have today.
- **The Investiture methodology IS the differentiator.** Every proposal should show how doctrine-first development reduces risk. Generic consulting proposals say "we follow best practices." This proposal says "here is our specific methodology, here is how it has been applied, and here are the artifacts it produces that give you visibility and control."
- **Reference real shipped projects as evidence.** Do not make generic claims about expertise. Clarion, Everbloom, Arroyo, Foghorn — these are real products built with this methodology. Reference the ones most relevant to the client's domain. Be specific about what was built and what challenge it addressed.
- **Scope exclusions are as important as inclusions.** They prevent the two most expensive consulting failures: scope creep and mismatched expectations. Every exclusion should include a reason so the client understands it is a deliberate boundary, not an oversight.
- **Investment section uses placeholders.** The skill generates structure — pricing models, what is included, what is not. Humans decide the numbers. Never generate specific dollar amounts.
- **Readable by a non-technical executive AND a technical lead.** No jargon without explanation. No architecture diagrams without context. The executive reads the Executive Summary and Scope. The technical lead reads Approach and Phases. Both read Risk and Investment. The document serves both audiences without compromising for either.
- **"Why Us" is evidence, not marketing.** Every claim in the "Why Us" section must point to something specific — a shipped project, a methodology artifact, a documented process. If you cannot cite evidence, do not make the claim. Clients who are serious about hiring will verify. Clients who are not serious will not read the proposal regardless.
- **Next Steps are concrete, not vague.** "Let's schedule a call to discuss" is not a next step — it is a delay. "Sign engagement letter by [date], kickoff on [date], first deliverable by [date]" is a next step. Make it easy for the client to say yes by showing them exactly what happens when they do.
