import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { authRepository } from "../repositories/authRepository.js";
import { authService } from "./authService.js";

function useTestSecret(t) {
  const previous = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "test-only-signing-secret-with-32-bytes-minimum";
  t.after(() => {
    if (previous === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previous;
  });
}

test("registration hashes the password and creates a client session", async (t) => {
  useTestSecret(t);
  let inserted;
  t.mock.method(authRepository, "findRole", async (code) => ({
    id: "client-role",
    code,
  }));
  t.mock.method(authRepository, "createAccountAndSession", async (input) => {
    inserted = input;
    return {
      id: "user-1",
      fullName: input.userData.fullName,
      email: input.userData.email,
      preferredLanguage: input.userData.preferredLanguage,
      isActive: true,
      createdAt: new Date(),
      roleAssignments: [{ role: { code: "CLIENT" } }],
    };
  });

  const result = await authService.register({
    fullName: "  Saral Client  ",
    email: "  client@example.in ",
    password: "A-long-password-123",
  });

  assert.equal(await bcrypt.compare("A-long-password-123", inserted.userData.passwordHash), true);
  assert.equal(inserted.userData.email, "client@example.in");
  assert.equal(result.user.role, "CLIENT");
  assert.equal(typeof result.token, "string");
  assert.equal(inserted.session.id.length > 0, true);
});

test("login verifies the password and creates a revocable session", async (t) => {
  useTestSecret(t);
  const password = "Valid-login-password-123";
  const passwordHash = await bcrypt.hash(password, 10);
  let createdSession;
  t.mock.method(authRepository, "findByEmail", async () => ({
    id: "user-2",
    fullName: "Returning Client",
    email: "client@example.in",
    passwordHash,
    preferredLanguage: "en",
    isActive: true,
    createdAt: new Date(),
    roleAssignments: [{ role: { code: "CLIENT" } }],
  }));
  t.mock.method(authRepository, "createSession", async (userId, session) => {
    createdSession = { userId, session };
  });

  const result = await authService.login({ email: " CLIENT@example.in ", password });

  assert.equal(result.user.id, "user-2");
  assert.equal(typeof result.token, "string");
  assert.equal(createdSession.userId, "user-2");
  assert.ok(createdSession.session.expiresAt > new Date());
  await assert.rejects(
    authService.login({ email: "client@example.in", password: "wrong-password-123" }),
    (error) => error.code === "invalid_credentials" && error.status === 401,
  );
});
