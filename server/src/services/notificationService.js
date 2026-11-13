import { prisma } from "../lib/db.js";
import AppError from "../utils/AppError.js";
import { pagination } from "../utils/response.js";

export const notificationService = {
  async list(userId, query = {}) {
    const { skip, take, page, pageSize } = pagination(query);
    const where = { userId, ...(query.unread === "true" ? { readAt: null } : {}) };
    const [items, total] = await prisma.$transaction([
      prisma.notification.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      prisma.notification.count({ where }),
    ]);
    return { items, pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } };
  },
  async markRead(userId, id) {
    const result = await prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });
    if (!result.count) throw new AppError(404, "notification_not_found", "The notification was not found.");
    return prisma.notification.findUnique({ where: { id } });
  },
};
