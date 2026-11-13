import { prisma, audit } from "../lib/db.js";
import AppError from "../utils/AppError.js";

const consultationInclude = { expert: true };

export const consultationService = {
  async listExperts() {
    return prisma.expert.findMany({
      where: { isAvailable: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, specialization: true, isAvailable: true },
    });
  },
  async create(userId, input) {
    return prisma.$transaction(async (tx) => {
      const document = await tx.document.findFirst({
        where: { id: input.draftId, ownerUserId: userId, deletedAt: null },
        select: { id: true },
      });
      if (!document) throw new AppError(404, "document_not_found", "The requested document was not found.");
      if (input.expertId) {
        const expert = await tx.expert.findFirst({ where: { id: input.expertId, isAvailable: true }, select: { id: true } });
        if (!expert) throw new AppError(400, "expert_unavailable", "The selected expert is unavailable.");
      }
      const consultation = await tx.consultation.create({
        data: { userId, documentId: document.id, expertId: input.expertId || null, query: input.query.trim() },
        include: consultationInclude,
      });
      await audit(tx, userId, "consultation.created", "consultations", consultation.id);
      return consultation;
    });
  },
  async list(userId) {
    return prisma.consultation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: consultationInclude,
    });
  },
};
