/**
 * @fileoverview Main AI Assistant API Client.
 * Communicates with backend endpoints or mock adapters safely.
 * Never leaks API keys or logs private messages in production builds.
 */

import { isAiEnabled, isMockMode, API_BASE_URL, hasUserConsented } from './config';
import { mockIntakeChat, mockExplainClause } from './mockAdapter';

export class AiError extends Error {
  constructor(message, code = 'AI_ERROR', status = null) {
    super(message);
    this.name = 'AiError';
    this.code = code;
    this.status = status;
  }
}

export class AiNotConfiguredError extends AiError {
  constructor(message = 'AI assistant is not configured yet.') {
    super(message, 'AI_NOT_CONFIGURED', 503);
    this.name = 'AiNotConfiguredError';
  }
}

export class AiConsentRequiredError extends AiError {
  constructor(message = 'User consent is required before using AI drafting features.') {
    super(message, 'CONSENT_REQUIRED', 400);
    this.name = 'AiConsentRequiredError';
  }
}

/**
 * Checks if sensitive identity data (Aadhaar, PAN, Bank IFSC/Account) is detected in text.
 * @param {string} text
 * @returns {{ hasSensitiveData: boolean, warnings: string[] }}
 */
export function checkSensitiveInformation(text) {
  if (!text || typeof text !== 'string') {
    return { hasSensitiveData: false, warnings: [] };
  }
  const warnings = [];

  // Aadhaar check (12 digits with optional spaces or hyphens)
  if (/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/.test(text)) {
    warnings.push('Aadhaar number detected. Please remove sensitive government IDs from the prompt.');
  }

  // PAN card check (5 letters, 4 digits, 1 letter)
  if (/\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/i.test(text)) {
    warnings.push('PAN number detected. Please do not paste tax IDs into the chat.');
  }

  // Indian Bank Account number pattern (9-18 continuous digits with bank keywords)
  if (/(?:account|a\/c|bank)\s*(?:no\.?|num(?:ber)?)?\s*[:-]?\s*\b\d{9,18}\b/i.test(text)) {
    warnings.push('Bank account details detected. Please omit banking details from drafting chat.');
  }

  return {
    hasSensitiveData: warnings.length > 0,
    warnings,
  };
}

/**
 * Helper to log safe diagnostics only in development mode.
 */
function devLog(...args) {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.debug('[AI Client]', ...args);
  }
}

/**
 * Send an intake conversation turn to the AI backend or mock adapter.
 * @param {import('./types').ChatRequest} request
 * @returns {Promise<import('./types').ChatResponse>}
 */
export async function sendIntakeChat(request) {
  if (!isAiEnabled()) {
    throw new AiNotConfiguredError('AI assistant is not configured yet. The rest of the dashboard remains fully functional.');
  }

  if (!request.consent && !hasUserConsented()) {
    throw new AiConsentRequiredError('Please review and accept the AI consent notice before continuing.');
  }

  const sensitiveCheck = checkSensitiveInformation(request.message);
  if (sensitiveCheck.hasSensitiveData) {
    throw new AiError(sensitiveCheck.warnings[0], 'SENSITIVE_DATA_BLOCKED');
  }

  // If in mock mode, use the realistic offline mock adapter
  if (isMockMode()) {
    devLog('Dispatching intake chat to Mock Adapter');
    return mockIntakeChat(request);
  }

  // Otherwise, invoke backend API contract
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const res = await fetch(`${API_BASE_URL}/ai/intake-chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        draftId: request.draftId,
        message: request.message,
        history: (request.history || []).map((m) => ({ role: m.role, content: m.content })),
        consent: true,
      }),
    });

    if (res.status === 429) {
      throw new AiError('Too many AI requests. Please wait a minute before sending another message.', 'RATE_LIMITED', 429);
    }

    if (res.status === 401 || res.status === 403) {
      throw new AiError('Your session has expired. Please sign in again to use the AI assistant.', 'AUTH_EXPIRED', res.status);
    }

    if (!res.ok) {
      // If the backend endpoint does not exist yet (404/503), fall back gracefully to mock adapter
      if (res.status === 404 || res.status === 503) {
        devLog(`Backend endpoint not available (${res.status}); using mock fallback`);
        return mockIntakeChat(request);
      }
      const errJson = await res.json().catch(() => ({}));
      throw new AiError(errJson.error || `AI service returned error HTTP ${res.status}`, 'HTTP_ERROR', res.status);
    }

    return await res.json();
  } catch (error) {
    if (error instanceof AiError) throw error;
    // Network failure (server down or offline) -> fallback to mock adapter
    devLog('Network failure calling backend; using mock fallback');
    return mockIntakeChat(request);
  }
}

/**
 * Request plain-language explanation for a contract clause.
 * @param {import('./types').ClauseExplanationRequest} request
 * @returns {Promise<import('./types').ClauseExplanationResponse>}
 */
export async function explainClause(request) {
  if (!isAiEnabled()) {
    throw new AiNotConfiguredError('AI explanations are currently disabled.');
  }

  if (!request.consent && !hasUserConsented()) {
    throw new AiConsentRequiredError('Please grant consent to generate plain-language clause explanations.');
  }

  if (isMockMode()) {
    devLog('Dispatching clause explanation to Mock Adapter');
    return mockExplainClause(request);
  }

  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const res = await fetch(`${API_BASE_URL}/ai/explain-clause`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        clauseId: request.clauseId,
        clauseTitle: request.clauseTitle,
        legalText: request.legalText,
        consent: true,
      }),
    });

    if (res.status === 429) {
      throw new AiError('Too many requests. Please wait a minute and try again.', 'RATE_LIMITED', 429);
    }

    if (!res.ok) {
      if (res.status === 404 || res.status === 503) {
        devLog(`Backend endpoint not available (${res.status}); using mock fallback`);
        return mockExplainClause(request);
      }
      const errJson = await res.json().catch(() => ({}));
      throw new AiError(errJson.error || `HTTP ${res.status}`, 'HTTP_ERROR', res.status);
    }

    return await res.json();
  } catch (error) {
    if (error instanceof AiError) throw error;
    devLog('Network failure in explainClause; using mock fallback');
    return mockExplainClause(request);
  }
}
