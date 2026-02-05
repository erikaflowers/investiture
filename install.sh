#!/bin/bash
# Investiture setup — gets you from zero to running app

set -e

echo ""
echo "  Investiture Setup"
echo "  Getting your development environment ready..."
echo ""

# 1. Check for Homebrew
if ! command -v brew &> /dev/null; then
  echo "  Installing Homebrew (Mac package manager)..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  # Add to path for Apple Silicon Macs
  if [ -f /opt/homebrew/bin/brew ]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  fi
else
  echo "  Homebrew found"
fi

# 2. Check for Node.js
if ! command -v node &> /dev/null; then
  echo "  Installing Node.js..."
  brew install node
else
  echo "  Node.js found ($(node --version))"
fi

# 3. Install project dependencies
echo "  Installing dependencies..."
npm install --silent

# 4. Create CLAUDE.md if it doesn't exist
if [ ! -f CLAUDE.md ]; then
  echo "  Creating CLAUDE.md..."
  cat > CLAUDE.md << 'CLAUDEMD'
# My App

This is a React application built with Vite.

---

## What is this file?

CLAUDE.md is read by Claude Code when it opens your project. It tells Claude
about your codebase so it can help you build. Think of it as a briefing doc
for your AI assistant.

You can customize this file however you want. Add rules, describe your
architecture, or define a persona for Claude to adopt.

---

## Project Structure

```
demo/App.jsx    — Your main React component. This is where your UI lives.
demo/App.css    — Your styles. Uses CSS variables for theming.
demo/main.jsx   — React mount point. You probably don't need to touch this.
demo/index.html — HTML shell. You probably don't need to touch this.
package.json    — Dependencies and scripts.
```

---

## How to run

```
npm start       — Start the dev server (opens in browser)
```

---

## Persona (optional)

You can give Claude a personality. Uncomment and customize:

<!--
You are a helpful coding assistant who explains what you're doing
as you work. Keep code simple and well-commented. When I ask for
a feature, implement the simplest version first.
-->

---

## Rules (optional)

Add rules here as you learn what works:

<!-- Examples:
- Always use CSS variables for colors, never hardcoded values
- Keep components under 100 lines
- Add comments explaining non-obvious code
-->
CLAUDEMD
  echo "  Created CLAUDE.md — this is your AI assistant's guide to your project"
fi

# 5. Success
echo ""
echo "  Setup complete!"
echo ""
echo "  Your app is in the demo/ folder:"
echo "    demo/App.jsx  — your React component"
echo "    demo/App.css  — your styles"
echo ""
echo "  Next steps:"
echo "    1. Run:  npm start"
echo "    2. Open Claude Code in this folder"
echo "    3. Try:  \"Add a color picker that changes the background\""
echo ""
