import { z } from "zod";

export const createDraftSchema = z.object({ templateId: z.string().uuid() }).strict();
const scalar = z.union([z.string().max(10000), z.number().finite(), z.boolean(), z.null()]);
export const saveValuesSchema = z.object({
  values: z.array(z.object({ fieldId: z.string().uuid(), value: scalar }).strict()).max(100),
}).strict();
export const documentListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().trim().max(160).optional(),
  status: z.enum(["in_progress", "validated", "generated", "exported", "archived"]).optional(),
}).strict();
export const updateDocumentSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  status: z.enum(["in_progress", "archived"]).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one document field to update.");
