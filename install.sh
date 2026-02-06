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

A React application with clean architecture.

---

## Project Structure

```
src/              — YOUR APP (start here)
  App.jsx         — Your main component
  App.css         — Your styles

design-system/    — Visual foundation
  tokens.css      — Colors, spacing, typography as CSS variables

content/          — User-facing strings
  en.json         — All text in one place

core/             — Pure business logic
  utils.js        — Helper functions (no side effects)

services/         — External integrations
  api.js          — API client (swap for your backend)

examples/         — Reference implementations
  App.jsx         — Counter, theme toggle, animations
```

---

## Architecture Rules

When adding features, follow this pattern:

1. **UI goes in src/** — Components, styles, layouts
2. **Strings go in content/** — No hardcoded text in components
3. **Styles use tokens** — Always use CSS variables from design-system/
4. **Logic goes in core/** — Pure functions, no API calls
5. **API calls go in services/** — All external data through services/

---

## Do Not

- Put API calls in components — use services/
- Hardcode colors — use design-system/tokens.css
- Inline user-facing strings — use content/en.json
- Mix business logic with UI — keep core/ pure

---

## How to Run

```
npm start        — Run your app (localhost:3000)
npm run examples — See the demo app (localhost:3001)
```

---

## Starter Prompts

Try these in Claude Code:

1. "Add a todo list that saves to localStorage"
2. "Add a dark mode toggle using the design tokens"
3. "Fetch data from an API and display it"

## Version Control

This project uses Git. Claude Code can handle Git commands for you:

- "Commit my work" — saves a checkpoint you can return to
- "Create a branch called experiment" — try ideas without risk
- "Undo my last changes" — roll back if something breaks
CLAUDEMD
  echo "  Created CLAUDE.md — this is your AI assistant's guide to your project"
fi

# 5. Check for Git config
echo ""
if ! git config user.name &> /dev/null || ! git config user.email &> /dev/null; then
  echo "  ⚠  Git is not configured with your name/email."
  echo "  Run these two commands (use your info):"
  echo ""
  echo "    git config --global user.name \"Your Name\""
  echo "    git config --global user.email \"you@example.com\""
  echo ""
fi

# 6. Success
echo "  Setup complete!"
echo ""
echo "  Your app is in the src/ folder:"
echo "    src/App.jsx         — your React component"
echo "    src/App.css         — your styles"
echo ""
echo "  Architecture folders:"
echo "    design-system/      — CSS variables and tokens"
echo "    content/            — user-facing strings"
echo "    core/               — pure business logic"
echo "    services/           — API and external integrations"
echo ""
echo "  Next steps:"
echo "    1. Run:  npm start"
echo "    2. Open Claude Code in this folder"
echo "    3. Try:  \"Add a todo list that saves to localStorage\""
echo ""
echo "  Version control (important!):"
echo "    Save your work anytime:  git add . && git commit -m \"describe what changed\""
echo "    Undo a mistake:          git checkout ."
echo "    Push to GitHub:          git push"
echo "    Or just ask Claude Code: \"commit my work\""
echo ""
echo "  Run 'npm run examples' to see interactive demos."
echo ""
