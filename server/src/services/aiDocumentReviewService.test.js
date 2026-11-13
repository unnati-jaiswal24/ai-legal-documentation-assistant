import test from "node:test";
import assert from "node:assert/strict";
import {
  aiDocumentReviewService,
  analyzeDocument,
  redactDocument,
} from "./aiDocumentReviewService.js";

test("redacts common identifiers and personal profile fields before AI submission", () => {
  const result = redactDocument(
    "Client: Asha Rao; Email: asha@example.in; PAN: ABCDE1234F; Phone: 9876543210; Aadhaar: 1234 5678 9012",
    [
      { valueText: "\"Asha Rao\"", templateField: { fieldKey: "client_name" } },
      { valueText: "\"asha@example.in\"", templateField: { fieldKey: "client_email" } },
    ],
  );
  assert.equal(result.includes("Asha Rao"), false);
  assert.equal(result.includes("asha@example.in"), false);
  assert.equal(result.includes("ABCDE1234F"), false);
  assert.equal(result.includes("9876543210"), false);
  assert.equal(result.includes("1234 5678 9012"), false);
  assert.equal(result.includes("[REDACTED]"), true);
});

test("Gemini document analysis accepts only the structured review contract", async () => {
  let prompt;
  const client = {
    models: {
      generateContent: async (input) => {
        prompt = input;
        return {
          text: JSON.stringify({
            summary: "The agreement should clarify how milestone acceptance works.",
            findings: [{
              kind: "risk",
              severity: "medium",
              title: "Unclear acceptance process",
              explanation: "The agreement does not explain how deliverables are accepted.",
              suggestion: "Ask a qualified professional to review an acceptance process.",
            }],
          }),
        };
      },
    },
  };
  const result = await analyzeDocument("Sanitized agreement text", { client, model: "test-model" });
  assert.equal(prompt.contents, "Sanitized agreement text");
  assert.equal(result.status, "ready");
  assert.equal(result.result.findings[0].kind, "risk");
});

test("document AI review stores findings against the owned version", async () => {
  const persisted = {};
  const version = {
    id: "version-1",
    format: "txt",
    contentText: "Client: Asha Rao; Email: asha@example.in",
    document: {
      fieldValues: [
        { valueText: "\"Asha Rao\"", templateField: { fieldKey: "client_name" } },
        { valueText: "\"asha@example.in\"", templateField: { fieldKey: "client_email" } },
      ],
    },
  };
  const db = {
    documentVersion: {
      findFirst: async ({ where }) => {
        persisted.ownershipFilter = where;
        return version;
      },
    },
    aiReview: {
      create: async ({ data }) => {
        persisted.reviewData = data;
        return { id: "ai-review-1" };
      },
    },
    $transaction: async (callback) => callback({
      aiReview: {
        update: async ({ data }) => {
          persisted.completionData = data;
          return { id: "ai-review-1", status: data.status, findings: data.findings.create };
        },
      },
      auditLog: { create: async () => ({}) },
    }),
  };
  let submittedContent;

  const result = await aiDocumentReviewService.create("client-1", "document-1", "version-1", {
    consent: true,
    enabled: true,
    db,
    analyze: async (content) => {
      submittedContent = content;
      return {
        status: "ready",
        result: {
          summary: "Clarify payment timing.",
          findings: [{
            kind: "suggestion",
            severity: "low",
            title: "Payment timing",
            explanation: "The payment date could be clearer.",
            suggestion: "Request review of the payment schedule.",
          }],
        },
      };
    },
  });

  assert.equal(persisted.ownershipFilter.document.ownerUserId, "client-1");
  assert.equal(persisted.reviewData.documentVersionId, "version-1");
  assert.equal(persisted.reviewData.status, "processing");
  assert.equal(submittedContent.includes("Asha Rao"), false);
  assert.equal(submittedContent.includes("asha@example.in"), false);
  assert.equal(result.status, "completed");
  assert.equal(persisted.completionData.findings.create[0].displayOrder, 0);
});

test("document AI review requires explicit consent", async () => {
  await assert.rejects(
    aiDocumentReviewService.create("client-1", "document-1", "version-1", { consent: false }),
    (error) => error.code === "consent_required" && error.status === 400,
  );
});
