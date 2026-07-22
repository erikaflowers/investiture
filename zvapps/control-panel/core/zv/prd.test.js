import { describe, it, expect } from "vitest";
import { missingSections, appendToSection, seedPrd } from "./prd.js";

describe("seedPrd / missingSections", () => {
  it("seed contains every required section", () => {
    expect(missingSections(seedPrd("Proj", "A thing.", "2026-07-22"))).toEqual([]);
  });

  it("reports what is missing", () => {
    expect(missingSections("## Overview\n## Goals")).toEqual([
      "Non-Goals",
      "Milestones",
      "Open Questions",
      "Changelog",
    ]);
  });
});

describe("appendToSection", () => {
  const prd = seedPrd("Proj", "A thing.", "2026-07-20");

  it("appends a dated bullet at the end of Changelog", () => {
    const out = appendToSection(prd, "changelog", "2026-07-22", "agent:heavy", "Did work.");
    const lines = out.trim().split("\n");
    expect(lines[lines.length - 1]).toBe("- **2026-07-22** (agent:heavy) — Did work.");
    // Prior entries stay above.
    expect(out.indexOf("Project onboarded")).toBeLessThan(out.indexOf("Did work."));
  });

  it("appends inside a mid-document section without leaking into the next", () => {
    const doc = "## Open Questions\n\n- old q\n\n## Changelog\n\n- entry\n";
    const out = appendToSection(doc, "open-questions", "2026-07-22", "human", "New q?");
    const openQ = out.slice(0, out.indexOf("## Changelog"));
    expect(openQ).toContain("New q?");
  });

  it("returns null for unknown sections or missing headings", () => {
    expect(appendToSection(prd, "goals", "2026-07-22", "human", "x")).toBeNull();
    expect(appendToSection("# no sections", "changelog", "2026-07-22", "human", "x")).toBeNull();
  });
});
