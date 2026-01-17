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

// =============================================================================
// Application State
// =============================================================================

/** @type {import('./types/interfaces.js').AppState} */
let appState = {
  user: null,
  isLoading: false,
  error: null,
  theme: 'default',
  locale: 'en',
};

/** @type {Set<(state: import('./types/interfaces.js').AppState) => void>} */
const stateListeners = new Set();

/**
 * Get current application state
 * @returns {import('./types/interfaces.js').AppState}
 */
function getState() {
  return { ...appState };
}

/**
 * Get current user
 * @returns {import('./types/interfaces.js').User | null}
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
 * @param {Partial<import('./types/interfaces.js').AppState>} updates
 */
function setState(updates) {
  appState = { ...appState, ...updates };
  notifyStateListeners();
}

/**
 * Subscribe to state changes
 * @param {(state: import('./types/interfaces.js').AppState) => void} callback
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
    signOut: auth.signOut,
    getCurrentUser: auth.getCurrentUser,
    onAuthChange: auth.onAuthChange,
  },
  database: {
    query: database.query,
    insert: database.insert,
    update: database.update,
    delete: database.remove,
  },
  ai: {
    complete: ai.complete,
    stream: ai.stream,
    isAvailable: ai.isAvailable,
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
