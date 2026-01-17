/**
 * Investiture - Vanilla JS View Implementation
 *
 * This view demonstrates the architecture by:
 * 1. Importing from core (not directly from services)
 * 2. Using content from JSON (not hardcoded strings)
 * 3. Styling with design tokens (not hardcoded colors)
 */

// Import from core - the ONLY way views should access business logic
import { api, state, utils, init } from '../../core/index.js';

// Import content
import commonContent from '../../content/en/common.json' with { type: 'json' };
import errorsContent from '../../content/en/errors.json' with { type: 'json' };

// =============================================================================
// DOM References
// =============================================================================

const elements = {
  authStatus: document.getElementById('auth-status'),
  heroActions: document.getElementById('hero-actions'),
  stateDisplay: document.getElementById('state-display'),
  aiInput: document.getElementById('ai-input'),
  aiSubmit: document.getElementById('ai-submit'),
  aiResponse: document.getElementById('ai-response'),
};

// =============================================================================
// Render Functions
// =============================================================================

/**
 * Render auth status and actions
 * @param {import('../../core/types/interfaces.js').User | null} user
 */
function renderAuth(user) {
  if (user) {
    elements.authStatus.innerHTML = `
      <span class="auth-status__user">${user.email}</span>
      <button class="button button--secondary button--small" id="sign-out-btn">
        ${commonContent.auth.signOut}
      </button>
    `;

    // Attach sign out handler
    document.getElementById('sign-out-btn')?.addEventListener('click', handleSignOut);
  } else {
    elements.authStatus.innerHTML = `
      <button class="button button--primary button--small" id="sign-in-btn">
        ${commonContent.auth.signIn}
      </button>
    `;

    // Attach sign in handler
    document.getElementById('sign-in-btn')?.addEventListener('click', handleSignIn);
  }
}

/**
 * Render hero actions based on auth state
 * @param {import('../../core/types/interfaces.js').User | null} user
 */
function renderHeroActions(user) {
  if (user) {
    elements.heroActions.innerHTML = `
      <button class="button button--primary" id="get-started-btn">
        Get Started
      </button>
      <button class="button button--secondary" id="view-docs-btn">
        View Documentation
      </button>
    `;
  } else {
    elements.heroActions.innerHTML = `
      <button class="button button--primary" id="hero-sign-in-btn">
        ${utils.interpolate(commonContent.auth.signInWith, { provider: 'Demo' })}
      </button>
      <button class="button button--secondary" id="learn-more-btn">
        Learn More
      </button>
    `;

    document.getElementById('hero-sign-in-btn')?.addEventListener('click', handleSignIn);
  }
}

/**
 * Render application state for debugging
 * @param {import('../../core/types/interfaces.js').AppState} appState
 */
function renderState(appState) {
  const displayState = {
    ...appState,
    user: appState.user ? { ...appState.user, id: appState.user.id.substring(0, 12) + '...' } : null,
  };

  elements.stateDisplay.textContent = JSON.stringify(displayState, null, 2);
}

/**
 * Render AI response
 * @param {string} text
 * @param {boolean} [isStreaming]
 */
function renderAIResponse(text, isStreaming = false) {
  elements.aiResponse.innerHTML = `
    <div class="ai-response__text ${isStreaming ? 'ai-response__text--streaming' : ''}">
      ${text}
    </div>
  `;
}

// =============================================================================
// Event Handlers
// =============================================================================

async function handleSignIn() {
  const btn = document.getElementById('sign-in-btn') || document.getElementById('hero-sign-in-btn');
  if (btn) {
    btn.textContent = commonContent.auth.signingIn;
    btn.disabled = true;
  }

  try {
    const result = await api.auth.signIn('demo', { email: 'user@example.com' });
    if (!result.success) {
      console.error('Sign in failed:', result.error);
    }
  } catch (error) {
    console.error('Sign in error:', error);
    renderAIResponse(errorsContent.generic.unknown);
  }
}

async function handleSignOut() {
  try {
    await api.auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

async function handleAISubmit() {
  const prompt = elements.aiInput.value.trim();
  if (!prompt) return;

  elements.aiSubmit.disabled = true;
  elements.aiSubmit.textContent = commonContent.actions.loading;
  renderAIResponse('', true);

  try {
    // Use streaming for demo
    let fullResponse = '';
    await api.ai.stream(prompt, {}, (chunk) => {
      fullResponse += chunk;
      renderAIResponse(fullResponse, true);
    });

    renderAIResponse(fullResponse, false);
  } catch (error) {
    console.error('AI error:', error);
    renderAIResponse(errorsContent.generic.unknown);
  } finally {
    elements.aiSubmit.disabled = false;
    elements.aiSubmit.textContent = commonContent.actions.submit;
  }
}

// =============================================================================
// Initialize Application
// =============================================================================

async function bootstrap() {
  console.log('[App] Bootstrapping...');

  // Initialize core
  await init();

  // Subscribe to state changes and render UI
  state.subscribe((appState) => {
    renderAuth(appState.user);
    renderHeroActions(appState.user);
    renderState(appState);
  });

  // Attach AI demo handlers
  elements.aiSubmit?.addEventListener('click', handleAISubmit);
  elements.aiInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAISubmit();
  });

  // Set initial button text from content
  if (elements.aiSubmit) {
    elements.aiSubmit.textContent = commonContent.actions.submit;
  }

  console.log('[App] Ready');
}

// Start the app
bootstrap().catch(console.error);
