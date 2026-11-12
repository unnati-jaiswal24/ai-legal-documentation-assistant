/**
 * @fileoverview Frontend AI Assistant Configuration.
 * Reads environment variables only and provides safe configuration status.
 * Never stores or requests API secrets in frontend code.
 */

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

/**
 * Public backend API base URL
 */
export const API_BASE_URL = env.VITE_API_BASE_URL || 'http://localhost:4000/api';

/**
 * Feature flag: whether the AI assistant is enabled.
 * Defaults to true so the UI is active in mock mode unless explicitly disabled.
 */
export function isAiEnabled() {
  if (env.VITE_AI_ENABLED === undefined) return true;
  return String(env.VITE_AI_ENABLED).toLowerCase() === 'true';
}

/**
 * Mock mode flag: whether to use realistic local mock responses.
 * Defaults to true so developers and reviewers can use the UI before API keys are connected.
 */
export function isMockMode() {
  if (env.VITE_AI_MOCK_MODE === undefined) return true;
  return String(env.VITE_AI_MOCK_MODE).toLowerCase() === 'true';
}

/**
 * Storage key for AI user consent
 */
export const AI_CONSENT_STORAGE_KEY = 'saraldocs_ai_consent_v1';

/**
 * Check if the user has given consent for AI features.
 */
export function hasUserConsented() {
  try {
    return localStorage.getItem(AI_CONSENT_STORAGE_KEY) === 'granted';
  } catch {
    return false;
  }
}

/**
 * Set user consent for AI features.
 * @param {boolean} granted
 */
export function setUserConsent(granted) {
  try {
    if (granted) {
      localStorage.setItem(AI_CONSENT_STORAGE_KEY, 'granted');
    } else {
      localStorage.removeItem(AI_CONSENT_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

/**
 * Returns the overall AI configuration status.
 * @returns {'configured'|'mock'|'not_configured'}
 */
export function getAiConfigStatus() {
  if (!isAiEnabled()) {
    return 'not_configured';
  }
  if (isMockMode()) {
    return 'mock';
  }
  return 'configured';
}
