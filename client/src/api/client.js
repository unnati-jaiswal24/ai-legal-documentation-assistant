import { mockTemplate, mockTypes, mockExperts, mockState, newMockDraft } from './mock';

export const API = 'http://localhost:4000/api';

export async function call(path, { method = 'GET', body, auth = true } = {}) {
  const token = localStorage.getItem('token');
  const r = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!r.ok) {
    const errData = await r.json().catch(() => ({}));
    throw Object.assign(new Error(errData.error || `HTTP ${r.status}`), { status: r.status });
  }
  return r.status === 204 ? null : r.json();
}

export async function withMock(real, mock) {
  try {
    return await real();
  } catch (e) {
    if (e.status === 404 || e instanceof TypeError || e?.message?.includes('fetch')) {
      return mock();
    }
    throw e;
  }
}

export const api = {
  me: () => withMock(() => call('/me'), () => ({ user: JSON.parse(localStorage.getItem('mock-user') || 'null') })),
  updateMe: (body) => withMock(() => call('/me', { method: 'PUT', body }), () => ({ user: { id: 'mock-user', ...body } })),
  templates: () => withMock(() => call('/templates'), () => [mockTemplate]),
  drafts: () => withMock(() => call('/drafts'), () => mockState.drafts),
  createDraft: (body) => withMock(() => call('/drafts', { method: 'POST', body }), () => newMockDraft(body?.templateId)),
  draft: (id) => withMock(() => call(`/drafts/${id}`), () => mockState.drafts.find((d) => d.id === id) || newMockDraft()),
  saveValues: (id, values) => withMock(() => call(`/drafts/${id}/values`, { method: 'PUT', body: { values } }), () => {
    const d = mockState.drafts.find((x) => x.id === id);
    if (d) {
      d.values = values;
      d.updatedAt = new Date().toISOString();
    }
    return { values };
  }),
  validate: (id) => withMock(() => call(`/drafts/${id}/validate`, { method: 'POST' }), () => {
    const d = mockState.drafts.find((x) => x.id === id);
    if (d) d.status = 'validated';
    return { status: 'validated', errors: [] };
  }),
  clauses: (id) => withMock(() => call(`/drafts/${id}/clauses`), () => {
    const d = mockState.drafts.find((x) => x.id === id);
    return d?.template?.clauses || mockTemplate.clauses || [];
  }),
  generate: (id) => withMock(() => call(`/drafts/${id}/generate`, { method: 'POST' }), () => {
    const list = mockState.versions[id] || [];
    const v = {
      id: crypto.randomUUID(),
      draftId: id,
      versionNo: list.length + 1,
      fileUrl: '#',
      format: 'pdf',
      generatedAt: new Date().toISOString(),
    };
    mockState.versions[id] = [v, ...list];
    const d = mockState.drafts.find((x) => x.id === id);
    if (d) d.status = 'generated';
    return v;
  }),
  versions: (id) => withMock(() => call(`/drafts/${id}/documents`), () => mockState.versions[id] || []),
  experts: () => withMock(() => call('/experts'), () => mockExperts),
  consult: (id, body) => withMock(() => call(`/drafts/${id}/consultations`, { method: 'POST', body }), () => {
    const c = { id: crypto.randomUUID(), draftId: id, ...body, status: 'requested', expert: mockExperts.find((e) => e.id === body.expertId) };
    mockState.consultations.unshift(c);
    return c;
  }),
  consultations: () => withMock(() => call('/consultations'), () => mockState.consultations),
};
