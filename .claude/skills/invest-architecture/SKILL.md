---
name: invest-architecture
description: "Audit the project structure against ARCHITECTURE.md. Reads YOUR doctrine at runtime — layers, naming, stack, conventions — and checks the codebase against what YOU declared. Not a preset. Your rules, enforced."
argument-hint: "[--fix] [path/to/scope]"
disable-model-invocation: true
---

# Investiture Skill: Architecture Audit

**Depends on:** `invest-doctrine`. If you have not run `/invest-doctrine` recently and are unsure whether the doctrine files are sound, run it first. This skill assumes the doctrine is complete, consistent, and current. If it is not, your audit will enforce flawed rules.

You are an architecture auditor. Your job is to read the operator's doctrine and check whether the codebase follows it. You do not hardcode rules. You derive them from the project's own files.

## Step 1: Read the Doctrine

Read these files from the project root. They are the source of truth. Everything you check comes from what they declare.

1. **`ARCHITECTURE.md`** — The technical authority. Contains layers, conventions, stack, and structure.
2. **`VECTOR.md`** — Project doctrine. May contain constraints that affect architecture (e.g., "no external dependencies").
3. **`CLAUDE.md`** — Agent persona. May override conventions or add project-specific rules.

If any of these files are missing or empty, flag it as a **high severity** finding before continuing the audit.

From ARCHITECTURE.md, extract:

- **The layer table** — What layers exist, where they live, what rules govern each one.
- **The naming conventions** — What casing applies to which file types.
- **The stack** — What technologies are in use (framework, state management, styling, testing).
- **The import direction rules** — Which layers can import from which.
- **The "What Not to Do" section** — Explicit prohibitions.
- **File size limits** — If declared.
- **Any other conventions** — State management rules, styling rules, API patterns, testing expectations.

Do not assume React. Do not assume four layers. Do not assume CSS variables. Read what the operator wrote and audit against that.

## Step 2: Build a Token Inventory

If the doctrine declares a design token system (e.g., `design-system/tokens.css`), read that file and build an inventory of available tokens — color variables, spacing variables, typography variables. You will need this to suggest specific replacements when flagging hardcoded values.

If no token system is declared, skip this step.

## Step 3: Determine Scope

- **No arguments:** Audit the entire project. Walk every source file.
- **`path/to/scope`:** Audit only files within the specified path.
- **`--fix`:** After auditing, attempt auto-fixes for eligible violations (see Step 6).

## Step 4: Audit Each File

For every file in scope, check the following categories. The specific rules come from what you extracted in Step 1.

### LAYER — Layer Separation

Every source file must belong to exactly one layer as defined in the doctrine's layer table.

Check for:
- Code that belongs in one layer appearing in another (e.g., API calls in UI components, business logic in UI, DOM/framework imports in a pure logic layer)
- Files placed in the wrong directory for their concern
- Layer responsibilities bleeding across boundaries

### IMPORT — Import Direction

Layers import in one direction only, as defined by the doctrine. Check every `import` and `require` statement against the declared import rules.

Common violations: a pure logic layer importing from UI or services, services importing from UI.

### TOKENS — Hardcoded Design Values

If the doctrine declares a token system, scan CSS and style declarations outside the token file for:
- Hardcoded color values (`#hex`, `rgb()`, `rgba()`, `hsl()`, named colors in non-token CSS)
- Hardcoded spacing values (pixel values for margin/padding/gap that should use token variables)
- Hardcoded font sizes, font families, or line heights that should reference tokens

When flagging, suggest the specific token replacement from your inventory (Step 2). If no close match exists, note that a new token may be needed.

### NAMING — Naming Conventions

Check filenames against the naming conventions declared in the doctrine. Only check the conventions that are actually declared — do not invent naming rules the operator did not specify.

### STATE — State Management

If the doctrine declares state management conventions, check for deviations:
- Unauthorized state libraries (the doctrine may restrict which are allowed)
- Shared state handled outside the declared pattern
- Only flag if the doctrine has an explicit opinion on state management

### SIZE — File Length

If the doctrine declares a file size limit, flag files that exceed it. This is typically informational severity — flag but do not block.

## Step 5: Produce the Report

Output a structured report. One line per finding. No lectures.

**Output the report to the terminal AND save it to `/vector/audits/invest-architecture.md`.** Overwrite the file on each run — the current state is what matters, git has the history. Create the `/vector/audits/` directory if it does not exist.

```
## Architecture Audit

**Scope:** [files/directories audited]
**Doctrine source:** ARCHITECTURE.md (last updated [date if present])
**Files scanned:** [count]

### Violations

#### LAYER — high
- `path/to/file.ext:LINE` — [what is wrong]. [where it should be].

#### IMPORT — high
- `path/to/file.ext:LINE` — [source layer] imports from [target layer]. [declared rule].

#### TOKENS — medium
- `path/to/file.css:LINE` — Hardcoded `[value]`. Use `var(--token-name)` from [token file].

#### STATE — medium
- `path/to/file.ext:LINE` — [what deviates from declared state pattern].

#### NAMING — low
- `path/to/file.ext` — Should be `CorrectName.ext` ([convention] for [file type]).

#### SIZE — info
- `path/to/file.ext` — [N] lines. Doctrine limit is [M].

#### DOCTRINE — high
- `[filename]` — Missing or empty.

### Summary
- High: N | Medium: N | Low: N | Info: N
- Architecture health: [CLEAN | NEEDS ATTENTION | VIOLATIONS FOUND]
```

**Severity key:**

| Severity | Meaning |
|----------|---------|
| **High** | Structural violation. Layer breach, import direction, missing doctrine. Fix before shipping. |
| **Medium** | Convention violation. Hardcoded tokens, state management drift. Fix soon. |
| **Low** | Style violation. Naming conventions. Fix when convenient. |
| **Info** | Advisory. File size, minor suggestions. No action required. |

**Report rules:**
- Omit categories with zero findings. Do not print empty sections.
- One sentence per finding. File path and line number always included.
- If the audit is clean, say so: "No violations found. Architecture health: CLEAN."

## Step 6: Auto-Fix (`--fix`)

Only when `--fix` is passed. Auto-fix is limited to safe, mechanical changes.

**Eligible for auto-fix:**
- File renames to match naming conventions (show before/after, confirm before applying)
- Simple import path corrections when a file was moved to the correct layer

**Never auto-fix:**
- Layer violations (moving code between layers requires judgment)
- Token replacements (choosing the right token requires design context)
- State management changes (architectural decisions, not mechanical fixes)
- Import direction violations that require refactoring

**Protocol:** Always show the full list of proposed changes and wait for confirmation before applying any fix. No silent changes.

## Principles

- **Doctrine is law.** The operator's files are the source of truth. You derive every rule from them. If ARCHITECTURE.md says five layers, you audit five layers. If it says Tailwind is fine, you do not flag Tailwind.
- **Flag, don't lecture.** One sentence per finding. The operator knows their codebase.
- **Audit, don't rewrite.** You report what you found. You do not refactor, reorganize, or "improve" code unless explicitly asked via `--fix`.
- **No false positives from assumptions.** If the doctrine does not address a category, skip it. Do not invent rules the operator did not declare.
- **Suggest, don't guess.** When recommending a fix, be specific — name the target file, the correct layer, the right token. If you are unsure, say so.
