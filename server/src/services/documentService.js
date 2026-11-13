import { prisma, audit } from "../lib/db.js";
import AppError from "../utils/AppError.js";
import { pagination } from "../utils/response.js";

const templateVersionInclude = {
  template: { include: { documentType: true } },
  fields: {
    orderBy: { displayOrder: "asc" },
    include: { options: { orderBy: { displayOrder: "asc" } } },
  },
  clauseLinks: {
    orderBy: { position: "asc" },
    include: {
      clauseVersion: {
        include: {
          clause: true,
          sourceLinks: { include: { legalSource: true } },
        },
      },
      conditionField: true,
    },
  },
};

function shapeTemplate(version) {
  const { template } = version;
  return {
    id: version.id,
    templateId: template.id,
    documentTypeId: template.documentTypeId,
    title: version.title,
    version: version.versionLabel,
    isActive: version.status === "approved",
    documentType: template.documentType,
    fields: version.fields,
    clauses: version.clauseLinks.map((link) => ({
      id: link.clauseVersion.id,
      title: link.clauseVersion.title,
      plainText: link.clauseVersion.plainText,
      legalText: link.clauseVersion.legalText,
      position: link.position,
      isRequired: link.isRequired,
      conditionFieldId: link.conditionFieldId,
      conditionOperator: link.conditionOperator,
      conditionValue: link.conditionValue,
      sources: link.clauseVersion.sourceLinks.map(({ legalSource }) => ({
        id: legalSource.id,
        citationKey: legalSource.citationKey,
        actName: legalSource.actName,
        section: legalSource.section,
        sourceUrl: legalSource.sourceUrl,
      })),
    })),
  };
}

function decodeValue(valueText) {
  try { return JSON.parse(valueText); } catch { return valueText; }
}

function shapeDraft(document) {
  const version = document.templateVersion;
  return {
    id: document.id,
    userId: document.ownerUserId,
    templateId: document.templateVersionId,
    status: document.status,
    title: document.title,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    template: version ? shapeTemplate(version) : null,
    values: document.fieldValues.map((value) => ({
      fieldId: value.templateFieldId,
      value: decodeValue(value.valueText),
    })),
  };
}

function valuesByFieldId(document) {
  return new Map(document.fieldValues.map((value) => [value.templateFieldId, decodeValue(value.valueText)]));
}

function conditionMatches(link, values) {
  if (!link.conditionFieldId || !link.conditionOperator) return true;
  const value = values.get(link.conditionFieldId);
  const actual = String(value ?? "");
  const expected = link.conditionValue ?? "";
  return link.conditionOperator === "equals" ? actual === expected : actual !== expected;
}

function applicableClauses(document) {
  const values = valuesByFieldId(document);
  const links = document.templateVersion?.clauseLinks || [];
  return links.filter((link) => conditionMatches(link, values));
}

function requiredErrors(document) {
  const values = valuesByFieldId(document);
  const fields = document.templateVersion?.fields || [];
  const errors = [];
  for (const field of fields) {
    const value = values.get(field.id);
    if (field.isRequired && (value === undefined || value === null || String(value).trim() === "")) {
      errors.push({ fieldId: field.id, message: `${field.labelPlain} is required.` });
      continue;
    }
    if (value === undefined || value === null || value === "") continue;
    if (field.dataType === "number" && (!Number.isFinite(Number(value)) || Number(value) <= 0)) {
      errors.push({ fieldId: field.id, message: `${field.labelPlain} must be a positive number.` });
    } else if (field.dataType === "date" && Number.isNaN(Date.parse(String(value)))) {
      errors.push({ fieldId: field.id, message: `${field.labelPlain} must be a valid date.` });
    } else if (field.dataType === "boolean" && typeof value !== "boolean") {
      errors.push({ fieldId: field.id, message: `${field.labelPlain} must be true or false.` });
    } else if (field.dataType === "select" && field.options.length && !field.options.some((option) => option.value === String(value))) {
      errors.push({ fieldId: field.id, message: `${field.labelPlain} must be one of the listed options.` });
    }
  }
  return errors;
}

function renderAgreement(document) {
  const values = valuesByFieldId(document);
  const fields = new Map((document.templateVersion?.fields || []).map((field) => [field.id, field]));
  const clauses = applicableClauses(document);
  return clauses.map((link) => {
    let text = link.clauseVersion.legalText;
    for (const [fieldId, value] of values) {
      const field = fields.get(fieldId);
      if (field) text = text.replaceAll(`{{${field.fieldKey}}}`, String(value));
    }
    return `${link.clauseVersion.title}\n\n${text}`;
  }).join("\n\n");
}

export const documentService = {
  async listTypes() {
    return prisma.documentType.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  },

  async listTemplates() {
    const versions = await prisma.templateVersion.findMany({
      where: { status: "approved" },
      orderBy: [{ title: "asc" }, { createdAt: "desc" }],
      include: templateVersionInclude,
    });
    return versions.map(shapeTemplate);
  },

  async listDrafts(userId) {
    const documents = await prisma.document.findMany({
      where: { ownerUserId: userId, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      include: {
        templateVersion: { include: templateVersionInclude },
        fieldValues: { orderBy: { updatedAt: "asc" } },
      },
    });
    return documents.map(shapeDraft);
  },

  async createDraft(userId, templateVersionId) {
    const templateVersion = await prisma.templateVersion.findFirst({
      where: { id: templateVersionId, status: "approved" },
      include: templateVersionInclude,
    });
    if (!templateVersion) throw new AppError(404, "template_not_found", "The requested active template was not found.");
    const document = await prisma.$transaction(async (tx) => {
      const created = await tx.document.create({
        data: { ownerUserId: userId, templateVersionId, title: templateVersion.title },
        include: { templateVersion: { include: templateVersionInclude } },
      });
      await audit(tx, userId, "document.created", "documents", created.id);
      return created;
    });
    return shapeDraft({ ...document, fieldValues: [] });
  },

  async getDraft(userId, id) {
    const document = await prisma.document.findFirst({
      where: { id, ownerUserId: userId, deletedAt: null },
      include: {
        templateVersion: { include: templateVersionInclude },
        fieldValues: { orderBy: { updatedAt: "asc" } },
      },
    });
    if (!document) throw new AppError(404, "document_not_found", "The requested document was not found.");
    return { document, shaped: shapeDraft(document) };
  },

  async saveValues(userId, id, values) {
    const { document } = await this.getDraft(userId, id);
    const fields = new Set(document.templateVersion?.fields.map(({ id: fieldId }) => fieldId) || []);
    if (values.some(({ fieldId }) => !fields.has(fieldId))) {
      throw new AppError(400, "invalid_field", "One or more answers do not belong to this document's template.");
    }
    return prisma.$transaction(async (tx) => {
      for (const { fieldId, value } of values) {
        await tx.documentFieldValue.upsert({
          where: { documentId_templateFieldId: { documentId: id, templateFieldId: fieldId } },
          create: { documentId: id, templateFieldId: fieldId, valueText: JSON.stringify(value) },
          update: { valueText: JSON.stringify(value) },
        });
      }
      await tx.document.update({ where: { id }, data: { status: "in_progress" } });
      await audit(tx, userId, "document.values.updated", "documents", id);
      return { values: values.map(({ fieldId, value }) => ({ fieldId, value })) };
    });
  },

  async validateDraft(userId, id) {
    const { document } = await this.getDraft(userId, id);
    const errors = requiredErrors(document);
    const status = errors.length ? "needs_input" : "validated";
    if (!errors.length) await prisma.document.update({ where: { id }, data: { status: "validated" } });
    return { status, errors };
  },

  async getClauses(userId, id) {
    const { document } = await this.getDraft(userId, id);
    return applicableClauses(document).map((link) => ({
      id: link.clauseVersion.id,
      title: link.clauseVersion.title,
      plainText: link.clauseVersion.plainText,
      legalText: link.clauseVersion.legalText,
      position: link.position,
      source: link.clauseVersion.sourceLinks.map(({ legalSource }) => `${legalSource.actName}, ${legalSource.section}`).join("; ") || null,
    }));
  },

  async generate(userId, id) {
    const created = await prisma.$transaction(async (tx) => {
      const document = await tx.document.findFirst({
        where: { id, ownerUserId: userId, deletedAt: null },
        include: {
          templateVersion: { include: templateVersionInclude },
          fieldValues: true,
        },
      });
      if (!document) throw new AppError(404, "document_not_found", "The requested document was not found.");
      const errors = requiredErrors(document);
      if (errors.length) throw new AppError(422, "draft_incomplete", "Complete required agreement fields before generating.", { errors });
      const contentText = renderAgreement(document);
      if (!contentText.trim()) throw new AppError(422, "template_has_no_clauses", "The approved template has no applicable clauses.");
      const latest = await tx.documentVersion.findFirst({
        where: { documentId: id },
        orderBy: { versionNo: "desc" },
        select: { versionNo: true },
      });
      const version = await tx.documentVersion.create({
        data: {
          documentId: id,
          versionNo: (latest?.versionNo || 0) + 1,
          sourceKind: "generated",
          format: "txt",
          contentText,
          createdByUserId: userId,
        },
      });
      const activeRequests = await tx.reviewRequest.count({
        where: { documentId: id, status: { in: ["PENDING", "ACCEPTED", "IN_PROGRESS"] } },
      });
      await tx.document.update({ where: { id }, data: { status: activeRequests ? "in_review" : "generated" } });
      await audit(tx, userId, "document.version.generated", "document_versions", version.id);
      return version;
    }, { isolationLevel: "Serializable" }).catch((error) => {
      if (error.code === "P2002" || error.code === "P2034") {
        throw new AppError(409, "version_conflict", "The document changed while a version was being generated. Retry the request.");
      }
      throw error;
    });
    return {
      id: created.id,
      draftId: id,
      versionNo: created.versionNo,
      fileUrl: `/api/drafts/${id}/documents/${created.id}/download`,
      format: created.format,
      generatedAt: created.createdAt,
    };
  },

  async listVersions(userId, id) {
    await this.getDraft(userId, id);
    const versions = await prisma.documentVersion.findMany({ where: { documentId: id }, orderBy: { versionNo: "desc" } });
    return versions.map((version) => ({
      id: version.id,
      draftId: id,
      versionNo: version.versionNo,
      fileUrl: `/api/drafts/${id}/documents/${version.id}/download`,
      format: version.format,
      generatedAt: version.createdAt,
    }));
  },

  async listDocuments(userId, query = {}) {
    const { skip, take, page, pageSize } = pagination(query);
    const where = {
      ownerUserId: userId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search ? { title: { contains: query.search, mode: "insensitive" } } : {}),
    };
    const [items, total] = await prisma.$transaction([
      prisma.document.findMany({
        where, skip, take, orderBy: { updatedAt: "desc" },
        include: { templateVersion: { include: templateVersionInclude } },
      }),
      prisma.document.count({ where }),
    ]);
    return { items: items.map((item) => shapeDraft({ ...item, fieldValues: [] })), pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } };
  },

  async updateDocument(userId, id, input) {
    const { document } = await this.getDraft(userId, id);
    if (input.status === "archived") {
      const activeRequests = await prisma.reviewRequest.count({
        where: { documentId: id, status: { in: ["PENDING", "ACCEPTED", "IN_PROGRESS"] } },
      });
      if (activeRequests) throw new AppError(409, "document_has_active_review", "Cancel or complete active review requests before archiving this document.");
    }
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.document.update({
        where: { id },
        data: {
          ...(input.title !== undefined ? { title: input.title.trim() } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
        },
      });
      await audit(tx, userId, "document.updated", "documents", id);
      return result;
    });
    return { ...shapeDraft({ ...document, ...updated }), values: document.fieldValues.map((value) => ({ fieldId: value.templateFieldId, value: decodeValue(value.valueText) })) };
  },

  async deleteDocument(userId, id) {
    const { document } = await this.getDraft(userId, id);
    await prisma.$transaction(async (tx) => {
      await tx.document.update({ where: { id }, data: { deletedAt: new Date(), status: "archived" } });
      await audit(tx, userId, "document.deleted", "documents", id);
    });
    return document;
  },

  async getVersionContent(userId, id, versionId) {
    const { document } = await this.getDraft(userId, id);
    const version = await prisma.documentVersion.findFirst({ where: { id: versionId, documentId: document.id } });
    if (!version) throw new AppError(404, "version_not_found", "The requested document version was not found.");
    return version;
  },
};
