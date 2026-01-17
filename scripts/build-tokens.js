#!/usr/bin/env node

/**
 * Build Tokens Script
 *
 * Generates SCSS and CSS token files from the canonical tokens.json
 *
 * Usage: npm run build:tokens
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Paths
const TOKENS_JSON = join(rootDir, 'design-system/tokens/tokens.json');
const TOKENS_SCSS = join(rootDir, 'design-system/tokens/_tokens.scss');
const TOKENS_CSS = join(rootDir, 'design-system/tokens/tokens.css');

/**
 * Flatten nested object into key-value pairs with dashed keys
 */
function flattenTokens(obj, prefix = '') {
  const result = [];

  for (const [key, value] of Object.entries(obj)) {
    const newPrefix = prefix ? `${prefix}-${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result.push(...flattenTokens(value, newPrefix));
    } else {
      result.push({ key: newPrefix, value });
    }
  }

  return result;
}

/**
 * Generate SCSS variables
 */
function generateSCSS(tokens) {
  const flat = flattenTokens(tokens);
  const lines = [
    '// =============================================================================',
    '// Design Tokens - Auto-generated from tokens.json',
    '// DO NOT EDIT DIRECTLY - Run `npm run build:tokens` to regenerate',
    '// =============================================================================',
    '',
  ];

  // Group by category
  const categories = {};
  for (const { key, value } of flat) {
    const category = key.split('-')[0];
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push({ key, value });
  }

  for (const [category, items] of Object.entries(categories)) {
    lines.push(`// ${category.charAt(0).toUpperCase() + category.slice(1)}`);
    for (const { key, value } of items) {
      const scssKey = `$${key}`;
      const scssValue = typeof value === 'string' ? value : value;
      lines.push(`${scssKey}: ${scssValue};`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate CSS custom properties
 */
function generateCSS(tokens) {
  const flat = flattenTokens(tokens);
  const lines = [
    '/* =============================================================================',
    '   Design Tokens - CSS Custom Properties',
    '   Auto-generated from tokens.json',
    '   DO NOT EDIT DIRECTLY - Run `npm run build:tokens` to regenerate',
    '   ============================================================================= */',
    '',
    ':root {',
  ];

  // Group by category
  const categories = {};
  for (const { key, value } of flat) {
    const category = key.split('-')[0];
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push({ key, value });
  }

  for (const [category, items] of Object.entries(categories)) {
    lines.push(`  /* ${category.charAt(0).toUpperCase() + category.slice(1)} */`);
    for (const { key, value } of items) {
      const cssKey = `--${key}`;
      lines.push(`  ${cssKey}: ${value};`);
    }
    lines.push('');
  }

  lines.push('}');

  return lines.join('\n');
}

// Main
try {
  console.log('Building tokens...');

  const tokensJson = readFileSync(TOKENS_JSON, 'utf8');
  const tokens = JSON.parse(tokensJson);

  const scss = generateSCSS(tokens);
  const css = generateCSS(tokens);

  writeFileSync(TOKENS_SCSS, scss);
  console.log(`  ✓ Generated ${TOKENS_SCSS}`);

  writeFileSync(TOKENS_CSS, css);
  console.log(`  ✓ Generated ${TOKENS_CSS}`);

  console.log('Done!');
} catch (error) {
  console.error('Error building tokens:', error.message);
  process.exit(1);
}
