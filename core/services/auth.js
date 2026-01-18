/**
 * Auth Service
 * Wrapper for authentication operations - powered by Supabase Auth
 *
 * For now, works in "anonymous" mode for testing.
 * Google login will be added in a future phase.
 */

import { supabase } from './supabase.js';

/** @type {object | null} */
let currentUser = null;

/** @type {Set<(user: object | null) => void>} */
const authListeners = new Set();

/**
 * Initialize the auth service
 * Call this once when your app starts
 * @returns {Promise<void>}
 */
export async function initAuth() {
  try {
    // Get current session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('[Auth] Session error:', error);
    }

    currentUser = session?.user ?? null;
    console.log('[Auth] Initialized', currentUser ? `(user: ${currentUser.email || currentUser.id})` : '(no session)');

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] State change:', event);
      currentUser = session?.user ?? null;
      notifyListeners();
    });

    notifyListeners();
  } catch (e) {
    console.error('[Auth] Init error:', e);
    // Continue without auth - app will work in anonymous mode
  }
}

/**
 * Sign in with a provider (Google, GitHub, etc.)
 * @param {string} provider - The auth provider (e.g., 'google', 'github')
 * @returns {Promise<{success: boolean, user: object|null, error: object|null}>}
 */
export async function signIn(provider) {
  try {
    console.log(`[Auth] Signing in with ${provider}`);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    });

    if (error) {
      console.error('[Auth] Sign in error:', error);
      return { success: false, user: null, error };
    }

    // OAuth redirects, so we won't get here immediately
    return { success: true, user: null, error: null };
  } catch (e) {
    console.error('[Auth] Sign in exception:', e);
    return { success: false, user: null, error: { message: e.message } };
  }
}

/**
 * Sign in with email and password
 * @param {string} email - Email address
 * @param {string} password - Password
 * @returns {Promise<{success: boolean, user: object|null, error: object|null}>}
 */
export async function signInWithEmail(email, password) {
  try {
    console.log(`[Auth] Signing in with email: ${email}`);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[Auth] Email sign in error:', error);
      return { success: false, user: null, error };
    }

    currentUser = data.user;
    notifyListeners();

    return { success: true, user: data.user, error: null };
  } catch (e) {
    console.error('[Auth] Email sign in exception:', e);
    return { success: false, user: null, error: { message: e.message } };
  }
}

/**
 * Sign up with email and password
 * @param {string} email - Email address
 * @param {string} password - Password
 * @returns {Promise<{success: boolean, user: object|null, error: object|null}>}
 */
export async function signUp(email, password) {
  try {
    console.log(`[Auth] Signing up with email: ${email}`);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('[Auth] Sign up error:', error);
      return { success: false, user: null, error };
    }

    // Note: User may need to verify email depending on Supabase settings
    return { success: true, user: data.user, error: null };
  } catch (e) {
    console.error('[Auth] Sign up exception:', e);
    return { success: false, user: null, error: { message: e.message } };
  }
}

/**
 * Sign out the current user
 * @returns {Promise<{success: boolean, error: object|null}>}
 */
export async function signOut() {
  try {
    console.log('[Auth] Signing out');

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('[Auth] Sign out error:', error);
      return { success: false, error };
    }

    currentUser = null;
    notifyListeners();

    return { success: true, error: null };
  } catch (e) {
    console.error('[Auth] Sign out exception:', e);
    return { success: false, error: { message: e.message } };
  }
}

/**
 * Get the currently authenticated user
 * @returns {object | null}
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Get the current user's ID (convenience method)
 * @returns {string | null}
 */
export function getCurrentUserId() {
  return currentUser?.id ?? null;
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return currentUser !== null;
}

/**
 * Subscribe to auth state changes
 * @param {(user: object | null) => void} callback
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
