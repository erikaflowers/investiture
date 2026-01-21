// Load environment variables from .env file for local development
// In production (Netlify), env vars are already available

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from project root
// Use override:true to ensure .env values take precedence over
// Netlify-injected vars (which may be wrong JWT tokens from AI integration)
config({ path: resolve(process.cwd(), '.env'), override: true });

// Remove ANTHROPIC_BASE_URL if set by Netlify AI integration
// This causes the SDK to use Netlify's proxy which doesn't work with real API keys
if (process.env.ANTHROPIC_BASE_URL) {
  delete process.env.ANTHROPIC_BASE_URL;
}
