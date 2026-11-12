/**
 * @fileoverview Realistic Mock AI Adapter for Indian Freelance Agreements.
 * Simulates the backend AI service responses without making any external API calls.
 */

const STANDARD_REQUIRED_FIELDS = [
  { key: 'freelancer_name', label: 'Freelancer full name' },
  { key: 'client_name', label: 'Client / Company name' },
  { key: 'scope_description', label: 'Scope of work & deliverables' },
  { key: 'fee_amount', label: 'Agreed fee amount (INR)' },
  { key: 'effective_date', label: 'Agreement start date' },
  { key: 'payment_days', label: 'Payment due timeline (e.g. 15 or 30 days)' },
  { key: 'include_nda', label: 'Confidentiality & non-disclosure term' },
];

/**
 * Common high-risk keywords that trigger advocate consultation recommendation.
 */
const HIGH_RISK_PATTERNS = [
  /unlimited\s+liability/i,
  /penalty/i,
  /non-compete/i,
  /indemnif/i,
  /perpetual\s+exclusivity/i,
  /no\s+payment\s+until/i,
  /immediate\s+termination\s+without\s+cause/i,
];

/**
 * Extract simulated fields from user input text.
 * @param {string} text
 * @param {Record<string, any>} existingFields
 * @returns {Record<string, any>}
 */
function extractSimulatedFields(text, existingFields = {}) {
  const extracted = { ...existingFields };
  const lower = text.toLowerCase();

  // Extract freelancer name (stops before connective words like 'and', 'for', etc.)
  const freelancerMatch = text.match(/(?:my name is|i am|freelancer\s*(?:is|:))\s*([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/i);
  if (freelancerMatch && freelancerMatch[1]) {
    extracted.freelancer_name = freelancerMatch[1].trim();
  }

  // Extract client name
  const clientMatch = text.match(/(?:client is|working for|company is|client\s*(?:is|:))\s*([A-Z][a-zA-Z0-9]+(?:\s+[A-Z0-9][a-zA-Z0-9.]+)*)/i);
  if (clientMatch && clientMatch[1]) {
    extracted.client_name = clientMatch[1].replace(/[.,]+$/, '').trim();
  }

  // Extract fee amount (INR)
  const feeMatch = text.match(/(?:₹|rs\.?|inr\s*)\s*([\d,]+)|([\d,]+)\s*(?:inr|rupees)/i);
  if (feeMatch) {
    const rawNumber = (feeMatch[1] || feeMatch[2] || '').replace(/,/g, '');
    const num = parseInt(rawNumber, 10);
    if (!Number.isNaN(num) && num > 0) {
      extracted.fee_amount = num;
    }
  }

  // Extract scope of work
  if (lower.includes('build') || lower.includes('design') || lower.includes('writing') || lower.includes('develop') || lower.includes('deliverable')) {
    extracted.scope_description = text.length > 120 ? `${text.slice(0, 117)}...` : text;
  }

  // Extract NDA / Confidentiality preference
  if (lower.includes('nda') || lower.includes('confidential') || lower.includes('privacy')) {
    extracted.include_nda = !lower.includes('no nda') && !lower.includes('without nda');
  }

  // Extract Payment timeline
  const daysMatch = text.match(/(\d{1,3})\s*days?(?:\s+for\s+payment|\s+net)?/i);
  if (daysMatch && daysMatch[1]) {
    extracted.payment_days = parseInt(daysMatch[1], 10);
  }

  // Extract Start date
  if (lower.includes('start') || lower.includes('effective')) {
    const today = new Date().toISOString().split('T')[0];
    extracted.effective_date = today;
  }

  return extracted;
}

/**
 * Determine remaining missing fields.
 * @param {Record<string, any>} fields
 * @returns {string[]}
 */
function getMissingFieldLabels(fields) {
  return STANDARD_REQUIRED_FIELDS
    .filter((f) => fields[f.key] === undefined || fields[f.key] === null || fields[f.key] === '')
    .map((f) => f.label);
}

/**
 * Pick the next logical question to ask.
 * @param {string[]} missingLabels
 * @returns {string}
 */
function getNextQuestionSuggestion(missingLabels) {
  if (!missingLabels.length) {
    return 'All essential fields are captured! Would you like to review and generate your draft?';
  }
  const next = missingLabels[0];
  if (next.includes('Client')) return 'Who is the client or company you will be contracting with?';
  if (next.includes('Freelancer')) return 'What is your full legal name or registered trade name?';
  if (next.includes('Scope')) return 'Could you briefly describe the services and key deliverables you will provide?';
  if (next.includes('fee')) return 'What is the total agreed compensation in INR, or your milestone schedule?';
  if (next.includes('start date')) return 'What is the anticipated start or effective date of this agreement?';
  if (next.includes('Payment due')) return 'What is the payment timeline (e.g. Net 15 or Net 30 days after invoice)?';
  if (next.includes('Confidentiality')) return 'Do you want to include a mutual confidentiality and NDA clause?';
  return `Could you specify details for ${next}?`;
}

/**
 * Mock response handler for intake chat messages.
 * @param {import('./types').ChatRequest} request
 * @returns {Promise<import('./types').ChatResponse>}
 */
export async function mockIntakeChat(request) {
  // Simulate network latency (250-400ms)
  await new Promise((resolve) => setTimeout(resolve, 300));

  const text = request.message || '';
  const priorExtracted = {};

  // Accumulate fields from history
  if (request.history && Array.isArray(request.history)) {
    for (const msg of request.history) {
      if (msg.extracted_fields) {
        Object.assign(priorExtracted, msg.extracted_fields);
      }
    }
  }

  const updatedFields = extractSimulatedFields(text, priorExtracted);
  const missingLabels = getMissingFieldLabels(updatedFields);
  const nextQuestion = getNextQuestionSuggestion(missingLabels);

  const needsLegalReview = HIGH_RISK_PATTERNS.some((pattern) => pattern.test(text));

  let replyText = '';
  const newlyCaptured = Object.keys(updatedFields).filter((k) => priorExtracted[k] === undefined);

  if (newlyCaptured.length > 0) {
    replyText = `Thank you! I have recorded the following details: ${newlyCaptured
      .map((k) => STANDARD_REQUIRED_FIELDS.find((f) => f.key === k)?.label || k)
      .join(', ')}. `;
  } else if (text.trim().toLowerCase().includes('hello') || text.trim().toLowerCase().includes('hi')) {
    replyText = 'Hello! I can guide you through preparing your Indian Freelance Service Agreement step-by-step. Let us capture the essential details for your agreement. ';
  } else {
    replyText = 'I have reviewed your message. ';
  }

  if (needsLegalReview) {
    replyText += '\n\n**Note on Special Terms:** Your input mentions clauses such as uncapped liability, non-compete, or penalty terms. Under Indian contract law (Section 27 of the Indian Contract Act, 1872), non-compete covenants are often void or heavily restricted, and uncapped indemnities carry substantial financial exposure. We strongly recommend having an advocate review these specific terms.';
  }

  replyText += `\n\n${nextQuestion}`;

  return {
    reply_text: replyText.trim(),
    extracted_fields: updatedFields,
    missing_fields: missingLabels,
    next_question: nextQuestion,
    needs_legal_review: needsLegalReview,
    disclaimer: 'AI provides drafting assistance and information only; not legal advice. Binding clauses originate from reviewed templates.',
  };
}

/**
 * Pre-compiled mock explanations for standard clauses in India.
 */
const MOCK_CLAUSE_EXPLANATIONS = {
  'c-parties': {
    plain_explanation: 'This clause formally identifies who is entering into the contract (the Freelancer and the Client) and binds both parties to the terms agreed upon. In India, defining clear legal entities ensures enforceability under the Indian Contract Act, 1872.',
    key_considerations: [
      'Ensure registered names match official government IDs or GST registrations.',
      'Clarifies that the freelancer is an independent contractor, not an employee.',
    ],
    needs_legal_review: false,
  },
  'c-scope': {
    plain_explanation: 'This clause outlines the exact work, services, and deliverables the freelancer is expected to deliver. A precise scope prevents "scope creep" and provides an objective benchmark for completion.',
    key_considerations: [
      'List specific deliverables and milestones rather than broad descriptions.',
      'Specify the acceptance criteria and timelines for client feedback.',
    ],
    needs_legal_review: false,
  },
  'c-payment': {
    plain_explanation: 'This clause governs the fees, billing schedule, invoice payment deadlines, and any applicable taxes (such as GST or TDS under the Income Tax Act).',
    key_considerations: [
      'Sets a clear payment window (e.g. Net 15 or Net 30 days).',
      'Protects against indefinite delays by stipulating late payment interest or suspension of services.',
    ],
    needs_legal_review: false,
  },
};

/**
 * Mock response handler for explaining a specific contract clause.
 * @param {import('./types').ClauseExplanationRequest} request
 * @returns {Promise<import('./types').ClauseExplanationResponse>}
 */
export async function mockExplainClause(request) {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 250));

  const known = MOCK_CLAUSE_EXPLANATIONS[request.clauseId];
  if (known) {
    return {
      clause_id: request.clauseId,
      clause_title: request.clauseTitle || 'Clause Explanation',
      plain_explanation: known.plain_explanation,
      key_considerations: known.key_considerations,
      needs_legal_review: known.needs_legal_review,
      disclaimer: 'AI-generated plain-language summary for reference only; not legal advice. The official clause text is lawyer-reviewed.',
    };
  }

  // Fallback heuristic explanation for other clauses
  const hasRisk = HIGH_RISK_PATTERNS.some((pattern) => pattern.test(request.legalText || ''));

  return {
    clause_id: request.clauseId,
    clause_title: request.clauseTitle || 'Contract Clause',
    plain_explanation: `This clause establishes the agreed terms and expectations regarding ${request.clauseTitle || 'this section'}. It sets out the rights and duties of both the freelancer and the client to prevent misunderstandings during the engagement.`,
    key_considerations: [
      'Read in conjunction with the payment, scope, and termination schedules.',
      'Clause text is sourced directly from the platform’s reviewed template library.',
      hasRisk ? 'Contains terms that warrant review by a qualified Indian advocate.' : 'Standard operational clause for freelance services.',
    ],
    needs_legal_review: hasRisk,
    disclaimer: 'AI-generated plain-language summary for reference only; not legal advice. The official clause text is lawyer-reviewed.',
  };
}
