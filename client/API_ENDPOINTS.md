# Client API endpoints

All requests use `http://localhost:4000/api` and `Authorization: Bearer <token>` when authenticated. If unavailable or `404`, the client uses `src/api/mock.js`.

| Method | Path | Request body | Response shape |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | `{ token, user }` |
| POST | `/auth/signup` | `{ fullName, email, password }` | `{ token, user }` |
| GET | `/me` | none | `{ user }` |
| PUT | `/me` | `{ fullName, email, preferredLanguage }` | `{ user }` |
| GET | `/document-types` | none | `[{ id, name }]` |
| GET | `/templates` | none | `[{ id, documentTypeId, title, version, isActive, fields, clauses }]` |
| GET | `/drafts` | none | `[{ id, userId, templateId, status, template }]` |
| POST | `/drafts` | `{ templateId }` | `{ id, userId, templateId, status, template }` |
| GET | `/drafts/:id` | none | `{ id, status, template: { fields }, values: [{ fieldId, value }] }` |
| PUT | `/drafts/:id/values` | `{ values: [{ fieldId, value }] }` | `{ values: [{ fieldId, value }] }` |
| POST | `/drafts/:id/validate` | none | `{ status, errors? }` |
| GET | `/drafts/:id/clauses` | none | `[{ id, title, plainText, legalText, position, source? }]` |
| POST | `/drafts/:id/generate` | none | `{ id, draftId, versionNo, fileUrl, format, generatedAt }` |
| GET | `/drafts/:id/documents` | none | `[{ id, draftId, versionNo, fileUrl, format, generatedAt }]` |
| GET | `/experts` | none | `[{ id, name, specialization, isAvailable }]` |
| POST | `/consultations` | `{ draftId, expertId, query }` | `{ id, status, expert }` |
| GET | `/consultations` | none | `[{ id, draftId, expertId, query, status, expert }]` |
