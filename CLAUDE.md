# [Project Name] — Contributor Onboarding

This file is for anyone — human or AI — who is about to work in this codebase. Read it after VECTOR.md, before ARCHITECTURE.md.

---

## Reading Order

1. **VECTOR.md** — Project doctrine. Why this project exists, who it serves, what the constraints are.
2. **CLAUDE.md** — This file. What you need to know before touching code.
3. **ARCHITECTURE.md** — Technical specification. Layers, stack, conventions, structure, import rules.

Read ARCHITECTURE.md and follow it. It is the single technical authority. When in doubt about where a file goes or how to name it, ARCHITECTURE.md decides.

---

## Stack Summary

[OPERATOR: List the technologies your project uses. One row per concern. This gives any contributor a snapshot of the stack without reading ARCHITECTURE.md in full.]

| Layer | Technology |
|-------|-----------|
| Frontend | [framework + version] |
| Styling | [approach] |
| State | [library or pattern] |
| Backend | [framework, serverless, or "none"] |
| Deployment | [platform] |

---

## Key Context

Things that aren't obvious from the code but will cause wrong assumptions if you don't know them:

[OPERATOR: Write 3-6 bullets. Each one should be something a new contributor would get wrong without being told. Examples: "All content lives in src/content/ — do not put copy in JSX." "The CSS file is 15,000 lines and that is intentional." "There is no persistent server — all backend logic runs in serverless functions."]

- [Non-obvious architectural decision and why it matters]
- [Deployment or runtime constraint that affects development]
- [Content, data, or state convention that would be easy to violate]

---

## What Not to Do

[OPERATOR: Surface the 3-5 most important prohibitions from ARCHITECTURE.md here, so they are seen early. These should be the mistakes most likely to happen.]

1. [Most important prohibition — the one that causes the most damage if violated]
2. [Second most important]
3. [Third]

---

## Commit Format

```
Co-Authored-By: [Agent or Model Name] <noreply@anthropic.com>
```

---

## Standup Format

When asked for status:

```
Where we left off: [last task completed]
What is working: [current stable state]
Concerns: [anything requiring attention]
Blockers: [anything stopping progress]
```

---

## Agent Identity (Optional)

[OPERATOR: If your agent has a defined persona (name, pronouns, voice,
working style), add it here. If your agents are managed externally,
or you want this file to serve any contributor regardless of whether
they are human or AI, the sections above are sufficient.]
