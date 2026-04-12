// Zero Vector UI — Theme Registry
// Ported from Labrador (3 native themes only; community themes deferred).
// Drop-in extension: add new themes here and they appear in the picker.

import labradorDark from './labrador-dark.js';
import labradorLight from './labrador-light.js';
import labradorMidnight from './labrador-midnight.js';

// Theme ID → theme object
export const themes = {
  'labrador-light': labradorLight,
  'labrador-dark': labradorDark,
  'labrador-midnight': labradorMidnight,
};

// Ordered list for UI rendering
export const themeList = [
  labradorLight,
  labradorDark,
  labradorMidnight,
];

// ── Color key → CSS variable mapping ──────────────────────────────────────
const COLOR_MAP = {
  backgroundPrimary: '--bg-primary',
  backgroundSecondary: '--bg-secondary',
  backgroundTertiary: '--bg-tertiary',
  textPrimary: '--text-primary',
  textSecondary: '--text-secondary',
  textMuted: '--text-muted',
  borderDefault: '--border',
  borderLight: '--border-light',
  accentPrimary: '--accent',
  accentPrimaryHover: '--accent-hover',
  accentSecondary: '--accent-secondary',
  accentBackground: '--accent-dim',
  success: '--success',
  successBackground: '--success-bg',
  error: '--error',
  errorBackground: '--error-bg',
  warning: '--warning',
  warningBackground: '--warning-bg',
  buttonText: '--button-text',
  overlayBackdrop: '--overlay-backdrop',
};

const ALL_VARS = [
  '--bg-primary', '--bg-secondary', '--bg-tertiary', '--bg-hover',
  '--border', '--border-light',
  '--text-primary', '--text-secondary', '--text-muted',
  '--accent', '--accent-hover', '--accent-secondary', '--accent-dim',
  '--error', '--error-bg',
  '--success', '--success-bg',
  '--warning', '--warning-bg',
  '--button-text', '--overlay-backdrop',
];

// ── Apply / clear theme ───────────────────────────────────────────────────

export function applyTheme(theme) {
  if (!theme?.colors || typeof document === 'undefined') return;
  const root = document.documentElement;
  clearTheme();
  for (const [colorKey, cssVar] of Object.entries(COLOR_MAP)) {
    if (theme.colors[colorKey]) {
      root.style.setProperty(cssVar, theme.colors[colorKey]);
    }
  }
  // Auto-derive hover surface from tertiary background
  const tertiary = theme.colors.backgroundTertiary || theme.colors.backgroundSecondary;
  if (tertiary) root.style.setProperty('--bg-hover', tertiary);
}

export function clearTheme() {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const v of ALL_VARS) {
    root.style.removeProperty(v);
  }
}

// ── Module-level theme store ──────────────────────────────────────────────
const THEME_KEY = 'zv-ui_theme';

let currentId = (() => {
  if (typeof localStorage === 'undefined') return 'labrador-light';
  const saved = localStorage.getItem(THEME_KEY);
  return saved && themes[saved] ? saved : 'labrador-light';
})();

// Apply on module load so there's no flash of unstyled content
applyTheme(themes[currentId]);

export function getTheme(id) {
  return themes[id] || themes['labrador-light'];
}

export function getThemeId() {
  return currentId;
}

export function setThemeId(id) {
  if (!themes[id] || id === currentId) return;
  currentId = id;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(THEME_KEY, id);
  }
  applyTheme(getTheme(id));
}

export default themes;
