# Normalization Notes

The schema is designed to satisfy 1NF, 2NF, and 3NF. Functional dependencies below use the declared candidate keys and unique constraints.

## 1NF

- Every column holds one atomic value. Repeating expertise lists are not stored in a string/array; each student/expertise association is one `student_expertise` row.
- A student's institution is a foreign key, not repeated university name, city, and state fields.
- One questionnaire answer is one `(document_id, template_field_id)` row, with the answer encoded as one scalar JSON value in `value_text`.
- Clause/source and template/clause many-to-many facts are represented as separate rows in junction tables.
- Versioned legal/template text is stored as individual version rows.

## 2NF

- Non-key attributes in composite-key `user_roles`, `student_expertise`, `template_version_clauses`, and `clause_version_sources` depend on the complete composite key. Position and condition data belong to a specific template-version/clause association.
- `document_field_values.value_text` depends on the complete `(document_id, template_field_id)` key; it is not stored on either parent or keyed by only one half.
- Other tables use a single-column primary key; each non-key attribute depends on that key.

## 3NF and functional dependencies

- `users.id -> full_name, email, password_hash, preferred_language, is_active, timestamps`; role metadata is not copied into users. `roles.id -> code, name, description`, and role assignments are separate.
- `client_profiles.id -> user_id, company_name, phone_number`; unique `user_id` gives one profile per account. Student-only attributes are not copied into user rows.
- `universities.id -> name, city, state, country_code`; profiles store only the university key.
- `law_student_profiles.id -> user_id, university_id, degree, study_year, graduation_year, enrollment_number, bio`; student expertise is held in its junction table. Verification status is derived from the current verification submission rather than duplicated on the profile.
- `expertise_areas.id -> code, name`; expertise labels are not duplicated on student profiles.
- `documents.id -> owner_user_id, template_version_id, title, status, timestamps`; document owner and template facts remain in their parent tables.
- `template_fields.id -> template_version_id, field_key, label, type, required, display_order`; unique `(template_version_id, field_key)` keeps field keys scoped to one immutable template version.
- `clause_versions.id -> clause_id, version_label, legal_text, plain_text, status, reviewer, approval_time`; stable clause identity is separate from changing text.
- `review_requests.id -> client_user_id, document_id, document_version_id, student_profile_id, message, deadline, status, lifecycle times`; a composite foreign key ensures the pinned version belongs to that document. Client/student/document display information is derived through foreign keys.
- `reviews.id -> review_request_id, summary, submitted_at`; the reviewed version is derived through its request, avoiding a duplicated version reference. Rating values are in `review_ratings` and comments are separate rows.
- `notifications.id -> user_id, type, title, body, read_at, created_at`; user identity is referenced, not copied.
- `audit_logs.id -> actor, action, entity type/id, created_at`; this is an append-only event record, not a denormalized current-state table.

No non-key attribute is intentionally dependent on another non-key attribute. Derived dashboard counts, verification state, and average ratings are computed from source rows with SQL aggregation rather than stored redundantly. Database constraints and service transaction checks enforce cross-row rules that are not functional dependencies (for example, requiring a document field to belong to the document's template version).

## Database integrity and caveats

Enums/check constraints restrict workflow values. Foreign keys and unique indexes enforce identity and relationships. Transactions guard verification decisions, review assignment transitions, registration, and review submission. PostgreSQL triggers may enforce cross-table document/template field consistency where a simple foreign key cannot express the rule. The current schema's field-value constraint is installed in the initial migration.
