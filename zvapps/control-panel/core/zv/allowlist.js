// Territory guard for the ZV write API (ZV-CONTRACT.md §4.5).
//
// The API may touch exactly two territories:
//   (a) anything inside <repoRoot>/zvapps/
//   (b) the four doctrine files at repo root, by exact name
//
// Every endpoint that touches disk resolves its path through guardPath().
// The UI is never trusted; clients never send raw paths.

import fs from "fs";
import path from "path";

export const DOCTRINE_FILES = [
  "VECTOR.md",
  "ARCHITECTURE.md",
  "CLAUDE.md",
  "DESIGN.md",
];

export class OutOfBoundsError extends Error {
  constructor(message) {
    super(message);
    this.name = "OutOfBoundsError";
    this.code = "OUT_OF_BOUNDS";
  }
}

// Resolve symlinks on the deepest ancestor of `p` that exists, then re-join
// the not-yet-existing tail. This catches symlinked directories that point
// outside a territory even when the final file does not exist yet.
function realResolve(p) {
  let existing = p;
  const tail = [];
  while (!fs.existsSync(existing)) {
    tail.unshift(path.basename(existing));
    const parent = path.dirname(existing);
    if (parent === existing) break;
    existing = parent;
  }
  return path.join(fs.realpathSync(existing), ...tail);
}

export function createGuard(repoRoot) {
  const realRoot = fs.realpathSync(path.resolve(repoRoot));
  const zvappsRoot = path.join(realRoot, "zvapps");
  const doctrinePaths = new Set(
    DOCTRINE_FILES.map((f) => path.join(realRoot, f))
  );

  // Returns the canonical absolute path, or throws OutOfBoundsError.
  function guardPath(candidate) {
    const resolved = realResolve(path.resolve(realRoot, candidate));

    if (doctrinePaths.has(resolved)) return resolved;
    if (
      resolved === zvappsRoot ||
      resolved.startsWith(zvappsRoot + path.sep)
    ) {
      return resolved;
    }
    throw new OutOfBoundsError(
      "Path resolves outside allowed territories"
    );
  }

  // Doctrine names are matched by exact string against the closed list,
  // then still routed through guardPath so symlinked doctrine files that
  // point elsewhere are rejected too.
  function guardDoctrine(name) {
    if (!DOCTRINE_FILES.includes(name)) {
      throw new OutOfBoundsError(`Not a doctrine file: ${name}`);
    }
    return guardPath(path.join(realRoot, name));
  }

  return { guardPath, guardDoctrine, realRoot, zvappsRoot };
}
