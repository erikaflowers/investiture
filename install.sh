#!/bin/bash
# Investiture setup — gets you from zero to running app

set -e

echo ""
echo "  Investiture Setup"
echo "  Getting your development environment ready..."
echo ""

# Detect platform
detect_platform() {
  case "$(uname -s)" in
    Darwin*)  echo "mac" ;;
    Linux*)
      if [ -f /proc/version ] && grep -qi microsoft /proc/version; then
        echo "linux"  # WSL behaves like Linux for install purposes
      else
        echo "linux"
      fi
      ;;
    MINGW*|MSYS*|CYGWIN*) echo "windows" ;;
    *) echo "unknown" ;;
  esac
}

PLATFORM="$(detect_platform)"

if [ "$PLATFORM" = "unknown" ]; then
  echo "  Unsupported operating system: $(uname -s)"
  echo "  This script supports macOS, Linux, and Windows (Git Bash or WSL)."
  exit 1
fi

echo "  Detected platform: $PLATFORM"

# Detect Linux package manager
detect_linux_pkg_manager() {
  if command -v apt-get &> /dev/null; then
    echo "apt"
  elif command -v dnf &> /dev/null; then
    echo "dnf"
  elif command -v pacman &> /dev/null; then
    echo "pacman"
  elif command -v zypper &> /dev/null; then
    echo "zypper"
  else
    echo "unknown"
  fi
}

# 1. Ensure Git is available
if [ "$PLATFORM" = "mac" ]; then
  if ! xcode-select -p &> /dev/null; then
    echo "  Installing command line tools (includes Git)..."
    echo "  A system dialog may appear — click Install and wait for it to finish."
    xcode-select --install
    echo ""
    echo "  After the install finishes, run ./install.sh again."
    echo ""
    exit 0
  else
    echo "  Command line tools found (includes Git)"
  fi
elif [ "$PLATFORM" = "linux" ]; then
  if ! command -v git &> /dev/null; then
    PKG_MANAGER="$(detect_linux_pkg_manager)"
    echo "  Installing Git..."
    case "$PKG_MANAGER" in
      apt)    sudo apt-get update -qq && sudo apt-get install -y -qq git ;;
      dnf)    sudo dnf install -y -q git ;;
      pacman) sudo pacman -Sy --noconfirm git ;;
      zypper) sudo zypper install -y git ;;
      *)
        echo "  Could not detect a supported package manager (apt, dnf, pacman, zypper)."
        echo "  Please install Git manually and re-run this script."
        exit 1
        ;;
    esac
  else
    echo "  Git found"
  fi
elif [ "$PLATFORM" = "windows" ]; then
  if ! command -v git &> /dev/null; then
    echo "  Git is not installed."
    echo "  Download and install it from: https://git-scm.com/download/win"
    echo "  Then re-run this script from Git Bash."
    exit 1
  else
    echo "  Git found"
  fi
fi

# 2. Ensure a package manager / system dependencies
if [ "$PLATFORM" = "mac" ]; then
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
elif [ "$PLATFORM" = "linux" ]; then
  PKG_MANAGER="$(detect_linux_pkg_manager)"
  if [ "$PKG_MANAGER" = "unknown" ]; then
    echo "  Could not detect a supported package manager (apt, dnf, pacman, zypper)."
    echo "  Please install Node.js manually and re-run this script."
    exit 1
  fi
  echo "  Package manager found ($PKG_MANAGER)"
elif [ "$PLATFORM" = "windows" ]; then
  if command -v winget &> /dev/null; then
    WIN_PKG="winget"
    echo "  Package manager found (winget)"
  elif command -v choco &> /dev/null; then
    WIN_PKG="choco"
    echo "  Package manager found (choco)"
  else
    WIN_PKG="none"
  fi
fi

# 3. Ensure Node.js is available
if ! command -v node &> /dev/null; then
  echo "  Installing Node.js..."

  if [ "$PLATFORM" = "mac" ]; then
    brew install node

  elif [ "$PLATFORM" = "linux" ]; then
    PKG_MANAGER="$(detect_linux_pkg_manager)"
    case "$PKG_MANAGER" in
      apt)
        # Use NodeSource for an up-to-date version instead of the distro default
        echo "  Adding NodeSource repository for current Node.js..."
        sudo apt-get update -qq && sudo apt-get install -y -qq ca-certificates curl gnupg
        sudo mkdir -p /etc/apt/keyrings
        curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg 2>/dev/null
        echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list > /dev/null
        sudo apt-get update -qq && sudo apt-get install -y -qq nodejs
        ;;
      dnf)
        sudo dnf install -y -q nodejs npm
        ;;
      pacman)
        sudo pacman -Sy --noconfirm nodejs npm
        ;;
      zypper)
        sudo zypper install -y nodejs npm
        ;;
    esac

  elif [ "$PLATFORM" = "windows" ]; then
    if [ "$WIN_PKG" = "winget" ]; then
      winget install --id OpenJS.NodeJS -e --accept-source-agreements --accept-package-agreements
    elif [ "$WIN_PKG" = "choco" ]; then
      choco install nodejs -y
    else
      echo "  Could not install Node.js automatically."
      echo "  Download and install it from: https://nodejs.org"
      echo "  Then re-run this script."
      exit 1
    fi
  fi

  # Verify node is now available (may need path refresh on Windows)
  if ! command -v node &> /dev/null; then
    echo ""
    echo "  Node.js was installed but isn't available in this shell yet."
    echo "  Close this terminal, open a new one, and re-run ./install.sh"
    exit 0
  fi
else
  echo "  Node.js found ($(node --version))"
fi

# 4. Install project dependencies
echo "  Installing dependencies..."
npm install --silent

# 5. Check for Claude Code
if ! command -v claude &> /dev/null; then
  echo "  Installing Claude Code..."
  npm install -g @anthropic-ai/claude-code
  if command -v claude &> /dev/null; then
    echo "  Claude Code installed"
  else
    echo "  Claude Code install may need a terminal restart."
    echo "  If 'claude' doesn't work, run: npm install -g @anthropic-ai/claude-code"
  fi
else
  echo "  Claude Code found"
fi

# 6. Create CLAUDE.md if it doesn't exist
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

# 7. Check for Git config
echo ""
if ! git config user.name &> /dev/null || ! git config user.email &> /dev/null; then
  echo "  Git is not configured with your name/email."
  echo "  Run these two commands (use your info):"
  echo ""
  echo "    git config --global user.name \"Your Name\""
  echo "    git config --global user.email \"you@example.com\""
  echo ""
fi

# 8. Success
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
