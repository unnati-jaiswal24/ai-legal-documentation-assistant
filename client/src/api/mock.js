// Mock Data and Offline Adapter for Indian Freelance Service Agreements
// Follows Phase 1 requirements from README.md

export const mockTemplate = {
  id: 'mock-template',
  title: 'Freelance Service Agreement',
  version: '1.0',
  isActive: true,
  documentTypeId: 'type-freelance',
  fields: [
    {
      id: 'f-date',
      fieldKey: 'effective_date',
      labelPlain: 'Agreement start date',
      dataType: 'date',
      isRequired: true,
      displayOrder: 1,
    },
    {
      id: 'f-freelancer',
      fieldKey: 'freelancer_name',
      labelPlain: 'Freelancer full name',
      dataType: 'text',
      isRequired: true,
      displayOrder: 2,
    },
    {
      id: 'f-client',
      fieldKey: 'client_name',
      labelPlain: 'Client / Company full name',
      dataType: 'text',
      isRequired: true,
      displayOrder: 3,
    },
    {
      id: 'f-scope',
      fieldKey: 'scope_description',
      labelPlain: 'Scope of work & services',
      dataType: 'text',
      isRequired: true,
      displayOrder: 4,
    },
    {
      id: 'f-deliverables',
      fieldKey: 'deliverables',
      labelPlain: 'Key deliverables & acceptance criteria',
      dataType: 'text',
      isRequired: true,
      displayOrder: 5,
    },
    {
      id: 'f-fee',
      fieldKey: 'fee_amount',
      labelPlain: 'Total contractual fee (INR)',
      dataType: 'number',
      isRequired: true,
      displayOrder: 6,
    },
    {
      id: 'f-pay-days',
      fieldKey: 'payment_days',
      labelPlain: 'Invoice payment timeline (days)',
      dataType: 'number',
      isRequired: true,
      displayOrder: 7,
    },
    {
      id: 'f-ip',
      fieldKey: 'ip_arrangement',
      labelPlain: 'Intellectual property ownership arrangement',
      dataType: 'text',
      isRequired: true,
      displayOrder: 8,
    },
    {
      id: 'f-nda',
      fieldKey: 'include_nda',
      labelPlain: 'Include mutual confidentiality terms',
      dataType: 'boolean',
      isRequired: false,
      displayOrder: 9,
    },
    {
      id: 'f-notice',
      fieldKey: 'notice_days',
      labelPlain: 'Termination notice period (days)',
      dataType: 'number',
      isRequired: true,
      displayOrder: 10,
    },
    {
      id: 'f-law',
      fieldKey: 'governing_law',
      labelPlain: 'Governing state law (e.g., Karnataka, Maharashtra, Delhi)',
      dataType: 'text',
      isRequired: true,
      displayOrder: 11,
    },
    {
      id: 'f-jurisdiction',
      fieldKey: 'jurisdiction',
      labelPlain: 'Jurisdiction & arbitration city',
      dataType: 'text',
      isRequired: true,
      displayOrder: 12,
    },
  ],
  clauses: [
    {
      id: 'c-parties',
      title: 'Parties',
      plainText: 'Identifies the people or entities entering the freelance agreement.',
      legalText: 'This agreement is made between the Freelancer and the Client identified above as an independent contractor relationship under the Indian Contract Act, 1872.',
      position: 1,
      source: 'Indian Contract Act, 1872, Sec. 2',
    },
    {
      id: 'c-scope',
      title: 'Scope of work & deliverables',
      plainText: 'Describes the agreed services, milestones, and deliverables.',
      legalText: 'The Freelancer shall provide the services and deliverables described herein in a professional manner in accordance with the agreed timelines.',
      position: 2,
      source: 'Reviewed Template Library v1.0',
    },
    {
      id: 'c-payment',
      title: 'Payment & fees',
      plainText: 'Describes the agreed compensation and invoice settlement period.',
      legalText: 'The Client will pay the agreed fee within the stipulated payment days upon receipt of a valid invoice. All applicable statutory deductions or taxes shall apply per Indian law.',
      position: 3,
      source: 'Indian Contract Act, 1872, Sec. 73',
    },
    {
      id: 'c-ip',
      title: 'Intellectual property rights',
      plainText: 'Clarifies who owns the final work product upon complete payment.',
      legalText: 'Upon receipt of full payment, all intellectual property rights in the final deliverables shall transfer to the Client. The Freelancer retains rights to pre-existing background materials.',
      position: 4,
      source: 'Copyright Act, 1957, Sec. 17',
    },
    {
      id: 'c-confidentiality',
      title: 'Confidentiality',
      plainText: 'Protects private business and technical information shared during the project.',
      legalText: 'Both parties agree to keep all proprietary information, materials, and trade secrets confidential and not disclose them to third parties without prior written consent.',
      position: 5,
      source: 'Reviewed Template Library v1.0',
    },
    {
      id: 'c-termination',
      title: 'Termination',
      plainText: 'Explains the notice period and steps required if either party wishes to end the contract.',
      legalText: 'Either party may terminate this agreement by providing the agreed written notice period. The Client shall pay for all satisfactory work completed up to the termination date.',
      position: 6,
      source: 'Indian Contract Act, 1872, Sec. 39',
    },
    {
      id: 'c-dispute',
      title: 'Governing law & dispute resolution',
      plainText: 'Specifies the Indian jurisdiction and arbitration procedures for resolving disputes.',
      legalText: 'This agreement shall be governed by the laws of India. Any dispute arising under this agreement shall be settled through mutual negotiation, failing which through arbitration in the agreed city under the Arbitration and Conciliation Act, 1996.',
      position: 7,
      source: 'Arbitration and Conciliation Act, 1996',
    },
  ],
};

export const mockTypes = [{ id: 'type-freelance', name: 'Freelance Service Agreement' }];
export const mockExperts = [{ id: 'expert-1', name: 'Advocate Priya Rao', specialization: 'Indian Contract Law & IT Agreements', isAvailable: true }];

// Persistent state cache across browser reloads
const STORAGE_DRAFTS_KEY = 'saraldocs_mock_drafts_v1';

function loadPersistedDrafts() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_DRAFTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistDrafts(drafts) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_DRAFTS_KEY, JSON.stringify(drafts));
  } catch {
    // Ignore storage limits
  }
}

export const mockState = {
  drafts: loadPersistedDrafts(),
  consultations: [],
  versions: {},
};

export function newMockDraft(templateId = mockTemplate.id) {
  const d = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `draft-${Date.now()}`,
    templateId,
    status: 'in_progress',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    template: mockTemplate,
    values: [],
  };
  mockState.drafts.unshift(d);
  persistDrafts(mockState.drafts);
  return d;
}

export function getMockDraft(id) {
  return mockState.drafts.find((d) => d.id === id) || null;
}

export function saveMockDraftValues(id, values) {
  const draft = getMockDraft(id);
  if (draft) {
    draft.values = values;
    draft.updatedAt = new Date().toISOString();
    persistDrafts(mockState.drafts);
  }
  return { values };
}
