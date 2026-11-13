CREATE OR REPLACE FUNCTION saraldocs_actor_id() RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION saraldocs_check_document_field_value() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  document_template_id uuid;
  field_template_id uuid;
BEGIN
  SELECT template_version_id
    INTO document_template_id
    FROM documents
   WHERE id = NEW.document_id;

  SELECT template_version_id
    INTO field_template_id
    FROM template_fields
   WHERE id = NEW.template_field_id;

  IF document_template_id IS NULL
     OR field_template_id IS DISTINCT FROM document_template_id THEN
    RAISE EXCEPTION 'Template field does not belong to this document'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER document_field_values_template_match
BEFORE INSERT OR UPDATE ON document_field_values
FOR EACH ROW EXECUTE FUNCTION saraldocs_check_document_field_value();

CREATE OR REPLACE FUNCTION saraldocs_check_clause_condition() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  field_template_id uuid;
BEGIN
  IF NEW.condition_field_id IS NULL THEN
    IF NEW.condition_operator IS NOT NULL OR NEW.condition_value IS NOT NULL THEN
      RAISE EXCEPTION 'Clause condition operator and value require a field'
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.condition_operator IS NULL OR NEW.condition_value IS NULL THEN
    RAISE EXCEPTION 'A clause condition requires an operator and value'
      USING ERRCODE = 'check_violation';
  END IF;

  SELECT template_version_id
    INTO field_template_id
    FROM template_fields
   WHERE id = NEW.condition_field_id;

  IF field_template_id IS DISTINCT FROM NEW.template_version_id THEN
    RAISE EXCEPTION 'Clause condition field belongs to another template version'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER template_version_clauses_condition_match
BEFORE INSERT OR UPDATE ON template_version_clauses
FOR EACH ROW EXECUTE FUNCTION saraldocs_check_clause_condition();

ALTER TABLE document_versions
  ADD CONSTRAINT document_versions_positive_version CHECK (version_no > 0),
  ADD CONSTRAINT document_versions_has_content_or_file
    CHECK (NULLIF(content_text, '') IS NOT NULL OR NULLIF(storage_key, '') IS NOT NULL);

CREATE OR REPLACE FUNCTION saraldocs_check_consultation_owner() RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  document_owner_id uuid;
BEGIN
  SELECT owner_user_id
    INTO document_owner_id
    FROM documents
   WHERE id = NEW.document_id;

  IF document_owner_id IS DISTINCT FROM NEW.user_id THEN
    RAISE EXCEPTION 'Consultation user must own the document'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER consultations_owner_match
BEFORE INSERT OR UPDATE ON consultations
FOR EACH ROW EXECUTE FUNCTION saraldocs_check_consultation_owner();

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY;
CREATE POLICY documents_owner_policy ON documents
  USING (owner_user_id = saraldocs_actor_id())
  WITH CHECK (owner_user_id = saraldocs_actor_id());

ALTER TABLE document_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_field_values FORCE ROW LEVEL SECURITY;
CREATE POLICY document_field_values_owner_policy ON document_field_values
  USING (EXISTS (
    SELECT 1 FROM documents d
     WHERE d.id = document_id AND d.owner_user_id = saraldocs_actor_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM documents d
     WHERE d.id = document_id AND d.owner_user_id = saraldocs_actor_id()
  ));

ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions FORCE ROW LEVEL SECURITY;
CREATE POLICY document_versions_owner_policy ON document_versions
  USING (EXISTS (
    SELECT 1 FROM documents d
     WHERE d.id = document_id AND d.owner_user_id = saraldocs_actor_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM documents d
     WHERE d.id = document_id AND d.owner_user_id = saraldocs_actor_id()
  ));

ALTER TABLE ai_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reviews FORCE ROW LEVEL SECURITY;
CREATE POLICY ai_reviews_owner_policy ON ai_reviews
  USING (EXISTS (
    SELECT 1
      FROM document_versions v
      JOIN documents d ON d.id = v.document_id
     WHERE v.id = document_version_id
       AND d.owner_user_id = saraldocs_actor_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1
      FROM document_versions v
      JOIN documents d ON d.id = v.document_id
     WHERE v.id = document_version_id
       AND d.owner_user_id = saraldocs_actor_id()
  ));

ALTER TABLE review_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_findings FORCE ROW LEVEL SECURITY;
CREATE POLICY review_findings_owner_policy ON review_findings
  USING (EXISTS (
    SELECT 1
      FROM ai_reviews r
      JOIN document_versions v ON v.id = r.document_version_id
      JOIN documents d ON d.id = v.document_id
     WHERE r.id = ai_review_id
       AND d.owner_user_id = saraldocs_actor_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1
      FROM ai_reviews r
      JOIN document_versions v ON v.id = r.document_version_id
      JOIN documents d ON d.id = v.document_id
     WHERE r.id = ai_review_id
       AND d.owner_user_id = saraldocs_actor_id()
  ));

ALTER TABLE review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_comments FORCE ROW LEVEL SECURITY;
CREATE POLICY review_comments_owner_policy ON review_comments
  USING (EXISTS (
    SELECT 1
      FROM document_versions v
      JOIN documents d ON d.id = v.document_id
     WHERE v.id = document_version_id
       AND d.owner_user_id = saraldocs_actor_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1
      FROM document_versions v
      JOIN documents d ON d.id = v.document_id
     WHERE v.id = document_version_id
       AND d.owner_user_id = saraldocs_actor_id()
  ));

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations FORCE ROW LEVEL SECURITY;
CREATE POLICY consultations_owner_policy ON consultations
  USING (user_id = saraldocs_actor_id())
  WITH CHECK (user_id = saraldocs_actor_id());

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;
CREATE POLICY audit_logs_actor_policy ON audit_logs
  USING (user_id = saraldocs_actor_id())
  WITH CHECK (user_id = saraldocs_actor_id());
