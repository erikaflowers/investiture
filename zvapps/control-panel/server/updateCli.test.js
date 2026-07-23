// CLI update-path tests (R-2 Tasks 2 & 4). The `investiture update` command
// had no committed tests; v2.0.0 is the first release where `update` exists
// for any downstream, so its replace/merge semantics must be proven not to
// delete user files.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { runReplace, runMerge, validateExtraction } = require("../../../cli/bin/update.js");

let source, target, logs;

beforeEach(() => {
  source = fs.mkdtempSync(path.join(os.tmpdir(), "zv-upd-src-"));
  target = fs.mkdtempSync(path.join(os.tmpdir(), "zv-upd-dst-"));
  logs = [];
  vi.spyOn(console, "log").mockImplementation((m) => logs.push(String(m)));
});
afterEach(() => {
  vi.restoreAllMocks();
  fs.rmSync(source, { recursive: true, force: true });
  fs.rmSync(target, { recursive: true, force: true });
});

const write = (root, rel, content) => {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
};

describe("R4a — replace is non-destructive to downstream-added files", () => {
  it("keeps a downstream-added file inside a replace directory and reports it", () => {
    // Upstream ships server/ with one file; downstream added its own plugin.
    write(source, "zvapps/control-panel/server/zvApi.js", "upstream v2");
    write(target, "zvapps/control-panel/server/zvApi.js", "downstream old");
    write(target, "zvapps/control-panel/server/myPlugin.js", "DOWNSTREAM CUSTOM");

    const summary = { replaced: 0, added: 0, preserved: 0, kept: 0, wouldReplace: 0, wouldAdd: 0 };
    runReplace(
      { replace: ["zvapps/control-panel/server"] },
      source,
      target,
      false,
      summary
    );

    // Upstream file overwritten...
    expect(fs.readFileSync(path.join(target, "zvapps/control-panel/server/zvApi.js"), "utf-8")).toBe("upstream v2");
    // ...but the downstream-added file SURVIVES (old rmrf+cpR deleted it).
    expect(fs.existsSync(path.join(target, "zvapps/control-panel/server/myPlugin.js"))).toBe(true);
    expect(fs.readFileSync(path.join(target, "zvapps/control-panel/server/myPlugin.js"), "utf-8")).toBe("DOWNSTREAM CUSTOM");
    // ...and it was reported by path, not silently kept.
    expect(logs.join("\n")).toMatch(/kept.*myPlugin\.js/s);
    expect(summary.kept).toBe(1);
  });

  it("does not resurrect a file the upstream removed (deletion reaches new installs only)", () => {
    // Upstream removed writeVector.js (it is absent from source). A downstream
    // that already deleted it must not have it reinstalled.
    write(source, "zvapps/control-panel/server/zvApi.js", "upstream");
    // target has no writeVector.js and no server/ yet beyond what update writes
    const summary = { replaced: 0, added: 0, preserved: 0, kept: 0, wouldReplace: 0, wouldAdd: 0 };
    runReplace({ replace: ["zvapps/control-panel/server"] }, source, target, false, summary);
    expect(fs.existsSync(path.join(target, "zvapps/control-panel/server/writeVector.js"))).toBe(false);
  });

  it("dry-run reports the kept file without touching disk", () => {
    write(source, "zvapps/control-panel/server/zvApi.js", "upstream v2");
    write(target, "zvapps/control-panel/server/myPlugin.js", "DOWNSTREAM CUSTOM");
    const summary = { replaced: 0, added: 0, preserved: 0, kept: 0, wouldReplace: 0, wouldAdd: 0 };
    runReplace({ replace: ["zvapps/control-panel/server"] }, source, target, true, summary);
    // Nothing written in dry-run.
    expect(fs.existsSync(path.join(target, "zvapps/control-panel/server/zvApi.js"))).toBe(false);
    expect(summary.kept).toBe(1);
    expect(logs.join("\n")).toMatch(/kept.*myPlugin\.js/s);
  });
});

describe("R5 — merge backs up a customized skill/preset before overwriting", () => {
  const rule = { path: ".claude/skills", pattern: "*/SKILL.md" };
  const baseSummary = () => ({ replaced: 0, added: 0, preserved: 0, kept: 0, backedUp: 0, wouldReplace: 0, wouldAdd: 0 });

  it("preserves a modified downstream SKILL.md in recoverable form and reports it", () => {
    write(source, ".claude/skills/invest-audit/SKILL.md", "UPSTREAM v2 skill body");
    write(target, ".claude/skills/invest-audit/SKILL.md", "DOWNSTREAM CUSTOMIZED skill body");

    const summary = baseSummary();
    runMerge({ merge: [rule] }, source, target, false, summary);

    const skillDir = path.join(target, ".claude/skills/invest-audit");
    // The upstream version is now live...
    expect(fs.readFileSync(path.join(skillDir, "SKILL.md"), "utf-8")).toBe("UPSTREAM v2 skill body");
    // ...and the customization is recoverable from a .bak alongside it.
    const backups = fs.readdirSync(skillDir).filter((f) => f.includes(".orig-") && f.endsWith(".bak"));
    expect(backups).toHaveLength(1);
    expect(fs.readFileSync(path.join(skillDir, backups[0]), "utf-8")).toBe("DOWNSTREAM CUSTOMIZED skill body");
    expect(summary.backedUp).toBe(1);
    expect(logs.join("\n")).toMatch(/backed up.*SKILL\.md/s);
  });

  it("does not back up an identical (un-customized) skill", () => {
    write(source, ".claude/skills/invest-audit/SKILL.md", "same body");
    write(target, ".claude/skills/invest-audit/SKILL.md", "same body");
    const summary = baseSummary();
    runMerge({ merge: [rule] }, source, target, false, summary);
    const skillDir = path.join(target, ".claude/skills/invest-audit");
    expect(fs.readdirSync(skillDir).filter((f) => f.endsWith(".bak"))).toHaveLength(0);
    expect(summary.backedUp).toBe(0);
  });
});

describe("R8 — extracted-tarball path validation", () => {
  let tmpRoot, outside;
  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "zv-tar-"));
    outside = fs.mkdtempSync(path.join(os.tmpdir(), "zv-outside-"));
  });
  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
    fs.rmSync(outside, { recursive: true, force: true });
  });

  it("passes a clean extracted tree (returns null)", () => {
    const src = path.join(tmpRoot, "owner-repo-abc123");
    write(src, "zvapps/control-panel/package.json", "{}");
    write(src, ".claude/skills/x/SKILL.md", "ok");
    expect(validateExtraction(tmpRoot, src)).toBeNull();
  });

  it("flags a symlinked entry that resolves outside the temp root (tar-slip)", () => {
    const src = path.join(tmpRoot, "owner-repo-abc123");
    fs.mkdirSync(src, { recursive: true });
    fs.writeFileSync(path.join(outside, "secret"), "outside data");
    // A malicious tarball entry: a symlink pointing outside the temp root.
    fs.symlinkSync(outside, path.join(src, "escape"));
    const offender = validateExtraction(tmpRoot, src);
    expect(offender).toContain("escape");
  });
});
