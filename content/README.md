# Content Layer

All user-facing strings live here. Never hardcode text in views.

## Structure

```
content/
├── en/                     # English content
│   ├── common.json        # Shared UI copy
│   └── errors.json        # Error messages
├── schema/
│   └── content-schema.json # Validation schema
└── README.md
```

## Adding Content

Add strings to the appropriate JSON file:

```json
// common.json
{
  "actions": {
    "submit": "Submit",
    "myNewAction": "Do the thing"
  }
}
```

## Using Content in Views

```javascript
import content from '../../content/en/common.json' with { type: 'json' };

button.textContent = content.actions.submit;
```

## Interpolation

Use `{{variable}}` syntax for dynamic values:

```json
{
  "greeting": "Hello, {{name}}!",
  "itemCount": "You have {{count}} items"
}
```

Use the core utility to interpolate:

```javascript
import { utils } from '../../core/index.js';

const message = utils.interpolate(content.greeting, { name: 'User' });
// "Hello, User!"
```

## Adding a New Language

1. Copy the `en` folder to a new locale (e.g., `es`, `fr`, `de`)
2. Translate all strings
3. Update `/config/content.config.js`:

```javascript
export default {
  locales: ['en', 'es', 'fr'],
  // ...
}
```

4. Import the appropriate locale in your view:

```javascript
const locale = navigator.language.split('-')[0];
const content = await import(`../../content/${locale}/common.json`);
```

## Content Categories

### common.json
- `actions` — Button labels, form actions
- `states` — Empty states, loading, success, error
- `auth` — Authentication-related strings

### errors.json
- `network` — Connection and timeout errors
- `auth` — Authentication errors
- `validation` — Form validation messages
- `generic` — Catch-all error messages

## Schema Validation

The `/schema/content-schema.json` file validates content structure. This ensures:

- Required keys are present
- Types are correct
- New locales match the expected structure

## CMS Integration

To load content from a CMS instead of local JSON:

1. Update `/config/content.config.js`:

```javascript
export default {
  source: 'https://your-cms.com/api/content',
  // ...
}
```

2. The content loader will fetch from the CMS endpoint
3. Schema validation still applies to remote content

## Best Practices

- Keep strings short and scannable
- Use sentence case for UI text
- Include context comments for translators
- Test all strings in actual UI context
- Review interpolation variables with translators
