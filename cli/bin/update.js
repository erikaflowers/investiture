// investiture update — pull latest zvapps + skills into a downstream project
// while preserving user-owned files (vector/, doctrine/.md, DESIGN.md, .env, data/)

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawnSync } = require('child_process');

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GOLD = '\x1b[33m';
const CORAL = '\x1b[38;5;167m';
const BLUE = '\x1b[38;5;74m';
const GREEN = '\x1b[32m';
const WHITE = '\x1b[37m';
const YELLOW = '\x1b[33m';

const UPSTREAM_REPO = process.env.INVESTITURE_REPO || 'erikaflowers/investiture';
const UPSTREAM_REF = process.env.INVESTITURE_REF || 'main';
const TARBALL_URL = `https://api.github.com/repos/${UPSTREAM_REPO}/tarball/${UPSTREAM_REF}`;

function log(msg) { console.log(msg); }
function blank() { console.log(); }
function banner() {
  blank();
  log(`${GOLD}${BOLD}  investiture${RESET} ${DIM}update${RESET}`);
  log(`${DIM}  Sync zvapps + skills from upstream. Preserve your content.${RESET}`);
  blank();
}
function header(text) { log(`${WHITE}${BOLD}  ${text}${RESET}`); blank(); }
function replaced(p) { log(`  ${GREEN}~${RESET} replaced ${DIM}${p}${RESET}`); }
function added(p) { log(`  ${GREEN}+${RESET} added ${DIM}${p}${RESET}`); }
function preserved(p) { log(`  ${BLUE}·${RESET} preserved ${DIM}${p}${RESET}`); }
function kept(p) { log(`  ${BLUE}·${RESET} ${YELLOW}kept (not in upstream, not deleted)${RESET} ${DIM}${p}${RESET}`); }
function backedUp(p, backup) { log(`  ${YELLOW}~${RESET} ${YELLOW}backed up before overwrite${RESET} ${DIM}${p} -> ${backup}${RESET}`); }
function wouldBackup(p) { log(`  ${YELLOW}⇥${RESET} ${DIM}would back up (local changes) ${p}${RESET}`); }

function backupStamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
}
function wouldReplace(p) { log(`  ${YELLOW}~${RESET} ${DIM}would replace ${p}${RESET}`); }
function wouldAdd(p) { log(`  ${YELLOW}+${RESET} ${DIM}would add ${p}${RESET}`); }
function error(msg) { log(`${CORAL}  Error: ${msg}${RESET}`); }

function fetchTarball() {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'investiture-update-'));
  const tarballPath = path.join(tmpRoot, 'source.tar.gz');
  log(`${DIM}  Fetching ${TARBALL_URL}${RESET}`);
  try {
    execSync(`curl -sSL "${TARBALL_URL}" -o "${tarballPath}"`, { stdio: 'pipe' });
    execSync(`tar -xzf "${tarballPath}" -C "${tmpRoot}"`, { stdio: 'pipe' });
  } catch (err) {
    error(`failed to fetch or extract upstream tarball`);
    error(err.message || String(err));
    try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch {}
    process.exit(1);
  }
  // GitHub tarballs extract to a single directory named <owner>-<repo>-<sha>
  const entries = fs.readdirSync(tmpRoot).filter((name) => name !== 'source.tar.gz');
  const extracted = entries.map((name) => path.join(tmpRoot, name)).find((p) => fs.statSync(p).isDirectory());
  if (!extracted) {
    error('upstream tarball extracted unexpectedly (no source directory found)');
    try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch {}
    process.exit(1);
  }
  return { tmpRoot, source: extracted };
}

function readManifest(sourceRoot) {
  const manifestPath = path.join(sourceRoot, 'cli', 'update-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    error(`upstream manifest not found at cli/update-manifest.json`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
}

function rmrf(target) {
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
}

function cpR(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  if (fs.statSync(src).isDirectory()) {
    // Node 16+ supports fs.cpSync with recursive, but for portability use cp -R
    execSync(`cp -R "${src}" "${dest}"`, { stdio: 'pipe' });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function walkFiles(dir, base = dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, base, out);
    else out.push(path.relative(base, full));
  }
  return out;
}

function matchPattern(filename, pattern) {
  // Simple glob: *.md or */SKILL.md
  if (pattern === '*') return true;
  if (pattern.includes('/')) {
    // Multi-segment pattern like "*/SKILL.md"
    const parts = pattern.split('/');
    const fileParts = filename.split('/');
    if (parts.length !== fileParts.length) return false;
    return parts.every((p, i) => matchPattern(fileParts[i], p));
  }
  if (pattern === '*.md') return filename.endsWith('.md');
  if (pattern === '*.json') return filename.endsWith('.json');
  if (pattern.startsWith('*.')) return filename.endsWith(pattern.slice(1));
  return filename === pattern;
}

// Non-destructive replace (R4a). The old rmrf(dest)+cpR silently deleted any
// file a downstream added inside a replace directory — runPreserve cannot
// protect a file that lives inside a replace path. Instead, sync file-by-file:
// overwrite every upstream-owned file, but KEEP (and report) any file present
// in the downstream copy that upstream does not ship. Nothing is deleted
// without being named. A consequence: upstream cannot force-delete a file from
// existing installs via `replace` — deletions reach new installs/clones only.
// That is the safe default; downstreams remove files deliberately, not by
// surprise.
function runReplace(manifest, source, target, dryRun, summary) {
  for (const relPath of manifest.replace) {
    const srcPath = path.join(source, relPath);
    const destPath = path.join(target, relPath);
    if (!fs.existsSync(srcPath)) {
      log(`  ${DIM}(skip) upstream missing: ${relPath}${RESET}`);
      continue;
    }

    if (!fs.statSync(srcPath).isDirectory()) {
      // Single-file replace.
      if (dryRun) { wouldReplace(relPath); summary.wouldReplace++; }
      else {
        if (!fs.existsSync(path.dirname(destPath))) fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(srcPath, destPath);
        replaced(relPath); summary.replaced++;
      }
      continue;
    }

    // Directory replace — sync, do not rmrf.
    const srcFiles = new Set(walkFiles(srcPath));
    const destFiles = walkFiles(destPath); // [] if dest is missing
    const foreign = destFiles.filter((rel) => !srcFiles.has(rel));

    if (dryRun) {
      wouldReplace(relPath); summary.wouldReplace++;
      for (const rel of foreign) { kept(path.join(relPath, rel)); summary.kept++; }
      continue;
    }
    for (const rel of srcFiles) {
      const d = path.join(destPath, rel);
      if (!fs.existsSync(path.dirname(d))) fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(path.join(srcPath, rel), d);
    }
    replaced(relPath); summary.replaced++;
    for (const rel of foreign) { kept(path.join(relPath, rel)); summary.kept++; }
  }
}

// Merge (R5). Skills and presets are closer to user content than panel code,
// so a downstream that tuned a SKILL.md or preset must not lose it silently.
// Before overwriting a file whose current content DIFFERS from the incoming
// upstream version (customized, or on an older version), copy the current
// version to a timestamped `.orig-<ts>.bak` alongside it and report the path.
// Identical files are overwritten with no backup (nothing is lost).
function runMerge(manifest, source, target, dryRun, summary) {
  for (const mergeRule of manifest.merge || []) {
    const srcDir = path.join(source, mergeRule.path);
    const destDir = path.join(target, mergeRule.path);
    if (!fs.existsSync(srcDir)) continue;
    const upstreamFiles = walkFiles(srcDir);
    for (const rel of upstreamFiles) {
      if (!matchPattern(rel, mergeRule.pattern)) continue;
      const srcFile = path.join(srcDir, rel);
      const destFile = path.join(destDir, rel);
      const isNew = !fs.existsSync(destFile);
      const displayPath = path.join(mergeRule.path, rel);
      const differs = !isNew &&
        fs.readFileSync(destFile).toString() !== fs.readFileSync(srcFile).toString();
      if (dryRun) {
        if (isNew) { wouldAdd(displayPath); summary.wouldAdd++; }
        else {
          wouldReplace(displayPath); summary.wouldReplace++;
          if (differs) { wouldBackup(displayPath); summary.backedUp++; }
        }
      } else {
        if (!fs.existsSync(path.dirname(destFile))) fs.mkdirSync(path.dirname(destFile), { recursive: true });
        if (differs) {
          const backupPath = `${destFile}.orig-${backupStamp()}.bak`;
          fs.copyFileSync(destFile, backupPath);
          backedUp(displayPath, path.basename(backupPath));
          summary.backedUp++;
        }
        fs.copyFileSync(srcFile, destFile);
        if (isNew) { added(displayPath); summary.added++; }
        else { replaced(displayPath); summary.replaced++; }
      }
    }
  }
}

function runPreserve(manifest, target, summary) {
  for (const relPath of manifest.preserve) {
    const destPath = path.join(target, relPath);
    if (fs.existsSync(destPath)) {
      preserved(relPath);
      summary.preserved++;
    }
  }
}

function runCreateIfMissing(manifest, source, target, dryRun, summary) {
  for (const rule of manifest.createIfMissing || []) {
    const srcPath = path.join(source, rule.src);
    const destPath = path.join(target, rule.dest);
    if (fs.existsSync(destPath)) continue;
    if (!fs.existsSync(srcPath)) continue;
    if (dryRun) {
      wouldAdd(rule.dest);
      summary.wouldAdd++;
    } else {
      cpR(srcPath, destPath);
      added(rule.dest);
      summary.added++;
    }
  }
}

function writeVersionStamp(target, manifestVersion) {
  const stampPath = path.join(target, '.investiture-version.json');
  const now = new Date().toISOString();
  let existing = {};
  if (fs.existsSync(stampPath)) {
    try { existing = JSON.parse(fs.readFileSync(stampPath, 'utf-8')); } catch {}
  }
  const stamp = {
    version: manifestVersion,
    installedAt: existing.installedAt || now,
    lastUpdatedAt: now,
    source: `https://github.com/${UPSTREAM_REPO}`,
    ref: UPSTREAM_REF,
  };
  fs.writeFileSync(stampPath, JSON.stringify(stamp, null, 2) + '\n');
  return stamp;
}

function runPostHooks(manifest, target) {
  if (!manifest.postUpdate) return;
  for (const prefix of manifest.postUpdate.runNpmInstall || []) {
    const fullPath = path.join(target, prefix);
    if (!fs.existsSync(path.join(fullPath, 'package.json'))) continue;
    log(`${DIM}  running npm install --prefix ${prefix}${RESET}`);
    const result = spawnSync('npm', ['install', '--prefix', fullPath], { stdio: 'inherit' });
    if (result.status !== 0) {
      error(`npm install failed in ${prefix}`);
    }
  }
}

function run({ dryRun = false } = {}) {
  banner();
  const target = process.cwd();
  const zvappsPath = path.join(target, 'zvapps', 'control-panel');
  if (!fs.existsSync(zvappsPath)) {
    error(`No zvapps/control-panel found at ${target}.`);
    log(`${DIM}  Run ${GOLD}npx investiture install-zvapps${RESET}${DIM} first to install.${RESET}`);
    blank();
    process.exit(1);
  }

  log(`${WHITE}${BOLD}  Target:${RESET} ${DIM}${target}${RESET}`);
  if (dryRun) log(`  ${YELLOW}(dry-run — no files will be written)${RESET}`);
  blank();

  const { tmpRoot, source } = fetchTarball();
  try {
    const manifest = readManifest(source);
    log(`${DIM}  Upstream version: ${manifest.version}${RESET}`);
    blank();

    const summary = { replaced: 0, added: 0, preserved: 0, kept: 0, backedUp: 0, wouldReplace: 0, wouldAdd: 0 };

    header('Replace');
    runReplace(manifest, source, target, dryRun, summary);
    blank();

    header('Merge');
    runMerge(manifest, source, target, dryRun, summary);
    blank();

    header('Preserve');
    runPreserve(manifest, target, summary);
    blank();

    header('Create-if-missing');
    runCreateIfMissing(manifest, source, target, dryRun, summary);
    blank();

    if (!dryRun) {
      runPostHooks(manifest, target);
      blank();
      const stamp = writeVersionStamp(target, manifest.version);
      log(`${GREEN}  ✓${RESET} wrote .investiture-version.json ${DIM}(v${stamp.version})${RESET}`);
      blank();
    }

    if (dryRun) {
      log(`${BOLD}  Would:${RESET} ${summary.wouldReplace} replace, ${summary.wouldAdd} add, ${summary.preserved} preserve, ${summary.kept} keep, ${summary.backedUp} back up`);
      log(`${DIM}  Run without --dry-run to apply.${RESET}`);
    } else {
      log(`${BOLD}  Done:${RESET} ${summary.replaced} replaced, ${summary.added} added, ${summary.preserved} preserved, ${summary.kept} kept, ${summary.backedUp} backed up`);
    }
    blank();
  } finally {
    try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch {}
  }
}

module.exports = { run, runReplace, runMerge, walkFiles, matchPattern };
