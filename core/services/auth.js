/**
 * Auth Service
 * Wrapper for authentication operations - Supabase-ready but provider-swappable
 *
 * To swap providers, update the internal implementation while keeping the interface stable.
 */

/** @type {import('../types/interfaces.js').User | null} */
let currentUser = null;

/** @type {Set<(user: import('../types/interfaces.js').User | null) => void>} */
const authListeners = new Set();

/**
 * Initialize the auth service
 * Call this once when your app starts
 * @returns {Promise<void>}
 */
export async function initAuth() {
  // TODO: Replace with actual auth provider initialization
  // Example for Supabase:
  // const { data: { session } } = await supabase.auth.getSession();
  // currentUser = session?.user ?? null;

  console.log('[Auth] Initialized');

  // Check for existing session in localStorage (stub implementation)
  const savedUser = localStorage.getItem('investiture_user');
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      notifyListeners();
    } catch (e) {
      localStorage.removeItem('investiture_user');
    }
  }
}

/**
 * Sign in with a provider
 * @param {string} provider - The auth provider (e.g., 'google', 'github', 'email')
 * @param {object} [credentials] - Optional credentials for email/password auth
 * @param {string} [credentials.email] - Email address
 * @param {string} [credentials.password] - Password
 * @returns {Promise<import('../types/interfaces.js').AuthResult>}
 */
export async function signIn(provider, credentials = {}) {
  // TODO: Replace with actual auth provider logic
  // Example for Supabase OAuth:
  // const { data, error } = await supabase.auth.signInWithOAuth({ provider });

  console.log(`[Auth] Signing in with ${provider}`);

  // Stub implementation for demo purposes
  return new Promise((resolve) => {
    setTimeout(() => {
      currentUser = {
        id: 'demo-user-' + Date.now(),
        email: credentials.email || `demo@${provider}.com`,
        provider,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('investiture_user', JSON.stringify(currentUser));
      notifyListeners();

      resolve({
        success: true,
        user: currentUser,
        error: null,
      });
    }, 500);
  });
}

/**
 * Sign out the current user
 * @returns {Promise<import('../types/interfaces.js').AuthResult>}
 */
export async function signOut() {
  // TODO: Replace with actual auth provider logic
  // Example for Supabase:
  // const { error } = await supabase.auth.signOut();

  console.log('[Auth] Signing out');

  return new Promise((resolve) => {
    setTimeout(() => {
      currentUser = null;
      localStorage.removeItem('investiture_user');
      notifyListeners();

      resolve({
        success: true,
        user: null,
        error: null,
      });
    }, 200);
  });
}

/**
 * Get the currently authenticated user
 * @returns {import('../types/interfaces.js').User | null}
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Subscribe to auth state changes
 * @param {(user: import('../types/interfaces.js').User | null) => void} callback
 * @returns {() => void} Unsubscribe function
 */
export function onAuthChange(callback) {
  authListeners.add(callback);

  // Immediately call with current state
  callback(currentUser);

  // Return unsubscribe function
  return () => {
    authListeners.delete(callback);
  };
}

/**
 * Notify all listeners of auth state change
 * @private
 */
function notifyListeners() {
  authListeners.forEach((callback) => {
    try {
      callback(currentUser);
    } catch (e) {
      console.error('[Auth] Listener error:', e);
    }
  });
}
