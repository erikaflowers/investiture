/**
 * Investiture - Vanilla JS View Implementation
 *
 * This view demonstrates the architecture by:
 * 1. Importing from core (not directly from services)
 * 2. Using content from JSON (not hardcoded strings)
 * 3. Styling with design tokens (not hardcoded colors)
 */

// Import from core - the ONLY way views should access business logic
import { init } from '../../core/index.js';

// =============================================================================
// Initialize Application
// =============================================================================

async function bootstrap() {
  console.log('[App] Bootstrapping...');

  // Initialize core
  await init();

  console.log('[App] Ready');
}

// Start the app
bootstrap().catch(console.error);
