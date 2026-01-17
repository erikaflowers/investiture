# Themes

This directory contains theme configurations that override or extend the base design tokens.

## How Themes Work

1. `tokens.json` in `/tokens/` is the base design system
2. Theme files here can override any token values
3. Build process merges base + theme to generate final tokens

## Adding a Client Theme

1. Create `[client].json` in this directory:

```json
{
  "name": "Acme Corp",
  "description": "Brand theme for Acme Corporation",
  "version": "1.0.0",
  "extends": "default",
  "overrides": {
    "color": {
      "accent": {
        "primary": "#0066cc",
        "secondary": "#00994d"
      },
      "background": {
        "primary": "#ffffff",
        "secondary": "#f5f5f5"
      }
    }
  }
}
```

2. Update `/config/design-system.config.js`:

```javascript
export default {
  source: 'acme',
  // ...
}
```

3. Regenerate tokens:

```bash
npm run build:tokens
```

## Theme File Structure

```json
{
  "name": "Theme Display Name",
  "description": "What this theme is for",
  "version": "1.0.0",
  "extends": "default | null",
  "overrides": {
    // Only include tokens you want to change
    // Structure mirrors tokens.json
  }
}
```

## Best Practices

- Only override what's necessary — inherit the rest
- Document the use case for each theme
- Test themes across all view implementations
- Keep color contrast ratios accessible (WCAG AA minimum)
- Version themes alongside the main codebase

## Light Theme Example

```json
{
  "name": "Light Mode",
  "extends": "default",
  "overrides": {
    "color": {
      "background": {
        "primary": "#ffffff",
        "secondary": "#f8f9fa",
        "tertiary": "#e9ecef"
      },
      "text": {
        "primary": "#212529",
        "secondary": "#495057",
        "muted": "#6c757d"
      },
      "border": {
        "default": "#dee2e6",
        "focus": "#ff6b6b"
      }
    },
    "shadow": {
      "sm": "0 1px 2px rgba(0,0,0,0.05)",
      "md": "0 4px 6px rgba(0,0,0,0.07)",
      "lg": "0 10px 15px rgba(0,0,0,0.1)"
    }
  }
}
```
