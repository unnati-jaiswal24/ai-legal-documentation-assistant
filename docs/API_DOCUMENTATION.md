# SaralDocs REST API

Base URL: `http://localhost:4000/api` (same default as the existing React client). Requests and responses use JSON except student verification uploads. Protected endpoints require `Authorization: Bearer <access-token>`.

Errors use `{ "error": "Readable message", "code": "stable_code", "details"?: [...] }`. Status codes are 400 for invalid input, 401 for missing/invalid/revoked access, 403 for role/eligibility failures, 404 for inaccessible or missing resources, 409 for conflicting state transitions, 413/415 for file constraints, 422 for incomplete drafts, 429 for rate limits, and 500 for unexpected failures. Production responses never include stack traces or database details.

## Authentication and account management

| Method | Path | Access | Request | Response |
|---|---|---|---|---|
| POST | `/auth/register` or `/auth/signup` | Public; CLIENT or LAW_STUDENT only | `{ fullName, email, password, role?, preferredLanguage?, ...studentFields }` | `201 { token, user }` |
| POST | `/auth/login` | Public, rate-limited | `{ email, password }` | `{ token, user }` |
| POST | `/auth/logout` | Authenticated | — | `204`; revokes the token session |
| GET | `/me` or `/auth/me` | Authenticated | — | `{ user }` |
| PUT | `/me` or `/auth/me` | Authenticated | `{ fullName, email, preferredLanguage }` | `{ user }` |

Student registration accepts `phoneNumber`, `universityName`, `universityCity`, `universityState`, `degree`, `currentYear`, `graduationYear`, `enrollmentNumber`, optional `bio`, and optional existing `expertiseCodes`. The student remains unverified until an admin decision. Public ADMIN registration is rejected; initial admin creation is a separate one-time CLI bootstrap.

## Student discovery and verification

| Method | Path | Access | Request | Response |
|---|---|---|---|---|
| GET | `/students` | CLIENT | `page`, `pageSize`, `search`, `expertise` query | `{ items, pagination }`, verified students only |
| GET | `/students/:id` | CLIENT | Student profile UUID | `{ student }` |
| GET | `/students/profile` | LAW_STUDENT | — | `{ profile }`, including current verification state |
| PATCH | `/students/profile` | LAW_STUDENT | Any subset of academic/profile fields and `expertiseCodes` | `{ profile }` |
| POST | `/students/verification` | LAW_STUDENT, multipart `file` | PDF, JPEG, or PNG ID/enrollment proof | `201 { verification }`, status PENDING |
| GET | `/students/verification/status` | LAW_STUDENT | — | `{ verification }` |
| GET | `/students/verification/:id/document` | Uploading student or ADMIN | Verification UUID | Private attachment stream |
| GET | `/students/expertise` | Public | — | Non-sensitive expertise catalog used during registration |

Uploads are size-limited, signature-checked, stored under a private non-static directory using random names, and never exposed through public URLs. Rejected students may replace the current submission; prior verification rows remain available to administrators as history.

## Agreement documents

The existing client uses `/templates`, `/drafts`, and `/drafts/:id/*`; the API preserves those paths and response shapes. All draft/document operations below are CLIENT-only and always scoped to the authenticated owner.

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/document-types` | — | `[{ id, name }]` |
| GET | `/templates` | — | Active approved template versions, fields/options/clauses included |
| GET | `/drafts` | — | Current user's document drafts |
| POST | `/drafts` | `{ templateId }` (approved template-version UUID) | `201 { id, userId, templateId, status, template }` |
| GET | `/drafts/:id` | — | `{ id, status, template: { fields }, values: [{ fieldId, value }] }` |
| PUT | `/drafts/:id/values` | `{ values: [{ fieldId, value }] }` | `{ values }` |
| POST | `/drafts/:id/validate` | — | `{ status: "validated" \| "needs_input", errors }` |
| GET | `/drafts/:id/clauses` | — | Applicable reviewed clauses with source citations |
| POST | `/drafts/:id/generate` | — | `201 { id, draftId, versionNo, fileUrl, format: "txt", generatedAt }` |
| GET | `/drafts/:id/documents` | — | Generated version list |
| GET | `/drafts/:id/documents/:versionId/download` | — | Authenticated text attachment |
| GET | `/documents` | `page`, `pageSize`, `search`, `status` | `{ items, pagination }` |
| GET | `/documents/:id` | — | `{ document }` |
| PATCH | `/documents/:id` | `{ title?, status? }` | `{ document }` |
| DELETE | `/documents/:id` | — | `204`; soft-deletes and archives |

Only approved template/clause versions are returned. The seed contains no example agreement text; legal clauses must be supplied and approved by qualified reviewers before use.

## Student review workflow

| Method | Path | Access | Request | Response |
|---|---|---|---|---|
| POST | `/reviews/requests` | CLIENT | `{ documentId, studentId, message, requestedCompletionAt? }` | `201 { request }` |
| GET | `/reviews/requests` | CLIENT or LAW_STUDENT | `page`, `pageSize`, `status` | `{ items, pagination }`, scoped to requester |
| PATCH | `/reviews/requests/:id/accept` | Currently verified LAW_STUDENT assigned to request | — | `{ request }` |
| PATCH | `/reviews/requests/:id/reject` | Assigned LAW_STUDENT | — | `{ request }` |
| PATCH | `/reviews/requests/:id/start` | Verified assigned LAW_STUDENT | — | `{ request }` |
| POST | `/reviews/:id/submit` | Verified assigned LAW_STUDENT | `{ summary, comments?: string[] }` | `{ review }`, status COMPLETED |
| GET | `/reviews/:id` | Request client, assigned student, or ADMIN | Review/request UUID | `{ review }` |
| POST | `/reviews/:id/rating` | Owning CLIENT after completion | `{ stars: 1..5, comment? }` | `201 { rating }` |

Statuses are PENDING, ACCEPTED, REJECTED, IN_PROGRESS, COMPLETED, and CANCELLED. A partial unique database index and transactional state changes prevent duplicate active assignments for one document. Each student review is preliminary feedback, not professional legal advice.
Each request pins the exact generated document version at creation; edits or later versions do not change the content assigned for review.

## Admin and analytics

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/admin/dashboard` or `/dashboard/admin` | `range=30d\|90d\|6m\|12m` | Database counts, grouped status/type data, registration/document trends, student activity, ratings, completion rate and turnaround |
| GET | `/admin/users` | `page`, `pageSize`, `search`, `role`, `status` | `{ items, pagination }` |
| PATCH | `/admin/users/:id/status` | `{ isActive }` | `{ user }`; deactivation revokes sessions |
| PATCH | `/admin/users/:id/role` | `{ role }` | `{ user }`; ADMIN-only operation |
| GET | `/admin/students` | `page`, `pageSize`, `search`, `status=PENDING\|APPROVED\|REJECTED` | `{ items, pagination }` |
| GET | `/admin/verifications` | `page`, `pageSize`, `status` | `{ items, pagination }` |
| GET | `/admin/verifications/:id/document` | — | Authenticated private file stream |
| PATCH | `/admin/verifications/:id/approve` | — | `{ verification }` |
| PATCH | `/admin/verifications/:id/reject` | `{ reason }` | `{ verification }` |
| GET | `/admin/documents` | `page`, `pageSize`, `search`, `status` | `{ items, pagination }` |
| GET | `/admin/reviews` and `/admin/review-requests` | `page`, `pageSize`, `status` | Paginated management data |
| GET/POST | `/admin/expertise` | POST `{ code, name }` | Expertise catalog / `201 { expertise }` |
| POST | `/admin/experts` | `{ name, specialization, barCouncilId?, isAvailable? }` | `201 { expert }` |

Additional dashboards: `GET /dashboard/client` (CLIENT) and `GET /dashboard/student` (LAW_STUDENT). Notifications: `GET /notifications` and `PATCH /notifications/:id/read`, both scoped to the authenticated user.

## Existing AI routes

The pre-existing Gemini routes remain mounted at `/ai/questionnaire-help` and `/ai/report-content`. Both require explicit consent in the body and return their existing `{ status, guidance/report, ... }` response shapes. Provider keys remain server-side.

| Method | Path | Access | Request | Response |
|---|---|---|---|---|
| POST | `/ai/documents/:documentId/versions/:versionId/review` | Owning CLIENT, explicit consent | `{ consent: true }` | `201 { review, disclaimer }`; persists structured findings against that exact document version |
| GET | `/ai/documents/:documentId/reviews` | Owning CLIENT | — | `{ items }`, review history for the owned document |

Document analysis is disabled unless `GEMINI_DOCUMENT_REVIEW_ENABLED=true` and Gemini is configured. Common identifiers and values in fields marked as personal are redacted before provider submission; users must still explicitly consent. Review output is structured and stored in `ai_reviews`/`review_findings`; it is informational, not legal advice. The older questionnaire report route still does not persist its report output.

## Operational configuration and product boundary

See [server/README.md](../server/README.md). Role dashboard components still use local mock services and do not call these endpoints. The existing React app has no student registration/upload form or role-dashboard API adapter; backend endpoints are ready, but that frontend integration is a separate task.
