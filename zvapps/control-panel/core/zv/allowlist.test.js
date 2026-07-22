// ZV-CONTRACT.md §4.5.4 — proof that out-of-bounds paths are rejected.

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import { createGuard, OutOfBoundsError, DOCTRINE_FILES } from "./allowlist.js";

let root;
let outside;
let guard;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "zv-guard-"));
  outside = fs.mkdtempSync(path.join(os.tmpdir(), "zv-outside-"));
  fs.mkdirSync(path.join(root, "zvapps", "backlog"), { recursive: true });
  fs.mkdirSync(path.join(root, "src"));
  fs.mkdirSync(path.join(root, "node_modules"));
  fs.writeFileSync(path.join(root, "CLAUDE.md"), "# doctrine");
  fs.writeFileSync(path.join(root, ".env"), "SECRET=1");
  fs.writeFileSync(path.join(root, "src", "app.js"), "code");
  guard = createGuard(root);
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
  fs.rmSync(outside, { recursive: true, force: true });
});

describe("territory (a): zvapps/", () => {
  it("allows paths inside zvapps, existing or not", () => {
    expect(guard.guardPath("zvapps/backlog/BL-0001-x.md")).toContain("zvapps");
    expect(guard.guardPath("zvapps/.zv-history/CLAUDE.md/20260722T000000Z.md")).toContain(
      ".zv-history"
    );
  });
});

describe("territory (b): doctrine files", () => {
  it("allows exactly the four doctrine files", () => {
    for (const f of DOCTRINE_FILES) {
      expect(guard.guardDoctrine(f)).toBe(path.join(guard.realRoot, f));
    }
  });

  it("rejects non-doctrine root files by name", () => {
    for (const name of ["README.md", "invest.md", ".env", "package.json"]) {
      expect(() => guard.guardDoctrine(name)).toThrow(OutOfBoundsError);
    }
  });

  it("rejects doctrine-lookalike names", () => {
    for (const name of ["CLAUDE.md.bak", "claude.md", " CLAUDE.md", "CLAUDE.md/.."]) {
      expect(() => guard.guardDoctrine(name)).toThrow(OutOfBoundsError);
    }
  });
});

describe("traversal and smuggling", () => {
  it("rejects ../ traversal out of zvapps", () => {
    expect(() => guard.guardPath("zvapps/../src/app.js")).toThrow(OutOfBoundsError);
    expect(() => guard.guardPath("zvapps/backlog/../../.env")).toThrow(OutOfBoundsError);
    expect(() => guard.guardPath("zvapps/../../etc/passwd")).toThrow(OutOfBoundsError);
  });

  it("rejects absolute paths outside the territories", () => {
    expect(() => guard.guardPath("/etc/passwd")).toThrow(OutOfBoundsError);
    expect(() => guard.guardPath(path.join(outside, "x.md"))).toThrow(OutOfBoundsError);
  });

  it("rejects repo files that are in neither territory", () => {
    expect(() => guard.guardPath("src/app.js")).toThrow(OutOfBoundsError);
    expect(() => guard.guardPath("node_modules/foo/index.js")).toThrow(OutOfBoundsError);
    expect(() => guard.guardPath(".env")).toThrow(OutOfBoundsError);
    expect(() => guard.guardPath(".git/config")).toThrow(OutOfBoundsError);
  });

  it("normalizes ./ segments without widening access", () => {
    expect(guard.guardPath("./zvapps/./backlog/x.md")).toContain("backlog");
    expect(() => guard.guardPath("./CLAUDE.md/../src/app.js")).toThrow(OutOfBoundsError);
  });
});

describe("symlink escapes", () => {
  it("rejects a symlinked dir inside zvapps pointing outside", () => {
    fs.symlinkSync(outside, path.join(root, "zvapps", "sneaky"));
    expect(() => guard.guardPath("zvapps/sneaky/x.md")).toThrow(OutOfBoundsError);
  });

  it("rejects a symlinked file inside zvapps pointing outside", () => {
    const target = path.join(outside, "target.md");
    fs.writeFileSync(target, "outside");
    fs.symlinkSync(target, path.join(root, "zvapps", "link.md"));
    expect(() => guard.guardPath("zvapps/link.md")).toThrow(OutOfBoundsError);
  });

  it("rejects a doctrine file that is a symlink pointing outside", () => {
    const target = path.join(outside, "evil.md");
    fs.writeFileSync(target, "outside");
    fs.rmSync(path.join(root, "CLAUDE.md"));
    fs.symlinkSync(target, path.join(root, "CLAUDE.md"));
    expect(() => guard.guardDoctrine("CLAUDE.md")).toThrow(OutOfBoundsError);
  });

  it("still allows symlinks that stay inside zvapps", () => {
    fs.writeFileSync(path.join(root, "zvapps", "real.md"), "in");
    fs.symlinkSync(
      path.join(root, "zvapps", "real.md"),
      path.join(root, "zvapps", "alias.md")
    );
    expect(guard.guardPath("zvapps/alias.md")).toContain("zvapps");
  });
});
