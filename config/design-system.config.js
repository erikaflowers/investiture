/**
 * Design System Configuration
 *
 * Determines which design system/theme to use.
 * Change this to swap in a client's design system or alternate themes.
 */

export default {
  /**
   * Source theme name
   * Options:
   *   - 'default' - Uses /design-system/themes/default.json
   *   - '[client]' - Uses /design-system/themes/[client].json
   */
  source: 'default',

  /**
   * Token format to generate
   * Options: 'scss', 'css', 'both'
   */
  output: 'both',

  /**
   * Whether to include CSS custom properties in output
   */
  cssCustomProperties: true,

  /**
   * Prefix for CSS custom properties
   * Example: 'inv' would generate --inv-color-primary
   * Leave empty for no prefix
   */
  cssPrefix: '',

  /**
   * Path overrides (relative to project root)
   */
  paths: {
    tokensSource: './design-system/tokens/tokens.json',
    scssOutput: './design-system/tokens/_tokens.scss',
    cssOutput: './design-system/tokens/tokens.css',
    themesDir: './design-system/themes',
  },
};
