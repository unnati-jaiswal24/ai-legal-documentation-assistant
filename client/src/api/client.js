import {
  mockTemplate,
  mockState,
  newMockDraft,
  getMockDraft,
  saveMockDraftValues,
} from './mock.js';

export const API = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:4000/api';

export async function call(path, { method = 'GET', body, auth = true } = {}) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  const r = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!r.ok) {
    const errorMsg = (await r.json().catch(() => ({}))).error || `HTTP ${r.status}`;
    throw Object.assign(new Error(errorMsg), { status: r.status });
  }
  return r.status === 204 ? null : r.json();
}

export async function withMock(real, mock) {
  try {
    return await real();
  } catch (e) {
    if (e.status === 404 || e.status === 503 || e instanceof TypeError) {
      return typeof mock === 'function' ? mock() : mock;
    }
    throw e;
  }
}

export const api = {
  me: () => call('/me'),
  updateMe: (body) => call('/me', { method: 'PUT', body }),
  templates: () => withMock(() => call('/templates'), () => [mockTemplate]),
  drafts: () => withMock(() => call('/drafts'), () => mockState.drafts),
  createDraft: (body) => withMock(
    () => call('/drafts', { method: 'POST', body }),
    () => newMockDraft(body?.templateId || mockTemplate.id),
  ),
  draft: (id) => withMock(
    () => call(`/drafts/${id}`),
    () => getMockDraft(id) || newMockDraft(),
  ),
  saveValues: (id, values) => withMock(
    () => call(`/drafts/${id}/values`, { method: 'PUT', body: { values } }),
    () => saveMockDraftValues(id, values),
  ),
  validate: (id) => withMock(() => call(`/drafts/${id}/validate`, { method: 'POST' }), () => ({ status: 'valid' })),
  clauses: (id) => withMock(() => call(`/drafts/${id}/clauses`), () => mockTemplate.clauses),
  generate: (id) => withMock(() => call(`/drafts/${id}/generate`, { method: 'POST' }), () => ({ id: `doc-${Date.now()}`, draftId: id, generatedAt: new Date().toISOString() })),
  versions: (id) => withMock(() => call(`/drafts/${id}/documents`), () => []),
  experts: () => call('/experts'),
  consult: (id, body) => call(`/drafts/${id}/consultations`, { method: 'POST', body }),
  consultations: () => call('/consultations'),
};
