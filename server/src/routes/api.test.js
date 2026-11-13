import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../app.js";
import {
  adminDocumentQuerySchema,
  adminReviewQuerySchema,
  adminUserQuerySchema,
  adminVerificationQuerySchema,
} from "../validators/adminValidators.js";
import { registerSchema } from "../validators/authValidators.js";

test("protected admin routes reject missing authentication", async () => {
  const response = await request(app).get("/api/admin/dashboard");
  assert.equal(response.status, 401);
  assert.equal(response.body.code, "authentication_required");
});

test("public registration cannot request the ADMIN role", async () => {
  const response = await request(app).post("/api/auth/signup").send({
    fullName: "Example Account",
    email: "example@example.in",
    password: "A-long-test-password-123",
    role: "ADMIN",
  });
  assert.equal(response.status, 400);
  assert.equal(response.body.code, "validation_error");
});

test("public client registration requires validated account fields", async () => {
  const response = await request(app).post("/api/auth/register").send({
    fullName: "X",
    email: "not-an-email",
    password: "short",
  });
  assert.equal(response.status, 400);
  assert.equal(response.body.code, "validation_error");
});

test("student ID upload requires authentication before parsing a file", async () => {
  const response = await request(app).post("/api/students/verification");
  assert.equal(response.status, 401);
  assert.equal(response.body.code, "authentication_required");
});

test("document AI review requires authentication before provider access", async () => {
  const response = await request(app)
    .post("/api/ai/documents/00000000-0000-4000-8000-000000000001/versions/00000000-0000-4000-8000-000000000002/review")
    .send({ consent: true });
  assert.equal(response.status, 401);
  assert.equal(response.body.code, "authentication_required");
});

test("unknown API routes return a consistent 404 response", async () => {
  const response = await request(app).get("/api/unknown-resource");
  assert.equal(response.status, 404);
  assert.equal(response.body.code, "not_found");
  assert.ok(response.body.error);
});

test("admin list filters reject values outside their database enums", () => {
  assert.equal(adminDocumentQuerySchema.safeParse({ status: "untrusted-status" }).success, false);
  assert.equal(adminReviewQuerySchema.safeParse({ status: "untrusted-status" }).success, false);
  assert.equal(adminVerificationQuerySchema.safeParse({ status: "untrusted-status" }).success, false);
  assert.equal(adminUserQuerySchema.safeParse({ status: "untrusted-status" }).success, false);
});

test("registration rejects passwords exceeding bcrypt's UTF-8 byte limit", () => {
  const parsed = registerSchema.safeParse({
    fullName: "Example Account",
    email: "example@example.in",
    password: "é".repeat(37),
  });
  assert.equal(parsed.success, false);
});
