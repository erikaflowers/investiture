# Design System Primitives

This directory contains component API definitions — the contracts that describe how UI components should behave across all view implementations.

## Purpose

Primitives define the **interface** of a component without implementing it. This allows:

- Consistent component APIs across vanilla JS, React, Svelte, etc.
- Designer-developer alignment on component capabilities
- Documentation of props, states, and behaviors

## Structure

Each primitive is defined as a JSON or TypeScript file:

```
primitives/
├── Button.json
├── Input.json
├── Card.json
├── Modal.json
└── ...
```

## Example Primitive

```json
{
  "name": "Button",
  "description": "Interactive button for user actions",
  "props": {
    "variant": {
      "type": "enum",
      "values": ["primary", "secondary", "ghost"],
      "default": "primary",
      "description": "Visual style variant"
    },
    "size": {
      "type": "enum",
      "values": ["sm", "md", "lg"],
      "default": "md",
      "description": "Button size"
    },
    "disabled": {
      "type": "boolean",
      "default": false,
      "description": "Whether the button is disabled"
    },
    "loading": {
      "type": "boolean",
      "default": false,
      "description": "Shows loading state"
    }
  },
  "slots": {
    "default": "Button label content",
    "icon": "Optional icon before label"
  },
  "events": {
    "click": "Fired when button is clicked (not fired when disabled)"
  },
  "accessibility": {
    "role": "button",
    "focusable": true,
    "keyboardInteraction": ["Enter", "Space"]
  }
}
```

## Usage in Views

View implementations should follow these primitives:

```javascript
// React implementation
function Button({ variant = 'primary', size = 'md', disabled, loading, children, onClick }) {
  // Implementation follows the primitive contract
}

// Vanilla implementation
function createButton({ variant = 'primary', size = 'md', disabled, loading, label, onClick }) {
  // Implementation follows the primitive contract
}
```

## Adding New Primitives

1. Create a new JSON file in this directory
2. Define all props with types, defaults, and descriptions
3. Document slots, events, and accessibility requirements
4. Update each view implementation to match the contract
