import test from "node:test";
import assert from "node:assert/strict";
import { generateDraftReport } from "./reportService.js";

const reportInput = {
  templateTitle: "Freelance Service Agreement",
  fields: [
    { key: "scope_description", label: "Scope of work", value: "Design a product website" },
    { key: "freelancer_name", label: "Freelancer name", value: "Asha Rao" },
    { key: "fee_amount", label: "Project fee", value: 50000 },
  ],
};

function fakeModel(responseOrError, onInvoke = () => {}) {
  return {
    withStructuredOutput() {
      return {
        async invoke(messages) {
          onInvoke(messages);
          if (responseOrError instanceof Error) throw responseOrError;
          return responseOrError;
        },
      };
    },
  };
}

test("requires explicit consent before report input reaches the model", async () => {
  let called = false;
  const result = await generateDraftReport(reportInput, {
    enabled: true,
    apiKey: "test-key",
    model: fakeModel({}, () => { called = true; }),
  });
  assert.equal(result.status, "not_requested");
  assert.equal(called, false);
});

test("validates report input before model invocation", async () => {
  let called = false;
  const result = await generateDraftReport({ ...reportInput, fields: [] }, {
    consent: true,
    enabled: true,
    apiKey: "test-key",
    model: fakeModel({}, () => { called = true; }),
  });
  assert.equal(result.errorCode, "invalid_input");
  assert.equal(called, false);
});

test("sends a structured, redacted prompt and returns a constrained report", async () => {
  let messages;
  const result = await generateDraftReport(reportInput, {
    consent: true,
    enabled: true,
    apiKey: "test-key",
    model: fakeModel({
      overview: "The project is to design a product website.",
      sections: [{ heading: "Scope", content: "Design a product website." }],
    }, (input) => { messages = input; }),
  });
  const prompt = messages[1][1];
  assert.ok(prompt.includes('"value":"[REDACTED]"'));
  assert.match(prompt, /Design a product website/);
  assert.deepEqual(result, {
    status: "ready",
    report: {
      title: "Freelance Service Agreement",
      overview: "The project is to design a product website.",
      sections: [{ heading: "Scope", content: "Design a product website." }],
      redactedFieldCount: 1,
      disclaimer: "AI-generated informational summary only; not a legal document or legal advice. Agreement clauses must come from the reviewed template.",
    },
    errorCode: null,
  });
});

test("redacts common identifiers embedded in field values", async () => {
  let messages;
  await generateDraftReport({
    templateTitle: reportInput.templateTitle,
    fields: [{
      key: "notes",
      label: "Email user@example.com",
      value: "Call +91 987 654 3210 or use Aadhaar 5489 1234 5678",
    }],
  }, {
    consent: true,
    enabled: true,
    apiKey: "test-key",
    model: fakeModel({
      overview: "Contact details were omitted.",
      sections: [{ heading: "Notes", content: "Contact details were omitted." }],
    }, (input) => { messages = input; }),
  });
  assert.doesNotMatch(messages[1][1], /user@example\.com|987 654 3210|5489 1234 5678/);
});

test("maps provider errors without exposing provider messages", async () => {
  const result = await generateDraftReport(reportInput, {
    consent: true,
    enabled: true,
    apiKey: "test-key",
    model: fakeModel(Object.assign(new Error("quota exceeded with private request details"), { status: 429 })),
  });
  assert.deepEqual(result, { status: "unavailable", report: null, errorCode: "quota_exceeded" });
});

test("rejects malformed structured model output", async () => {
  const result = await generateDraftReport(reportInput, {
    consent: true,
    enabled: true,
    apiKey: "test-key",
    model: fakeModel({ overview: "A summary without sections." }),
  });
  assert.equal(result.errorCode, "invalid_provider_response");
});
