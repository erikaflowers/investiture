// investiture install-zvapps — first-time install of the control panel
// into a downstream project. Copies zvapps/ from upstream, adds scripts
// to the project's package.json, runs npm install, writes version stamp.

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawnSync } = require('child_process');
const { validateExtraction } = require('./update.js');

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GOLD = '\x1b[33m';
const CORAL = '\x1b[38;5;167m';
const BLUE = '\x1b[38;5;74m';
const GREEN = '\x1b[32m';
const WHITE = '\x1b[37m';

const UPSTREAM_REPO = process.env.INVESTITURE_REPO || 'erikaflowers/investiture';
const UPSTREAM_REF = process.env.INVESTITURE_REF || 'main';
const TARBALL_URL = `https://api.github.com/repos/${UPSTREAM_REPO}/tarball/${UPSTREAM_REF}`;

function log(msg) { console.log(msg); }
function blank() { console.log(); }
function banner() {
  blank();
  log(`${GOLD}${BOLD}  investiture${RESET} ${DIM}install-zvapps${RESET}`);
  log(`${DIM}  Install the Investiture Control Panel into this project.${RESET}`);
  blank();
}
function header(text) { log(`${WHITE}${BOLD}  ${text}${RESET}`); blank(); }
function success(msg) { log(`  ${GREEN}+${RESET} ${msg}`); }
function info(msg) { log(`  ${BLUE}>${RESET} ${msg}`); }
function error(msg) { log(`${CORAL}  Error: ${msg}${RESET}`); }

function fetchTarball() {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'investiture-install-'));
  const tarballPath = path.join(tmpRoot, 'source.tar.gz');
  log(`${DIM}  Fetching ${TARBALL_URL}${RESET}`);
  try {
    execSync(`curl -sSL "${TARBALL_URL}" -o "${tarballPath}"`, { stdio: 'pipe' });
    execSync(`tar -xzf "${tarballPath}" -C "${tmpRoot}"`, { stdio: 'pipe' });
  } catch (err) {
    error('failed to fetch or extract upstream tarball');
    error(err.message || String(err));
    try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch {}
    process.exit(1);
  }
  const entries = fs.readdirSync(tmpRoot).filter((name) => name !== 'source.tar.gz');
  const extracted = entries.map((name) => path.join(tmpRoot, name)).find((p) => fs.statSync(p).isDirectory());
  if (!extracted) {
    error('upstream tarball extracted unexpectedly');
    try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch {}
    process.exit(1);
  }
  // R8: nothing in the network-fetched tarball may resolve outside the temp
  // root before we copy it into the downstream project.
  const escape = validateExtraction(tmpRoot, extracted);
  if (escape) {
    error(`refusing unsafe tarball: ${escape} resolves outside the temp root`);
    try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch {}
    process.exit(1);
  }
  return { tmpRoot, source: extracted };
}

function cpR(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  // R8: fs.cpSync instead of execSync("cp -R ...") — no shell.
  fs.cpSync(src, dest, { recursive: true });
}

function addPackageScripts(target) {
  const pkgPath = path.join(target, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    info('no package.json at project root — skipping script additions');
    info(`you can run the control panel via: cd zvapps/control-panel && npm start`);
    return false;
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  pkg.scripts = pkg.scripts || {};
  const scripts = {
    'zvapps': 'npm start --prefix zvapps/control-panel',
    'zvapps:install': 'npm install --prefix zvapps/control-panel',
    'zvapps:build': 'npm run build --prefix zvapps/control-panel',
  };
  let added = 0;
  for (const [name, cmd] of Object.entries(scripts)) {
    if (!pkg.scripts[name]) {
      pkg.scripts[name] = cmd;
      success(`added script: npm run ${name}`);
      added++;
    }
  }
  if (added > 0) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  } else {
    info('zvapps:* scripts already present — skipping');
  }
  return added > 0;
}

function writeVersionStamp(target, manifestVersion) {
  const stampPath = path.join(target, '.investiture-version.json');
  const now = new Date().toISOString();
  const stamp = {
    version: manifestVersion,
    installedAt: now,
    lastUpdatedAt: now,
    source: `https://github.com/${UPSTREAM_REPO}`,
    ref: UPSTREAM_REF,
  };
  fs.writeFileSync(stampPath, JSON.stringify(stamp, null, 2) + '\n');
  return stamp;
}

function run() {
  banner();
  const target = process.cwd();
  const zvappsPath = path.join(target, 'zvapps');

  log(`${WHITE}${BOLD}  Target:${RESET} ${DIM}${target}${RESET}`);
  blank();

  if (fs.existsSync(zvappsPath)) {
    error(`zvapps/ already exists at ${target}.`);
    log(`${DIM}  Use ${GOLD}npx investiture update${RESET}${DIM} to sync an existing install.${RESET}`);
    blank();
    process.exit(1);
  }

  const { tmpRoot, source } = fetchTarball();
  try {
    const manifestPath = path.join(source, 'cli', 'update-manifest.json');
    if (!fs.existsSync(manifestPath)) {
      error('upstream manifest not found');
      process.exit(1);
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    log(`${DIM}  Upstream version: ${manifest.version}${RESET}`);
    blank();

    // Copy the zvapps/ tree
    header('Installing zvapps/');
    const srcZvapps = path.join(source, 'zvapps');
    if (!fs.existsSync(srcZvapps)) {
      error('upstream tarball has no zvapps/ directory');
      process.exit(1);
    }
    cpR(srcZvapps, zvappsPath);
    success('zvapps/zv-ui/ (shared design system)');
    success('zvapps/control-panel/ (control panel app)');
    blank();

    // Copy skills
    header('Installing skills');
    const srcSkills = path.join(source, '.claude', 'skills');
    const destSkills = path.join(target, '.claude', 'skills');
    if (fs.existsSync(srcSkills)) {
      if (!fs.existsSync(destSkills)) fs.mkdirSync(destSkills, { recursive: true });
      const skillDirs = fs.readdirSync(srcSkills, { withFileTypes: true }).filter((e) => e.isDirectory());
      for (const dir of skillDirs) {
        const src = path.join(srcSkills, dir.name);
        const dest = path.join(destSkills, dir.name);
        if (!fs.existsSync(dest)) {
          cpR(src, dest);
          success(`/${dir.name}`);
        }
      }
    }
    blank();

    // Add package.json scripts
    header('Project scripts');
    addPackageScripts(target);
    blank();

    // Run npm install in zvapps/control-panel
    header('Installing dependencies');
    log(`${DIM}  npm install --prefix zvapps/control-panel${RESET}`);
    const result = spawnSync('npm', ['install', '--prefix', path.join(zvappsPath, 'control-panel')], { stdio: 'inherit' });
    if (result.status !== 0) {
      error('npm install failed — you may need to run it manually');
    }
    blank();

    // Version stamp
    const stamp = writeVersionStamp(target, manifest.version);
    log(`${GREEN}  ✓${RESET} wrote .investiture-version.json ${DIM}(v${stamp.version})${RESET}`);
    blank();

    // Next steps
    log(`${WHITE}${BOLD}  Next steps:${RESET}`);
    blank();
    log(`    ${GOLD}npm run zvapps${RESET}       Start the control panel (port 3067)`);
    log(`    ${GOLD}npx investiture update${RESET}  Pull the latest from upstream`);
    blank();
  } finally {
    try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch {}
  }
}

module.exports = { run };
