-- =====================================================================
-- Paste this at the END of the generated migration.sql
-- (server/prisma/migrations/<timestamp>_init/migration.sql)
-- before running `npx prisma migrate dev`.
-- Prisma cannot express these in schema.prisma.
-- =====================================================================

-- 1. CHECK constraints (stand in for enums, no diagram change)
ALTER TABLE "template_fields" ADD CONSTRAINT chk_field_data_type
  CHECK ("data_type" IN ('text','number','date','boolean','select','email','phone'));

ALTER TABLE "drafts" ADD CONSTRAINT chk_draft_status
  CHECK ("status" IN ('in_progress','validated','generated','exported'));

ALTER TABLE "document_versions" ADD CONSTRAINT chk_doc_format
  CHECK ("format" IN ('pdf','docx'));

ALTER TABLE "consultations" ADD CONSTRAINT chk_consult_status
  CHECK ("status" IN ('requested','assigned','answered','closed'));

-- 2. Vector index for retrieval over verified legal sources
CREATE INDEX idx_legal_sources_vec ON "legal_sources"
  USING hnsw ("embedding" vector_cosine_ops);

-- 3. A saved answer must belong to the draft's template
CREATE OR REPLACE FUNCTION check_field_belongs_to_draft_template() RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "drafts" d
    JOIN "template_fields" f ON f."template_id" = d."template_id"
    WHERE d."id" = NEW."draft_id" AND f."id" = NEW."field_id"
  ) THEN
    RAISE EXCEPTION 'field % does not belong to the template of draft %', NEW."field_id", NEW."draft_id";
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_dfv_field_check
BEFORE INSERT OR UPDATE ON "draft_field_values"
FOR EACH ROW EXECUTE FUNCTION check_field_belongs_to_draft_template();

-- 4. Row-level security: a user sees only their own rows.
--    The backend sets app.user_id inside each transaction (see src/lib/db.ts).
CREATE OR REPLACE FUNCTION app_user_id() RETURNS uuid AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '')::uuid
$$ LANGUAGE sql STABLE;

ALTER TABLE "drafts"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "draft_field_values" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "document_versions"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "consultations"      ENABLE ROW LEVEL SECURITY;

CREATE POLICY drafts_owner ON "drafts"
  USING ("user_id" = app_user_id()) WITH CHECK ("user_id" = app_user_id());

CREATE POLICY dfv_owner ON "draft_field_values"
  USING (EXISTS (SELECT 1 FROM "drafts" d WHERE d."id" = "draft_id" AND d."user_id" = app_user_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM "drafts" d WHERE d."id" = "draft_id" AND d."user_id" = app_user_id()));

CREATE POLICY docver_owner ON "document_versions"
  USING (EXISTS (SELECT 1 FROM "drafts" d WHERE d."id" = "draft_id" AND d."user_id" = app_user_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM "drafts" d WHERE d."id" = "draft_id" AND d."user_id" = app_user_id()));

CREATE POLICY consult_owner ON "consultations"
  USING ("user_id" = app_user_id()) WITH CHECK ("user_id" = app_user_id());

-- 5. Application role (RLS does NOT apply to the table owner / superuser).
--    Run once, manually, with your own password. Point DATABASE_URL at this role.
-- CREATE ROLE app_user LOGIN PASSWORD 'change-me';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;
-- REVOKE UPDATE, DELETE ON "audit_logs" FROM app_user;   -- keep audit log append-only
-- Keep a separate owner URL (DIRECT_URL) for migrations and seeding.