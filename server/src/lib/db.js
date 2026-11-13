import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

if (!process.env.DATABASE_URL) throw new Error("Missing required backend environment variable: DATABASE_URL.");
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });

export async function audit(tx, userId, action, entityType, entityId) {
  await tx.auditLog.create({
    data: { userId, action, entityType, entityId },
  });
}