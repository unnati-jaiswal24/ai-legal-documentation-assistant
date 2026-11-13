import { z } from "zod";

export const aiReviewConsentSchema = z.object({ consent: z.literal(true) }).strict();
export const aiReviewParamsSchema = z.object({
  documentId: z.string().uuid(),
  versionId: z.string().uuid(),
}).strict();
export const aiReviewDocumentParamsSchema = z.object({
  documentId: z.string().uuid(),
}).strict();
