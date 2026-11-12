import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { createAiRouter } from "./aiRoutes.js";

async function startServer(t, router) {
  const app = express();
  app.use(express.json());
  app.use("/api/ai", router);
  const server = app.listen(0);
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.once("listening", resolve));
  return `http://127.0.0.1:${server.address().port}/api/ai/report-content`;
}

const requestBody = {
  templateTitle: "Freelance Service Agreement",
  fields: [{ key: "scope_description", label: "Scope of work", value: "Design a website" }],
  consent: true,
};

test("report endpoint validates consent and returns the structured report", async (t) => {
  let received;
  const endpoint = await startServer(t, createAiRouter({
    reportsEnabled: true,
    createReport: async (input, options) => {
      received = { input, options };
      return {
        status: "ready",
        report: { title: input.templateTitle, overview: "The project is to design a website.", sections: [] },
      };
    },
  }));
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(body, {
    status: "ready",
    report: { title: "Freelance Service Agreement", overview: "The project is to design a website.", sections: [] },
  });
  assert.deepEqual(received, {
    input: { templateTitle: requestBody.templateTitle, fields: requestBody.fields },
    options: { consent: true },
  });
});

test("report endpoint rejects missing consent and unsupported payload keys", async (t) => {
  const endpoint = await startServer(t, createAiRouter({
    reportsEnabled: true,
    createReport: async () => assert.fail("invalid report requests must not reach the service"),
  }));
  const noConsent = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...requestBody, consent: false }),
  });
  const extraData = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...requestBody, answers: { email: "private@example.com" } }),
  });
  assert.equal(noConsent.status, 400);
  assert.equal(extraData.status, 400);
});

test("report endpoint is disabled unless explicitly enabled", async (t) => {
  const endpoint = await startServer(t, createAiRouter({
    reportsEnabled: false,
    createReport: async () => assert.fail("disabled report generation must not reach the service"),
  }));
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  assert.equal(response.status, 404);
});
