import { z } from "zod";

const paginationSearch = {
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().trim().max(160).optional(),
};

export const adminDashboardQuerySchema = z.object({
  range: z.enum(["30d", "90d", "6m", "12m"]).optional(),
}).strict();

export const adminUserQuerySchema = z.object({
  ...paginationSearch,
  status: z.enum(["active", "suspended"]).optional(),
  role: z.enum(["CLIENT", "LAW_STUDENT", "ADMIN"]).optional(),
}).strict();
export const adminStudentQuerySchema = z.object({
  ...paginationSearch,
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
}).strict();
export const adminVerificationQuerySchema = z.object({
  page: paginationSearch.page,
  pageSize: paginationSearch.pageSize,
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
}).strict();
export const adminDocumentQuerySchema = z.object({
  ...paginationSearch,
  status: z.enum(["in_progress", "validated", "generated", "exported", "in_review", "archived"]).optional(),
}).strict();
export const adminReviewQuerySchema = z.object({
  page: paginationSearch.page,
  pageSize: paginationSearch.pageSize,
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
}).strict();
export const activeStateSchema = z.object({ isActive: z.boolean() }).strict();
export const roleSchema = z.object({ role: z.enum(["CLIENT", "LAW_STUDENT", "ADMIN"]) }).strict();
export const createExpertiseSchema = z.object({
  code: z.string().trim().min(2).max(80).regex(/^[a-zA-Z0-9 _-]+$/),
  name: z.string().trim().min(2).max(120),
}).strict();
export const createExpertSchema = z.object({
  name: z.string().trim().min(2).max(160),
  specialization: z.string().trim().min(2).max(200),
  barCouncilId: z.string().trim().max(80).optional(),
  isAvailable: z.boolean().optional(),
}).strict();
export const rejectionSchema = z.object({ reason: z.string().trim().min(5).max(1000) }).strict();
