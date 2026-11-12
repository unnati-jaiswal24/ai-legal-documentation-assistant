/**
 * @fileoverview Type definitions for the AI Legal Assistant API client.
 */

/**
 * @typedef {Object} ExtractedFieldValue
 * @property {string} fieldId - Form field identifier.
 * @property {string} fieldKey - Machine key (e.g., 'effective_date', 'fee_amount').
 * @property {string|number|boolean} value - Extracted value.
 * @property {string} label - Human-readable field label.
 */

/**
 * @typedef {Object} ChatMessage
 * @property {'user'|'assistant'|'system'} role
 * @property {string} content
 * @property {string} [id]
 * @property {number} [timestamp]
 * @property {Record<string, any>} [extracted_fields]
 * @property {string[]} [missing_fields]
 * @property {string} [next_question]
 * @property {boolean} [needs_legal_review]
 * @property {string} [disclaimer]
 * @property {boolean} [isStreaming]
 * @property {boolean} [isError]
 */

/**
 * @typedef {Object} ChatRequest
 * @property {string} message - User message text.
 * @property {string} [draftId] - Current draft ID if within a document context.
 * @property {ChatMessage[]} [history] - Previous messages in this conversation.
 * @property {boolean} consent - Explicit user consent flag.
 */

/**
 * @typedef {Object} ChatResponse
 * @property {string} reply_text - AI conversational response.
 * @property {Record<string, any>} [extracted_fields] - Dictionary of extracted field values.
 * @property {string[]} [missing_fields] - Remaining required or recommended fields.
 * @property {string} [next_question] - Suggested next prompt for the user.
 * @property {boolean} [needs_legal_review] - Flag indicating terms requiring advocate consultation.
 * @property {string} [disclaimer] - Legal disclaimer notice.
 */

/**
 * @typedef {Object} ClauseExplanationRequest
 * @property {string} clauseId - Unique identifier of the clause.
 * @property {string} clauseTitle - Title of the clause.
 * @property {string} legalText - Reviewed legal clause text from the template.
 * @property {boolean} consent - Explicit user consent flag.
 */

/**
 * @typedef {Object} ClauseExplanationResponse
 * @property {string} clause_id - Source clause identifier.
 * @property {string} clause_title - Source clause title.
 * @property {string} plain_explanation - Plain language explanation.
 * @property {string[]} key_considerations - Practical points for freelancers.
 * @property {boolean} needs_legal_review - Flag if clause contains high-risk elements.
 * @property {string} disclaimer - Persistent legal limitations notice.
 */

/**
 * @typedef {'configured'|'mock'|'not_configured'|'error'} AiStatus
 */

export {};
