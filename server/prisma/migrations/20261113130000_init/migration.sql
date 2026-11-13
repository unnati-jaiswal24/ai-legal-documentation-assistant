-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "template_status" AS ENUM ('draft', 'in_review', 'approved', 'retired');

-- CreateEnum
CREATE TYPE "clause_status" AS ENUM ('draft', 'in_review', 'approved', 'retired');

-- CreateEnum
CREATE TYPE "field_data_type" AS ENUM ('text', 'number', 'date', 'boolean', 'select', 'email', 'phone');

-- CreateEnum
CREATE TYPE "clause_condition_operator" AS ENUM ('equals', 'not_equals');

-- CreateEnum
CREATE TYPE "document_status" AS ENUM ('in_progress', 'validated', 'generated', 'exported', 'in_review', 'archived');

-- CreateEnum
CREATE TYPE "document_version_source" AS ENUM ('generated', 'upload');

-- CreateEnum
CREATE TYPE "document_format" AS ENUM ('pdf', 'docx', 'txt');

-- CreateEnum
CREATE TYPE "ai_review_type" AS ENUM ('questionnaire_report', 'document_review', 'clause_explanation');

-- CreateEnum
CREATE TYPE "ai_review_status" AS ENUM ('queued', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "review_finding_kind" AS ENUM ('risk', 'suggestion', 'missing_term', 'inconsistency', 'explanation', 'summary_section');

-- CreateEnum
CREATE TYPE "review_severity" AS ENUM ('info', 'low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "consultation_status" AS ENUM ('requested', 'assigned', 'answered', 'closed');

-- CreateEnum
CREATE TYPE "student_verification_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "review_request_status" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(160) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "preferred_language" VARCHAR(16) NOT NULL DEFAULT 'en',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "description" VARCHAR(240),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "company_name" VARCHAR(180),
    "phone_number" VARCHAR(32),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "client_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universities" (
    "id" UUID NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "country_code" CHAR(2) NOT NULL DEFAULT 'IN',

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "law_student_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "university_id" UUID NOT NULL,
    "phone_number" VARCHAR(32) NOT NULL,
    "degree" VARCHAR(100) NOT NULL,
    "current_year" INTEGER NOT NULL,
    "graduation_year" INTEGER NOT NULL,
    "enrollment_number" VARCHAR(100) NOT NULL,
    "bio" VARCHAR(1200),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "law_student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expertise_areas" (
    "id" UUID NOT NULL,
    "code" VARCHAR(80) NOT NULL,
    "name" VARCHAR(120) NOT NULL,

    CONSTRAINT "expertise_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_expertise" (
    "student_profile_id" UUID NOT NULL,
    "expertise_area_id" UUID NOT NULL,

    CONSTRAINT "student_expertise_pkey" PRIMARY KEY ("student_profile_id","expertise_area_id")
);

-- CreateTable
CREATE TABLE "student_verifications" (
    "id" UUID NOT NULL,
    "student_profile_id" UUID NOT NULL,
    "storage_key" VARCHAR(255) NOT NULL,
    "original_file_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(80) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "status" "student_verification_status" NOT NULL DEFAULT 'PENDING',
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "submitted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decided_at" TIMESTAMPTZ(6),
    "decided_by_user_id" UUID,
    "rejection_reason" VARCHAR(1000),

    CONSTRAINT "student_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_types" (
    "id" UUID NOT NULL,
    "code" VARCHAR(60) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" VARCHAR(500),

    CONSTRAINT "document_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" UUID NOT NULL,
    "document_type_id" UUID NOT NULL,
    "code" VARCHAR(80) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_versions" (
    "id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "version_label" VARCHAR(40) NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "state_applicability" VARCHAR(80),
    "status" "template_status" NOT NULL DEFAULT 'draft',
    "changelog" TEXT,
    "reviewer_user_id" UUID,
    "approved_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_fields" (
    "id" UUID NOT NULL,
    "template_version_id" UUID NOT NULL,
    "field_key" VARCHAR(80) NOT NULL,
    "label_plain" VARCHAR(240) NOT NULL,
    "data_type" "field_data_type" NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL,

    CONSTRAINT "template_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_field_options" (
    "id" UUID NOT NULL,
    "template_field_id" UUID NOT NULL,
    "value" VARCHAR(240) NOT NULL,
    "label" VARCHAR(240) NOT NULL,
    "display_order" INTEGER NOT NULL,

    CONSTRAINT "template_field_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clauses" (
    "id" UUID NOT NULL,
    "code" VARCHAR(80) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clauses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clause_versions" (
    "id" UUID NOT NULL,
    "clause_id" UUID NOT NULL,
    "version_label" VARCHAR(40) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "legal_text" TEXT NOT NULL,
    "plain_text" TEXT NOT NULL,
    "status" "clause_status" NOT NULL DEFAULT 'draft',
    "reviewer_user_id" UUID,
    "approved_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clause_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_version_clauses" (
    "template_version_id" UUID NOT NULL,
    "clause_version_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "condition_field_id" UUID,
    "condition_operator" "clause_condition_operator",
    "condition_value" VARCHAR(500),

    CONSTRAINT "template_version_clauses_pkey" PRIMARY KEY ("template_version_id","clause_version_id")
);

-- CreateTable
CREATE TABLE "legal_sources" (
    "id" UUID NOT NULL,
    "citation_key" VARCHAR(180) NOT NULL,
    "act_name" VARCHAR(200) NOT NULL,
    "section" VARCHAR(100) NOT NULL,
    "source_url" VARCHAR(2048) NOT NULL,
    "excerpt" TEXT NOT NULL,
    "verified_at" TIMESTAMPTZ(6),
    "verified_by_user_id" UUID,

    CONSTRAINT "legal_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clause_version_sources" (
    "clause_version_id" UUID NOT NULL,
    "legal_source_id" UUID NOT NULL,
    "citation_note" VARCHAR(500),

    CONSTRAINT "clause_version_sources_pkey" PRIMARY KEY ("clause_version_id","legal_source_id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "owner_user_id" UUID NOT NULL,
    "template_version_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "status" "document_status" NOT NULL DEFAULT 'in_progress',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_field_values" (
    "document_id" UUID NOT NULL,
    "template_field_id" UUID NOT NULL,
    "value_text" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "document_field_values_pkey" PRIMARY KEY ("document_id","template_field_id")
);

-- CreateTable
CREATE TABLE "document_versions" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "version_no" INTEGER NOT NULL,
    "source_kind" "document_version_source" NOT NULL,
    "format" "document_format" NOT NULL,
    "content_text" TEXT,
    "storage_key" VARCHAR(1024),
    "created_by_user_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_reviews" (
    "id" UUID NOT NULL,
    "document_version_id" UUID NOT NULL,
    "review_type" "ai_review_type" NOT NULL,
    "provider" VARCHAR(80) NOT NULL,
    "model" VARCHAR(120) NOT NULL,
    "prompt_version" VARCHAR(80),
    "status" "ai_review_status" NOT NULL DEFAULT 'queued',
    "summary" TEXT,
    "error_code" VARCHAR(80),
    "created_by_user_id" UUID,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),

    CONSTRAINT "ai_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_findings" (
    "id" UUID NOT NULL,
    "ai_review_id" UUID NOT NULL,
    "kind" "review_finding_kind" NOT NULL,
    "severity" "review_severity" NOT NULL DEFAULT 'info',
    "title" VARCHAR(200) NOT NULL,
    "explanation" TEXT NOT NULL,
    "suggestion" TEXT,
    "legal_source_id" UUID,
    "display_order" INTEGER NOT NULL,

    CONSTRAINT "review_findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_comments" (
    "id" UUID NOT NULL,
    "document_version_id" UUID NOT NULL,
    "author_user_id" UUID NOT NULL,
    "review_id" UUID,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "review_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experts" (
    "id" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "bar_council_id" VARCHAR(80),
    "specialization" VARCHAR(200) NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "experts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "expert_id" UUID,
    "query" TEXT NOT NULL,
    "status" "consultation_status" NOT NULL DEFAULT 'requested',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_requests" (
    "id" UUID NOT NULL,
    "client_user_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "document_version_id" UUID NOT NULL,
    "student_profile_id" UUID NOT NULL,
    "message" VARCHAR(3000) NOT NULL,
    "requested_completion_at" TIMESTAMPTZ(6),
    "status" "review_request_status" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "accepted_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),

    CONSTRAINT "review_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "review_request_id" UUID NOT NULL,
    "summary" TEXT NOT NULL,
    "submitted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_ratings" (
    "id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "stars" INTEGER NOT NULL,
    "comment" VARCHAR(1000),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "kind" VARCHAR(80) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "body" VARCHAR(1000) NOT NULL,
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(80) NOT NULL,
    "entity_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

-- CreateIndex
CREATE INDEX "auth_sessions_user_id_expires_at_idx" ON "auth_sessions"("user_id", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "client_profiles_user_id_key" ON "client_profiles"("user_id");

-- CreateIndex
CREATE INDEX "universities_state_city_idx" ON "universities"("state", "city");

-- CreateIndex
CREATE UNIQUE INDEX "universities_name_city_state_key" ON "universities"("name", "city", "state");

-- CreateIndex
CREATE UNIQUE INDEX "law_student_profiles_user_id_key" ON "law_student_profiles"("user_id");

-- CreateIndex
CREATE INDEX "law_student_profiles_university_id_idx" ON "law_student_profiles"("university_id");

-- CreateIndex
CREATE INDEX "law_student_profiles_graduation_year_idx" ON "law_student_profiles"("graduation_year");

-- CreateIndex
CREATE UNIQUE INDEX "law_student_profiles_university_id_enrollment_number_key" ON "law_student_profiles"("university_id", "enrollment_number");

-- CreateIndex
CREATE UNIQUE INDEX "expertise_areas_code_key" ON "expertise_areas"("code");

-- CreateIndex
CREATE UNIQUE INDEX "expertise_areas_name_key" ON "expertise_areas"("name");

-- CreateIndex
CREATE INDEX "student_expertise_expertise_area_id_idx" ON "student_expertise"("expertise_area_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_verifications_storage_key_key" ON "student_verifications"("storage_key");

-- CreateIndex
CREATE INDEX "student_verifications_status_submitted_at_idx" ON "student_verifications"("status", "submitted_at");

-- CreateIndex
CREATE INDEX "student_verifications_student_profile_id_submitted_at_idx" ON "student_verifications"("student_profile_id", "submitted_at");

-- CreateIndex
CREATE UNIQUE INDEX "document_types_code_key" ON "document_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "document_types_name_key" ON "document_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "templates_code_key" ON "templates"("code");

-- CreateIndex
CREATE INDEX "templates_document_type_id_idx" ON "templates"("document_type_id");

-- CreateIndex
CREATE INDEX "template_versions_status_template_id_idx" ON "template_versions"("status", "template_id");

-- CreateIndex
CREATE UNIQUE INDEX "template_versions_template_id_version_label_key" ON "template_versions"("template_id", "version_label");

-- CreateIndex
CREATE INDEX "template_fields_template_version_id_id_idx" ON "template_fields"("template_version_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "template_fields_template_version_id_field_key_key" ON "template_fields"("template_version_id", "field_key");

-- CreateIndex
CREATE UNIQUE INDEX "template_fields_template_version_id_display_order_key" ON "template_fields"("template_version_id", "display_order");

-- CreateIndex
CREATE UNIQUE INDEX "template_field_options_template_field_id_value_key" ON "template_field_options"("template_field_id", "value");

-- CreateIndex
CREATE UNIQUE INDEX "template_field_options_template_field_id_display_order_key" ON "template_field_options"("template_field_id", "display_order");

-- CreateIndex
CREATE UNIQUE INDEX "clauses_code_key" ON "clauses"("code");

-- CreateIndex
CREATE INDEX "clause_versions_status_clause_id_idx" ON "clause_versions"("status", "clause_id");

-- CreateIndex
CREATE UNIQUE INDEX "clause_versions_clause_id_version_label_key" ON "clause_versions"("clause_id", "version_label");

-- CreateIndex
CREATE INDEX "template_version_clauses_condition_field_id_idx" ON "template_version_clauses"("condition_field_id");

-- CreateIndex
CREATE UNIQUE INDEX "template_version_clauses_template_version_id_position_key" ON "template_version_clauses"("template_version_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "legal_sources_citation_key_key" ON "legal_sources"("citation_key");

-- CreateIndex
CREATE INDEX "legal_sources_act_name_section_idx" ON "legal_sources"("act_name", "section");

-- CreateIndex
CREATE INDEX "clause_version_sources_legal_source_id_idx" ON "clause_version_sources"("legal_source_id");

-- CreateIndex
CREATE INDEX "documents_owner_user_id_status_updated_at_idx" ON "documents"("owner_user_id", "status", "updated_at");

-- CreateIndex
CREATE INDEX "documents_template_version_id_idx" ON "documents"("template_version_id");

-- CreateIndex
CREATE INDEX "document_field_values_template_field_id_idx" ON "document_field_values"("template_field_id");

-- CreateIndex
CREATE INDEX "document_versions_document_id_created_at_idx" ON "document_versions"("document_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "document_versions_document_id_version_no_key" ON "document_versions"("document_id", "version_no");

-- Composite key supports a foreign key that ensures each request version belongs to its document.
CREATE UNIQUE INDEX "document_versions_id_document_id_key" ON "document_versions"("id", "document_id");

-- CreateIndex
CREATE INDEX "ai_reviews_document_version_id_started_at_idx" ON "ai_reviews"("document_version_id", "started_at");

-- CreateIndex
CREATE INDEX "review_findings_legal_source_id_idx" ON "review_findings"("legal_source_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_findings_ai_review_id_display_order_key" ON "review_findings"("ai_review_id", "display_order");

-- CreateIndex
CREATE INDEX "review_comments_document_version_id_created_at_idx" ON "review_comments"("document_version_id", "created_at");

-- CreateIndex
CREATE INDEX "review_comments_review_id_created_at_idx" ON "review_comments"("review_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "experts_bar_council_id_key" ON "experts"("bar_council_id");

-- CreateIndex
CREATE INDEX "experts_is_available_idx" ON "experts"("is_available");

-- CreateIndex
CREATE INDEX "consultations_user_id_status_created_at_idx" ON "consultations"("user_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "consultations_document_id_idx" ON "consultations"("document_id");

-- CreateIndex
CREATE INDEX "consultations_expert_id_status_idx" ON "consultations"("expert_id", "status");

-- CreateIndex
CREATE INDEX "review_requests_client_user_id_status_created_at_idx" ON "review_requests"("client_user_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "review_requests_student_profile_id_status_created_at_idx" ON "review_requests"("student_profile_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "review_requests_document_id_idx" ON "review_requests"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_review_request_id_key" ON "reviews"("review_request_id");

-- CreateIndex
CREATE INDEX "reviews_submitted_at_idx" ON "reviews"("submitted_at");

-- CreateIndex
CREATE UNIQUE INDEX "review_ratings_review_id_key" ON "review_ratings"("review_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_created_at_idx" ON "notifications"("user_id", "read_at", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "law_student_profiles" ADD CONSTRAINT "law_student_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "law_student_profiles" ADD CONSTRAINT "law_student_profiles_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_expertise" ADD CONSTRAINT "student_expertise_student_profile_id_fkey" FOREIGN KEY ("student_profile_id") REFERENCES "law_student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_expertise" ADD CONSTRAINT "student_expertise_expertise_area_id_fkey" FOREIGN KEY ("expertise_area_id") REFERENCES "expertise_areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_verifications" ADD CONSTRAINT "student_verifications_student_profile_id_fkey" FOREIGN KEY ("student_profile_id") REFERENCES "law_student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_verifications" ADD CONSTRAINT "student_verifications_decided_by_user_id_fkey" FOREIGN KEY ("decided_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "document_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_versions" ADD CONSTRAINT "template_versions_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_versions" ADD CONSTRAINT "template_versions_reviewer_user_id_fkey" FOREIGN KEY ("reviewer_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_fields" ADD CONSTRAINT "template_fields_template_version_id_fkey" FOREIGN KEY ("template_version_id") REFERENCES "template_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_field_options" ADD CONSTRAINT "template_field_options_template_field_id_fkey" FOREIGN KEY ("template_field_id") REFERENCES "template_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clause_versions" ADD CONSTRAINT "clause_versions_clause_id_fkey" FOREIGN KEY ("clause_id") REFERENCES "clauses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clause_versions" ADD CONSTRAINT "clause_versions_reviewer_user_id_fkey" FOREIGN KEY ("reviewer_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_version_clauses" ADD CONSTRAINT "template_version_clauses_template_version_id_fkey" FOREIGN KEY ("template_version_id") REFERENCES "template_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_version_clauses" ADD CONSTRAINT "template_version_clauses_clause_version_id_fkey" FOREIGN KEY ("clause_version_id") REFERENCES "clause_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_version_clauses" ADD CONSTRAINT "template_version_clauses_condition_field_id_fkey" FOREIGN KEY ("condition_field_id") REFERENCES "template_fields"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_sources" ADD CONSTRAINT "legal_sources_verified_by_user_id_fkey" FOREIGN KEY ("verified_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clause_version_sources" ADD CONSTRAINT "clause_version_sources_clause_version_id_fkey" FOREIGN KEY ("clause_version_id") REFERENCES "clause_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clause_version_sources" ADD CONSTRAINT "clause_version_sources_legal_source_id_fkey" FOREIGN KEY ("legal_source_id") REFERENCES "legal_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_template_version_id_fkey" FOREIGN KEY ("template_version_id") REFERENCES "template_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_field_values" ADD CONSTRAINT "document_field_values_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_field_values" ADD CONSTRAINT "document_field_values_template_field_id_fkey" FOREIGN KEY ("template_field_id") REFERENCES "template_fields"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_reviews" ADD CONSTRAINT "ai_reviews_document_version_id_fkey" FOREIGN KEY ("document_version_id") REFERENCES "document_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_reviews" ADD CONSTRAINT "ai_reviews_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_findings" ADD CONSTRAINT "review_findings_ai_review_id_fkey" FOREIGN KEY ("ai_review_id") REFERENCES "ai_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_findings" ADD CONSTRAINT "review_findings_legal_source_id_fkey" FOREIGN KEY ("legal_source_id") REFERENCES "legal_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_comments" ADD CONSTRAINT "review_comments_document_version_id_fkey" FOREIGN KEY ("document_version_id") REFERENCES "document_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_comments" ADD CONSTRAINT "review_comments_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_comments" ADD CONSTRAINT "review_comments_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_expert_id_fkey" FOREIGN KEY ("expert_id") REFERENCES "experts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_requests" ADD CONSTRAINT "review_requests_client_user_id_fkey" FOREIGN KEY ("client_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_requests" ADD CONSTRAINT "review_requests_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_requests" ADD CONSTRAINT "review_requests_document_version_id_document_id_fkey" FOREIGN KEY ("document_version_id", "document_id") REFERENCES "document_versions"("id", "document_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_requests" ADD CONSTRAINT "review_requests_student_profile_id_fkey" FOREIGN KEY ("student_profile_id") REFERENCES "law_student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_review_request_id_fkey" FOREIGN KEY ("review_request_id") REFERENCES "review_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_ratings" ADD CONSTRAINT "review_ratings_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Domain constraints Prisma does not yet express in the schema.
ALTER TABLE "roles" ADD CONSTRAINT "roles_code_allowed_check"
  CHECK ("code" IN ('CLIENT', 'LAW_STUDENT', 'ADMIN'));
ALTER TABLE "users" ADD CONSTRAINT "users_email_lowercase_check"
  CHECK ("email" = lower("email"));
ALTER TABLE "law_student_profiles" ADD CONSTRAINT "law_student_profiles_years_check"
  CHECK ("current_year" BETWEEN 1 AND 10 AND "graduation_year" BETWEEN 2000 AND 2100);
ALTER TABLE "student_verifications" ADD CONSTRAINT "student_verifications_file_check"
  CHECK ("size_bytes" > 0 AND "mime_type" IN ('application/pdf', 'image/jpeg', 'image/png'));
ALTER TABLE "review_ratings" ADD CONSTRAINT "review_ratings_stars_check"
  CHECK ("stars" BETWEEN 1 AND 5);
ALTER TABLE "document_field_values" ADD CONSTRAINT "document_field_values_scalar_json_check"
  CHECK (jsonb_typeof("value_text"::jsonb) IN ('string', 'number', 'boolean', 'null'));

CREATE UNIQUE INDEX "student_verifications_one_current_per_student"
  ON "student_verifications" ("student_profile_id") WHERE "is_current";
CREATE UNIQUE INDEX "documents_id_owner_user_id_key"
  ON "documents" ("id", "owner_user_id");
CREATE UNIQUE INDEX "template_versions_one_approved_per_template"
  ON "template_versions" ("template_id") WHERE "status" = 'approved';
CREATE UNIQUE INDEX "review_requests_one_active_per_client_document_student"
  ON "review_requests" ("client_user_id", "document_id", "student_profile_id")
  WHERE "status" IN ('PENDING', 'ACCEPTED', 'IN_PROGRESS');
CREATE UNIQUE INDEX "review_requests_one_assigned_student_per_document"
  ON "review_requests" ("document_id")
  WHERE "status" IN ('ACCEPTED', 'IN_PROGRESS');

ALTER TABLE "review_requests"
  ADD CONSTRAINT "review_requests_owner_document_fkey"
  FOREIGN KEY ("document_id", "client_user_id")
  REFERENCES "documents" ("id", "owner_user_id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE FUNCTION enforce_document_field_template_version() RETURNS trigger AS $$
DECLARE
  document_template_id uuid;
  field_template_id uuid;
BEGIN
  SELECT "template_version_id" INTO document_template_id
  FROM "documents" WHERE "id" = NEW."document_id";
  SELECT "template_version_id" INTO field_template_id
  FROM "template_fields" WHERE "id" = NEW."template_field_id";
  IF document_template_id IS NULL OR field_template_id IS NULL OR document_template_id <> field_template_id THEN
    RAISE EXCEPTION 'The field does not belong to the document template version'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "document_field_values_template_match"
  BEFORE INSERT OR UPDATE OF "document_id", "template_field_id"
  ON "document_field_values"
  FOR EACH ROW EXECUTE FUNCTION enforce_document_field_template_version();

CREATE FUNCTION enforce_review_version_document_match() RETURNS trigger AS $$
DECLARE
  request_document_id uuid;
  version_document_id uuid;
BEGIN
  IF NEW."document_version_id" IS NULL THEN RETURN NEW; END IF;
  SELECT "document_id" INTO request_document_id
  FROM "review_requests" WHERE "id" = NEW."review_request_id";
  SELECT "document_id" INTO version_document_id
  FROM "document_versions" WHERE "id" = NEW."document_version_id";
  IF request_document_id IS NULL OR version_document_id IS NULL OR request_document_id <> version_document_id THEN
    RAISE EXCEPTION 'The reviewed version must belong to the requested document'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "reviews_version_document_match"
  BEFORE INSERT OR UPDATE OF "review_request_id", "document_version_id"
  ON "reviews"
  FOR EACH ROW EXECUTE FUNCTION enforce_review_version_document_match();

CREATE FUNCTION enforce_review_comment_version_match() RETURNS trigger AS $$
DECLARE
  version_document_id uuid;
  review_document_id uuid;
BEGIN
  IF NEW."review_id" IS NULL THEN RETURN NEW; END IF;
  SELECT "document_id" INTO version_document_id
  FROM "document_versions" WHERE "id" = NEW."document_version_id";
  SELECT request."document_id" INTO review_document_id
  FROM "reviews" review
  JOIN "review_requests" request ON request."id" = review."review_request_id"
  WHERE review."id" = NEW."review_id";
  IF version_document_id IS NULL OR review_document_id IS NULL OR version_document_id <> review_document_id THEN
    RAISE EXCEPTION 'The comment version must belong to the reviewed document'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "review_comments_version_match"
  BEFORE INSERT OR UPDATE OF "review_id", "document_version_id"
  ON "review_comments"
  FOR EACH ROW EXECUTE FUNCTION enforce_review_comment_version_match();
