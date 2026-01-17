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

export { auth, database, ai };

// Also export individual functions for tree-shaking
export {
  initAuth,
  signIn,
  signOut,
  getCurrentUser,
  onAuthChange,
} from './auth.js';

export {
  query,
  insert,
  update,
  remove,
} from './database.js';

export {
  complete,
  stream,
  isAvailable,
} from './ai.js';
