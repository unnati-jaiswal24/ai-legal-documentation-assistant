# SaralDocs Database Design

## Scope and design principles

The initial relational model supports the current React workflow: accounts, reviewed
templates, guided agreement drafts, saved answers, deterministic validation,
generated document versions, AI review history, and expert consultations. Uploaded
documents can be represented as documents with source versions and no drafting
template. Clause wording is versioned independently from the reusable clause
identity. AI outputs are persisted as review runs and individual findings.

PostgreSQL is the source of truth. Prisma models the relational schema; migrations
add database constraints Prisma cannot express (including cross-template answer
validation and row-level security). UUIDs are used for entity identifiers. Timestamps
are stored in UTC. Enum-like values are constrained in PostgreSQL. All foreign keys
are indexed where they are used for joins or ownership checks.

## Entities, keys, constraints, and relationships

### `users`

- **Attributes:** `id`, `full_name`, `email`, `password_hash`,
  `preferred_language`, `is_active`, `created_at`, `updated_at`.
- **Primary key:** `id`.
- **Foreign keys:** none.
- **Constraints:** email is required and unique; email is normalized to lowercase
  by the service; password hash and full name are required.
- **Relationships:** many-to-many with `roles` through `user_roles`; one-to-many
  with sessions, documents, consultations, comments, and audit events; may review
  template/clause versions.
- **Normalization:** each user fact depends on the user key. Profile attributes
  stay here because the current profile is one-to-one and has no independent
  lifecycle.

### `roles`

- **Attributes:** `id`, `code`, `name`, `description`.
- **Primary key:** `id`.
- **Foreign keys:** none.
- **Constraints:** `code` and `name` are unique; `code` is required.
- **Relationships:** many-to-many with users through `user_roles`.
- **Normalization:** role descriptions depend only on the role key.

### `user_roles`

- **Attributes:** `user_id`, `role_id`, `assigned_at`.
- **Primary key:** `(user_id, role_id)`.
- **Foreign keys:** `user_id → users.id`, `role_id → roles.id`.
- **Constraints:** both key columns are required; the composite key prevents
  duplicate assignments.
- **Relationships:** junction between users and roles.
- **Normalization:** a many-to-many relationship is represented as rows; no user
  or role attributes are copied into the junction.

### `auth_sessions`

- **Attributes:** `id` (JWT session identifier), `user_id`, `expires_at`,
  `revoked_at`, `created_at`.
- **Primary key:** `id`.
- **Foreign keys:** `user_id → users.id`.
- **Constraints:** `user_id`, `expires_at`, and `created_at` are required; indexes
  cover `(user_id, expires_at)`.
- **Relationships:** many sessions belong to one user.
- **Normalization:** one row represents one login session. The JWT itself is not
  stored; revoking this row invalidates its session identifier.

### `document_types`

- **Attributes:** `id`, `code`, `name`, `description`.
- **Primary key:** `id`.
- **Foreign keys:** none.
- **Constraints:** `code` and `name` are unique and required.
- **Relationships:** one-to-many with templates.
- **Normalization:** document-type descriptions are held once in a reference table.

### `templates`

- **Attributes:** `id`, `document_type_id`, `code`, `created_at`.
- **Primary key:** `id`.
- **Foreign keys:** `document_type_id → document_types.id`.
- **Constraints:** `code` is unique and required; document type is required.
- **Relationships:** one-to-many with template versions.
- **Normalization:** this table identifies a template independently of its
  changeable title, wording, and questionnaire.

### `template_versions`

- **Attributes:** `id`, `template_id`, `version_label`, `title`,
  `state_applicability`, `status`, `changelog`, `reviewer_user_id`,
  `approved_at`, `created_at`.
- **Primary key:** `id`.
- **Foreign keys:** `template_id → templates.id`;
  `reviewer_user_id → users.id` (nullable).
- **Constraints:** unique `(template_id, version_label)`; status is constrained;
  approval metadata is nullable until review.
- **Relationships:** one-to-many with fields and template-clause links; referenced
  by documents.
- **Normalization:** title and approval state belong to a specific template
  version. The document type is reached through `templates`, not copied here.

### `template_fields`

- **Attributes:** `id`, `template_version_id`, `field_key`, `label_plain`,
  `data_type`, `is_required`, `display_order`.
- **Primary key:** `id`.
- **Foreign keys:** `template_version_id → template_versions.id`.
- **Constraints:** unique `(template_version_id, field_key)` and
  `(template_version_id, display_order)`; data type is constrained; all field
  definition values are required.
- **Relationships:** one-to-many with saved document field values; may be
  referenced by a template clause condition.
- **Normalization:** each row describes one atomic question in one template
  version. Display metadata is not repeated on each answer.

### `clauses`

- **Attributes:** `id`, `code`, `created_at`.
- **Primary key:** `id`.
- **Foreign keys:** none.
- **Constraints:** `code` is unique and required.
- **Relationships:** one-to-many with clause versions.
- **Normalization:** stable clause identity is separate from changing wording.

### `clause_versions`

- **Attributes:** `id`, `clause_id`, `version_label`, `legal_text`,
  `plain_text`, `status`, `reviewer_user_id`, `approved_at`, `created_at`.
- **Primary key:** `id`.
- **Foreign keys:** `clause_id → clauses.id`;
  `reviewer_user_id → users.id` (nullable).
- **Constraints:** unique `(clause_id, version_label)`; status is constrained;
  legal text and review state are required.
- **Relationships:** many-to-many with template versions through
  `template_version_clauses`; many-to-many with legal sources through
  `clause_version_sources`.
- **Normalization:** text and approval facts are tied to an immutable clause
  version, preserving prior generated agreements.

### `template_version_clauses`

- **Attributes:** `template_version_id`, `clause_version_id`, `position`,
  `is_required`, `condition_field_id`, `condition_operator`,
  `condition_value`.
- **Primary key:** `(template_version_id, clause_version_id)`.
- **Foreign keys:** template and clause-version FKs; the optional condition field
  uses a composite FK to ensure it belongs to this template version.
- **Constraints:** unique `(template_version_id, position)`; a check requires
  condition operator/value exactly when a condition field is present.
- **Relationships:** junction between template versions and clause versions.
- **Normalization:** order, requiredness, and a single scalar inclusion condition
  depend on the association, not on either referenced entity alone.

### `legal_sources`

- **Attributes:** `id`, `citation_key`, `act_name`, `section`, `source_url`,
  `excerpt`, `verified_at`, `verified_by_user_id`.
- **Primary key:** `id`.
- **Foreign keys:** `verified_by_user_id → users.id` (nullable).
- **Constraints:** citation key, act name, and source reference are required;
  `citation_key` is unique.
- **Relationships:** many-to-many with clause versions through
  `clause_version_sources`; may be cited by review findings.
- **Normalization:** verified source information is stored once and referenced,
  not copied into clause text.

### `clause_version_sources`

- **Attributes:** `clause_version_id`, `legal_source_id`, `citation_note`.
- **Primary key:** `(clause_version_id, legal_source_id)`.
- **Foreign keys:** `clause_version_id → clause_versions.id`;
  `legal_source_id → legal_sources.id`.
- **Constraints:** both foreign keys are required.
- **Relationships:** junction between clause versions and legal sources.
- **Normalization:** a source may support multiple clauses and a clause may cite
  multiple sources without repeating either record.

### `documents`

- **Attributes:** `id`, `owner_user_id`, nullable `template_version_id`, `title`,
  `status`, `created_at`, `updated_at`, `deleted_at`.
- **Primary key:** `id`.
- **Foreign keys:** `owner_user_id → users.id`;
  `template_version_id → template_versions.id` (nullable for uploaded-only
  documents).
- **Constraints:** owner, title, status, and timestamps are required; status is
  constrained; indexes cover owner/status/update time.
- **Relationships:** one-to-many with field values, versions, reviews through
  versions, comments, and consultations.
- **Normalization:** a draft is a document in a draft status, avoiding overlapping
  `drafts` and `documents` records. Document type is derived through the selected
  template version and is not duplicated here.

### `document_field_values`

- **Attributes:** `document_id`, `template_field_id`, `value_text`, `updated_at`.
- **Primary key:** `(document_id, template_field_id)`.
- **Foreign keys:** `document_id → documents.id`;
  `template_field_id → template_fields.id`.
- **Constraints:** one scalar answer per document/field; a database trigger
  validates that the field belongs to the document's template version and
  rejects answers for documents without a template.
- **Relationships:** many field answers belong to one document; each answer uses
  one template field definition.
- **Normalization:** the composite key identifies an answer; field labels and
  types remain solely in `template_fields`. Arrays or serialized collections are
  not valid answer values.

### `document_versions`

- **Attributes:** `id`, `document_id`, `version_no`, `source_kind`, `format`,
  `content_text`, `storage_key`, `created_by_user_id`, `created_at`.
- **Primary key:** `id`.
- **Foreign keys:** `document_id → documents.id`;
  `created_by_user_id → users.id` (nullable).
- **Constraints:** unique `(document_id, version_no)`; source kind and format are
  constrained; each version must have content or a private storage key.
- **Relationships:** many immutable versions belong to one document; reviews and
  comments reference a specific version.
- **Normalization:** one immutable snapshot/file per row; prior versions are not
  overwritten. API download URLs are generated by the service.

### `ai_reviews`

- **Attributes:** `id`, `document_version_id`, `review_type`, `provider`,
  `model`, `prompt_version`, `status`, `summary`, `error_code`, `created_by_user_id`,
  `started_at`, `completed_at`.
- **Primary key:** `id`.
- **Foreign keys:** `document_version_id → document_versions.id`;
  `created_by_user_id → users.id` (nullable).
- **Constraints:** review type/provider/status are constrained; index by version
  and creation time; provider errors are stored as safe codes, not secrets or
  raw exception details.
- **Relationships:** many review runs belong to one document version; each run
  has many findings.
- **Normalization:** each run is a distinct historical event, and its findings
  are stored separately.

### `review_findings`

- **Attributes:** `id`, `ai_review_id`, `kind`, `severity`, `title`,
  `explanation`, `suggestion`, `legal_source_id`, `display_order`.
- **Primary key:** `id`.
- **Foreign keys:** `ai_review_id → ai_reviews.id`;
  `legal_source_id → legal_sources.id` (nullable).
- **Constraints:** kind and severity are constrained; display order is required.
- **Relationships:** many findings belong to one AI review; a finding may cite
  one verified source.
- **Normalization:** each risk, suggestion, explanation, or report section is an
  individual row rather than an embedded array.

### `review_comments`

- **Attributes:** `id`, `document_version_id`, `author_user_id`, `body`,
  `created_at`, `updated_at`.
- **Primary key:** `id`.
- **Foreign keys:** `document_version_id → document_versions.id`;
  `author_user_id → users.id`.
- **Constraints:** all references/body/timestamps are required; index by version
  and creation time.
- **Relationships:** comments are attached to a specific version and written by
  one user.
- **Normalization:** each comment is one independently addressable row.

### `experts`

- **Attributes:** `id`, `name`, `bar_council_id`, `specialization`,
  `is_available`, `created_at`.
- **Primary key:** `id`.
- **Foreign keys:** none.
- **Constraints:** name and availability are required; bar-council identifier is
  nullable and unique when supplied.
- **Relationships:** one-to-many with consultations.
- **Normalization:** expert identity is stored once; the current client models
  specialization as one scalar value.

### `consultations`

- **Attributes:** `id`, `user_id`, `document_id`, nullable `expert_id`, `query`,
  `status`, `created_at`, `updated_at`.
- **Primary key:** `id`.
- **Foreign keys:** `user_id → users.id`, `document_id → documents.id`,
  `expert_id → experts.id` (nullable).
- **Constraints:** user/document/query/status/timestamps required; status is
  constrained; indexes cover user/status/time and document.
- **Relationships:** each consultation belongs to one user and document and may
  be assigned to one expert.
- **Normalization:** request details are stored once; expert and document data
  remain in their own tables.

### `audit_logs`

- **Attributes:** `id`, nullable `user_id`, `action`, `entity_type`,
  `entity_id`, `created_at`.
- **Primary key:** `id`.
- **Foreign keys:** `user_id → users.id` (nullable).
- **Constraints:** action/entity type/entity ID/time required; append-only database
  permissions; indexes by actor/time and entity.
- **Relationships:** many events may be attributed to one user. `entity_id` is
  polymorphic and is checked by the application because it can identify more
  than one entity table.
- **Normalization:** one event per row with atomic attributes; no arbitrary
  metadata payload or duplicated entity snapshot.

## Deliberate exclusions

- **Party tables:** the current questionnaire captures freelancer/client details
  as scalar template answers. Duplicating those answers in a second party store
  would create update anomalies. Add party and document-party tables only if
  reusable party identities or repeated parties become a real product need.
- **Payment terms/milestones:** current intake has one total fee and payment
  interval, each represented by its own scalar field. A future repeated
  installment schedule must use a child `payment_milestones` table.
- **User profiles:** profile fields are one-to-one with the account and do not
  justify another table yet.
- **Notifications:** no current frontend workflow consumes them.
- **JSON/arrays:** no JSON field is used to store questionnaire answers, clause
  collections, findings, or audit attributes.

## Access control and indexes

Every document query is scoped by authenticated owner in the repository/service.
Row-level security is defense in depth on documents and dependent rows. The
backend sets actor context transaction-locally and connects with a non-owner,
least-privilege PostgreSQL role; migration and seed credentials are separate.
RLS policies do not replace application authorization.

Unique constraints cover normalized email, role code, document type code, stable
template/clause codes, template/clause version labels, template field keys and
positions, template-clause positions, document field pairs, and per-document
version numbers. Foreign-key indexes are included for owner lists, review
history, consultations, and audit lookups.

## Transaction boundaries

- Create a document and its first audit event atomically.
- Save a batch of answer values atomically, validating that all fields belong to
  the pinned template version.
- Generate a document snapshot, increment its version number, update document
  status, and append audit event in one transaction.
- Persist an AI review and all findings atomically after provider output passes
  Zod validation.
- Revoke an authentication session atomically on logout.

Legal content in development seed data is illustrative only and cannot be
promoted to an approved template/source without qualified review.
