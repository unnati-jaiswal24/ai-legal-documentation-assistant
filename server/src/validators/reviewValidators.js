import { z } from "zod";

export const createReviewRequestSchema = z.object({
  documentId: z.string().uuid(),
  studentId: z.string().uuid(),
  message: z.string().trim().min(10).max(3000),
  requestedCompletionAt: z.string().datetime().optional(),
}).strict();
export const reviewListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
}).strict();
export const submitReviewSchema = z.object({
  summary: z.string().trim().min(10).max(10000),
  comments: z.array(z.string().trim().min(1).max(5000)).max(100).default([]),
}).strict();
export const reviewRatingSchema = z.object({
  stars: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
}).strict();
