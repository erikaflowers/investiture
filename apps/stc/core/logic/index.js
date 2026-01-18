/**
 * STC Logic Layer - Public API
 *
 * Export all logic functions from this file.
 * Views should only import from here, not from individual files.
 */

export {
  beats,
  getAllBeatIds,
  getTotalBeatCount,
  getBeatById,
  getBeatsByAct
} from './beat-definitions.js';

export {
  isBeatFilled,
  isProjectValid,
  countCompletedBeats,
  validateTitle,
  getExportReadiness
} from './validators.js';
