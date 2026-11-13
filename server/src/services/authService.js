import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { getConfig, durationSeconds } from "../config/env.js";
import { authRepository } from "../repositories/authRepository.js";
import AppError from "../utils/AppError.js";
import { publicUser } from "../utils/response.js";

const allowedRoles = new Set(["CLIENT", "LAW_STUDENT"]);

function tokenResult(user, sessionId) {
  const config = getConfig();
  const role = user.roleAssignments[0]?.role.code;
  const token = jwt.sign(
    { role },
    config.jwtSecret,
    { subject: user.id, jwtid: sessionId, expiresIn: config.accessTokenTtl, issuer: "saraldocs-api" },
  );
  return { token, user: publicUser(user) };
}

function sessionDetails() {
  const config = getConfig();
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + durationSeconds(config.accessTokenTtl) * 1000);
  return { sessionId, expiresAt };
}

export const authService = {
  async register(input) {
    const roleCode = input.role || "CLIENT";
    if (!allowedRoles.has(roleCode)) throw new AppError(403, "role_not_allowed", "Public registration cannot assign this role.");

    const role = await authRepository.findRole(roleCode);
    if (!role) throw new AppError(503, "roles_not_seeded", "Account roles are not initialized. Run the database seed command.");
    const config = getConfig();
    const passwordHash = await bcrypt.hash(input.password, config.bcryptRounds);
    const { sessionId, expiresAt } = sessionDetails();
    const userData = {
      fullName: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      passwordHash,
      preferredLanguage: input.preferredLanguage || "en",
      roleAssignments: { create: { roleId: role.id } },
      ...(roleCode === "CLIENT" ? {
        clientProfile: {
          create: {
            companyName: input.companyName?.trim() || null,
            phoneNumber: input.phoneNumber?.trim() || null,
          },
        },
      } : {
        studentProfile: {
          create: {
            phoneNumber: input.phoneNumber.trim(),
            degree: input.degree.trim(),
            currentYear: input.currentYear,
            graduationYear: input.graduationYear,
            enrollmentNumber: input.enrollmentNumber.trim(),
            bio: input.bio?.trim() || null,
            university: {
              connectOrCreate: {
                where: {
                  name_city_state: {
                    name: input.universityName.trim(),
                    city: input.universityCity.trim(),
                    state: input.universityState.trim(),
                  },
                },
                create: {
                  name: input.universityName.trim(),
                  city: input.universityCity.trim(),
                  state: input.universityState.trim(),
                },
              },
            },
            expertise: {
              create: (input.expertiseCodes || []).map((code) => ({
                expertiseArea: { connect: { code } },
              })),
            },
          },
        },
      }),
    };

    try {
      const user = await authRepository.createAccountAndSession({
        userData,
        session: { id: sessionId, expiresAt },
      });
      return tokenResult(user, sessionId);
    } catch (error) {
      if (error.code === "P2002") throw new AppError(409, "account_conflict", "An account already uses one of these unique details.");
      if (error.code === "P2025") throw new AppError(400, "invalid_expertise", "One or more selected expertise areas are unavailable.");
      throw error;
    }
  },

  async login({ email, password }) {
    const user = await authRepository.findByEmail(email.trim().toLowerCase());
    const validPassword = user && await bcrypt.compare(password, user.passwordHash);
    if (!validPassword || !user.isActive) throw new AppError(401, "invalid_credentials", "Email or password is incorrect.");
    const { sessionId, expiresAt } = sessionDetails();
    await authRepository.createSession(user.id, { id: sessionId, expiresAt });
    return tokenResult(user, sessionId);
  },

  async authenticate(token) {
    const config = getConfig();
    let claims;
    try {
      claims = jwt.verify(token, config.jwtSecret, { issuer: "saraldocs-api" });
    } catch {
      throw new AppError(401, "invalid_token", "Authentication is required.");
    }
    if (typeof claims === "string" || !claims.sub || !claims.jti) {
      throw new AppError(401, "invalid_token", "Authentication is required.");
    }
    const [session, user] = await Promise.all([
      authRepository.getActiveSession(claims.jti, claims.sub, new Date()),
      authRepository.findById(claims.sub),
    ]);
    if (!session || !user || !user.isActive) throw new AppError(401, "session_expired", "Your session is no longer active.");
    return { user, sessionId: claims.jti, role: user.roleAssignments[0]?.role.code };
  },

  async logout(authenticated) {
    await authRepository.revokeSession(authenticated.sessionId, authenticated.user.id, new Date());
  },

  async updateProfile(userId, input) {
    try {
      const user = await authRepository.updateUser(userId, {
        fullName: input.fullName.trim(),
        email: input.email.trim().toLowerCase(),
        preferredLanguage: input.preferredLanguage,
      });
      return publicUser(user);
    } catch (error) {
      if (error.code === "P2002") throw new AppError(409, "email_in_use", "That email address is already associated with an account.");
      throw error;
    }
  },
};
