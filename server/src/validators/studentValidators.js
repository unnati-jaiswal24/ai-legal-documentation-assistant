import { z } from "zod";

export const studentProfileUpdateSchema = z.object({
  phoneNumber: z.string().trim().min(7).max(32).optional(),
  degree: z.string().trim().min(2).max(100).optional(),
  currentYear: z.coerce.number().int().min(1).max(10).optional(),
  graduationYear: z.coerce.number().int().min(2000).max(2100).optional(),
  bio: z.string().trim().max(1200).optional(),
  universityId: z.string().uuid().optional(),
  expertiseCodes: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one profile field to update.");

export const studentListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().trim().max(160).optional(),
  expertise: z.string().trim().max(80).optional(),
}).strict();
