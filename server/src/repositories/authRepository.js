import { prisma } from "../lib/db.js";

const userInclude = {
  roleAssignments: { include: { role: true } },
  clientProfile: true,
  studentProfile: {
    include: {
      university: true,
      expertise: { include: { expertiseArea: true } },
      verifications: { orderBy: { submittedAt: "desc" }, take: 1 },
    },
  },
};

export const authRepository = {
  findByEmail(email) {
    return prisma.user.findUnique({ where: { email }, include: userInclude });
  },
  findById(id) {
    return prisma.user.findUnique({ where: { id }, include: userInclude });
  },
  findRole(code) {
    return prisma.role.findUnique({ where: { code } });
  },
  createAccountAndSession({ userData, session }) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: userData, include: userInclude });
      await tx.authSession.create({ data: { ...session, userId: user.id } });
      return user;
    });
  },
  async createSession(userId, session) {
    await prisma.authSession.create({ data: { ...session, userId } });
  },
  async getActiveSession(sessionId, userId, now) {
    return prisma.authSession.findFirst({
      where: { id: sessionId, userId, revokedAt: null, expiresAt: { gt: now } },
      select: { id: true },
    });
  },
  async revokeSession(sessionId, userId, now) {
    return prisma.authSession.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: now },
    });
  },
  updateUser(id, data) {
    return prisma.user.update({ where: { id }, data, include: userInclude });
  },
};
