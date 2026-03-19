---
name: invest-compliance
description: "Maps doctrine declarations and architecture decisions to compliance requirements for a specified regulatory framework (HIPAA, SOC 2, WCAG, GDPR, etc.). Produces a coverage matrix showing what is addressed, what is implemented, and where the gaps are. Use when working with regulated industries, preparing for audits, or demonstrating governance maturity to clients."
argument-hint: "<framework: hipaa|soc2|wcag|gdpr|custom> [--dry-run]"
disable-model-invocation: true
---

# Investiture Skill: Compliance Mapping

You are connecting what the project has declared and built to what a regulatory framework requires. Compliance is not a separate workstream — it is a lens on the existing doctrine, architecture, and decisions. Projects that treat compliance as an afterthought scramble during audits. This skill makes compliance visible early by mapping the project's own artifacts to a framework's requirements, showing coverage and gaps in one structured document.

**This skill requires a framework argument.** It does not produce a generic compliance report. Each framework has specific requirements, and the mapping must be specific to match.

## Step 0: Get the Framework

If a framework was passed as an argument, use it. Supported frameworks:

- **`hipaa`** — Health Insurance Portability and Accountability Act. Relevant for any product that handles Protected Health Information (PHI).
- **`soc2`** — Service Organization Control 2 (Trust Services Criteria). Relevant for SaaS and cloud services.
- **`wcag`** — Web Content Accessibility Guidelines (2.1 AA as default). Relevant for any web-facing product.
- **`gdpr`** — General Data Protection Regulation. Relevant for any product serving EU users.
- **`custom`** — Prompts the operator to specify requirements manually.

If no argument was provided, prompt:

```
Which compliance framework are you mapping to?
  hipaa  — Health data (PHI) protection
  soc2   — Cloud service trust criteria
  wcag   — Web accessibility (2.1 AA)
  gdpr   — EU data protection
  custom — Provide your own requirements

Framework:
```

## Step 1: Load Framework Requirements

For each supported framework, use the canonical requirement set:

### HIPAA (Security Rule — Technical Safeguards)
Key requirement areas:
- Access controls (unique user identification, emergency access, automatic logoff, encryption)
- Audit controls (recording and examining activity in systems with PHI)
- Integrity controls (mechanisms to ensure PHI is not improperly altered/destroyed)
- Authentication (verification of person/entity seeking access)
- Transmission security (encryption of PHI in transit)
- Breach notification procedures
- Business Associate Agreements (if third-party services handle PHI)

### SOC 2 (Trust Services Criteria)
Key requirement areas:
- Security (CC6): Logical/physical access controls, system operations, change management
- Availability (A1): System availability commitments, disaster recovery, backups
- Processing integrity (PI1): Completeness, accuracy, timeliness of processing
- Confidentiality (C1): Data classification, encryption, access restrictions
- Privacy (P1-P8): Collection, use, retention, disclosure, access, quality, monitoring

### WCAG 2.1 AA
Key requirement areas:
- Perceivable: Text alternatives, time-based media, adaptable content, distinguishable (contrast, resize, audio)
- Operable: Keyboard accessible, enough time, no seizure triggers, navigable, input modalities
- Understandable: Readable, predictable, input assistance
- Robust: Compatible with assistive technologies, parseable markup

### GDPR
Key requirement areas:
- Lawful basis for processing (Art. 6)
- Consent management (Art. 7)
- Data subject rights (Art. 15-22: access, rectification, erasure, portability, objection)
- Data protection by design and default (Art. 25)
- Records of processing activities (Art. 30)
- Data breach notification (Art. 33-34)
- Data Protection Impact Assessment (Art. 35)
- International transfers (Art. 44-49)

### Custom
Prompt the operator to provide a list of requirements, one per line or as a file path to a requirements document.

## Step 2: Read Project Artifacts

Read the following to find evidence of compliance:

1. **`VECTOR.md`** — Constraints, target audience (determines which frameworks apply), quality gates, privacy-related declarations.

2. **`ARCHITECTURE.md`** — Data flow, storage decisions, authentication/authorization patterns, encryption declarations, service boundaries, deployment architecture.

3. **`/vector/decisions/`** — ADRs that address compliance-relevant decisions (encryption choices, auth architecture, data retention, access control patterns).

4. **`/vector/audits/`** — Architecture audit findings that relate to compliance (e.g., data handling violations, security findings).

5. **`/vector/risk-register.md`** — If exists, check for compliance-related risks already identified.

6. **Codebase scan (targeted):** For specific compliance checks, scan the codebase for evidence:
   - WCAG: Check for `alt` attributes, ARIA roles, semantic HTML, color contrast declarations, keyboard handlers
   - HIPAA/GDPR: Check for encryption patterns, auth middleware, logging of access, data deletion capabilities
   - SOC 2: Check for error handling, audit logging, access control enforcement

This is a targeted scan, not a full security audit. Flag what you find and what you cannot verify from code alone.

## Step 3: Build the Compliance Matrix

For each requirement in the framework, map it to project evidence:

**Coverage levels:**
- **Addressed in doctrine** — VECTOR.md or ARCHITECTURE.md declares a relevant constraint or decision, but implementation is not verified.
- **Implemented in code** — Evidence exists in the codebase (specific file paths, patterns found).
- **Verified by audit** — An Investiture audit has checked this area and it passed.
- **NOT ADDRESSED** — No doctrine, no code, no audit covers this requirement. This is a gap.
- **Partially addressed** — Some evidence exists but coverage is incomplete.

## Step 4: Produce the Mapping

```markdown
# Compliance Mapping: [Framework Name]

**Generated:** [today's date]
**Framework:** [full name and version]
**Project:** [from VECTOR.md or directory name]
**Project stage:** [from VECTOR.md]

## Coverage Summary

| Status | Count | % |
|--------|-------|---|
| Verified by audit | N | N% |
| Implemented in code | N | N% |
| Addressed in doctrine | N | N% |
| Partially addressed | N | N% |
| NOT ADDRESSED | N | N% |

**Overall compliance coverage:** [N]%
**Critical gaps:** [N]

---

## Requirement Matrix

### [Requirement Category 1]

| Requirement | Coverage | Evidence | Notes |
|-------------|----------|----------|-------|
| [Requirement text] | [status] | [file path, ADR ref, or doctrine quote] | [any caveat] |

### [Requirement Category 2]

[Same structure]

---

## Critical Gaps

[Requirements marked NOT ADDRESSED that are mandatory for the framework. Each gets a dedicated entry:]

### GAP: [Requirement]
- **Framework reference:** [article/section number]
- **Why it matters:** [consequence of non-compliance — fine, breach, exclusion from market]
- **Recommended action:** [specific step to address — ADR, implementation task, or doctrine update]
- **Effort estimate:** [low/medium/high]
- **Priority:** [must-have for compliance / should-have / nice-to-have]

---

## Partially Addressed

[Requirements with some evidence but incomplete coverage. What exists and what is missing.]

---

## Recommendations

[Prioritized list of actions to improve compliance coverage, ordered by: mandatory gaps first, then high-risk partial coverage, then nice-to-haves.]

1. [Action] — addresses [requirement], estimated effort [level]
2. [Action] — addresses [requirement], estimated effort [level]
3. [Action]

---

## Limitations

[What this mapping cannot verify:]
- This is a documentation and code-level assessment, not a penetration test or formal audit
- Runtime behavior (actual encryption in transit, actual access control enforcement) requires testing
- Third-party service compliance (cloud providers, payment processors) requires BAA/DPA review
- [Framework-specific limitations]

*This mapping supports compliance preparation but does not constitute legal compliance certification.*
```

## Step 5: Output

**Print the full mapping to the terminal AND save it to `/vector/compliance/[framework]-mapping-[date].md`.**

Use today's date in YYYY-MM-DD format. Do NOT overwrite prior mappings — compliance state changes over time and each snapshot has value. Create `/vector/compliance/` if it does not exist.

**If `--dry-run` was passed:** Print to terminal only.

After writing, output:

```
Compliance mapping written to /vector/compliance/[framework]-mapping-[date].md

Framework: [name]
Requirements assessed: [N]
Coverage: [N]% ([N] verified, [N] implemented, [N] doctrine-only)
Critical gaps: [N]

Feeds into: invest-risk (compliance gaps as risks), invest-proposal (compliance coverage in proposals), invest-contract (compliance requirements in deliverable manifests).
```

## Arguments

- **`<framework>`:** Required. One of: hipaa, soc2, wcag, gdpr, custom.
- **`--dry-run`:** Generate and display without writing.

## Output

`/vector/compliance/[framework]-mapping-[date].md`

## When to Run

- When starting work with a client in a regulated industry
- Before compliance audits or security reviews
- When a client asks "are we HIPAA compliant?" or "do we meet WCAG?"
- After major architecture changes that affect data handling or access control
- When evaluating whether to enter a new market or vertical

## Principles

- **Specificity, not theater.** Mapping "we use encryption" to a HIPAA requirement is not compliance — mapping "ARCHITECTURE.md declares TLS 1.3 for all API endpoints (ADR-007), implemented in middleware/tls.ts:14, verified by invest-architecture audit on [date]" is compliance evidence. Be specific or mark it as a gap.
- **Gaps are the deliverable.** The client doesn't hire ZV because everything is already compliant. They hire ZV because this mapping shows exactly where the gaps are and how to close them. Every gap is a work item. Every work item justifies the engagement.
- **Not a legal opinion.** This mapping is a technical assessment. It shows what the code and doctrine say. It does not certify compliance. Always include the limitations section. Always recommend legal review for the framework's mandatory requirements.
- **Framework-specific, not generic.** A HIPAA mapping and a WCAG mapping look completely different. Do not produce a generic "security checklist" — map to the actual requirements of the specified framework.
- **Evidence chains matter.** The strongest evidence is: doctrine declares it → code implements it → audit verified it. Single-source evidence (doctrine only, code only) is weaker and should be flagged as such.
