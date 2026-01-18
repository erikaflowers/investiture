/**
 * STC State Layer - Public API
 *
 * Export all state functions from this file.
 * Views should only import from here, not from individual files.
 */

export {
  getBeatEntries,
  getBeatEntry,
  saveBeatEntry,
  saveAllBeatEntries,
  clearBeatEntries,
  onBeatEntriesChange
} from './beats.js';

export {
  getProject,
  saveProject,
  updateProjectField,
  clearProject,
  onProjectChange
} from './project.js';
