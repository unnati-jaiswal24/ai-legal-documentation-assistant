# PostgreSQL Database Design

The schema extends the existing drafting, template, clause, AI-review, and consultation data model rather than replacing it. The additional relational entities support exactly three roles, student verification, client/student profiles, review requests, ratings, notifications, sessions, and audit history. Prisma model definitions in `server/prisma/schema.prisma` are authoritative.

## Entities and relationships

| Table | Attributes (principal) | Primary key | Foreign keys and relationships | Constraints |
|---|---|---|---|---|
| `users` | full name, normalized unique email, password hash, language, active flag, timestamps | `id` UUID | — | email unique; password hash never returned |
| `roles` | role code, display name, description | `id` UUID | — | code restricted to CLIENT, LAW_STUDENT, ADMIN; code/name unique |
| `user_roles` | user, role, assignment time | `(user_id, role_id)` | user and role; many-to-many | pair unique |
| `auth_sessions` | expiry, revocation, creation time | `id` UUID | user | indexed by user and expiry; revocation invalidates bearer tokens |
| `client_profiles` | user, company name, phone | `id` UUID | unique user | one-to-one with user |
| `universities` | name, city, state, country code | `id` UUID | — | unique normalized name/location |
| `law_student_profiles` | user, university, degree, study year, graduation year, enrollment number, bio | `id` UUID | unique user; university | enrollment unique within university; years checked |
| `expertise_areas` | code, name | `id` UUID | — | code/name unique |
| `student_expertise` | student profile, expertise area | `(student_profile_id, expertise_area_id)` | both parents | junction table; pair unique |
| `student_verifications` | student, private storage key, file metadata, status, submission/decision data, admin decision maker, rejection reason | `id` UUID | student profile; deciding admin user | status constrained; decision metadata indexed; each resubmission is a new row |
| `document_types` | code, name, description | `id` UUID | — | code/name unique |
| `templates` | code, document type, creation time | `id` UUID | document type | code unique |
| `template_versions` | template, version label, title, state applicability, status, reviewer, approval time | `id` UUID` | template; reviewer user | `(template_id, version_label)` unique |
| `template_fields` | version, key, label, type, required flag, display order | `id` UUID | template version | version/key and version/order unique |
| `clauses` | stable clause code | `id` UUID | — | code unique |
| `clause_versions` | clause, version label, legal/plain text, status, reviewer, approval time | `id` UUID | clause; reviewer user | `(clause_id, version_label)` unique |
| `template_version_clauses` | template version, clause version, position, requirement/condition | `(template_version_id, clause_version_id)` | template version, clause version, optional condition field | pair and position unique |
| `legal_sources` | citation key, act/section, URL, excerpt, verifier and verification time | `id` UUID | optional verifier user | citation unique |
| `clause_version_sources` | clause version, legal source, citation note | `(clause_version_id, legal_source_id)` | both parents | junction table |
| `documents` | owner, optional template version, title, status, timestamps, soft-delete time | `id` UUID | owner user; optional template version | owner/status/update index |
| `document_field_values` | document, template field, scalar JSON text, update time | `(document_id, template_field_id)` | document; template field | one answer per field; trigger ensures field belongs to document's template version |
| `document_versions` | document, sequence number, source, format, content/storage key, creator, time | `id` UUID | document; optional creator | document/version unique |
| `ai_reviews` | document version, kind, provider/model, status, summary, creator/timestamps | `id` UUID | document version; optional creator | indexed by document version/time |
| `review_findings` | AI review, kind, severity, title, explanation, suggestion, optional source, order | `id` UUID | AI review; optional legal source | unique display order per AI review |
| `review_requests` | client, document, pinned document version, student profile, message, deadline, status, lifecycle times | `id` UUID | client user; document; composite document/version; student profile | pinned version must belong to the requested document; indexed by owner/status and student/status |
| `reviews` | review request, summary, submission time | `id` UUID | unique review request | one review per request; version derives from its request |
| `review_comments` | document version, author, optional student review, body, timestamps | `id` UUID | document version; author; optional review | indexed by version/time |
| `review_ratings` | review, stars, optional comment, creation time | `id` UUID | unique review | stars 1–5 |
| `notifications` | user, type, title, body, read time, creation time | `id` UUID | user | user/read/time index |
| `experts` | name, optional bar council ID, specialization, availability | `id` UUID | — | bar council ID unique |
| `consultations` | user, document, optional expert, query, status, timestamps | `id` UUID | user; document; expert | indexed by owner/status/time |
| `audit_logs` | optional actor, action, entity type/id, creation time | `id` UUID | optional user | indexed by actor/time and entity |

## Keys and constraints

UUID primary keys are used for independent entities. Junction entities use composite primary keys where the pair itself uniquely identifies the association. Foreign keys use restrictive deletion for immutable reviewed templates and clauses, and cascading deletion only for user-owned subordinate data. Database enums/checks constrain role, verification, review, document, and workflow status values. API services additionally validate cross-row ownership and lifecycle transitions inside transactions.

`document_field_values.value_text` contains one JSON-encoded scalar (`string`, `number`, or `boolean`) rather than a repeating group or multiple columns. Student expertise uses a junction table. Academic institution facts live in `universities`, not in every student row.

## Existing frontend dependencies

The existing agreement workflow requires `Document` (adapted as a draft), template versions and fields, saved values, document versions, and consultation history. Existing `/api` paths and payloads are documented in [FRONTEND_BACKEND_MAPPING.md](./FRONTEND_BACKEND_MAPPING.md). Role dashboard mock resources are not persisted by the current UI.
