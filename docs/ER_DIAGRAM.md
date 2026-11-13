# Entity Relationship Diagram

```mermaid
erDiagram
  USERS ||--o{ USER_ROLES : assigned
  ROLES ||--o{ USER_ROLES : grants
  USERS ||--o{ AUTH_SESSIONS : authenticates
  USERS ||--o| CLIENT_PROFILES : has
  USERS ||--o| LAW_STUDENT_PROFILES : has
  UNIVERSITIES ||--o{ LAW_STUDENT_PROFILES : enrolls
  LAW_STUDENT_PROFILES ||--o{ STUDENT_EXPERTISE : lists
  EXPERTISE_AREAS ||--o{ STUDENT_EXPERTISE : categorizes
  LAW_STUDENT_PROFILES ||--o{ STUDENT_VERIFICATIONS : submits
  USERS ||--o{ STUDENT_VERIFICATIONS : decides
  USERS ||--o{ DOCUMENTS : owns
  DOCUMENT_TYPES ||--o{ TEMPLATES : classifies
  TEMPLATES ||--o{ TEMPLATE_VERSIONS : versions
  TEMPLATE_VERSIONS ||--o{ TEMPLATE_FIELDS : defines
  TEMPLATE_VERSIONS ||--o{ TEMPLATE_VERSION_CLAUSES : includes
  CLAUSE_VERSIONS ||--o{ TEMPLATE_VERSION_CLAUSES : included
  TEMPLATE_FIELDS ||--o{ DOCUMENT_FIELD_VALUES : answered
  DOCUMENTS ||--o{ DOCUMENT_FIELD_VALUES : contains
  DOCUMENTS ||--o{ DOCUMENT_VERSIONS : versions
  DOCUMENT_VERSIONS ||--o{ AI_REVIEWS : analyzed
  AI_REVIEWS ||--o{ REVIEW_FINDINGS : reports
  CLAUSE_VERSIONS ||--o{ CLAUSE_VERSION_SOURCES : cites
  LEGAL_SOURCES ||--o{ CLAUSE_VERSION_SOURCES : referenced
  USERS ||--o{ REVIEW_REQUESTS : requests
  DOCUMENTS ||--o{ REVIEW_REQUESTS : reviewed
  DOCUMENT_VERSIONS ||--o{ REVIEW_REQUESTS : pins
  LAW_STUDENT_PROFILES ||--o{ REVIEW_REQUESTS : assigned
  REVIEW_REQUESTS ||--o| REVIEWS : produces
  REVIEWS ||--o| REVIEW_RATINGS : rated
  REVIEWS ||--o{ REVIEW_COMMENTS : includes
  USERS ||--o{ REVIEW_COMMENTS : authors
  USERS ||--o{ NOTIFICATIONS : receives
  USERS ||--o{ CONSULTATIONS : requests
  DOCUMENTS ||--o{ CONSULTATIONS : concerns
  EXPERTS ||--o{ CONSULTATIONS : assigned
  USERS ||--o{ AUDIT_LOGS : acts
```

`USER_ROLES`, `STUDENT_EXPERTISE`, `TEMPLATE_VERSION_CLAUSES`, and `CLAUSE_VERSION_SOURCES` are junction tables. `REVIEWS` has a unique `review_request_id`, making the request-to-review relationship one-to-zero-or-one. `CLIENT_PROFILES` and `LAW_STUDENT_PROFILES` each have a unique user foreign key.
