import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { createAiRouter } from "../routes/aiRoutes.js";
import { explainQuestionnaireFields, explainReviewedClauses } from "./aiService.js";

const clause = {
  id: "clause-1",
  title: "Payment timing",
  legalText: "The client pays the agreed fee within the time stated in the schedule.",
  reviewStatus: "advocate_reviewed",
};

function fakeClient(responseOrError) {
  return {
    models: {
      async generateContent(request) {
        if (responseOrError instanceof Error) throw responseOrError;
        return { text: JSON.stringify(responseOrError), request };
      },
    },
  };
}

test("does not call Gemini without explicit consent", async () => {
  let called = false;
  const result = await explainReviewedClauses([clause], {
    consent: false,
    enabled: true,
    client: { models: { generateContent: async () => { called = true; } } },
  });
  assert.equal(result.status, "not_requested");
  assert.equal(called, false);
});

test("returns a safe unavailable result when the API key is missing", async () => {
  const result = await explainReviewedClauses([clause], {
    consent: true,
    enabled: true,
    client: null,
  });
  assert.deepEqual(result, { status: "unavailable", explanations: [], errorCode: "ai_not_configured" });
});

test("does not call Gemini when AI is disabled", async () => {
  let called = false;
  const result = await explainReviewedClauses([clause], {
    consent: true,
    enabled: false,
    client: { models: { generateContent: async () => { called = true; } } },
  });
  assert.equal(result.errorCode, "ai_disabled");
  assert.equal(called, false);
});

test("rejects invalid generic questionnaire field identifiers", async () => {
  let called = false;
  const result = await explainQuestionnaireFields(["client@example.com"], {
    consent: true,
    enabled: true,
    client: { models: { generateContent: async () => { called = true; } } },
  });
  assert.equal(result.errorCode, "invalid_input");
  assert.equal(called, false);
});

test("requires explicit consent and configured API key for generic help", async () => {
  const noConsent = await explainQuestionnaireFields(["scope_description"], {
    enabled: true,
    client: { models: { generateContent: async () => assert.fail("provider must not be called") } },
  });
  const disabled = await explainQuestionnaireFields(["scope_description"], {
    consent: true,
    enabled: false,
    client: { models: { generateContent: async () => assert.fail("provider must not be called") } },
  });
  const noKey = await explainQuestionnaireFields(["scope_description"], {
    consent: true,
    enabled: true,
    client: null,
  });
  assert.equal(noConsent.status, "not_requested");
  assert.equal(disabled.errorCode, "ai_disabled");
  assert.equal(noKey.errorCode, "ai_not_configured");
});

test("sends only allowlisted generic field descriptions to Gemini", async () => {
  let request;
  const result = await explainQuestionnaireFields(["scope_description"], {
    consent: true,
    enabled: true,
    client: {
      models: {
        async generateContent(input) {
          request = input;
          return {
            text: JSON.stringify({
              guidance: [{
                fieldKey: "scope_description",
                explanation: "Describe the services included in the work.",
                questions: ["What work is included?"],
              }],
            }),
          };
        },
      },
    },
  });
  assert.equal(result.status, "ready");
  assert.deepEqual(JSON.parse(request.contents), [{
    fieldKey: "scope_description",
    meaning: "the services and work included in the project",
  }]);
  assert.equal(request.config.responseMimeType, "application/json");
});

test("maps questionnaire timeout and malformed output safely", async () => {
  const timeout = await explainQuestionnaireFields(["scope_description"], {
    consent: true,
    enabled: true,
    client: fakeClient(Object.assign(new Error("request timed out"), { status: 408 })),
  });
  const malformed = await explainQuestionnaireFields(["scope_description"], {
    consent: true,
    enabled: true,
    client: { models: { generateContent: async () => ({ text: "{}" }) } },
  });
  assert.equal(timeout.errorCode, "timeout");
  assert.equal(malformed.errorCode, "invalid_provider_response");
});

test("maps questionnaire quota and provider rejection without exposing provider messages", async () => {
  const quota = await explainQuestionnaireFields(["scope_description"], {
    consent: true,
    enabled: true,
    client: fakeClient(Object.assign(new Error("quota exceeded: private request details"), { status: 429 })),
  });
  const rejected = await explainQuestionnaireFields(["scope_description"], {
    consent: true,
    enabled: true,
    client: fakeClient(Object.assign(new Error("invalid key"), { status: 401 })),
  });
  assert.deepEqual(quota, { status: "unavailable", guidance: [], errorCode: "quota_exceeded" });
  assert.deepEqual(rejected, { status: "unavailable", guidance: [], errorCode: "provider_rejected" });
  assert.equal(JSON.stringify(quota).includes("private request details"), false);
});

test("does not send student-feedback or unreviewed clauses", async () => {
  let called = false;
  const result = await explainReviewedClauses([{ ...clause, reviewStatus: "student_feedback_received" }], {
    consent: true,
    enabled: true,
    client: { models: { generateContent: async () => { called = true; } } },
  });
  assert.equal(result.errorCode, "review_not_confirmed");
  assert.equal(called, false);
});

test("returns only structured explanations for supplied reviewed clauses", async () => {
  const client = fakeClient({
    explanations: [
      { clauseId: "clause-1", explanation: "This explains when the fee is due." },
      { clauseId: "unrelated-id", explanation: "Unrelated output." },
    ],
  });
  const result = await explainReviewedClauses([clause], { consent: true, enabled: true, client });
  assert.deepEqual(result, {
    status: "ready",
    explanations: [{ clauseId: "clause-1", explanation: "This explains when the fee is due." }],
    errorCode: null,
  });
});

test("blocks clauses containing common personal-data patterns before provider calls", async () => {
  let called = false;
  const result = await explainReviewedClauses([
    { ...clause, legalText: "Contact client@example.com about payment." },
  ], {
    consent: true,
    enabled: true,
    client: { models: { generateContent: async () => { called = true; } } },
  });
  assert.equal(result.errorCode, "personal_data_blocked");
  assert.equal(called, false);
});

test("maps quota and provider failures without leaking provider details", async () => {
  const result = await explainReviewedClauses([clause], {
    consent: true,
    enabled: true,
    client: fakeClient(Object.assign(new Error("quota exceeded with sensitive request body"), { status: 429 })),
  });
  assert.deepEqual(result, { status: "unavailable", explanations: [], errorCode: "quota_exceeded" });
});

test("rejects malformed structured model responses", async () => {
  const result = await explainReviewedClauses([clause], {
    consent: true,
    enabled: true,
    client: { models: { generateContent: async () => ({ text: "not JSON" }) } },
  });
  assert.equal(result.errorCode, "invalid_provider_response");
});

test("development endpoint validates and returns generic guidance without agreement answers", async (t) => {
  let calledWith;
  const app = express();
  app.use(express.json());
  app.use("/api/ai", createAiRouter({
    enabled: true,
    explainFields: async (fieldKeys, options) => {
      calledWith = { fieldKeys, options };
      return {
        status: "ready",
        guidance: [{ fieldKey: "scope_description", explanation: "Describe the work.", questions: [] }],
        errorCode: null,
      };
    },
  }));
  const server = app.listen(0);
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();

  const response = await fetch(`http://127.0.0.1:${port}/api/ai/questionnaire-help`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fieldKeys: ["scope_description"], consent: true }),
  });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.status, "ready");
  assert.match(body.disclaimer, /No questionnaire answers or document content were sent/);
  assert.deepEqual(calledWith, { fieldKeys: ["scope_description"], options: { consent: true } });
});

test("development endpoint rejects unconsented requests and is disabled by default", async (t) => {
  const app = express();
  app.use(express.json());
  app.use("/api/ai", createAiRouter({ enabled: false }));
  const server = app.listen(0);
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.once("listening", resolve));
  const endpoint = `http://127.0.0.1:${server.address().port}/api/ai/questionnaire-help`;

  const disabled = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fieldKeys: ["scope_description"], consent: true }),
  });
  assert.equal(disabled.status, 404);

  const appWithRoute = express();
  appWithRoute.use(express.json());
  appWithRoute.use("/api/ai", createAiRouter({ enabled: true }));
  const consentServer = appWithRoute.listen(0);
  t.after(() => new Promise((resolve) => consentServer.close(resolve)));
  await new Promise((resolve) => consentServer.once("listening", resolve));
  const unconsented = await fetch(`http://127.0.0.1:${consentServer.address().port}/api/ai/questionnaire-help`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fieldKeys: ["scope_description"], consent: false }),
  });
  assert.equal(unconsented.status, 400);
});

test("development endpoint rejects questionnaire answers and unknown field keys", async (t) => {
  const app = express();
  app.use(express.json());
  app.use("/api/ai", createAiRouter({
    enabled: true,
    explainFields: async () => assert.fail("invalid requests must not reach AI service"),
  }));
  const server = app.listen(0);
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.once("listening", resolve));
  const endpoint = `http://127.0.0.1:${server.address().port}/api/ai/questionnaire-help`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fieldKeys: ["scope_description"],
      consent: true,
      answers: { scope_description: "Sensitive agreement text" },
    }),
  });
  assert.equal(response.status, 400);
});
