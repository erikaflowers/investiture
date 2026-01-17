# Views

This directory contains UI implementations. Each subdirectory is a complete, self-contained view implementation.

## Current Implementations

- **vanilla/** — Pure JavaScript implementation (no framework)

## Architecture

Each view implementation must:

1. **Import from core only** — Never import services directly
2. **Use design tokens** — Never hardcode colors or spacing
3. **Use content from JSON** — Never hardcode user-facing strings

```javascript
// CORRECT
import { api, state } from '../../core/index.js';
import content from '../../content/en/common.json';

// WRONG
import { signIn } from '../../core/services/auth.js';
const buttonText = 'Submit'; // Hardcoded!
```

## Adding a New View Framework

### 1. Create the Directory

```bash
mkdir views/react
```

### 2. Set Up the Framework

Follow the framework's standard setup. For React:

```bash
cd views/react
npm create vite@latest . -- --template react
```

### 3. Import Core

```javascript
import { api, state, utils, init } from '../../core/index.js';
```

### 4. Import Content

```javascript
import content from '../../content/en/common.json';

function Button() {
  return <button>{content.actions.submit}</button>;
}
```

### 5. Use Design Tokens

Option A: CSS Custom Properties (recommended for most frameworks)
```css
.button {
  background: var(--color-accent-primary);
  padding: var(--spacing-sm) var(--spacing-md);
}
```

Option B: Import SCSS
```scss
@import '../../shared/scss/variables';

.button {
  background: $color-accent-primary;
}
```

### 6. Subscribe to State

```javascript
import { state, init } from '../../core/index.js';

// React example
function App() {
  const [appState, setAppState] = useState(null);

  useEffect(() => {
    init();
    return state.subscribe(setAppState);
  }, []);

  if (!appState) return <Loading />;

  return <Main user={appState.user} />;
}
```

### 7. Document Setup

Create a `README.md` in your view directory explaining:

- How to install dependencies
- How to run development server
- How to build for production
- Any framework-specific considerations

## View Checklist

Before considering a view implementation complete:

- [ ] Imports core through `core/index.js` only
- [ ] All text comes from content JSON
- [ ] All styles use design tokens
- [ ] Subscribes to state changes
- [ ] Handles loading and error states
- [ ] Accessible (keyboard nav, screen readers)
- [ ] Responsive (uses breakpoint tokens)
- [ ] Has a README with setup instructions

## Deleting a View

Views are self-contained. To remove one:

```bash
rm -rf views/[framework]
```

No other code changes needed.
