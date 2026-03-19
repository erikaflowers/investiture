---
name: invest-backfill
description: "Survey an existing codebase and generate Investiture doctrine files — VECTOR.md, CLAUDE.md, ARCHITECTURE.md — by combining Investiture defaults with patterns inferred from the project. Run this once on a project that does not yet have doctrine. Then run invest-doctrine to validate what was generated."
argument-hint: "[--dry-run] [--only vector|claude|architecture]"
---

# Investiture Skill: Backfill Doctrine

You are bootstrapping Investiture onto an existing project. The project already has code, structure, conventions, and possibly documentation — but it lacks the three doctrine files that the Investiture skill chain requires.

Your job: survey what exists, infer what you can, include Investiture defaults, and generate doctrine files that reflect reality. Not a blank template. Not a fantasy. The project as it actually is, with Investiture's philosophy layered in.

**This skill runs once.** After it runs, `/invest-doctrine` validates and `/invest-architecture` enforces.

## Step 0: Verify the Skill Chain is Installed

Before doing anything else, check that the full Investiture skill chain exists in this project:

```
.claude/skills/invest-backfill/SKILL.md      ← you are here
.claude/skills/invest-doctrine/SKILL.md      ← needed for validation after backfill
.claude/skills/invest-architecture/SKILL.md  ← needed for enforcement after backfill
```

The following v1.4 skills are optional but extend the chain with research, design, fleet, and release capabilities:

```
.claude/skills/invest-validate/SKILL.md      ← assumption risk prioritization + validation planning
.claude/skills/invest-synthesize/SKILL.md    ← research intake → doctrine patches
.claude/skills/invest-interview/SKILL.md     ← structured user research discussion guides
.claude/skills/invest-brief/SKILL.md         ← design briefs from research + doctrine
.claude/skills/invest-adr/SKILL.md           ← architecture decision records
.claude/skills/invest-crew/SKILL.md          ← multi-agent task decomposition
.claude/skills/invest-handoff/SKILL.md       ← role-specific onboarding docs
.claude/skills/invest-changelog/SKILL.md     ← user-facing release notes from git log
```

If `invest-doctrine` or `invest-architecture` are missing, warn the operator immediately:

```
The Investiture skill chain is incomplete. This project has invest-backfill but is missing:
- .claude/skills/invest-doctrine/SKILL.md
- .claude/skills/invest-architecture/SKILL.md

Backfill can generate doctrine files, but without the other skills you cannot
validate or enforce them. Copy the full skill chain from the Investiture scaffold:

  cp -r /path/to/investiture/.claude/skills/ your-project/.claude/skills/

Or see: https://github.com/erikaflowers/investiture — "Adopting Investiture"
```

Continue with backfill regardless — generating doctrine is useful even without the audit skills — but make sure the operator knows the chain is broken.

## Step 1: Check Existing Doctrine State

Before surveying anything, inventory what already exists at the project root:

| File | Check For |
|------|-----------|
| `VECTOR.md` | Exists? If so, is it filled in or still Investiture template placeholders? |
| `CLAUDE.md` | Exists? If so, is it filled in or still template placeholders? |
| `ARCHITECTURE.md` | Exists? If so, is it filled in or still template placeholders? |
| `/vector/` | Directory exists? |

A file is **PARTIAL** if it exists but contains Investiture template brackets (`[Write 2-3 sentences...]`, `[Your criteria]`, `YOUR PROJECT NAME`). These are files from a fresh Investiture clone that were never filled in.

**If all three files exist and are filled in:** Report "Doctrine already exists. Run `/invest-doctrine` to audit it." and stop.

**If `--only` was passed:** Skip files that already exist. Generate only the requested file.

**If some files exist:** Generate only the missing ones. Never overwrite an existing file.

## Step 2: Survey the Project

Read everything available to understand the project. Work from highest-signal to lowest-signal sources.

### 2a. Identity Signals — What the project IS

1. **README.md** — Read entirely. Extract: project name, description, purpose, audience, stated tech stack, contribution guidelines, project structure if documented, stated principles or philosophy.

2. **Package manifest** — Read the first one found:
   - JavaScript/TypeScript: `package.json`
   - Python: `pyproject.toml` or `requirements.txt` or `setup.py`
   - Rust: `Cargo.toml`
   - Go: `go.mod`
   - Ruby: `Gemfile`
   - PHP: `composer.json`

   Extract: project name, dependencies, scripts/commands, build tools, test framework.

3. **Existing documentation** — Read any `.md` files at the project root: CONTRIBUTING.md, CHANGELOG.md, any task/planning files. These reveal process, priorities, and maturity.

4. **License** — Note the license type. This informs constraints.

### 2b. Architecture Signals — How it is built

5. **Config files** — Read in order of informativeness:
   - Build: `vite.config.*`, `next.config.*`, `astro.config.*`, `webpack.config.*`, `rollup.config.*`, `tsconfig.json`
   - Deploy: `netlify.toml`, `vercel.json`, `Dockerfile`, `fly.toml`, `.github/workflows/*.yml`
   - Lint/format: `.eslintrc.*`, `.prettierrc`, `biome.json`
   - Framework: `tailwind.config.*`, `postcss.config.*`

6. **Directory structure** — List the top two levels of the project tree. Ignore: `node_modules/`, `.git/`, `dist/`, `build/`, `.next/`, `.cache/`, `__pycache__/`, `.venv/`, `target/`. Record every source directory and its file count.

7. **Entry points** — Identify and read the application entry point(s):
   - `src/main.jsx/tsx`, `src/index.js/ts`, `src/App.jsx/tsx`
   - `pages/_app.tsx`, `src/app/layout.tsx` (Next.js)
   - `app.py`, `api/main.py`, `server.js`
   - `index.html` at root or in `src/`

8. **Style architecture** — Determine the styling approach:
   - Look for: `tokens.css`, `variables.css`, `:root` CSS custom property blocks
   - Check for: Tailwind config, CSS modules (`.module.css`), styled-components/emotion imports
   - Check for: single monolith CSS file vs. component-scoped files
   - Read the first 100 lines of the main CSS file if one exists

9. **State management** — Scan imports across source files for:
   - Context/useReducer patterns, Context directories
   - Redux/Zustand/Jotai/Recoil/Pinia/Vuex imports
   - Custom store files

### 2c. Convention Signals — How code is written

10. **Naming conventions** — Sample 10-15 source filenames across the project. Determine dominant patterns:
    - PascalCase vs. camelCase vs. kebab-case vs. snake_case
    - File extensions (.jsx/.tsx/.js/.ts/.vue/.svelte/.py/.go/.rs)
    - Test file pattern: `*.test.*`, `*.spec.*`, `__tests__/`, `tests/`

11. **Import patterns** — Read 3-5 representative source files. Note:
    - Absolute vs. relative imports
    - Path aliases (`@/`, `~/`, `#/`)
    - Barrel exports (`index.js` re-exports)
    - Import grouping conventions

### 2d. Agent Signals — Embedded AI instructions

12. **Inline system prompts** — Scan for:
    - Variables named `SYSTEM_PROMPT`, `systemPrompt`, `system_prompt`, `SYSTEM_MESSAGE`
    - Large string literals containing instruction language ("You are...", "Your role is...", "RULES:", "BOUNDARIES:", "INSTRUCTIONS:")
    - AI SDK usage: `new Anthropic`, `new OpenAI`, `openai.chat.completions`, `anthropic.messages`
    - Any existing `.claude/` directory

    For each prompt found, record: file path, approximate length, what persona/voice it defines, whether it is function-specific or project-wide.

### 2e. Process Signals — How the project develops

13. **Git history** — Run `git log --oneline -20`. Infer:
    - Commit style (conventional commits, free-form, emoji-prefixed)
    - Activity (recent or dormant)
    - Solo or multi-author

14. **Git remotes and branches** — Run `git remote -v` and `git branch -a`. Note deployment branch, branching strategy.

## Step 3: Analyze and Classify

Take all signals from Step 2 and produce structured analysis.

### 3a. Stack Classification

Map the project to a technology profile:

| Layer | Technology | Source | Confidence |
|-------|-----------|--------|------------|
| Frontend | [framework + version] | [where you found it] | HIGH/MEDIUM/LOW |
| Build | [tool] | [config file] | HIGH/MEDIUM/LOW |
| Styling | [approach] | [evidence] | HIGH/MEDIUM/LOW |
| State | [library or pattern] | [evidence] | HIGH/MEDIUM/LOW |
| Backend | [framework or "serverless" or "none"] | [evidence] | HIGH/MEDIUM/LOW |
| Database | [if applicable] | [evidence] | HIGH/MEDIUM/LOW |
| Testing | [framework or "none detected"] | [evidence] | HIGH/MEDIUM/LOW |
| Deployment | [platform] | [config] | HIGH/MEDIUM/LOW |

**Confidence levels:**
- **HIGH** — Found in config file or package manifest. Unambiguous.
- **MEDIUM** — Inferred from code patterns. Likely correct but could be legacy or unused.
- **LOW** — Guessed from directory names or partial evidence. Needs operator confirmation.

### 3b. Layer Mapping

Map the project's actual directory structure to an architecture layer model.

**Rules:**
- Start with what EXISTS on disk, not with the Investiture four-layer default.
- Each top-level source directory is a candidate layer.
- If the project has clear separation already, describe it as-is.
- If the project is a monolith (everything in one directory), describe the sub-directory structure as implicit layers.
- **Never force a project into exactly four layers.** Three is fine. Seven is fine. Describe what is real.
- Note where the project's actual structure aligns with or diverges from the Investiture default pattern.

Produce a mapping table:

| Layer | Location | Contents | Investiture Analog |
|-------|----------|----------|-------------------|
| [descriptive name] | [path] | [what lives here] | [closest Investiture layer, or "no direct analog"] |

### 3c. Convention Extraction

From file samples, summarize observed conventions:
- **Naming:** What casing for what file types
- **Imports:** Absolute/relative, aliases, grouping
- **Styling:** CSS approach, class naming patterns (BEM, utility, custom prefix)
- **Testing:** Framework, file location, naming pattern — or "none detected"

### 3d. Inline Agent Inventory

For each embedded system prompt found:

| File | Purpose | Length | Scope |
|------|---------|--------|-------|
| [path] | [what it does] | [~chars] | Project-wide voice / Function-specific |

Prompts that define the PROJECT's voice or personality are CLAUDE.md candidates. Prompts that define a specific function's behavior stay where they are. Note both.

## Step 4: Present the Survey Report

Before writing any files, present findings to the operator. This is the confirmation gate.

```
## Backfill Survey — [Project Name]

**Project:** [name]
**Stage:** [inferred from git history and maturity]
**Doctrine status:** VECTOR.md [MISSING/EXISTS/PARTIAL] | CLAUDE.md [MISSING/EXISTS/PARTIAL] | ARCHITECTURE.md [MISSING/EXISTS/PARTIAL]

### Stack

| Layer | Technology | Confidence |
|-------|-----------|------------|
| ... | ... | ... |

### Architecture

| Layer | Location | Investiture Analog |
|-------|----------|-------------------|
| ... | ... | ... |

### Conventions

- **Naming:** [observed]
- **Imports:** [observed]
- **Styling:** [observed]
- **Testing:** [observed or "none detected"]
- **Commits:** [style from git log]

### Inline Agent Instructions

[List each with file path and scope, or "None found"]

### Generation Plan

For each missing file:
- **VECTOR.md** — Will include: [Investiture defaults] + [inferred content]. Operator input needed for: [list].
- **CLAUDE.md** — Will include: [Investiture defaults] + [inferred content]. Operator input needed for: [list].
- **ARCHITECTURE.md** — Will include: [inferred layers, stack, conventions, structure]. Operator input needed for: [list].

Proceed with generation?
```

**If `--dry-run` was passed, stop here.** The survey report is the output.

## Step 5: Generate Doctrine Files

Generate only MISSING files. For each, combine Investiture defaults with inferred content. Mark sections that need operator review with `[OPERATOR: ...]` prompts — these are more specific than generic Investiture template brackets because you have project context.

### 5a. Generate VECTOR.md

Use the Investiture VECTOR.md structure exactly.

**Frontmatter — fill from survey:**
- `project.name` — from package manifest or README
- `project.description` — from README first paragraph or package description
- `project.stage` — inferred: "development" if recent commits, "maintenance" if dormant, "discovery" if very early
- `project.started` — from first git commit date (`git log --reverse --format=%ai | head -1`)
- `project.repo` — from `git remote get-url origin`
- `owner.name` — from git log author if single-author, otherwise leave blank
- `knowledge.*` — use Investiture defaults (`./vector/research/`, etc.)

**Always include — Investiture defaults, verbatim from the Investiture VECTOR.md template:**
- The Core Relationship section (the contractor metaphor)
- The Seven Principles section (all seven, with non-negotiables)
- The "These are Investiture defaults" note

**Inferred content — fill from survey, flag confidence:**
- **Problem Statement** — Draft from README's description/purpose section. Wrap in: `[OPERATOR: Verify — inferred from README. "Your project..."]`
- **Target Audience** — Draft from README's audience/contribution section. Flag if inferred.
- **Core Value Proposition** — Draft from README. Always flag for review.
- **What This Is Not** — Leave as prompted bracket. Do not guess boundaries.

**Template content — specific prompts, not generic:**
- **Design Principles** — If README states principles or a philosophy, reference them: `[OPERATOR: Your README states principles including "[quoted principle]". Consider adapting these as design principles, or write new ones for the technical implementation.]` Otherwise, leave with standard Investiture brackets.
- **Constraints** — Fill what can be inferred: deployment platform, license type, serverless constraints, language requirements. Leave room for operator additions.
- **Quality Gates** — Leave as prompted brackets. These require human judgment.

**Research Status table:** Use Investiture default locations. They will point to directories that do not exist yet — that is expected (see Step 6).

### 5b. Generate CLAUDE.md

CLAUDE.md is an **onboarding briefing**, not a personality definition. It should be useful to any agent or human contributor who opens this project for the first time. It answers: "What do I need to know before I touch this code?"

Agent identity (name, pronouns, voice, persona) is optional — some operators define it here, some manage agent identities externally, some have multiple agents touching the same project. The generated CLAUDE.md should be functional without any personality section.

**Always include — these make the file useful on its own:**
- **Reading order:** VECTOR.md (project doctrine) → CLAUDE.md (this file) → ARCHITECTURE.md (technical spec)
- **Architecture reference:** "Read ARCHITECTURE.md and follow it." — the single technical authority
- **Stack summary:** The actual technologies in use, listed concisely so a new contributor knows what they're working with
- **Key context:** What a contributor needs to know that isn't obvious from the code — deployment model, content architecture, external services, anything that would cause someone to make a wrong assumption
- **What not to do:** The 2-3 most important prohibitions from ARCHITECTURE.md, surfaced here so they're seen early
- **Commit format:** `Co-Authored-By` template
- **Standup format:** Template for status reporting

**Inferred content:**
- `[project name]` — filled from package manifest
- **Stack summary** — list the actual stack detected: framework, build tool, styling approach, state management, backend, database
- **Key context** — anything notable from the survey: "All site content lives in `src/content/en.js` — do not put copy in components." "Serverless functions in `netlify/functions/` — no persistent server." Surface the non-obvious.

**Agent identity — optional, at the end:**

After the functional sections, include:

```
## Agent Identity (Optional)

[OPERATOR: If your agent has a defined persona (name, pronouns, voice,
working style), add it here. If your agents are managed externally,
or you want this file to serve any contributor regardless of whether
they are human or AI, the sections above are sufficient.]
```

**If inline agent prompts were found**, add a note:
```
[OPERATOR: Your project contains embedded agent instructions:
- [file path] — defines [what voice/persona]
Consider whether these should inform a persona definition here,
or remain function-specific.]
```

### 5c. Generate ARCHITECTURE.md

This is the most content-rich generated file. Almost everything is inferred.

**Always include — Investiture defaults:**
- Header with "Last Updated" set to today's date
- Opening line: "This file is the technical specification."
- Reference to VECTOR.md for philosophy
- "How to Add a Feature" section — adapted to the actual layer count and names
- "What Not to Do" section — adapted to the actual stack (see below)
- Flexible Preferences section
- Decisions section referencing `/vector/decisions/`

**Inferred content — the core of the file:**

- **Layer table** — From Step 3b layer mapping. Each layer gets: name, location, and rule (inferred from directory contents). Not forced into four layers.

- **Import Direction** — Inferred from actual import patterns observed in Step 2c. If pages import from components but not vice versa, document that. Format as the explicit directional diagram. If import direction is unclear, document what you observed and mark: `[OPERATOR: Verify these import rules reflect your intent.]`

- **Stack table** — From Step 3a. Each row: layer, technology, and "Why" (inferred from config context, or `[OPERATOR: Why this choice?]` if unknown).

- **Project Structure tree** — Built from ACTUAL disk state. Walk the filesystem and produce the annotated tree with layer annotations. This is not the Investiture default tree — it is this project's actual structure.

- **Naming conventions** — From Step 3c. Only declare conventions that were actually observed. Do not invent conventions for file types that do not exist in the project.

- **State Management** — Describe the actual approach. If Context, say Context. If Zustand, say Zustand. If Redux, say Redux. No judgment. Document reality.

- **Styling** — Describe the actual approach. CSS variables, Tailwind, CSS modules, styled-components, SCSS — whatever is in use.

- **API/Backend Pattern** — Describe how the project communicates with external services. REST endpoints, GraphQL, serverless functions, direct SDK calls. Document what exists.

- **Testing** — If a test framework exists, describe the convention (framework, file patterns, location). If none:
  ```
  Testing: None detected.
  [OPERATOR: If your project has a testing strategy, declare it here
  (framework, file patterns, coverage expectations) and invest-architecture
  will audit against it. If testing is outside your doctrine scope,
  omit this section — Investiture audits what you declare, not what you don't.]
  ```

- **Development Principles** — Infer higher-order architectural principles from the patterns observed during the survey. These are the *why* behind the conventions — the beliefs about how the codebase works that a contributor needs to understand for good judgment on edge cases.

  **How to infer principles:**
  - Look for patterns that appear across multiple signals (at least 2) — directory structure, import patterns, naming conventions, content organization
  - State each as a short declarative sentence with a one-line explanation
  - Mark all with `[OPERATOR: Verify — inferred from observed patterns.]` since these are interpretations, not facts

  **Examples of pattern → principle inference:**

  | Observed Pattern | Inferred Principle |
  |-----------------|-------------------|
  | All text lives as JS objects in `src/content/`, pages import and render them | **Content is data, not markup.** Pages render content; they don't contain it. |
  | Single CSS file with domain-scoped prefixes (`zv-`, `ovl-`) | **One stylesheet, scoped by domain.** CSS is centralized but namespaced by product area. |
  | Some pages bypass the shared layout component and manage their own body styles | **Standalone pages own their world.** Sub-brands break out of shared layout and control their full rendering context. |
  | VECTOR.md → CLAUDE.md → ARCHITECTURE.md reading order enforced | **Doctrine before code.** Read before you write. |

  **Rules:**
  - Only infer principles with clear evidence (2+ signals from the survey)
  - Keep to 3-6 principles. More than that and you're inventing, not inferring.
  - If the project has no clear architectural opinions (everything in one directory, no discernible patterns), skip this section entirely rather than fabricating principles

**"What Not to Do" adaptation:**

The Investiture default has five prohibitions. Adapt them to the actual stack:

- If CSS variables are used: include "no hardcoded colors outside the token file"
- If Tailwind is used: do NOT include the hardcoded colors rule
- If serverless functions exist: include "no API keys in client-side code"
- Universal: keep "files over 200 lines — split them"
- For each layer identified: add a prohibition that matches the layer boundary (e.g., "no data fetching in components — use [whatever the service layer is called]")

### What NOT to Generate

Do not generate content for sections where you have no signal. An honest `[OPERATOR: ...]` bracket is better than a confident-sounding guess. Specifically:

- Do not invent a project philosophy if the README doesn't state one
- Do not guess business constraints
- Do not fabricate audience descriptions
- Do not assign severity to architectural choices ("your state management is wrong")
- Do not recommend the project restructure to match Investiture defaults

## Step 6: Initialize the /vector Directory

The `/vector/` directory is the research artifact system — interviews, JTBD, personas, competitive analysis, assumptions, schemas, and architecture decision records. By default, backfill creates this structure so the doctrine files' references resolve immediately.

**If `/vector/` already exists:** Leave it as-is. Do not overwrite or restructure.

**If `/vector/` does not exist:** Create the following structure with `.gitkeep` files and a README:

```
/vector/
├── README.md
├── research/
│   ├── interviews/.gitkeep
│   ├── jtbd/.gitkeep
│   ├── personas/.gitkeep
│   ├── competitive/.gitkeep
│   └── assumptions/.gitkeep
├── schemas/.gitkeep
├── decisions/.gitkeep
├── audits/.gitkeep
├── missions/.gitkeep
├── handoffs/.gitkeep
├── changelog/.gitkeep
└── briefs/.gitkeep
```

**`/vector/README.md` contents:**

```markdown
# /vector — Knowledge Artifacts

This directory holds structured research and decision records for the project.
It is referenced by VECTOR.md and used by the Investiture skill chain.

## Structure

- **research/interviews/** — User interview transcripts, summaries, and discussion guides (`invest-interview`)
- **research/jtbd/** — Jobs to Be Done analysis
- **research/personas/** — User personas derived from research
- **research/competitive/** — Competitive analysis artifacts
- **research/assumptions/** — Documented assumptions with validation status and plans (`invest-validate`)
- **schemas/** — Zero-Vector schema definitions (zv-*.json)
- **decisions/** — Architecture Decision Records (`invest-adr`)
- **audits/** — Investiture skill chain audit reports (`invest-doctrine`, `invest-architecture`, `invest-synthesize`)
- **missions/** — Crew task manifests for multi-agent sprints (`invest-crew`)
- **handoffs/** — Role-specific onboarding snapshots (`invest-handoff`)
- **changelog/** — Versioned release notes (`invest-changelog`)
- **briefs/** — Design briefs from research and doctrine (`invest-brief`)

## Usage

These directories are empty until you begin structured research.
Fill them as you learn. The Investiture skill chain reads from these
locations — keeping artifacts here means your doctrine stays connected
to your evidence.
```

**If `--no-vector` is passed:** Skip directory creation. Write VECTOR.md with the standard `knowledge:` frontmatter pointing to `./vector/` paths and add a comment noting the directory does not exist yet:

```markdown
<!-- NOTE: The /vector directory was not created during backfill (--no-vector).
     Create it when you begin structured research, or run invest-backfill again
     without --no-vector to initialize the structure. -->
```

## Step 7: Post-Generation Summary

After writing files, **output the summary to the terminal AND save it to `/vector/audits/invest-backfill.md`.** Overwrite the file on each run. Create the `/vector/audits/` directory if it does not exist (it should have been created in Step 6, but handle the `--no-vector` case).

```
## Backfill Complete — [Project Name]

**Files generated:**
- VECTOR.md — [GENERATED / SKIPPED (already exists)]
- CLAUDE.md — [GENERATED / SKIPPED (already exists)]
- ARCHITECTURE.md — [GENERATED / SKIPPED (already exists)]

### Inferred (HIGH confidence)
- [List what was filled from project signals: stack, layers, naming, deployment, etc.]

### Needs Operator Review
- [List sections marked with [OPERATOR: ...] prompts, grouped by file]

### Inline Agent Instructions Found
- [List or "None found"]

### Next Steps
1. Run `/invest-doctrine` now — it will produce a punch list of every gap, placeholder, and `[OPERATOR: ...]` section that needs attention.
2. Fill in the gaps it flags. The audit tells you exactly which file and section to fix.
3. Run `/invest-doctrine` again to verify. When it returns SOUND, the chain is ready and `/invest-architecture` can run.
```

## Arguments

- **No arguments:** Full survey + generate all missing doctrine files
- **`--dry-run`:** Survey and report only. Write nothing. Use this to see what backfill would do before committing.
- **`--only vector`:** Generate only VECTOR.md (skip CLAUDE.md and ARCHITECTURE.md)
- **`--only claude`:** Generate only CLAUDE.md
- **`--only architecture`:** Generate only ARCHITECTURE.md
- **`--no-vector`:** Skip `/vector/` directory creation. Doctrine files still reference `/vector/` paths but the directory is not initialized.

## Edge Cases

**Monorepo:** If the project root contains `packages/`, `apps/`, or a `workspaces` field in package.json, report: "This appears to be a monorepo. Investiture doctrine is typically per-package. Consider running `/invest-backfill` in each package directory." Generate root-level doctrine only if the operator confirms.

**No README:** Fall back to package manifest description. If that is also empty, report: "No project description found. VECTOR.md identity sections will require manual writing." Generate what can be inferred from code alone.

**Python/Go/Rust projects:** Read the appropriate package manifest. Layer mapping looks for framework-specific patterns:
- Python: `app/`, `api/`, `models/`, `services/`, `tests/`, `templates/`
- Go: `cmd/`, `internal/`, `pkg/`, `api/`
- Rust: `src/`, `tests/`, `benches/`

**Next.js / Astro / SvelteKit:** Recognize framework-specific routing patterns. Do not force separation that the framework intentionally collocates (e.g., Next.js App Router colocates layouts, pages, and loading states).

**TypeScript vs. JavaScript:** Detect from `tsconfig.json` presence and file extensions. Naming conventions in ARCHITECTURE.md should use the extensions actually present (`.tsx` not `.jsx` if the project uses TypeScript).

**Very large projects:** Do not read every file. Sample. Read entry points, config files, and 5-10 representative source files. The directory walk is comprehensive but file reading is selective.

## Principles

- **Infer from reality, not from Investiture defaults.** The four-layer pattern is the scaffold default. If the project has seven directories, describe seven layers. If it has two, describe two. Reality wins.
- **Investiture defaults ship regardless.** The Seven Principles, Core Relationship, reading order, and structural conventions are framework opinion. They always go in. They are the value of adopting Investiture.
- **Flag confidence, not judgment.** Mark what you inferred vs. what needs operator input. Do not say "your project lacks testing." Say "Testing: None detected. [OPERATOR: Add testing framework and convention if applicable.]"
- **One pass, clean state.** This skill runs once. After it runs, `/invest-doctrine` should be runnable. If invest-doctrine returns SOUND on the first run, backfill did its job.
- **Embedded prompts are signals, not violations.** Inline system prompts in code are not wrong. They are context the operator has already written. Surface them. Do not demand extraction.
- **Never overwrite.** If a file exists, do not touch it — even if it is partial. Report its status and let the operator decide. The `--only` flag generates missing files, not replacements.
- **Specific prompts over generic brackets.** When a section needs operator input, write a prompt that uses what you learned: `[OPERATOR: Your README describes the audience as "designers and builders." Refine this for the doctrine.]` is better than `[Describe your primary user.]`
- **Doctrine scope is the operator's choice.** Investiture does not prescribe what should be in doctrine. It ensures what IS in doctrine is sound, consistent, and followed. If the operator's ARCHITECTURE.md says nothing about testing, invest-architecture does not flag missing tests. If the operator omits state management conventions, that is a valid choice, not a gap to fill.
