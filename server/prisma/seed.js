import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to seed role records.");
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const roles = [
  { code: "CLIENT", name: "Client", description: "Creates agreements and requests student feedback." },
  { code: "LAW_STUDENT", name: "Law Student", description: "Provides preliminary document feedback after verification." },
  { code: "ADMIN", name: "Administrator", description: "Manages platform users, verification, and reporting." },
];

try {
  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      create: role,
      update: { name: role.name, description: role.description },
    });
  }
  console.info("Role catalog initialized.");
} finally {
  await prisma.$disconnect();
}
