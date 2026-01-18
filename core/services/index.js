/**
 * Services Index
 * Re-exports all services for convenient importing
 *
 * Usage:
 *   import { auth, database, ai } from '../core/services/index.js';
 *   // or
 *   import * as services from '../core/services/index.js';
 */

import * as auth from './auth.js';
import * as database from './database.js';
import * as ai from './ai.js';
import { supabase, testConnection } from './supabase.js';

export { auth, database, ai, supabase };

// Auth exports
export {
  initAuth,
  signIn,
  signInWithEmail,
  signUp,
  signOut,
  getCurrentUser,
  getCurrentUserId,
  isAuthenticated,
  onAuthChange,
} from './auth.js';

// Generic database exports
export {
  query,
  insert,
  update,
  remove,
} from './database.js';

// STC-specific database exports
export {
  // Projects
  createProject,
  getProjectWithRelations,
  getUserProjects,
  updateProjectStatus,
  // Braindumps
  saveBraindump,
  getBraindumps,
  // Premise Spine
  savePremiseSpine,
  getPremiseSpines,
  // Story Shells
  saveStoryShell,
  selectStoryShell,
  getStoryShells,
  // Checkpoints
  saveCheckpoint,
  confirmCheckpoint,
  getCheckpoints,
  // High Concepts
  saveHighConcept,
  confirmHighConcept,
  getHighConcepts,
  // Characters (Phase 2)
  createCharacter,
  updateCharacter,
  deleteCharacter,
  getCharacters,
  getCharacter,
  // Beat Entries (Phase 3)
  saveBeatEntry,
  updateBeatEntry,
  deleteBeatEntry,
  getBeatEntries,
  getBeatEntry,
  upsertBeatEntry,
  // Parking Lot
  addToParkingLot,
  updateParkingLotEntry,
  resolveParkingLotEntry,
  deleteParkingLotEntry,
  getParkingLot,
} from './database.js';

// AI exports
export {
  complete,
  stream,
  isAvailable,
} from './ai.js';

// Supabase exports
export { testConnection };
