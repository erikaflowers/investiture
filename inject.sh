#!/usr/bin/env bash
# Investiture — inject skills + schemas into an existing project
# Usage: bash <(curl -fsSL https://raw.githubusercontent.com/erikaflowers/investiture/main/inject.sh)

set -euo pipefail

GOLD='\033[33m'
GREEN='\033[32m'
BLUE='\033[34m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'
CORAL='\033[38;5;167m'

REPO="erikaflowers/investiture"
BRANCH="main"
RAW="https://raw.githubusercontent.com/${REPO}/${BRANCH}"

echo ""
echo -e "${GOLD}${BOLD}  investiture${RESET}"
echo -e "${DIM}  Intent before implementation.${RESET}"
echo ""

# Check we're in a real project directory
if [ ! -d ".git" ] && [ ! -f "package.json" ] && [ ! -f "Cargo.toml" ] && [ ! -f "go.mod" ] && [ ! -f "pyproject.toml" ] && [ ! -f "Makefile" ]; then
  echo -e "${CORAL}  Warning: This doesn't look like a project directory.${RESET}"
  echo -e "${DIM}  Run this from the root of your project.${RESET}"
  echo ""
  read -p "  Continue anyway? [y/N] " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo -e "${DIM}  Installing to: $(pwd)${RESET}"
echo ""

installed=0

# --- Skills ---
echo -e "${GOLD}${BOLD}  Skills${RESET} ${DIM}.claude/skills/${RESET}"
echo ""

skills=("invest-backfill" "invest-doctrine" "invest-architecture")
for skill in "${skills[@]}"; do
  dest=".claude/skills/${skill}/SKILL.md"
  if [ -f "$dest" ]; then
    echo -e "  ${DIM}- ${skill}/SKILL.md (already exists)${RESET}"
  else
    mkdir -p ".claude/skills/${skill}"
    curl -fsSL "${RAW}/.claude/skills/${skill}/SKILL.md" -o "$dest"
    echo -e "  ${GREEN}+${RESET} ${skill}/SKILL.md"
    ((installed++))
  fi
done
echo ""

# --- Schemas ---
echo -e "${BLUE}${BOLD}  Schemas${RESET} ${DIM}vector/schemas/${RESET}"
echo ""

schemas=("zv-assumption.json" "zv-blue-ocean.json" "zv-competitive.json" "zv-interview.json" "zv-jtbd.json" "zv-persona.json")
mkdir -p "vector/schemas"
for schema in "${schemas[@]}"; do
  dest="vector/schemas/${schema}"
  if [ -f "$dest" ]; then
    echo -e "  ${DIM}- ${schema} (already exists)${RESET}"
  else
    curl -fsSL "${RAW}/vector/schemas/${schema}" -o "$dest"
    echo -e "  ${GREEN}+${RESET} ${schema}"
    ((installed++))
  fi
done
echo ""

# --- Research directories ---
echo -e "${BLUE}${BOLD}  Research${RESET} ${DIM}vector/${RESET}"
echo ""

dirs=("vector/research/personas" "vector/research/jtbd" "vector/research/interviews" "vector/research/assumptions" "vector/research/competitive" "vector/decisions" "vector/audits")
for dir in "${dirs[@]}"; do
  if [ -d "$dir" ]; then
    echo -e "  ${DIM}- ${dir}/ (already exists)${RESET}"
  else
    mkdir -p "$dir"
    touch "${dir}/.gitkeep"
    echo -e "  ${GREEN}+${RESET} ${dir}/"
    ((installed++))
  fi
done

# ADR template
if [ ! -f "vector/decisions/ADR-000-template.md" ]; then
  curl -fsSL "${RAW}/vector/decisions/ADR-000-template.md" -o "vector/decisions/ADR-000-template.md"
  echo -e "  ${GREEN}+${RESET} ADR-000-template.md"
  ((installed++))
fi

# Research README
if [ ! -f "vector/research/README.md" ]; then
  curl -fsSL "${RAW}/vector/research/README.md" -o "vector/research/README.md"
  echo -e "  ${GREEN}+${RESET} research/README.md"
  ((installed++))
fi

echo ""
echo -e "${GOLD}${BOLD}  Done.${RESET} ${GREEN}${installed} added${RESET}"
echo ""
echo -e "${BOLD}  What's next:${RESET}"
echo ""
echo -e "    1. Open Claude Code in this project"
echo -e "    2. Run ${GOLD}/invest-backfill${RESET} to generate doctrine from your codebase"
echo -e "    3. Fill in the operator prompts (the parts only you know)"
echo -e "    4. Run ${GOLD}/invest-doctrine${RESET} to validate"
echo -e "    5. Run ${GOLD}/invest-architecture${RESET} to enforce"
echo ""
echo -e "${DIM}  https://zerovector.design/investiture${RESET}"
echo ""
