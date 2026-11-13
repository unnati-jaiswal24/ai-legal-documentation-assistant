# Frontend–Backend Mapping

This mapping was derived from the existing React pages, `client/src/api`, and `client/src/services`. The backend is being implemented to match the existing `client/src/api/client.js` contract. The role dashboards use local mock services and do not call HTTP endpoints; they remain mock-only because this task prohibits frontend changes.

## Existing authenticated client

Requests use the existing `VITE_API_BASE_URL` (default `http://localhost:4000/api`) and send the stored access token as a Bearer token. The frontend reads the `error` field for failed responses and falls back to local fixtures for selected unavailable/404 requests.

| Frontend page/component | Required functionality | Endpoint | Method | Request body | Response structure | Database entities |
|---|---|---|---|---|---|---|
| `Signup.jsx` | Register a client account | `/auth/signup` (also `/auth/register`) | POST | `{ fullName, email, password }` | `{ token, user: { id, fullName, email, preferredLanguage, role } }` | User, Role, UserRole, ClientProfile, AuthSession |
| `Login.jsx` | Authenticate an account | `/auth/login` | POST | `{ email, password }` | `{ token, user }` | User, UserRole, Role, AuthSession |
| `AuthContext.jsx` | Restore current account | `/me` | GET | — | `{ user }` | User, UserRole, Role |
| `Profile.jsx` | Change account name, email, language | `/me` | PUT | `{ fullName, email, preferredLanguage }` | `{ user }` | User |
| `NewDraft.jsx`, `api/client.js` | List active drafting templates | `/templates` | GET | — | `[{ id, documentTypeId, title, version, isActive, documentType, fields, clauses }]` | DocumentType, Template, TemplateVersion, TemplateField, ClauseVersion, TemplateVersionClause, LegalSource |
| `Drafts.jsx`, `Dashboard.jsx` | List current user's drafts/documents | `/drafts` | GET | — | `[{ id, userId, templateId, status, createdAt, updatedAt, template }]` | Document, TemplateVersion |
| `NewDraft.jsx` | Start a draft | `/drafts` | POST | `{ templateId }` | `{ id, userId, templateId, status, template }` | Document, TemplateVersion |
| `FillQuestions.jsx`, `Review.jsx`, `Preview.jsx`, `DocumentDetails.jsx` | Read draft, template fields and saved values | `/drafts/:id` | GET | — | `{ id, status, template: { fields }, values: [{ fieldId, value }] }` | Document, TemplateField, DocumentFieldValue |
| `FillQuestions.jsx` | Save questionnaire answers | `/drafts/:id/values` | PUT | `{ values: [{ fieldId, value }] }` | `{ values: [{ fieldId, value }] }` | DocumentFieldValue |
| `Review.jsx` | Validate required inputs and consistency | `/drafts/:id/validate` | POST | — | `{ status, errors?: [{ fieldId, message }] }` | Document, TemplateField, DocumentFieldValue |
| `Preview.jsx` | Read clauses applicable to draft answers | `/drafts/:id/clauses` | GET | — | `[{ id, title, plainText, legalText, position, source? }]` | TemplateVersionClause, ClauseVersion, ClauseVersionSource, LegalSource, DocumentFieldValue |
| `Documents.jsx` | List generated versions | `/drafts/:id/documents` | GET | — | `[{ id, draftId, versionNo, fileUrl, format, generatedAt }]` | DocumentVersion |
| `Preview.jsx` | Generate a final document version | `/drafts/:id/generate` | POST | — | `{ id, draftId, versionNo, fileUrl, format, generatedAt }` | Document, DocumentVersion |
| `Consult.jsx` | Browse available legal experts | `/experts` | GET | — | `[{ id, name, specialization, isAvailable }]` | Expert |
| `Consult.jsx` | Request consultation about a draft | `/consultations` | POST | `{ draftId, expertId?, query }` | `{ id, status, expert }` | Consultation, Document, Expert |
| `Consultations.jsx` | List current user's consultation history | `/consultations` | GET | — | `[{ id, draftId, expertId, query, status, expert }]` | Consultation, Expert |
| `FillQuestions.jsx` | Ask generic field guidance after consent | `/ai/questionnaire-help` | POST | `{ fieldKeys, consent: true }` | `{ status, guidance, disclaimer }` | No persisted entity; existing AI service |
| `Preview.jsx` | Generate a non-binding report after consent | `/ai/report-content` | POST | `{ templateTitle, fields, consent: true }` | `{ status, report }` | No persisted entity; existing AI service |
| Future document review integration | Analyze a generated version after explicit consent | `/ai/documents/:documentId/versions/:versionId/review` | POST | `{ consent: true }` | `{ review, disclaimer }` | AiReview, ReviewFinding, DocumentVersion |

## Role dashboards

`client/src/services/{user,client,student,document,review,adminAnalytics}Service.js`, `client/src/hooks/useDashboardData.js`, and `client/src/data/*` currently read/update `dashboardMockStore`; they issue no HTTP calls. Consequently there is no existing dashboard request or response contract to preserve. Backend resources are exposed under `/students`, `/reviews`, `/admin`, and `/dashboard`, but connecting these dashboard components to those resources is explicitly out of scope and requires a separate frontend change.

## Student registration mismatch

The existing public signup form only sends `{ fullName, email, password }` and has no role selector, academic fields, or file input. The backend treats that unchanged payload as CLIENT registration. Student registration is supported by the backend with `role: "LAW_STUDENT"` and academic fields, followed by authenticated multipart ID submission at `POST /students/verification`. There is no existing frontend form that invokes these operations.

## API conventions

- Successful account responses use `{ user }`; login/register also return `token`.
- Lists return arrays unless an endpoint documents a pagination envelope.
- Errors use `{ error, code }`, matching the frontend's `error` lookup.
- Protected routes accept the existing `Authorization: Bearer <token>` header.
- Generated file URLs point to authenticated download endpoints, not public storage URLs.
