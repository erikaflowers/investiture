#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GOLD = '\x1b[33m';
const CORAL = '\x1b[38;5;167m';
const BLUE = '\x1b[38;5;74m';
const GREEN = '\x1b[32m';
const WHITE = '\x1b[37m';

const BRAND = `${GOLD}investiture${RESET}`;

function log(msg) { console.log(msg); }
function blank() { console.log(); }

function success(msg) { log(`  ${GREEN}+${RESET} ${msg}`); }
function skip(msg) { log(`  ${DIM}-${RESET} ${DIM}${msg}${RESET}`); }
function info(msg) { log(`  ${BLUE}>${RESET} ${msg}`); }

function banner() {
  blank();
  log(`${GOLD}${BOLD}  investiture${RESET} ${DIM}v${require('../package.json').version}${RESET}`);
  log(`${DIM}  Intent before implementation.${RESET}`);
  blank();
}

function usage() {
  banner();
  log(`${WHITE}${BOLD}  Usage:${RESET}`);
  blank();
  log(`    ${GOLD}npx investiture init${RESET}        Add skills + schemas to an existing project`);
  log(`    ${GOLD}npx investiture init --fresh${RESET} Also create starter doctrine templates`);
  log(`    ${GOLD}npx investiture --help${RESET}       Show this message`);
  blank();
  log(`${DIM}  After init, open Claude Code and run /invest-backfill${RESET}`);
  blank();
}

// --- File operations ---

const templatesDir = path.join(__dirname, '..', 'templates');
const targetDir = process.cwd();

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    return true;
  }
  return false;
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// --- Init command ---

function init(fresh) {
  banner();

  // Sanity check: are we in a real directory?
  if (!fs.existsSync(targetDir)) {
    log(`${CORAL}  Error: Directory does not exist.${RESET}`);
    process.exit(1);
  }

  log(`${WHITE}${BOLD}  Installing to:${RESET} ${DIM}${targetDir}${RESET}`);
  blank();

  let installed = 0;
  let skipped = 0;

  // 1. Skills
  log(`${GOLD}${BOLD}  Skills${RESET} ${DIM}.claude/skills/${RESET}`);
  blank();

  const skills = ['invest-backfill', 'invest-doctrine', 'invest-architecture'];
  for (const skill of skills) {
    const dest = path.join(targetDir, '.claude', 'skills', skill, 'SKILL.md');
    const src = path.join(templatesDir, 'skills', skill, 'SKILL.md');

    if (fileExists(dest)) {
      skip(`${skill}/SKILL.md (already exists)`);
      skipped++;
    } else {
      copyFile(src, dest);
      success(`${skill}/SKILL.md`);
      installed++;
    }
  }
  blank();

  // 2. Research schemas
  log(`${BLUE}${BOLD}  Schemas${RESET} ${DIM}vector/schemas/${RESET}`);
  blank();

  const schemaFiles = fs.readdirSync(path.join(templatesDir, 'schemas'));
  for (const file of schemaFiles) {
    const dest = path.join(targetDir, 'vector', 'schemas', file);
    const src = path.join(templatesDir, 'schemas', file);

    if (fileExists(dest)) {
      skip(`${file} (already exists)`);
      skipped++;
    } else {
      copyFile(src, dest);
      success(file);
      installed++;
    }
  }
  blank();

  // 3. Vector directory structure
  log(`${BLUE}${BOLD}  Research${RESET} ${DIM}vector/${RESET}`);
  blank();

  const researchDirs = [
    'vector/research/personas',
    'vector/research/jtbd',
    'vector/research/interviews',
    'vector/research/assumptions',
    'vector/research/competitive',
    'vector/decisions',
    'vector/audits',
  ];

  for (const dir of researchDirs) {
    const fullPath = path.join(targetDir, dir);
    if (ensureDir(fullPath)) {
      success(dir + '/');
      installed++;
      // Add .gitkeep to empty dirs
      const gitkeep = path.join(fullPath, '.gitkeep');
      if (!fileExists(gitkeep)) {
        fs.writeFileSync(gitkeep, '');
      }
    } else {
      skip(`${dir}/ (already exists)`);
      skipped++;
    }
  }

  // Copy ADR template
  const adrDest = path.join(targetDir, 'vector', 'decisions', 'ADR-000-template.md');
  const adrSrc = path.join(templatesDir, 'decisions', 'ADR-000-template.md');
  if (!fileExists(adrDest)) {
    copyFile(adrSrc, adrDest);
    success('ADR-000-template.md');
    installed++;
  }

  // Copy research README
  const readmeDest = path.join(targetDir, 'vector', 'research', 'README.md');
  const readmeSrc = path.join(templatesDir, 'research', 'README.md');
  if (!fileExists(readmeDest)) {
    copyFile(readmeSrc, readmeDest);
    success('research/README.md');
    installed++;
  }
  blank();

  // 4. Fresh mode: create starter doctrine files
  if (fresh) {
    log(`${CORAL}${BOLD}  Doctrine${RESET} ${DIM}(starter templates)${RESET}`);
    blank();

    const doctrineFiles = [
      { name: 'VECTOR.md', content: vectorTemplate() },
      { name: 'ARCHITECTURE.md', content: architectureTemplate() },
    ];

    for (const doc of doctrineFiles) {
      const dest = path.join(targetDir, doc.name);
      if (fileExists(dest)) {
        skip(`${doc.name} (already exists)`);
        skipped++;
      } else {
        fs.writeFileSync(dest, doc.content);
        success(doc.name);
        installed++;
      }
    }
    blank();
  }

  // Summary
  log(`${GOLD}${BOLD}  Done.${RESET} ${GREEN}${installed} added${RESET}${skipped > 0 ? `, ${DIM}${skipped} skipped${RESET}` : ''}`);
  blank();

  // Next steps
  log(`${WHITE}${BOLD}  What's next:${RESET}`);
  blank();
  if (fresh) {
    log(`    1. Fill in ${GOLD}VECTOR.md${RESET} with your project identity`);
    log(`    2. Open Claude Code and run ${GOLD}/invest-doctrine${RESET}`);
    log(`    3. Run ${GOLD}/invest-architecture${RESET} to set your rules`);
  } else {
    log(`    1. Open Claude Code in this project`);
    log(`    2. Run ${GOLD}/invest-backfill${RESET} to generate doctrine from your codebase`);
    log(`    3. Fill in the operator prompts (the parts only you know)`);
    log(`    4. Run ${GOLD}/invest-doctrine${RESET} to validate`);
    log(`    5. Run ${GOLD}/invest-architecture${RESET} to enforce`);
  }
  blank();
  log(`${DIM}  https://zerovector.design/investiture${RESET}`);
  blank();
}

// --- Doctrine templates for --fresh ---

function vectorTemplate() {
  return `# VECTOR.md

## Project Identity

**Name:** [Your project name]
**One-liner:** [What this project does in one sentence]
**For:** [Who this is for]
**Problem:** [What problem it solves]

## What We Know

[What do you already know about your users, their needs, and the domain?]

## What We Need to Learn

[What are your open questions? What assumptions need validation?]

## Principles

1. [Principle one]
2. [Principle two]
3. [Principle three]

## Success Looks Like

[How will you know this project is working?]
`;
}

function architectureTemplate() {
  return `# ARCHITECTURE.md

## Stack

[Your technology stack]

## Layers

[Define your architectural layers and what belongs in each]

## Import Rules

[Which layers can import from which? Define the dependency direction]

## Naming Conventions

[File naming, component naming, variable naming patterns]

## Conventions

[Other conventions: state management, error handling, testing, etc.]
`;
}

// --- CLI entry ---

const args = process.argv.slice(2);
const command = args[0];
const flags = args.slice(1);

if (!command || command === '--help' || command === '-h') {
  usage();
  process.exit(0);
}

if (command === 'init') {
  const fresh = flags.includes('--fresh');
  init(fresh);
} else {
  log(`${CORAL}  Unknown command: ${command}${RESET}`);
  usage();
  process.exit(1);
}
