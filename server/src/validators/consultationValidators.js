import { z } from "zod";

export const createConsultationSchema = z.object({
  draftId: z.string().uuid(),
  expertId: z.string().uuid().optional(),
  query: z.string().trim().min(10).max(5000),
}).strict();
