/**
 * Project State Management
 *
 * Manages project metadata (title, genre, etc.) with localStorage persistence.
 * Pure state management - no DOM manipulation.
 */

const STORAGE_KEY = 'stc_project';

const DEFAULT_PROJECT = {
  title: '',
  genre: '',
  createdAt: null,
  updatedAt: null
};

/**
 * Get project data from storage
 */
export function getProject() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULT_PROJECT, ...JSON.parse(stored) } : { ...DEFAULT_PROJECT };
  } catch (e) {
    console.error('Failed to load project:', e);
    return { ...DEFAULT_PROJECT };
  }
}

/**
 * Save project data
 */
export function saveProject(project) {
  try {
    const data = {
      ...project,
      updatedAt: new Date().toISOString()
    };
    if (!data.createdAt) {
      data.createdAt = data.updatedAt;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Failed to save project:', e);
    return false;
  }
}

/**
 * Update a single project field
 */
export function updateProjectField(field, value) {
  const project = getProject();
  project[field] = value;
  return saveProject(project);
}

/**
 * Clear project data
 */
export function clearProject() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.error('Failed to clear project:', e);
    return false;
  }
}

/**
 * Subscribe to storage changes (for multi-tab sync)
 */
export function onProjectChange(callback) {
  const handler = (e) => {
    if (e.key === STORAGE_KEY) {
      callback(getProject());
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
