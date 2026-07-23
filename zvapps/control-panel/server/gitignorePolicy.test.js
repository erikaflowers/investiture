// Repo-policy regression guard (R-2 Task 1). R-1 mistakenly added
// `zvapps/backlog/*.md` to the TRACKED .gitignore, which ships with every
// template and would make every downstream project's backlog and PRD
// untrackable — inverting the founding decision that backlog items are
// git-diffable markdown. This asserts the shipped .gitignore never carries
// an active rule that would ignore a downstream's backlog card or PRD.
// (Investiture's own cards are excluded via local .git/info/exclude, which
// does not ship and is not what this checks.)

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

function activeRules(gitignoreText) {
  return gitignoreText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
}

describe("shipped .gitignore does not un-track downstream backlog/PRD", () => {
  const text = fs.readFileSync(path.join(repoRoot, ".gitignore"), "utf-8");
  const rules = activeRules(text);

  it("has no active rule mentioning the backlog", () => {
    const offenders = rules.filter((r) => /backlog/i.test(r));
    expect(offenders).toEqual([]);
  });

  it("has no active rule mentioning the PRD", () => {
    const offenders = rules.filter((r) => /\bprd\b/i.test(r) || /PRD\.md/.test(r));
    expect(offenders).toEqual([]);
  });

  it("still ships the .gitkeep that keeps an empty backlog dir present", () => {
    expect(fs.existsSync(path.join(repoRoot, "zvapps", "backlog", ".gitkeep"))).toBe(true);
  });
});
