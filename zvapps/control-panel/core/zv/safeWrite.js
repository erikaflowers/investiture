// No-follow write primitives (Qin Finding 4 + Renic R3).
//
// The territory guard (allowlist.js) contains paths to zvapps/ + the four
// doctrine files, but it cannot close the symlink hole on its own:
//   - A DANGLING symlink at the final segment reads as "nonexistent tail,"
//     so realResolve realpaths only the parent — the guard passes, and a
//     plain fs.writeFileSync then writes THROUGH the link to the outside
//     target (Qin Finding 4, reproduced).
//   - Even lstat-at-check-time cannot close the check-to-write TOCTOU: the
//     malicious link does not exist when the check runs and is swapped in
//     before the write (Renic R3, variant C).
//   - realpath-ing the full candidate is impossible pre-write — the file
//     does not exist yet.
//
// The durable fix is to make the WRITE itself refuse to follow a symlink at
// the final path component: O_NOFOLLOW makes openSync fail with ELOOP if the
// final segment is a symlink, regardless of when it was planted. This is
// defense in depth layered on top of the guard's territory containment.
//
// Note on Renic variant (B), a mid-tail dangling directory link
// (backlog/evil/BL-0099.md where `evil` is a dangling dir symlink): the open
// fails ENOENT because you cannot create through a dangling directory link,
// so it is not independently exploitable and needs no separate handling.

import fs from "fs";

const WRITE_FLAGS =
  fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_NOFOLLOW | fs.constants.O_TRUNC;
const APPEND_FLAGS =
  fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_NOFOLLOW | fs.constants.O_APPEND;

export function safeWriteFileSync(filePath, content) {
  const fd = fs.openSync(filePath, WRITE_FLAGS, 0o644);
  try {
    fs.writeFileSync(fd, content, "utf-8");
  } finally {
    fs.closeSync(fd);
  }
}

export function safeAppendFileSync(filePath, content) {
  const fd = fs.openSync(filePath, APPEND_FLAGS, 0o644);
  try {
    fs.writeFileSync(fd, content, "utf-8");
  } finally {
    fs.closeSync(fd);
  }
}

// Copy where the DESTINATION's final segment must not be followed through a
// symlink (snapshots, restore). The source is read normally — snapshot and
// doctrine source files are server-computed, in-territory, and trusted.
export function safeCopyFileSync(src, dest) {
  const content = fs.readFileSync(src);
  const fd = fs.openSync(dest, WRITE_FLAGS, 0o644);
  try {
    fs.writeFileSync(fd, content);
  } finally {
    fs.closeSync(fd);
  }
}
