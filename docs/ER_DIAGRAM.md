# SaralDocs Entity-Relationship Diagram

```mermaid
erDiagram
    USERS {
        uuid id PK
        string full_name
        string email UK
        string password_hash
        string preferred_language
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    ROLES {
        uuid id PK
        string code UK
        string name UK
        string description
    }
    USER_ROLES {
        uuid user_id PK, FK
        uuid role_id PK, FK
        timestamp assigned_at
    }
    AUTH_SESSIONS {
        uuid id PK
        uuid user_id FK
        timestamp expires_at
        timestamp revoked_at
        timestamp created_at
    }
    DOCUMENT_TYPES {
        uuid id PK
        string code UK
        string name UK
        string description
    }
    TEMPLATES {
        uuid id PK
        uuid document_type_id FK
        string code UK
        timestamp created_at
    }
    TEMPLATE_VERSIONS {
        uuid id PK
        uuid template_id FK
        string version_label
        string title
        string state_applicability
        string status
        uuid reviewer_user_id FK
        timestamp approved_at
    }
    TEMPLATE_FIELDS {
        uuid id PK
        uuid template_version_id FK
        string field_key
        string label_plain
        string data_type
        boolean is_required
        int display_order
    }
    CLAUSES {
        uuid id PK
        string code UK
        timestamp created_at
    }
    CLAUSE_VERSIONS {
        uuid id PK
        uuid clause_id FK
        string version_label
        string legal_text
        string plain_text
        string status
        uuid reviewer_user_id FK
        timestamp approved_at
    }
    TEMPLATE_VERSION_CLAUSES {
        uuid template_version_id PK, FK
        uuid clause_version_id PK, FK
        int position
        boolean is_required
        uuid condition_field_id FK
        string condition_operator
        string condition_value
    }
    LEGAL_SOURCES {
        uuid id PK
        string citation_key UK
        string act_name
        string section
        string source_url
        string excerpt
        timestamp verified_at
        uuid verified_by_user_id FK
    }
    CLAUSE_VERSION_SOURCES {
        uuid clause_version_id PK, FK
        uuid legal_source_id PK, FK
        string citation_note
    }
    DOCUMENTS {
        uuid id PK
        uuid owner_user_id FK
        uuid template_version_id FK
        string title
        string status
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    DOCUMENT_FIELD_VALUES {
        uuid document_id PK, FK
        uuid template_field_id PK, FK
        string value_text
        timestamp updated_at
    }
    DOCUMENT_VERSIONS {
        uuid id PK
        uuid document_id FK
        int version_no
        string source_kind
        string format
        string content_text
        string storage_key
        uuid created_by_user_id FK
        timestamp created_at
    }
    AI_REVIEWS {
        uuid id PK
        uuid document_version_id FK
        string review_type
        string provider
        string model
        string status
        string summary
        timestamp created_at
        timestamp completed_at
    }
    REVIEW_FINDINGS {
        uuid id PK
        uuid ai_review_id FK
        string kind
        string severity
        string title
        string explanation
        string suggestion
        uuid legal_source_id FK
        int display_order
    }
    REVIEW_COMMENTS {
        uuid id PK
        uuid document_version_id FK
        uuid author_user_id FK
        string body
        timestamp created_at
    }
    EXPERTS {
        uuid id PK
        string name
        string bar_council_id UK
        string specialization
        boolean is_available
    }
    CONSULTATIONS {
        uuid id PK
        uuid user_id FK
        uuid document_id FK
        uuid expert_id FK
        string query
        string status
        timestamp created_at
        timestamp updated_at
    }
    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        string action
        string entity_type
        uuid entity_id
        timestamp created_at
    }

    USERS ||--o{ USER_ROLES : receives
    ROLES ||--o{ USER_ROLES : assigns
    USERS ||--o{ AUTH_SESSIONS : opens
    USERS ||--o{ TEMPLATE_VERSIONS : approves
    USERS ||--o{ CLAUSE_VERSIONS : approves
    USERS ||--o{ LEGAL_SOURCES : verifies
    DOCUMENT_TYPES ||--o{ TEMPLATES : categorizes
    TEMPLATES ||--o{ TEMPLATE_VERSIONS : versions
    TEMPLATE_VERSIONS ||--o{ TEMPLATE_FIELDS : defines
    CLAUSES ||--o{ CLAUSE_VERSIONS : versions
    TEMPLATE_VERSIONS ||--o{ TEMPLATE_VERSION_CLAUSES : includes
    CLAUSE_VERSIONS ||--o{ TEMPLATE_VERSION_CLAUSES : selected_as
    TEMPLATE_FIELDS ||--o{ TEMPLATE_VERSION_CLAUSES : conditions
    CLAUSE_VERSIONS ||--o{ CLAUSE_VERSION_SOURCES : cites
    LEGAL_SOURCES ||--o{ CLAUSE_VERSION_SOURCES : referenced_by
    USERS ||--o{ DOCUMENTS : owns
    TEMPLATE_VERSIONS o|--o{ DOCUMENTS : based_on
    DOCUMENTS ||--o{ DOCUMENT_FIELD_VALUES : answers
    TEMPLATE_FIELDS ||--o{ DOCUMENT_FIELD_VALUES : answered_by
    DOCUMENTS ||--o{ DOCUMENT_VERSIONS : snapshots
    USERS o|--o{ DOCUMENT_VERSIONS : creates
    DOCUMENT_VERSIONS ||--o{ AI_REVIEWS : reviewed_in
    AI_REVIEWS ||--o{ REVIEW_FINDINGS : reports
    LEGAL_SOURCES o|--o{ REVIEW_FINDINGS : supports
    DOCUMENT_VERSIONS ||--o{ REVIEW_COMMENTS : discussed_in
    USERS ||--o{ REVIEW_COMMENTS : writes
    USERS ||--o{ CONSULTATIONS : requests
    DOCUMENTS ||--o{ CONSULTATIONS : concerns
    EXPERTS o|--o{ CONSULTATIONS : assigned
    USERS o|--o{ AUDIT_LOGS : acts
```

`DOCUMENTS.template_version_id` is nullable for uploaded documents not created
from a drafting template. `DOCUMENT_FIELD_VALUES` are valid only when that
document has the matching template version; the database trigger enforces this
cross-table rule. Review findings and comments point to immutable document
versions so history remains meaningful after a later generation.
