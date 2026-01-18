/**
 * Supabase Client
 *
 * Initializes and exports the Supabase client for use by other services.
 * Uses CDN import for browser compatibility (no bundler required).
 *
 * Configuration:
 * - SUPABASE_URL and SUPABASE_ANON_KEY are public credentials
 * - Row Level Security (RLS) policies protect data on the server
 * - The anon key is safe to expose in client-side code
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Supabase configuration
// These are public credentials - RLS policies protect the data
const SUPABASE_URL = 'https://vfufedgmfcqwimvglvls.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vi8VVrb56M0_TAp3vo2Gow_TXzQQqCV';

// Create and export the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export config for debugging/testing
export const config = {
  url: SUPABASE_URL,
  // Don't expose the full key in logs
  keyPrefix: SUPABASE_ANON_KEY.substring(0, 10) + '...',
};

/**
 * Test the Supabase connection
 * @returns {Promise<{connected: boolean, error: string|null}>}
 */
export async function testConnection() {
  try {
    // Simple query to test connection
    const { error } = await supabase.from('projects').select('count', { count: 'exact', head: true });

    if (error) {
      console.error('[Supabase] Connection test failed:', error.message);
      return { connected: false, error: error.message };
    }

    console.log('[Supabase] Connected successfully');
    return { connected: true, error: null };
  } catch (e) {
    console.error('[Supabase] Connection test error:', e);
    return { connected: false, error: e.message };
  }
}
