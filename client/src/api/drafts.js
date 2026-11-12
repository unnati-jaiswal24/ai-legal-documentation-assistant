import { api, call, withMock } from './client';
import { mockTypes } from './mock';

export const templates = () => api.templates();
export const documentTypes = () => withMock(() => call('/document-types'), () => mockTypes);
export const drafts = () => api.drafts();
export const createDraft = (templateId) => api.createDraft({ templateId });
export const draft = (id) => api.draft(id);
export const saveValues = (id, values) => api.saveValues(id, values);
export const validateDraft = (id) => api.validate(id);
export const generate = (id) => api.generate(id);
export const versions = (id) => api.versions(id);
