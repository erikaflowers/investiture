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
const { runReplace } = require("../../../cli/bin/update.js");

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
