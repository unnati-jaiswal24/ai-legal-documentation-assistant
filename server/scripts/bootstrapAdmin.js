import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { z } from "zod";

const required = ["DATABASE_URL", "ADMIN_BOOTSTRAP_EMAIL", "ADMIN_BOOTSTRAP_PASSWORD"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) throw new Error(`Missing environment variables for one-time administrator bootstrap: ${missing.join(", ")}.`);
if (process.env.ADMIN_BOOTSTRAP_PASSWORD.length < 16 || Buffer.byteLength(process.env.ADMIN_BOOTSTRAP_PASSWORD, "utf8") > 72) {
  throw new Error("ADMIN_BOOTSTRAP_PASSWORD must contain at least 16 characters and no more than 72 UTF-8 bytes.");
}
const emailResult = z.string().trim().email().max(254).safeParse(process.env.ADMIN_BOOTSTRAP_EMAIL);
if (!emailResult.success) throw new Error("ADMIN_BOOTSTRAP_EMAIL must be a valid email address.");
const nameResult = z.string().trim().min(2).max(160).safeParse(process.env.ADMIN_BOOTSTRAP_NAME || "SaralDocs Admin");
if (!nameResult.success) throw new Error("ADMIN_BOOTSTRAP_NAME must contain 2 to 160 characters.");
const rounds = Number(process.env.BCRYPT_ROUNDS || 12);
if (!Number.isInteger(rounds) || rounds < 10 || rounds > 14) throw new Error("BCRYPT_ROUNDS must be an integer from 10 through 14.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
try {
  const email = emailResult.data.toLowerCase();
  const passwordHash = await bcrypt.hash(process.env.ADMIN_BOOTSTRAP_PASSWORD, rounds);
  const created = await prisma.$transaction(async (tx) => {
    const [adminRole] = await tx.$queryRaw`SELECT id FROM roles WHERE code = 'ADMIN' FOR UPDATE`;
    if (!adminRole) throw new Error("Administrator role is missing; run `npm run db:seed` first.");
    const existingAdmin = await tx.user.findFirst({
      where: { roleAssignments: { some: { role: { code: "ADMIN" } } } },
      select: { id: true },
    });
    if (existingAdmin) return false;
    const user = await tx.user.create({
      data: {
        fullName: nameResult.data,
        email,
        passwordHash,
        roleAssignments: { create: { roleId: adminRole.id } },
      },
    });
    await tx.auditLog.create({
      data: { userId: user.id, action: "admin.bootstrap.created", entityType: "users", entityId: user.id },
    });
    return true;
  }, { isolationLevel: "Serializable" });
  if (!created) {
    console.info("An administrator already exists. Bootstrap is one-time and was not repeated.");
    process.exitCode = 0;
  } else {
    console.info("Initial administrator created. Remove the bootstrap credentials from the environment before deployment.");
  }
} finally {
  await prisma.$disconnect();
}
