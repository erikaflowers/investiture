# PRD: npm Package Distribution for Investiture

**Author:** Zero Vector
**Date:** 2026-03-19
**Status:** Draft
**Version:** 1.0

---

## Problem

Installing Investiture today requires cloning a GitHub repository, understanding its directory structure, and manually copying skill files into the right locations. This friction contradicts the project's own doctrine: "The methodology should cost less time than the knowledge it produces" (VECTOR.md, Design Principle 3 — Capture over ceremony). A developer who hears about Investiture and wants to try it faces a multi-step setup process before they can run a single skill. This is especially painful for the primary audience — solo developers and small teams who want to move fast. If we do nothing, adoption stays limited to people willing to read a repo README and manually wire things up, which directly undermines the open question in VECTOR.md: "What is the minimum number of skills needed for a new adopter to get value?"

VECTOR.md's Key Assumption 4 states that the capture loop is the primary adoption driver for non-consulting users — but users cannot reach the capture loop if installation itself is a barrier. VECTOR.md also asks whether Investiture should ship a "getting started" path that sequences skills for new users. This feature is a prerequisite for that path.

## Audience

No formal persona research has been conducted (all persona files in `/vector/research/personas/` are empty). This is a risk — the audience description below is derived from VECTOR.md's Target Audience section, not validated research.

| Persona | Relevant Job | Current Pain |
|---------|-------------|-------------|
| Solo developer using Claude Code | Add structured methodology to an existing project without stopping to learn a framework | Must clone a repo, understand its layout, and manually copy files — high friction for an unproven tool |
| Small-team lead evaluating methodology tools | Get the team on a shared methodology quickly so everyone captures decisions consistently | Cannot point teammates at a one-line install command; onboarding requires repo familiarity |
| Consultant starting a new engagement | Scaffold a client project with Investiture artifacts (PRDs, proposals, contracts) in minutes | Must maintain a personal copy of the repo and manually sync when skills update |

## Proposed Solution

Users will install Investiture with a single terminal command (`npm install -g investiture` or `npx investiture`). After installation, they will have access to a CLI command (e.g., `invest-install`) that copies the skill files they need into their project's `.claude/skills/` directory and scaffolds the `/vector/` directory structure that skills depend on. The experience is: install once, run one command in any project, start using skills immediately. Users who want all skills get them all; users who want a subset can specify which ones. The `/vector/` scaffold includes the doctrine file templates (VECTOR.md, CLAUDE.md, ARCHITECTURE.md) so that skills have the context they need to operate from the first run.

When Investiture publishes updates to skills, users will be able to re-run the CLI to pull new or updated skills into existing projects without losing their project-specific doctrine files or `/vector/` content.

## Scope

### In Scope

- An npm package published to the public npm registry under the name `investiture` (or scoped as `@investiture/cli` if the unscoped name is unavailable)
- A CLI entry point (`invest-install`) that is available globally after installation
- The CLI copies all skill SKILL.md files from the package into the user's `.claude/skills/` directory, preserving the existing directory structure (one directory per skill)
- The CLI scaffolds the `/vector/` directory with the standard subdirectories (research, schemas, decisions, prds, captures, audits, missions, handoffs, changelog, briefs) if they do not already exist
- The CLI copies doctrine templates (VECTOR.md, CLAUDE.md, ARCHITECTURE.md) into the project root if they do not already exist — never overwrites existing files
- A `--skills` flag that allows installing a subset of skills by name (e.g., `invest-install --skills capture,prd,audit`)
- A `--update` flag that updates existing skill files to the latest version without touching doctrine files or `/vector/` content
- A `--list` flag that displays all available skills with their descriptions
- Clear terminal output confirming what was installed, what was skipped (because it already exists), and what to do next

### Out of Scope

- **A runtime or server component** — The package installs files and exits. No daemon, no watcher, no background process. This respects VECTOR.md's constraint: "No separate application, no server, no database."
- **Dependency installation for skills** — VECTOR.md states "No npm dependencies in skills." The package itself may have minimal CLI dependencies (e.g., a file-copy utility), but it must not introduce dependencies that skills require at runtime.
- **Automatic updates or version checking** — v2 consideration. The CLI is run manually; it does not phone home or auto-update.
- **A web interface or interactive wizard** — The CLI is non-interactive by default. It copies files and reports results. An interactive mode is a v2 consideration.
- **Publishing skills contributed by third parties** — The package ships only first-party Investiture skills. A plugin or community skill system is a separate feature.
- **Integration with package.json or project build systems** — Investiture skills are markdown files, not build artifacts. The CLI does not modify package.json, add scripts, or hook into build tools.

### Dependencies

- **npm registry account** — Zero Vector must control an npm account or organization to publish the package. Current status: not yet created.
- **Stable skill file structure** — The 25 skills must have a consistent directory and file naming convention before packaging. VECTOR.md's Ship Criteria require "All 25 skills have consistent format." If that criterion is not yet met, packaging ships inconsistency at scale.
- **VECTOR.md, CLAUDE.md, ARCHITECTURE.md templates finalized** — The scaffold copies these templates. They must be complete and usable per Ship Criteria: "VECTOR.md, CLAUDE.md, ARCHITECTURE.md templates are complete and usable."

## Success Criteria

| Criterion | Metric | Target | How to Measure |
|-----------|--------|--------|---------------|
| Installation completes without errors | Success rate on install + invest-install | 100% on macOS, Linux, and Windows (Node 18+) | Manual testing across platforms before publish; CI matrix if available |
| Time from zero to first skill run | Wall-clock time from `npm install` to running a skill | Under 2 minutes | Timed walkthrough by a person who has not used Investiture before |
| No overwrites of existing files | Doctrine files and `/vector/` content preserved on re-run | Zero overwrites of user-modified files | Automated test: create project with modified VECTOR.md, run install, verify VECTOR.md unchanged |
| Skill files match source repo | Installed skills are identical to the published versions | Byte-for-byte match | Diff check between installed files and source |
| Update path works cleanly | `invest-install --update` replaces skill files without touching doctrine | Skills updated, doctrine untouched | Automated test: modify a skill, run update, verify skill replaced and VECTOR.md preserved |

## Open Questions

1. **Package name availability** — Is `investiture` available on npm, or do we need a scoped package (`@investiture/cli`, `@zerovector/investiture`)? — Blocks: package.json configuration and all documentation referencing the install command. Ask: whoever controls the npm account (Zero Vector).

2. **Skill subset defaults** — Should `invest-install` with no flags install all 25 skills, or a recommended starter set? VECTOR.md's open question ("What is the minimum number of skills needed for a new adopter to get value?") is directly relevant here. — Blocks: default behavior of the CLI. Ask: Zero Vector / Erika Flowers.

3. **Where does the CLI source code live?** — Does the CLI live in the same repo as the skills (monorepo), or in a separate `investiture-cli` repo? A monorepo is simpler but means the repo has both markdown skills and JavaScript CLI code. — Blocks: repository structure and CI/CD setup. Ask: Zero Vector.

4. **How do we handle skill versioning?** — Skills are currently unversioned markdown files. The npm package has a version, but individual skills do not. If a user is on package v1.2 and runs `--update`, how do they know which skills changed? — Blocks: update UX and changelog communication. Ask: Zero Vector.

5. **Does the CLI need to handle non-Node projects?** — The target audience includes developers who may not have Node.js installed (e.g., Python, Rust, Go developers using Claude Code). Should there be a non-npm distribution path (e.g., a shell script, a Homebrew formula)? — Blocks: distribution strategy. Ask: Zero Vector.

## Assumptions & Risks

### Validated Assumptions

- The Claude Code skill format is sufficient to deliver the full methodology engine without a separate application. — Evidence: 25 skills shipped and functional (VECTOR.md, Key Assumption 2, status: validated).

### Unvalidated Assumptions

- **Developers in the target audience have Node.js and npm installed.** — Risk if wrong: the primary distribution channel is inaccessible to a meaningful portion of the audience (Python, Rust, Go developers using Claude Code). Recommend: survey or instrument to determine what percentage of Claude Code users have Node.js available.

- **A single `invest-install` command is sufficient for onboarding — users do not need a guided or interactive setup.** — Risk if wrong: users install skills but do not know which to run first, leading to confusion and abandonment. Recommend: usability test with 3-5 first-time users. Directly related to VECTOR.md's open question about a "getting started" path.

- **Users will accept a global npm install for a methodology tool.** — Risk if wrong: some developers avoid global installs for security or environment hygiene reasons. Recommend: support `npx investiture` as a no-install alternative.

- **Skill files are stable enough to distribute at package scale.** — Risk if wrong: frequent breaking changes to skills after users have installed them erodes trust. VECTOR.md Key Assumption 2 validates that skills work, but does not validate that they are stable across versions. Recommend: establish a skill stability policy before first publish.

### Key Risks

- **Constraint tension with "No npm dependencies in skills"** — VECTOR.md explicitly states skills have no npm dependencies. The CLI package itself will have dependencies (minimally: file system utilities, argument parsing). There is a risk of confusion — users may perceive Investiture as "requiring npm" when the doctrine says otherwise. — Likelihood: M. Impact: M. Mitigation: Documentation must clearly distinguish between the CLI (an npm package with dependencies) and the skills themselves (pure markdown, no dependencies). The CLI is a distribution mechanism, not a runtime requirement.

- **Packaging locks in directory structure prematurely** — Once users install via npm and their projects depend on specific paths (`.claude/skills/`, `/vector/`), changing the directory structure becomes a breaking change. The project is at "development" stage (VECTOR.md) — locking in structure this early could constrain future architecture decisions. — Likelihood: M. Impact: H. Mitigation: Document the directory structure as a contract in ARCHITECTURE.md before publishing. Accept that these paths become stable API once the package ships.

- **npm as sole distribution channel limits reach** — If significant portions of the Claude Code user base do not use Node.js, npm-only distribution misses them entirely. — Likelihood: M. Impact: H. Mitigation: Design the CLI so the core logic (copy files, scaffold directories) is trivially portable to a shell script or other distribution format. Do not over-invest in npm-specific features.

- **Maintenance burden** — Every skill update now requires a package publish. If the publish cadence falls behind the repo, users get stale skills from npm while the repo has newer versions. — Likelihood: H. Impact: M. Mitigation: Automate publishing via CI — on every tagged release, publish to npm. Do not require manual publish steps.

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-19 | Zero Vector | Initial draft |
