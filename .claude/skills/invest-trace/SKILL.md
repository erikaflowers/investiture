---
name: invest-trace
description: "Builds a requirements traceability matrix from user needs (VECTOR.md) through PRD features through architecture decisions through implementation. Shows which requirements have end-to-end coverage and which have gaps. Use at milestone boundaries, before client reviews, or when scope disputes arise."
argument-hint: "[--depth doctrine|prd|code] [--requirement id] [--dry-run]"
disable-model-invocation: true
---

# Investiture Skill: Requirements Traceability

You are proving that what was promised was built. Requirements traceability is the chain from "the user needs X" through "we designed X as feature Y" through "we decided to implement Y this way" through "here is the code that does it." When any link in the chain is missing, something was either lost in translation, built without justification, or justified without implementation. This skill maps the full chain and shows where it is complete and where it breaks.

**This is a capstone skill.** It reads from nearly every other Investiture output — doctrine, PRDs, ADRs, missions, code. The more skills have been run, the more complete the trace. It can run with only doctrine files, but the result will be thin.

## Step 0: Determine Scope

- **No arguments:** Full traceability matrix across all requirements in VECTOR.md.
- **`--depth [doctrine|prd|code]`:** Trace only to the specified depth. `doctrine` checks only whether requirements have doctrine coverage. `prd` checks doctrine + PRD. `code` checks the full chain (default).
- **`--requirement [id]`:** Trace a single requirement. The ID is the requirement's position in VECTOR.md or its label if labeled.
- **`--dry-run`:** Generate and display without writing.

## Step 1: Extract Requirements

Read **`VECTOR.md`** and extract every stated user need, job-to-be-done, quality gate, and ship criterion. Each one is a traceable requirement.

**From VECTOR.md, extract:**
- **Problem statement needs:** What pains or unmet needs does the problem statement describe?
- **JTBD:** If jobs-to-be-done are listed, each job is a requirement.
- **Quality gates:** Each quality gate is a requirement (e.g., "must load under 2 seconds").
- **Ship criteria:** Each ship criterion is a requirement.
- **Constraints that imply requirements:** e.g., "must work offline" implies offline capability is a requirement.

Assign each requirement a sequential ID: `REQ-001`, `REQ-002`, etc. If requirements are already labeled in VECTOR.md, preserve those labels.

**Also read `/vector/research/personas/`** if they exist — persona needs may surface additional requirements not explicitly in VECTOR.md.

## Step 2: Trace to Doctrine

For each requirement, check:

1. **Is it declared in VECTOR.md?** (It should be — that's where you extracted it. But check for requirements that appear ONLY in personas or JTBD files and are not in the main doctrine.)
2. **Is it reflected in ARCHITECTURE.md?** Does the architecture's structure, stack choices, or conventions account for this requirement? Example: if the requirement is "must work offline," does ARCHITECTURE.md declare an offline-first data strategy?
3. **Is it addressed by an ADR?** Check `/vector/decisions/` for ADRs that reference this requirement or the problem it addresses.

**Doctrine coverage status:**
- **Full:** Requirement appears in VECTOR.md AND is reflected in ARCHITECTURE.md or an ADR.
- **Partial:** Requirement appears in VECTOR.md but is not reflected in architecture or decisions.
- **Missing:** Requirement is implied (from personas, JTBD) but not declared in core doctrine.

## Step 3: Trace to PRD

If PRD files exist in `/vector/` (from `invest-prd`), check:

1. **Is the requirement represented as a feature or scope item in a PRD?** Read PRD files and match requirements to described features.
2. **Is it in-scope or out-of-scope?** If the PRD explicitly puts this requirement out of scope, note it — that's not a gap, it's a deliberate choice.

If scope files exist (from `invest-scope`), check which phase the requirement is assigned to.

**PRD coverage status:**
- **Covered:** Requirement maps to a specific PRD feature or scope item.
- **Out of scope:** PRD explicitly defers this requirement. Note to which phase if available.
- **Not found:** Requirement has no corresponding PRD entry.

## Step 4: Trace to Implementation

Scan the codebase for evidence that each requirement is implemented.

**How to find implementation evidence:**
- Search for filenames, function names, component names, or comments that reference the requirement's domain.
- Check `/vector/missions/` for task manifests (from `invest-crew`) that reference this requirement — they contain file paths and branch names.
- Use the architecture layer map from ARCHITECTURE.md to know where to look (e.g., a data requirement lives in the data layer).

**Implementation coverage status:**
- **Implemented:** Specific file(s) found that implement this requirement. Record file paths.
- **In progress:** A mission or branch exists but is not complete.
- **Not implemented:** No evidence of implementation found.

This is a heuristic scan — it cannot verify correctness, only presence. Note this limitation.

## Step 5: Trace to Verification

Check for test coverage or audit coverage of each requirement:

- **Test files:** Search for test files that reference the requirement's domain. Record file paths.
- **Audit findings:** Check `/vector/audits/` for audit results that verify this requirement (e.g., `invest-architecture` confirming offline capability, WCAG audit confirming accessibility).
- **Validation results:** Check `/vector/research/assumptions/` for validated assumptions tied to this requirement.

**Verification status:**
- **Verified:** Test, audit, or validation evidence exists.
- **Unverified:** Implemented but no test/audit coverage found.
- **N/A:** Not yet implemented, so verification is premature.

## Step 6: Produce the Matrix

```markdown
# Requirements Traceability Matrix

**Generated:** [today's date]
**Depth:** [doctrine / prd / code]
**Requirements source:** VECTOR.md[, personas][, JTBD files]
**Total requirements:** [N]

## Coverage Summary

| Trace Level | Covered | Partial | Gap | Out of Scope |
|-------------|---------|---------|-----|-------------|
| Doctrine | N (N%) | N | N | — |
| PRD | N (N%) | — | N | N |
| Implementation | N (N%) | N (in progress) | N | — |
| Verification | N (N%) | — | N | — |

**End-to-end coverage (doctrine → code → verified):** [N] of [N] requirements ([N]%)

## Full Matrix

| ID | Requirement | Doctrine | PRD | Implementation | Verification |
|----|------------|----------|-----|---------------|-------------|
| REQ-001 | [brief text] | [Full/Partial/Missing] | [Covered/Out of scope/Not found] | [Implemented: path/Partial/Not implemented] | [Verified: path/Unverified/N/A] |
| REQ-002 | [brief text] | ... | ... | ... | ... |

## Gaps Analysis

### Requirements with no implementation
[List requirements that have doctrine and/or PRD coverage but no code. These are the "designed but not built" items.]

- **REQ-[NNN]:** [requirement text] — Doctrine: [status], PRD: [status], Implementation: not found.

### Requirements with no PRD coverage
[List requirements from VECTOR.md that never made it into a PRD. These are the "declared but not planned" items — potential scope gaps.]

- **REQ-[NNN]:** [requirement text] — Present in VECTOR.md but not found in any PRD.

### Implemented without doctrine
[List code that appears to implement functionality not traced to any requirement. These are the "built but not justified" items — potential scope creep.]

[This section requires judgment. Only flag significant functionality, not utility code.]

### Unverified implementations
[List requirements that are implemented but have no test or audit coverage.]

- **REQ-[NNN]:** [requirement text] — Implemented in [path], no verification found.

## Recommendations

1. [Most critical gap — specific requirement, specific action needed]
2. [Second most critical]
3. [Third]

---

*Traceability scan is heuristic — it confirms presence of relevant code, not correctness. Implementation evidence is based on file/function name matching and mission manifests, not runtime verification.*
```

## Step 7: Output

**Print the full matrix to the terminal AND save it to `/vector/audits/invest-trace.md`.**

Overwrite on each run — git has the history. Create `/vector/audits/` if it does not exist.

**If `--dry-run` was passed:** Print to terminal only.

After writing, output:

```
Traceability matrix written to /vector/audits/invest-trace.md

Requirements: [N] total
End-to-end coverage: [N]% ([N] of [N])
Gaps: [N] not implemented, [N] not in PRD, [N] unverified.

Feeds into: invest-status (traceability summary in status reports), invest-contract (acceptance criteria reference traced requirements), invest-retro (trace drift between sprints).
```

## Arguments

- **No arguments:** Full traceability matrix to code depth
- **`--depth [doctrine|prd|code]`:** Limit trace depth
- **`--requirement [id]`:** Trace a single requirement in detail
- **`--dry-run`:** Generate and display without writing

## Output

`/vector/audits/invest-trace.md`

## When to Run

- At milestone boundaries — did we build what we said we would?
- Before client reviews — show the full chain from need to implementation
- When scope disputes arise — the matrix settles "was this in scope?"
- After major feature delivery — verify nothing was lost in translation
- During onboarding audits — how well does an existing codebase trace to its stated goals?

## Principles

- **The chain must be visible.** If a requirement exists in doctrine but not in code, that's a gap. If code exists that doesn't trace to a requirement, that's scope creep. Both are findings.
- **Out of scope is not a gap.** A requirement deliberately deferred in the PRD is not a failure — it's a decision. The matrix should distinguish between "we chose not to build this yet" and "we lost track of this."
- **Heuristic, not proof.** Code presence does not guarantee correctness. The matrix confirms that relevant code exists in relevant locations. Verification (tests, audits) is a separate trace level for a reason.
- **Requirements come from doctrine.** If it's not in VECTOR.md, it's not a requirement — it's a wish. The matrix grounds traceability in the project's own declared needs, not in someone's memory of what was discussed.
- **The matrix is a conversation tool.** When you hand this to a client and show "REQ-007 is declared, designed, and implemented but not verified," that's a concrete conversation about test coverage. When you show "REQ-012 is declared but not in any PRD," that's a concrete conversation about scope. The matrix makes conversations specific instead of vague.
