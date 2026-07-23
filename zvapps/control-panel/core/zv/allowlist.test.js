// ZV-CONTRACT.md §4.5.4 — proof that out-of-bounds paths are rejected.

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import { createGuard, OutOfBoundsError, DOCTRINE_FILES } from "./allowlist.js";
import { safeWriteFileSync } from "./safeWrite.js";

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

// Qin Finding 4 + Renic R3 — the guard alone cannot close the symlink hole;
// the no-follow WRITE is the durable fix. These prove that even when
// guardPath PASSES (the path is in-territory), a symlink at the final
// segment makes the write itself fail rather than escape.
describe("no-follow write closes the symlink escape", () => {
  it("(A) dangling final-segment symlink: guard passes, write refuses (ELOOP)", () => {
    const outsideTarget = path.join(outside, "pwned.md");
    const linkPath = path.join(root, "zvapps", "backlog", "BL-0099-evil.md");
    // Dangling: target does not exist yet, so existsSync(link) is false and
    // the guard realpaths only the (in-territory) parent — it PASSES.
    fs.symlinkSync(outsideTarget, linkPath);
    const guarded = guard.guardPath("zvapps/backlog/BL-0099-evil.md");
    expect(guarded).toContain("zvapps"); // guard did not catch it

    // The write must refuse to follow the link, and must NOT create the
    // outside target (the Finding-4 reproduction wrote pwned.md outside).
    expect(() => safeWriteFileSync(guarded, "owned")).toThrow(
      expect.objectContaining({ code: "ELOOP" })
    );
    expect(fs.existsSync(outsideTarget)).toBe(false);
  });

  it("(C) check-to-write TOCTOU swap: symlink planted after the check still fails the write", () => {
    const outsideTarget = path.join(outside, "toctou.md");
    const targetPath = path.join(root, "zvapps", "backlog", "BL-0100.md");
    // Guard checks a normal absent path (not a symlink) — passes.
    const guarded = guard.guardPath("zvapps/backlog/BL-0100.md");
    // Attacker swaps a symlink into that exact path before the write.
    fs.symlinkSync(outsideTarget, targetPath);
    // The no-follow open fails regardless of when the link was planted.
    expect(() => safeWriteFileSync(guarded, "owned")).toThrow(
      expect.objectContaining({ code: "ELOOP" })
    );
    expect(fs.existsSync(outsideTarget)).toBe(false);
  });

  it("writes normally when the final segment is a real file or absent", () => {
    const p = path.join(root, "zvapps", "backlog", "BL-0001-ok.md");
    safeWriteFileSync(p, "first"); // absent → created
    expect(fs.readFileSync(p, "utf-8")).toBe("first");
    safeWriteFileSync(p, "second"); // real file → truncated + rewritten
    expect(fs.readFileSync(p, "utf-8")).toBe("second");
  });

  // Renic variant (B), a mid-tail dangling directory link
  // (backlog/evil/BL.md, `evil` dangling): the open fails ENOENT because you
  // cannot create through a dangling directory link, so it is not
  // independently exploitable and needs no separate guard. Documented here so
  // nobody re-litigates it.
});
