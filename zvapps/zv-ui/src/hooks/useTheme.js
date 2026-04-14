import { useState, useCallback, useEffect } from 'react';
import { getTheme, themeList, getThemeId, setThemeId } from '../themes/index.js';

const THEME_CHANGE_EVENT = 'zv-ui-theme-change';

function notifyThemeChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }
}

export default function useTheme() {
  const [themeId, setLocal] = useState(getThemeId);

  useEffect(() => {
    const handler = () => setLocal(getThemeId());
    window.addEventListener(THEME_CHANGE_EVENT, handler);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, handler);
  }, []);

  const setTheme = useCallback((id) => {
    setThemeId(id);
    setLocal(id);
    notifyThemeChange();
  }, []);

  return {
    theme: getTheme(themeId),
    themeId,
    setTheme,
    themes: themeList,
  };
}
