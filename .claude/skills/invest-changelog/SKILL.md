---
name: invest-changelog
description: "Read git log since the last tag and VECTOR.md value prop, group commits by user-facing theme, filter out internal noise, and write a plain-language changelog keyed to what users can actually do now. Turns git history into release communication."
argument-hint: "[--since tag|commit] [--version x.y.z] [--dry-run]"
---

# Investiture Skill: Write Changelog

You are translating engineering history into user communication. `git log` tells you what changed in the code. VECTOR.md tells you what matters to the people using it. This skill bridges the two — reading both, filtering ruthlessly, and writing in plain language that describes outcomes, not implementation.

**This skill runs at release time.** It depends on a readable git history and a filled-in VECTOR.md. The richer the VECTOR.md value proposition and audience description, the more accurately the changelog can frame changes in terms users care about.

## Step 1: Read Doctrine

Read the following before touching git:

1. **`VECTOR.md`** — Extract:
   - **Value proposition** — the core outcome the product delivers. This is the lens for deciding what is "user-facing."
   - **Target audience** — who reads this changelog. A changelog for developers reads differently than one for end users.
   - **Design principles** — informs voice and framing
   - **Project stage** — a discovery-stage project may not have formal releases; note this if VECTOR.md stage is "discovery"

If VECTOR.md is missing or its value prop is a template placeholder, flag it: "VECTOR.md value prop is not filled in — changelog will use plain commit grouping without audience framing." Continue.

## Step 2: Determine the Commit Range

**If `--since [tag|commit]` was passed:** Use that as the start of the range. End at HEAD.

**If no `--since` argument was passed:** Find the most recent git tag.
- Run: `git tag --sort=-creatordate | head -1`
- If a tag exists, use it as the range start. End at HEAD.
- If no tags exist, use all commits: run `git log --oneline` without a range restriction.

Run `git log [range]..HEAD --oneline` (or `git log --oneline` if no range) to confirm the scope and show the commit count. Report to the terminal: "Reading [N] commits since [tag/commit]."

**If the range is empty (no commits since last tag):** Report: "No commits found since [tag]. Nothing to changelog." Stop.

## Step 3: Read the Full Commit Log

Run: `git log [range]..HEAD --format="%H %s" --no-merges`

For each commit, extract:
- **Hash** (first 7 characters)
- **Subject line** (the commit message summary)
- **Body** if present: `git show [hash] --format="%b" --no-patch`

Build a working list of all commits. You will filter and group them in Steps 4 and 5.

## Step 4: Filter — Drop Internal Noise

Remove commits from the working list that are not user-visible. A user cannot see these changes — they are internal to how the project is built or maintained.

**Drop unconditionally:**
- Dependency bumps with no behavior change: `bump`, `upgrade`, `update [package]`, version number changes in lock files
- Build system changes: `ci:`, `build:`, `chore:`, changes to `.github/`, `Makefile`, `Dockerfile`, `package.json` scripts only
- Documentation changes that are not user-facing: `docs:`, README updates, inline comment changes, type annotation-only changes
- Formatting and linting: `style:`, `lint:`, `fmt:`, whitespace-only commits
- Internal refactors with no behavior change: `refactor:` where the subject says "no behavior change" or "internal"
- Test-only changes: `test:`, `spec:`, changes to `*.test.*`, `*.spec.*`, `__tests__/`

**Keep these even if they look internal:**
- Dependency bumps that fix a user-visible bug (e.g., "bump X to fix Y crash" — the crash fix is user-facing)
- Refactors that change performance users can observe
- Documentation changes that are part of the product (help text, UI copy, onboarding content)

**Ambiguous commits:** If the subject line is unclear, check the commit body for context. If still ambiguous, keep it — it's better to include something borderline than to drop a real user change.

After filtering, report: "Kept [N] of [total] commits as user-facing."

## Step 5: Group by User-Facing Theme

Do not group by file, layer, or conventional commit prefix. Group by what changed for the user.

**Canonical groups (use these if they fit; not all will apply to every release):**

| Group | What belongs here |
|-------|-------------------|
| **New** | Net-new capabilities the user did not have before |
| **Improved** | Existing features that work better, faster, or more reliably |
| **Fixed** | Bugs that caused incorrect behavior, crashes, or data problems |
| **Changed** | Behavior that is intentionally different in a way users will notice |
| **Removed** | Features or options that no longer exist |

**How to assign:**
- Read each commit subject and body
- Ask: "What can a user do now that they couldn't before?" (→ New) or "What was broken that works now?" (→ Fixed)
- If a commit could fit two groups, prefer the more prominent user impact
- If a commit genuinely doesn't fit any group after filtering, drop it

**Write each item in plain language.** Not the commit subject — rewrite it in terms of outcome:
- `fix: prevent null ref in AgentProfile.save()` → "Fixed a crash when saving an agent profile with no backend selected"
- `feat: add json export to agent profile` → "Added JSON export for agent profiles"
- `perf: cache voice list response in memory` → "Voice list now loads instantly after the first fetch"

Keep each item to one sentence. Lead with the outcome, not the mechanism.

## Step 6: Determine the Version Header

**If `--version [x.y.z]` was passed:** Use that version.

**If no version was passed:**
- Check the most recent git tag for a semver version number
- If found, suggest bumping it: "Last tag was v1.3.0. Suggest `--version 1.4.0` for this release."
- If no semver tag exists, use the date: `[YYYY-MM-DD]`

## Step 7: Write the Changelog Entry

Format:

```markdown
## [version] — [date]

### New
- [item]
- [item]

### Improved
- [item]

### Fixed
- [item]

### Changed
- [item]

### Removed
- [item]
```

**Rules:**
- Omit any group with no items. Do not print empty sections.
- If only one group has items, no header needed for that group — just list the items under the version heading.
- Write for the target audience in VECTOR.md. If the audience is developers, technical specificity is fine. If the audience is end users, avoid implementation details entirely.
- Each item is one sentence. Start with a verb: "Added", "Fixed", "Removed", "Improved".
- Do not include commit hashes, PR numbers, or author names in the changelog entry itself.

## Step 8: Output

**Print the changelog entry to the terminal AND append it to `/vector/changelog/[version].md`.**

Create the `/vector/changelog/` directory if it does not exist.

Also check for a `CHANGELOG.md` at the project root:
- If it exists, prepend the new entry at the top (below the `# Changelog` heading if present)
- If it does not exist, create it with the new entry

Overwrite `/vector/changelog/[version].md` if it already exists for this version — the current content is what matters.

**If `--dry-run` was passed:** Print the entry to the terminal only. Do not write any files.

After writing, output:

```
Changelog entry written to /vector/changelog/[version].md
[If CHANGELOG.md was updated:] CHANGELOG.md updated.

[N] commits in range. [N] kept as user-facing. [N] dropped as internal.
```

## Arguments

- **No arguments:** Since last git tag, version from last tag or date
- **`--since [tag|commit]`:** Explicit range start
- **`--version [x.y.z]`:** Set the version header for this entry
- **`--dry-run`:** Preview the entry without writing files

## Output

- `/vector/changelog/[version].md`
- `CHANGELOG.md` (prepended if exists, created if not)

## When to Run

- At release time, before publishing release notes or updating a public changelog
- After a sprint, to communicate what shipped to stakeholders
- Before tagging a release — use `--dry-run` to preview what the release notes will say

## Principles

- **Value prop is the filter.** If VECTOR.md says the product's value is "instant, portable agent voices," a CSS refactor is not in the changelog. A new voice backend is.
- **Outcomes, not mechanisms.** "Fixed null reference in AgentProfile" is a mechanism. "Fixed a crash when saving an agent profile with no backend selected" is an outcome. Rewrite for the latter.
- **Omit empty groups.** A changelog with six headers and one item each is noise. A changelog with two headers and five meaningful items is signal.
- **git log is evidence, not the changelog.** Commit messages are for engineers. The changelog is for users. They are different documents with different audiences. Translate, don't copy.
- **Drop noise ruthlessly.** A changelog that includes every internal refactor trains users to stop reading it. The value of a changelog is in what it omits as much as what it includes.
