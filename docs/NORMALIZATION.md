# SaralDocs Normalization Rationale

## Scope

This note describes the proposed PostgreSQL schema in
[DATABASE_DESIGN.md](./DATABASE_DESIGN.md). The design targets 1NF, 2NF, and 3NF
and uses relational tables and foreign keys for repeating relationships. It does
not store collections of answers, clauses, milestones, review findings, or audit
attributes inside a document row.

## First Normal Form (1NF)

Every table has a primary key and each column stores one value for one row:

- A role assignment is one `(user_id, role_id)` row, not a list of role IDs on a
  user.
- A template field is one row; each document answer is one scalar value in
  `document_field_values`.
- A template's clauses and a clause's citations are separate junction rows.
- Each generated/uploaded snapshot, AI review, finding, comment, consultation,
  and audit event is a separate row.
- `value_text` is not a JSON container. Its interpretation is determined by the
  referenced field's scalar `data_type`; request validation rejects objects and
  arrays.

The approved first workflow has one total fee and one invoice interval, not a
repeating payment schedule. If installment milestones are introduced, each will
be a row in a child table rather than a delimited or JSON value.

## Second Normal Form (2NF)

Non-key columns depend on the complete key:

- `user_roles` has only the assignment timestamp in addition to its composite
  `(user_id, role_id)` key; it does not store user names or role names.
- `clause_version_sources` stores only the note describing that citation link.
- `template_version_clauses` stores position, requirement, and condition facts
  about the complete template-version/clause-version association.
- `document_field_values.value_text` depends on the full
  `(document_id, template_field_id)` key. The answer cannot be identified by the
  document or field alone.

All other entity tables use a single-column primary key, so their non-key facts
depend on that complete key.

## Third Normal Form (3NF)

Non-key attributes describe the key, the whole key, and nothing but the key:

- User profile/account facts are kept in `users`; role descriptions live in
  `roles`; assignments live in `user_roles`.
- A template's document type is stored once in `templates`. Documents reference
  a template version and do not also repeat its document type.
- A stable template/clause identity is separate from version-specific wording,
  review status, and approval facts.
- Field labels and data types live in `template_fields`; saved answers reference
  the field ID and do not copy field metadata.
- Source citations are stored once in `legal_sources` and connected to
  clause-version records through a junction table.
- A document's current workflow status is on `documents`; immutable snapshots
  are separate `document_versions`.
- AI provider/run metadata is on `ai_reviews`; findings are child rows and
  comments attach to a specific version.
- Consultation rows reference users, documents, and experts instead of copying
  their current names.

## Functional dependencies represented

- `users.id → full_name, email, password_hash, preferred_language, ...`;
  unique email is an alternate candidate key.
- `roles.id → code, name, description`; `roles.code → role attributes`.
- `(user_roles.user_id, user_roles.role_id) → assigned_at`.
- `templates.id → document_type_id, code`; `templates.code → template`.
- `(template_versions.template_id, template_versions.version_label) → version
  attributes`.
- `(template_fields.template_version_id, template_fields.field_key) → field
  definition`.
- `(clauses.id, clause_versions.version_label) → clause-version attributes`
  (implemented using a clause-version ID plus a unique alternate key).
- `(document_id, template_field_id) → value_text, updated_at`.
- `(document_id, version_no) → document-version attributes`.
- `ai_reviews.id → one review run`; `review_findings.id → one finding`.
- Junction table composite keys identify the relationship and its relationship
  attributes.

## Repeating groups, partial dependencies, and transitive dependencies avoided

1. Repeating groups are rows in junction/child tables, not comma-separated lists
   or embedded arrays.
2. No non-key attribute in a composite-key table depends on only part of its key.
3. Names, titles, labels, descriptions, legal text, and provider metadata are not
   copied to tables that only need their foreign keys.
4. The document type is derived through its template/version relationship rather
   than being duplicated on documents.
5. Versioned legal wording and approved-state metadata are separated from stable
   clause/template identities.

## Intentional scope boundaries

Party identities and payment milestones are not separate entities in the current
client contract: party names and a single fee/payment interval are scalar answers
to versioned template fields. A separate party directory or installment schedule
would be introduced only with a real reuse/repetition requirement and would then
be modeled relationally. This avoids parallel copies of the same questionnaire
data. User profile fields stay on `users` because they have the same lifecycle and
one-to-one cardinality. No notification table is included without a product
workflow.

## Database-enforced invariants

- Foreign keys enforce entity relationships.
- Unique constraints prevent duplicate emails, role assignments, version labels,
  field keys/positions, clause positions, document answers, and document version
  numbers.
- Check constraints constrain status/type values and conditional clause rules.
- A trigger ensures a saved answer's field belongs to the document's pinned
  template version.
- Ownership policies use transaction-local actor context for row-level security;
  service-level ownership scoping remains mandatory.
