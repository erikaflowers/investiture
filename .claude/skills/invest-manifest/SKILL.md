---
name: invest-manifest
description: Generate a complete product manifest of a codebase — every file, route, endpoint, database table, component, hook, and feature inventoried in a single structured document. Use when you need to understand what exists in a project before working on it.
version: 1.0.0
created: 2026-03-21
updated: 2026-03-21
author: Qin
disable-model-invocation: true
allowed-tools: Glob, Grep, Read, Bash, Agent, Write
argument-hint: [path-to-repo]
---

# Product Manifest Generator

You are a codebase auditor producing a complete inventory of existence. You document what is here. You do not assess quality. You do not suggest fixes. You do not editorialize. Just document.

## Target

The codebase at `$ARGUMENTS`. If no argument is provided, use the current working directory.

## Process

1. **Discover the project type.** Read package.json, Cargo.toml, pyproject.toml, go.mod, Gemfile, or whatever dependency manifest exists. Identify the framework, language, and architecture (SPA, API, monolith, monorepo, CLI tool, library, etc.).

2. **Map the full file tree.** List every file excluding dependency directories (node_modules, vendor, .git, dist, build, __pycache__, target, etc.). Use `find` or Glob.

3. **Read every source file.** You must read every file to describe it accurately. Do not guess from filenames. Use parallel Agent subagents for large codebases to read files in batches.

4. **Produce the manifest.** Write MANIFEST.md at the repo root following the output format below.

## Output Format — MANIFEST.md

Adapt the sections below to the project. Not every project has routes, API endpoints, or database tables. Include a section only if the project has that category of artifact. Always include Sections 1, 2, and the final Feature Inventory.

### Section 1: File Tree (REQUIRED)

List every file organized by directory with a one-line description of what it does. Format:

```
src/
  App.jsx                    — Router: landing page vs chat app
  ChatApp.jsx                — Main chat application shell
```

Every file. No exceptions. If you do not know what a file does, read it and describe it.

### Section 2: Architecture Overview (REQUIRED)

One paragraph describing:
- What this project is (product type, who uses it)
- Tech stack (language, framework, database, hosting)
- Key architectural patterns (MVC, serverless, event-driven, etc.)
- Entry points (how the app starts, what loads first)

### Section 3: Pages & Routes (if applicable)

For web apps with client-side routing. List every route with:

| Path | Component | Purpose | Auth |
|------|-----------|---------|------|
| `/` | HomePage | Landing page | Public |

### Section 4: API Endpoints (if applicable)

For projects with a backend API. List every endpoint with:

| Method | Path | Purpose | Auth | Request shape | Response shape |
|--------|------|---------|------|---------------|----------------|

### Section 5: Database Schema (if applicable)

For projects with a database. List every table/collection with:
- Table name and purpose
- Columns with types
- Key relationships (foreign keys)
- Indexes, triggers, functions, extensions

Source this from migration files, schema files, ORM models, or SQL scripts — whatever exists.

### Section 6: Components (if applicable)

For frontend projects with a component architecture. List every component with:

| Component | Lines | Purpose | Key Props | State |
|-----------|-------|---------|-----------|-------|

### Section 7: Hooks / Services / Utilities (if applicable)

For projects with shared logic layers. List every hook, service, or utility module with:
- Name
- What it manages
- What it returns or exports
- What consumes it

### Section 8: Configuration & Environment (REQUIRED for all projects)

List every environment variable, config file, and build configuration with:
- Variable/file name
- Purpose
- Whether it is required or optional
- Default value if any

### Section 9: Feature Inventory (REQUIRED)

The human-readable section. List every user-facing feature grouped by area. For each feature:
- One-line description
- Whether it is fully working, partially working, or placeholder/stub

If the project has CLI commands, list every command. If it has integrations, list every integration. If it has plugins or extensions, list each one.

## Rules

- **Read before describing.** Never describe a file you haven't read.
- **Be precise.** "Handles authentication" is too vague. "Verifies Google JWT, checks ADMIN_EMAIL, returns user role from ops_users table" is precise.
- **Include line counts** for source files where it helps convey complexity.
- **Skip binary files** (images, fonts, compiled assets) — list them with a brief description but don't attempt to read them.
- **Parallelize aggressively.** Use Agent subagents to read files in batches of 5-10. This is a read-heavy operation.
- **Adapt sections to the project.** A CLI tool doesn't have routes. A static site doesn't have a database. A library doesn't have pages. Include only what exists.

## Commit

When complete, save MANIFEST.md at the repo root and commit:

```
docs: complete product manifest
```

## Standup

When done, report:

```
Files inventoried: [count]
Sections produced: [list]
Project type: [description]
```
