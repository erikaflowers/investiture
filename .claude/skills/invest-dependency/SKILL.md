---
name: invest-dependency
description: "Scans the project's dependency tree and produces a risk-scored report covering licensing, maintenance health, security advisory status, and vendor concentration. Use before client deliverables, during onboarding audits, or when evaluating whether to add or remove a dependency."
argument-hint: "[--scope production|all] [--fix] [--dry-run]"
---

# Investiture Skill: Dependency Audit

You are checking the supply chain. Every dependency is a bet on someone else's maintenance, security practices, and licensing decisions. Most teams never audit this until something breaks — a CVE drops, a license conflict surfaces during legal review, or a critical package goes unmaintained. This skill reads the project's dependency manifests and produces a structured risk assessment that can be handed to a security reviewer, a compliance officer, or a client who asks "what are you building on top of?"

**This skill reads package manifests and lockfiles.** It supports any ecosystem — Node (package.json), Python (requirements.txt, pyproject.toml), Rust (Cargo.toml), Go (go.mod), Ruby (Gemfile), or others. It detects what's present and works with it.

## Step 0: Determine Scope

- **No arguments:** Audit all dependencies (production + development).
- **`--scope production`:** Audit only production/runtime dependencies. Skip devDependencies, dev extras, build-only deps.
- **`--scope all`:** Explicitly audit everything including dev, build, and optional.
- **`--fix`:** After auditing, suggest specific dependency updates for critical findings.
- **`--dry-run`:** Generate and display without writing.

## Step 1: Read Doctrine

1. **`ARCHITECTURE.md`** — Extract: declared stack, dependency policies (if any — e.g., "no heavy dependencies," "prefer stdlib," "no packages with fewer than X weekly downloads"), prohibited dependencies from "What Not to Do."
2. **`VECTOR.md`** — Extract: constraints that affect dependency choices (e.g., "must work offline" rules out cloud-only SDKs, "no external services" rules out API client libraries), target deployment environment.

## Step 2: Inventory Dependencies

Read the project's dependency manifests:

- **Node:** `package.json` (dependencies, devDependencies, peerDependencies), `package-lock.json` or `yarn.lock` or `pnpm-lock.yaml`
- **Python:** `requirements.txt`, `pyproject.toml`, `Pipfile`, `poetry.lock`
- **Rust:** `Cargo.toml`, `Cargo.lock`
- **Go:** `go.mod`, `go.sum`
- **Ruby:** `Gemfile`, `Gemfile.lock`

If multiple ecosystems are present, audit all of them.

For each dependency, record:
- **Name** and **version** (pinned or range)
- **Type** (production / dev / peer / optional)
- **Direct or transitive** (if lockfile is available)

If no dependency manifest is found, report: "No dependency manifests found (checked: package.json, requirements.txt, pyproject.toml, Cargo.toml, go.mod, Gemfile). If this project has no external dependencies, this audit is not applicable."

## Step 3: Assess Each Dependency

For each direct dependency (and critical transitive dependencies), assess the following dimensions:

### License Risk

Read the license field from the manifest or lockfile. Classify:

- **Permissive (low risk):** MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, Unlicense, CC0
- **Weak copyleft (medium risk):** LGPL-2.1, LGPL-3.0, MPL-2.0 — may require disclosure obligations
- **Strong copyleft (high risk):** GPL-2.0, GPL-3.0, AGPL-3.0 — may require source disclosure of the entire project
- **Unknown / No license (critical risk):** No declared license means no legal right to use

Flag any license that conflicts with the project's own license (if declared in VECTOR.md or package manifest).

### Maintenance Health

Assess from available signals. Not all signals are available without network access — assess what you can from the lockfile and manifest:

- **Version pinning:** Is the version pinned exactly, or using a wide range? Wide ranges increase risk of breaking changes.
- **Age of pinned version:** If the lockfile records the resolved version, is it recent or years old?
- **Major version:** Is the project on a pre-1.0 version? (Higher API instability risk.)

If you have access to the filesystem and can read `node_modules/[pkg]/package.json` or equivalent cached metadata, extract:
- Last publish date
- Number of maintainers
- Repository URL (is it archived?)

### Doctrine Compliance

Check each dependency against ARCHITECTURE.md and VECTOR.md rules:
- Does it violate any "no heavy dependencies" policy?
- Does it introduce a technology the stack declaration doesn't mention?
- Does it conflict with deployment constraints?
- Is it in the "What Not to Do" list?

### Vendor Concentration

Identify dependencies that share a single maintainer, organization, or funding source. If multiple critical-path dependencies all trace to one entity, that's concentration risk.

## Step 4: Produce the Report

```markdown
# Dependency Audit

**Generated:** [today's date]
**Scope:** [production / all]
**Ecosystems:** [Node / Python / Rust / etc.]
**Total dependencies:** [N direct, M transitive (if lockfile available)]

## Critical Findings

[Only if critical issues exist — unlicensed deps, known vulnerabilities, doctrine violations]

### [Finding title]
- **Package:** [name@version]
- **Issue:** [specific problem]
- **Risk:** [what happens if unaddressed]
- **Recommended action:** [specific fix]

## License Summary

| License | Count | Risk Level |
|---------|-------|-----------|
| MIT | N | Low |
| Apache-2.0 | N | Low |
| [etc.] | N | [level] |

**License conflicts:** [none / list specific conflicts]
**Unlicensed packages:** [none / list them — these are critical]

## Maintenance Concerns

| Package | Version | Concern | Severity |
|---------|---------|---------|----------|
| [name] | [ver] | [specific concern] | [level] |

## Doctrine Compliance

| Package | Violation | Doctrine Source |
|---------|----------|----------------|
| [name] | [what rule it breaks] | [ARCHITECTURE.md / VECTOR.md reference] |

[If no violations: "All dependencies comply with declared doctrine."]

## Vendor Concentration

| Entity | Packages | Risk |
|--------|----------|------|
| [org/maintainer] | [list] | [assessment] |

[If no concentration risk: "No single entity controls more than [N]% of the dependency tree."]

## Dependency Health Overview

| Health | Count | Packages |
|--------|-------|----------|
| Healthy | N | [summary] |
| Monitor | N | [summary] |
| At Risk | N | [summary] |
| Critical | N | [summary] |

## Recommendations

1. [Most important action — specific package, specific version, specific reason]
2. [Second most important]
3. [Third]
```

## Step 5: Auto-Fix (`--fix`)

Only when `--fix` is passed. Limited to safe operations:

**Eligible:**
- Suggest specific version bumps for packages with known issues
- Suggest replacements for unmaintained packages (only well-known alternatives)
- Generate the npm/pip/cargo commands to execute the updates

**Never auto-fix:**
- License changes (require legal judgment)
- Major version upgrades (require compatibility testing)
- Dependency removal (requires understanding of usage)

Show all proposed changes and wait for confirmation before executing any command.

## Step 6: Output

**Print the full report to the terminal AND save it to `/vector/audits/invest-dependency.md`.**

Overwrite on each run. Create `/vector/audits/` if it does not exist.

**If `--dry-run` was passed:** Print to terminal only.

After writing, output:

```
Dependency audit written to /vector/audits/invest-dependency.md

[N] direct dependencies, [M] transitive.
[N] critical findings, [N] license concerns, [N] maintenance concerns.

Feeds into: invest-risk (dependency risks populate the risk register), invest-compliance (license compliance for regulatory frameworks).
```

## Arguments

- **No arguments:** Full audit of all dependencies
- **`--scope [production|all]`:** Limit scope
- **`--fix`:** Suggest and execute safe dependency updates
- **`--dry-run`:** Generate and display without writing

## Output

`/vector/audits/invest-dependency.md`

## When to Run

- Before adding a new dependency — audit the current state first
- Before client deliverables — clients in regulated industries will ask about this
- During onboarding audits (`invest-backfill` → `invest-dependency`)
- After major dependency updates — verify the risk profile hasn't degraded
- Quarterly, as a hygiene check

## Principles

- **Every dependency is a liability until proven otherwise.** The default stance is skeptical. A dependency must justify its presence — it saves enough effort, is well-maintained, and has an acceptable license.
- **Lockfiles are truth.** If a lockfile exists, read it. It tells you exactly what is installed, not what the manifest says should be.
- **Doctrine compliance is not optional.** If ARCHITECTURE.md says "no heavy dependencies" and someone installed a 50MB package, that's a finding. The audit enforces what the team declared.
- **No network calls required.** This skill works entirely from local files. It does not query npm, PyPI, or any registry. It assesses what it can from the manifest, lockfile, and cached metadata. If network-dependent signals (download counts, GitHub stars) are unavailable, say so rather than guessing.
- **Specificity over alarm.** "3 packages have GPL licenses" is more useful than "YOUR SUPPLY CHAIN IS AT RISK." Name the packages, name the licenses, explain the actual implications.
