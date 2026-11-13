import { z } from "zod";

const email = z.string().trim().email().max(254);
const password = z.string().min(10).max(72).refine((value) => Buffer.byteLength(value, "utf8") <= 72, "Password must not exceed 72 UTF-8 bytes.");

export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  email,
  password,
  role: z.enum(["CLIENT", "LAW_STUDENT"]).optional(),
  preferredLanguage: z.enum(["en", "hi"]).optional(),
  companyName: z.string().trim().max(180).optional(),
  phoneNumber: z.string().trim().min(7).max(32).optional(),
  universityName: z.string().trim().min(2).max(180).optional(),
  universityCity: z.string().trim().min(2).max(100).optional(),
  universityState: z.string().trim().min(2).max(100).optional(),
  degree: z.string().trim().min(2).max(100).optional(),
  currentYear: z.coerce.number().int().min(1).max(10).optional(),
  graduationYear: z.coerce.number().int().min(2000).max(2100).optional(),
  enrollmentNumber: z.string().trim().min(1).max(100).optional(),
  bio: z.string().trim().max(1200).optional(),
  expertiseCodes: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
}).strict().superRefine((input, ctx) => {
  if (input.role !== "LAW_STUDENT") return;
  const required = ["phoneNumber", "universityName", "universityCity", "universityState", "degree", "currentYear", "graduationYear", "enrollmentNumber"];
  for (const field of required) {
    if (input[field] === undefined || input[field] === "") {
      ctx.addIssue({ code: "custom", path: [field], message: "This field is required for law student registration." });
    }
  }
  if (input.currentYear && input.graduationYear && input.graduationYear < new Date().getFullYear()) {
    ctx.addIssue({ code: "custom", path: ["graduationYear"], message: "Graduation year must not be in the past." });
  }
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(72).refine((value) => Buffer.byteLength(value, "utf8") <= 72, "Password must not exceed 72 UTF-8 bytes."),
}).strict();
export const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  email,
  preferredLanguage: z.enum(["en", "hi"]),
}).strict();
