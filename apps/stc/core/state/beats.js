/**
 * Beat State Management
 *
 * Manages user's beat entries with localStorage persistence.
 * Pure state management - no DOM manipulation.
 */

const STORAGE_KEY = 'stc_beats';

/**
 * Get all beat entries from storage
 */
export function getBeatEntries() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error('Failed to load beat entries:', e);
    return {};
  }
}

/**
 * Get a single beat entry
 */
export function getBeatEntry(beatId) {
  const entries = getBeatEntries();
  return entries[beatId] || '';
}

/**
 * Save a single beat entry
 */
export function saveBeatEntry(beatId, content) {
  const entries = getBeatEntries();
  entries[beatId] = content;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch (e) {
    console.error('Failed to save beat entry:', e);
    return false;
  }
}

/**
 * Save all beat entries at once
 */
export function saveAllBeatEntries(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch (e) {
    console.error('Failed to save beat entries:', e);
    return false;
  }
}

/**
 * Clear all beat entries
 */
export function clearBeatEntries() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.error('Failed to clear beat entries:', e);
    return false;
  }
}

/**
 * Subscribe to storage changes (for multi-tab sync)
 */
export function onBeatEntriesChange(callback) {
  const handler = (e) => {
    if (e.key === STORAGE_KEY) {
      callback(getBeatEntries());
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
