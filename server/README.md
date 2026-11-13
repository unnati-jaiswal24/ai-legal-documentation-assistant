# SaralDocs Backend

Node.js and Express REST API backed by PostgreSQL and Prisma 7. Controllers handle HTTP, services implement workflows, repositories provide account persistence, and Prisma models define relational constraints. The existing Vite client base URL remains unchanged (`VITE_API_BASE_URL`, default `http://localhost:4000/api`).

## Requirements and setup

1. Use Node.js 20.19+ (Node.js 24 was used for local validation).
2. Install dependencies with `npm ci` from `server/`.
3. Configure `server/.env` manually. Keep the existing `DATABASE_URL` exactly as supplied; this implementation does not rewrite it.
4. Provide a private `JWT_SECRET` of at least 32 UTF-8 bytes. Generate one locally, for example with `openssl rand -base64 48`.
5. To bootstrap the initial administrator, set `ADMIN_BOOTSTRAP_EMAIL` and a unique `ADMIN_BOOTSTRAP_PASSWORD` (16–72 characters and at most 72 UTF-8 bytes) in the backend environment. Optionally set `ADMIN_BOOTSTRAP_NAME`. Never place these values in the frontend.
6. Configure `PRIVATE_UPLOAD_DIR` (default `server/storage/private`) on a private disk with restricted access and backups appropriate for identity documents. Configure `MAX_UPLOAD_BYTES` (default 5 MiB; maximum 20 MiB).

`server/.env.example` documents the variables. The existing local `.env` was not changed. Its variable names currently do not include `JWT_SECRET`, `ADMIN_BOOTSTRAP_EMAIL`, or `ADMIN_BOOTSTRAP_PASSWORD`; add those manually before starting/authenticating or running the admin bootstrap. The existing database connection value is left untouched.

## Database and initial data

```sh
cd server
npm run db:generate
npm run db:migrate:dev        # development database only
npm run db:seed               # inserts the three role catalog records
npm run db:bootstrap-admin    # one-time, private environment credentials
```

For deployment use `npm run db:migrate:deploy`; do not use `db push` as a production migration strategy. The checked-in initial migration includes PostgreSQL constraints/triggers not expressible in Prisma's schema DSL.

The seed intentionally contains roles only. It does not publish mock users, placeholder legal language, invented experts, or unreviewed templates as real records. Approved template versions and qualified expert records must be provisioned from reviewed content before the matching frontend workflows can return data. Admin endpoints can create expertise and expert records; legal-template content must be loaded and approved through a controlled content process.

Student ID files are stored outside static serving, MIME/signature checked (PDF/JPEG/PNG), size-limited, randomly named, and served only through authenticated ownership/admin endpoints. Back up or delete private files according to the platform's retention policy.

## Run and test

```sh
cd server
npm run dev
npm start
npm test
```

`GET http://localhost:4000/health` reports API/database readiness without exposing connection details. A missing required setting fails startup with the variable name only.

## API and database documentation

- [API documentation](../docs/API_DOCUMENTATION.md)
- [Frontend/backend mapping](../docs/FRONTEND_BACKEND_MAPPING.md)
- [Database design](../docs/DATABASE_DESIGN.md)
- [ER diagram](../docs/ER_DIAGRAM.md)
- [Normalization](../docs/NORMALIZATION.md)

The existing role dashboards remain local mock-only until the frontend separately replaces its mock adapters. Current backend endpoints do not alter client-side routes, components, API URL configuration, or mock dashboard behavior.

## Current implementation boundaries

- Generated agreements are versioned and downloadable as private plain-text `.txt` files. PDF/DOCX rendering is not implemented.
- Review requests are limited to generated agreement versions; an uploaded-document review endpoint is not present in the existing frontend contract.
- Template authoring/review UI and production-reviewed legal content are not included. Do not mark placeholder text approved or use it as legal advice.
- The legacy Gemini questionnaire/report routes preserve their existing behavior; only the explicit document-review endpoint stores findings against a document version.
- No migration was applied to the configured PostgreSQL database during implementation. Inspect the target database/migration history before applying the initial migration, especially if it already contains manually created tables.
