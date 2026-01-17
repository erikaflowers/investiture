/**
 * Investiture Type Definitions / Contracts
 *
 * This file defines the interfaces/contracts between layers.
 * Uses JSDoc for type definitions (works in plain JS with IDE support).
 *
 * These types serve as the API contract - if you change these,
 * you're making a breaking change that affects all layers.
 */

// =============================================================================
// Auth Types
// =============================================================================

/**
 * @typedef {object} User
 * @property {string} id - Unique user identifier
 * @property {string} email - User's email address
 * @property {string} [provider] - Auth provider used (google, github, email, etc.)
 * @property {string} [displayName] - User's display name
 * @property {string} [avatarUrl] - URL to user's avatar
 * @property {string} createdAt - ISO timestamp of account creation
 * @property {object} [metadata] - Additional provider-specific metadata
 */

/**
 * @typedef {object} AuthResult
 * @property {boolean} success - Whether the operation succeeded
 * @property {User|null} user - The user object if successful
 * @property {AuthError|null} error - Error details if failed
 */

/**
 * @typedef {object} AuthError
 * @property {string} message - Human-readable error message
 * @property {string} code - Machine-readable error code
 */

// =============================================================================
// Database Types
// =============================================================================

/**
 * @typedef {object} QueryFilters
 * @property {object} [where] - Key-value pairs for filtering
 * @property {OrderBy} [orderBy] - Ordering configuration
 * @property {number} [limit] - Maximum records to return
 * @property {number} [offset] - Records to skip
 */

/**
 * @typedef {object} OrderBy
 * @property {string} field - Field to order by
 * @property {'asc'|'desc'} [direction] - Sort direction
 */

/**
 * @typedef {object} QueryResult
 * @property {Array<object>} data - Array of records
 * @property {DatabaseError|null} error - Error if query failed
 * @property {number} count - Total count of results
 */

/**
 * @typedef {object} MutationResult
 * @property {object|null} data - The affected record
 * @property {DatabaseError|null} error - Error if mutation failed
 */

/**
 * @typedef {object} DatabaseError
 * @property {string} message - Human-readable error message
 * @property {string} code - Machine-readable error code
 */

// =============================================================================
// AI Types
// =============================================================================

/**
 * @typedef {object} CompletionOptions
 * @property {string} [model] - Model identifier
 * @property {number} [maxTokens] - Maximum tokens in response
 * @property {number} [temperature] - Sampling temperature (0-1)
 * @property {string} [systemPrompt] - System prompt to prepend
 * @property {Array<Message>} [history] - Previous messages for context
 */

/**
 * @typedef {object} Message
 * @property {'user'|'assistant'|'system'} role - Message role
 * @property {string} content - Message content
 */

/**
 * @typedef {object} CompletionResult
 * @property {string} text - Generated text
 * @property {TokenUsage} usage - Token usage statistics
 * @property {AIError|null} error - Error if completion failed
 */

/**
 * @typedef {object} TokenUsage
 * @property {number} promptTokens - Tokens in the prompt
 * @property {number} completionTokens - Tokens in the completion
 */

/**
 * @typedef {object} AIError
 * @property {string} message - Human-readable error message
 * @property {string} code - Machine-readable error code
 */

// =============================================================================
// App State Types
// =============================================================================

/**
 * @typedef {object} AppState
 * @property {User|null} user - Current authenticated user
 * @property {boolean} isLoading - Global loading state
 * @property {AppError|null} error - Current error state
 * @property {string} theme - Current theme name
 * @property {string} locale - Current locale (e.g., 'en')
 */

/**
 * @typedef {object} AppError
 * @property {string} message - Error message to display
 * @property {string} [code] - Error code for programmatic handling
 * @property {boolean} [recoverable] - Whether user can recover from this error
 */

// =============================================================================
// Content Types
// =============================================================================

/**
 * @typedef {object} ContentConfig
 * @property {string} source - Content source ('local' or CMS URL)
 * @property {string} locale - Current locale
 * @property {string} fallbackLocale - Fallback if key missing
 */

/**
 * Interpolate variables into a content string
 * @callback InterpolateFunction
 * @param {string} template - Template string with {{variable}} placeholders
 * @param {object} variables - Key-value pairs to interpolate
 * @returns {string} Interpolated string
 */

// =============================================================================
// Design System Types
// =============================================================================

/**
 * @typedef {object} DesignTokens
 * @property {ColorTokens} color
 * @property {SpacingTokens} spacing
 * @property {TypographyTokens} typography
 * @property {BreakpointTokens} breakpoints
 * @property {RadiusTokens} radius
 * @property {ShadowTokens} shadow
 * @property {TransitionTokens} transition
 */

/**
 * @typedef {object} ColorTokens
 * @property {object} background
 * @property {object} text
 * @property {object} accent
 * @property {object} border
 */

/**
 * @typedef {object} SpacingTokens
 * @property {string} xs
 * @property {string} sm
 * @property {string} md
 * @property {string} lg
 * @property {string} xl
 * @property {string} xxl
 */

/**
 * @typedef {object} TypographyTokens
 * @property {object} fontFamily
 * @property {object} fontSize
 * @property {object} fontWeight
 * @property {object} lineHeight
 */

/**
 * @typedef {object} BreakpointTokens
 * @property {string} mobile
 * @property {string} tablet
 * @property {string} desktop
 * @property {string} wide
 */

/**
 * @typedef {object} RadiusTokens
 * @property {string} sm
 * @property {string} md
 * @property {string} lg
 * @property {string} full
 */

/**
 * @typedef {object} ShadowTokens
 * @property {string} sm
 * @property {string} md
 * @property {string} lg
 */

/**
 * @typedef {object} TransitionTokens
 * @property {string} fast
 * @property {string} base
 * @property {string} slow
 */

// Export empty object to make this a module
export {};
