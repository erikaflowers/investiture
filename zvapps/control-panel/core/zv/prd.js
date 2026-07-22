// PRD conventions (ZV-CONTRACT.md §2, §6.3).

export const REQUIRED_SECTIONS = [
  "Overview",
  "Goals",
  "Non-Goals",
  "Milestones",
  "Open Questions",
  "Changelog",
];

const APPEND_SECTIONS = {
  changelog: "Changelog",
  "open-questions": "Open Questions",
};

export function missingSections(content) {
  const lines = (content ?? "").split("\n");
  const found = new Set(
    lines
      .filter((l) => l.startsWith("## "))
      .map((l) => l.slice(3).trim())
  );
  return REQUIRED_SECTIONS.filter((s) => !found.has(s));
}

export function sectionPresence(content) {
  const missing = new Set(missingSections(content));
  const presence = {};
  for (const s of REQUIRED_SECTIONS) {
    const key = s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    presence[key] = !missing.has(s);
  }
  return presence;
}

// Appends "- **date** (actor) — entry" at the end of the named section,
// i.e. just before the next "## " heading or at EOF. Returns null if the
// section name is not an agent-appendable target.
export function appendToSection(content, sectionKey, date, actor, entry) {
  const heading = APPEND_SECTIONS[sectionKey];
  if (!heading) return null;

  const lines = content.split("\n");
  const start = lines.findIndex((l) => l.trim() === `## ${heading}`);
  if (start === -1) return null;

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) {
      end = i;
      break;
    }
  }
  // Trim trailing blank lines inside the section, append, restore one blank.
  let insertAt = end;
  while (insertAt > start + 1 && lines[insertAt - 1].trim() === "") insertAt--;
  const bullet = `- **${date}** (${actor}) — ${entry}`;
  const padding = end < lines.length ? [""] : [];
  lines.splice(insertAt, end - insertAt, bullet, ...padding);
  return lines.join("\n");
}

export function seedPrd(projectName, description, date) {
  const name = projectName?.trim() || "Untitled Project";
  return `# ${name} — PRD

## Overview

${description?.trim() || "_What is this project? Replace this line._"}

## Goals

_What must be true for this project to succeed? List them._

## Non-Goals

_What is this project deliberately not doing?_

## Milestones

_Break the work into stages. The backlog holds the individual items._

## Open Questions

_Unresolved decisions live here until they are settled._

## Changelog

- **${date}** (human) — Project onboarded.
`;
}
