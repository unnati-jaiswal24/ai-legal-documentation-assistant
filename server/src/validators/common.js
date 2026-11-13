import { z } from "zod";
import AppError from "../utils/AppError.js";

export const uuidSchema = z.string().uuid();
export const idParamsSchema = z.object({ id: uuidSchema }).strict();
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().trim().max(160).optional(),
  status: z.string().trim().max(40).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
}).strict();

export function validateRequest(schemas) {
  return (req, _res, next) => {
    for (const [part, schema] of Object.entries(schemas)) {
      const parsed = schema.safeParse(req[part]);
      if (!parsed.success) {
        const error = new AppError(400, "validation_error", "Request validation failed.");
        error.details = parsed.error.issues.map(({ path, message }) => ({ path: path.join("."), message }));
        return next(error);
      }
      req[part] = parsed.data;
    }
    return next();
  };
}
