/**
 * Investiture Core - Public API
 *
 * This is the ONLY way views should interact with the core layer.
 * Never import from services or state directly - always go through this API.
 *
 * Usage in views:
 *   import { api, state } from '../../core/index.js';
 *   await api.auth.signIn('google');
 *   const user = state.getUser();
 */

import * as auth from './services/auth.js';
import * as database from './services/database.js';
import * as ai from './services/ai.js';
import { supabase, testConnection } from './services/supabase.js';

// =============================================================================
// Application State
// =============================================================================

/** @type {object} */
let appState = {
  user: null,
  isLoading: false,
  error: null,
  theme: 'default',
  locale: 'en',
};

/** @type {Set<(state: object) => void>} */
const stateListeners = new Set();

/**
 * Get current application state
 * @returns {object}
 */
function getState() {
  return { ...appState };
}

/**
 * Get current user
 * @returns {object | null}
 */
function getUser() {
  return appState.user;
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
function isAuthenticated() {
  return appState.user !== null;
}

/**
 * Update application state
 * @param {object} updates
 */
function setState(updates) {
  appState = { ...appState, ...updates };
  notifyStateListeners();
}

/**
 * Subscribe to state changes
 * @param {(state: object) => void} callback
 * @returns {() => void} Unsubscribe function
 */
function subscribe(callback) {
  stateListeners.add(callback);
  callback(getState()); // Immediately call with current state
  return () => stateListeners.delete(callback);
}

/**
 * Notify all state listeners
 * @private
 */
function notifyStateListeners() {
  const currentState = getState();
  stateListeners.forEach((cb) => {
    try {
      cb(currentState);
    } catch (e) {
      console.error('[Core] State listener error:', e);
    }
  });
}

// =============================================================================
// Content Utilities
// =============================================================================

/**
 * Interpolate variables into a template string
 * @param {string} template - String with {{variable}} placeholders
 * @param {object} variables - Key-value pairs to interpolate
 * @returns {string}
 */
function interpolate(template, variables = {}) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables.hasOwnProperty(key) ? variables[key] : match;
  });
}

// =============================================================================
// Initialize
// =============================================================================

/**
 * Initialize the application
 * Call this once when your app starts
 * @returns {Promise<void>}
 */
async function init() {
  setState({ isLoading: true });

  try {
    // Initialize auth and sync user state
    await auth.initAuth();

    // Listen for auth changes and update app state
    auth.onAuthChange((user) => {
      setState({ user });
    });

    console.log('[Core] Initialized');
  } catch (error) {
    console.error('[Core] Initialization error:', error);
    setState({
      error: {
        message: 'Failed to initialize application',
        code: 'INIT_ERROR',
        recoverable: true,
      },
    });
  } finally {
    setState({ isLoading: false });
  }
}

// =============================================================================
// Public API
// =============================================================================

/**
 * API namespace - all external service operations
 */
export const api = {
  auth: {
    signIn: auth.signIn,
    signInWithEmail: auth.signInWithEmail,
    signUp: auth.signUp,
    signOut: auth.signOut,
    getCurrentUser: auth.getCurrentUser,
    getCurrentUserId: auth.getCurrentUserId,
    isAuthenticated: auth.isAuthenticated,
    onAuthChange: auth.onAuthChange,
  },
  database: {
    // Generic operations
    query: database.query,
    insert: database.insert,
    update: database.update,
    delete: database.remove,
  },
  // STC-specific database operations
  stc: {
    // Projects
    createProject: database.createProject,
    getProjectWithRelations: database.getProjectWithRelations,
    getUserProjects: database.getUserProjects,
    updateProjectStatus: database.updateProjectStatus,
    // Braindumps
    saveBraindump: database.saveBraindump,
    getBraindumps: database.getBraindumps,
    // Premise Spine
    savePremiseSpine: database.savePremiseSpine,
    getPremiseSpines: database.getPremiseSpines,
    // Story Shells
    saveStoryShell: database.saveStoryShell,
    selectStoryShell: database.selectStoryShell,
    getStoryShells: database.getStoryShells,
    // Checkpoints
    saveCheckpoint: database.saveCheckpoint,
    confirmCheckpoint: database.confirmCheckpoint,
    getCheckpoints: database.getCheckpoints,
    // High Concepts
    saveHighConcept: database.saveHighConcept,
    confirmHighConcept: database.confirmHighConcept,
    getHighConcepts: database.getHighConcepts,
    // Characters (Phase 2)
    createCharacter: database.createCharacter,
    updateCharacter: database.updateCharacter,
    deleteCharacter: database.deleteCharacter,
    getCharacters: database.getCharacters,
    getCharacter: database.getCharacter,
    // Beat Entries (Phase 3)
    saveBeatEntry: database.saveBeatEntry,
    updateBeatEntry: database.updateBeatEntry,
    deleteBeatEntry: database.deleteBeatEntry,
    getBeatEntries: database.getBeatEntries,
    getBeatEntry: database.getBeatEntry,
    upsertBeatEntry: database.upsertBeatEntry,
    // Parking Lot
    addToParkingLot: database.addToParkingLot,
    updateParkingLotEntry: database.updateParkingLotEntry,
    resolveParkingLotEntry: database.resolveParkingLotEntry,
    deleteParkingLotEntry: database.deleteParkingLotEntry,
    getParkingLot: database.getParkingLot,
  },
  ai: {
    complete: ai.complete,
    stream: ai.stream,
    isAvailable: ai.isAvailable,
  },
  // Supabase utilities
  supabase: {
    client: supabase,
    testConnection,
  },
};

/**
 * State namespace - application state management
 */
export const state = {
  get: getState,
  getUser,
  isAuthenticated,
  set: setState,
  subscribe,
};

/**
 * Utils namespace - helper functions
 */
export const utils = {
  interpolate,
};

/**
 * Initialize the application
 */
export { init };

// Default export for convenience
export default {
  api,
  state,
  utils,
  init,
};
