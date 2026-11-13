import test from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../lib/db.js";
import { documentService } from "./documentService.js";
import { reviewService } from "./reviewService.js";

test("review requests pin the generated document version", async (t) => {
  const version = { id: "version-1", versionNo: 3, format: "txt", contentText: "Agreement", createdAt: new Date() };
  const request = {
    id: "request-1",
    clientUserId: "client-1",
    documentId: "document-1",
    studentProfileId: "student-profile-1",
    message: "Please review this agreement.",
    requestedCompletionAt: null,
    status: "PENDING",
    acceptedAt: null,
    completedAt: null,
    createdAt: new Date(),
    client: { fullName: "Client" },
    document: { title: "Service Agreement", templateVersion: null },
    documentVersion: version,
    studentProfile: { user: { fullName: "Student" }, university: { name: "Example University" } },
    review: null,
  };
  let createdData;
  const tx = {
    document: {
      findFirst: async () => ({ id: "document-1", title: request.document.title, versions: [version] }),
      update: async () => ({}),
    },
    lawStudentProfile: {
      findFirst: async () => ({ id: "student-profile-1", user: { id: "student-1" } }),
    },
    reviewRequest: {
      findFirst: async () => null,
      create: async ({ data }) => {
        createdData = data;
        return request;
      },
    },
    notification: { create: async () => ({}) },
    auditLog: { create: async () => ({}) },
  };
  t.mock.method(prisma._originalClient, "$transaction", async (callback, options) => {
    assert.equal(options.isolationLevel, "Serializable");
    return callback(tx);
  });

  const result = await reviewService.createRequest("client-1", {
    documentId: "document-1",
    studentId: "student-profile-1",
    message: "Please review this agreement.",
  });

  assert.equal(createdData.documentVersionId, version.id);
  assert.equal(result.documentVersion.id, version.id);
});

test("document generation preserves in-review status when assignments are active", async (t) => {
  let documentStatus;
  const tx = {
    document: {
      findFirst: async () => ({
        id: "document-1",
        ownerUserId: "client-1",
        templateVersion: {
          fields: [],
          clauseLinks: [{
            position: 1,
            conditionFieldId: null,
            conditionOperator: null,
            clauseVersion: { legalText: "Terms", title: "Service terms" },
          }],
        },
        fieldValues: [],
      }),
      update: async ({ data }) => {
        documentStatus = data.status;
        return {};
      },
    },
    documentVersion: {
      findFirst: async () => null,
      create: async ({ data }) => ({ id: "version-2", versionNo: data.versionNo, createdAt: new Date(), format: data.format }),
    },
    reviewRequest: { count: async () => 1 },
    auditLog: { create: async () => ({}) },
  };
  t.mock.method(prisma._originalClient, "$transaction", async (callback, options) => {
    assert.equal(options.isolationLevel, "Serializable");
    return callback(tx);
  });

  const result = await documentService.generate("client-1", "document-1");

  assert.equal(result.versionNo, 1);
  assert.equal(documentStatus, "in_review");
});

test("student review comments use the document version pinned by the request", async (t) => {
  const request = {
    id: "request-1",
    documentId: "document-1",
    clientUserId: "client-1",
    documentVersion: { id: "version-requested" },
    review: null,
  };
  let commentData;
  const tx = {
    reviewRequest: {
      findFirst: async () => request,
      update: async () => ({}),
    },
    review: {
      create: async ({ data }) => ({ id: "review-1", ...data }),
      findUnique: async () => ({ id: "review-1" }),
    },
    reviewComment: {
      createMany: async ({ data }) => {
        commentData = data;
      },
    },
    document: { update: async () => ({}) },
    notification: { create: async () => ({}) },
    auditLog: { create: async () => ({}) },
  };
  t.mock.method(prisma._originalClient, "$transaction", async (callback) => callback(tx));

  await reviewService.submit("student-profile-1", "student-1", "request-1", {
    summary: "Review summary",
    comments: ["Please clarify the payment milestone."],
  });

  assert.equal(commentData[0].documentVersionId, "version-requested");
  assert.equal(commentData[0].reviewId, "review-1");
});
