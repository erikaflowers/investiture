import { useState, useRef, useEffect } from 'react';
import useTheme from '../hooks/useTheme.js';

function isLightTheme(theme) {
  const hex = theme?.colors?.backgroundPrimary?.replace('#', '');
  if (!hex || hex.length < 6) return false;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

export default function ThemePicker() {
  const { theme: currentTheme, themeId, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const lightThemes = themes.filter(isLightTheme);
  const darkThemes = themes.filter((t) => !isLightTheme(t));

  return (
    <div className="zv-theme-picker" ref={ref}>
      <button
        type="button"
        className="zv-theme-dot-current"
        onClick={() => setOpen((p) => !p)}
        title={currentTheme?.name || 'Theme'}
        aria-label="Switch theme"
        style={{
          background: `linear-gradient(135deg, ${currentTheme?.colors?.backgroundPrimary || '#0d1117'} 50%, ${currentTheme?.colors?.accentPrimary || '#1a6dd2'} 50%)`,
        }}
      />
      {open && (
        <div className="zv-theme-dropdown">
          {lightThemes.length > 0 && (
            <div className="zv-theme-dropdown-section">
              <div className="zv-theme-dropdown-label">Light</div>
              {lightThemes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`zv-theme-dropdown-item${t.id === themeId ? ' active' : ''}`}
                  onClick={() => {
                    setTheme(t.id);
                    setOpen(false);
                  }}
                >
                  <span
                    className="zv-theme-dropdown-swatch"
                    style={{
                      background: `linear-gradient(135deg, ${t.colors.backgroundPrimary} 50%, ${t.colors.accentPrimary} 50%)`,
                    }}
                  />
                  <span className="zv-theme-dropdown-name">{t.name}</span>
                  {t.id === themeId && <span className="zv-theme-dropdown-check">✓</span>}
                </button>
              ))}
            </div>
          )}
          {darkThemes.length > 0 && (
            <div className="zv-theme-dropdown-section">
              <div className="zv-theme-dropdown-label">Dark</div>
              {darkThemes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`zv-theme-dropdown-item${t.id === themeId ? ' active' : ''}`}
                  onClick={() => {
                    setTheme(t.id);
                    setOpen(false);
                  }}
                >
                  <span
                    className="zv-theme-dropdown-swatch"
                    style={{
                      background: `linear-gradient(135deg, ${t.colors.backgroundPrimary} 50%, ${t.colors.accentPrimary} 50%)`,
                    }}
                  />
                  <span className="zv-theme-dropdown-name">{t.name}</span>
                  {t.id === themeId && <span className="zv-theme-dropdown-check">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
