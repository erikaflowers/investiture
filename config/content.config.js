/**
 * Content Configuration
 *
 * Determines where content is loaded from.
 * Change this to swap between local JSON and a remote CMS.
 */

export default {
  /**
   * Content source
   * Options:
   *   - 'local' - Load from /content/[locale]/*.json
   *   - 'https://...' - Fetch from remote CMS endpoint
   */
  source: 'local',

  /**
   * Default locale
   */
  defaultLocale: 'en',

  /**
   * Fallback locale when a key is missing
   */
  fallbackLocale: 'en',

  /**
   * Available locales
   */
  locales: ['en'],

  /**
   * Content files to load (for local source)
   */
  files: ['common', 'errors'],

  /**
   * Path to local content (relative to project root)
   */
  localPath: './content',

  /**
   * CMS configuration (when source is a URL)
   */
  cms: {
    /**
     * API endpoint for fetching content
     */
    endpoint: null,

    /**
     * API key header name
     */
    apiKeyHeader: 'X-API-Key',

    /**
     * API key (should come from environment variable)
     */
    apiKey: null,

    /**
     * Cache TTL in milliseconds (0 = no cache)
     */
    cacheTTL: 60000,
  },

  /**
   * Enable strict mode - throws on missing keys
   * In development, you might want this true
   * In production, it falls back gracefully
   */
  strict: false,

  /**
   * Path to JSON schema for validation
   */
  schemaPath: './content/schema/content-schema.json',
};
