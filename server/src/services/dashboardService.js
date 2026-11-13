import { prisma } from "../lib/db.js";
import { adminService } from "./adminService.js";
import { studentService } from "./studentService.js";
import { reviewService } from "./reviewService.js";

export const dashboardService = {
  async client(userId) {
    const [totalDocuments, draftDocuments, pendingReviews, completedReviews, documents, requests, activity] = await Promise.all([
      prisma.document.count({ where: { ownerUserId: userId, deletedAt: null } }),
      prisma.document.count({ where: { ownerUserId: userId, deletedAt: null, status: "in_progress" } }),
      prisma.reviewRequest.count({ where: { clientUserId: userId, status: { in: ["PENDING", "ACCEPTED", "IN_PROGRESS"] } } }),
      prisma.reviewRequest.count({ where: { clientUserId: userId, status: "COMPLETED" } }),
      prisma.document.findMany({
        where: { ownerUserId: userId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, title: true, status: true, createdAt: true, updatedAt: true, templateVersion: { select: { template: { select: { documentType: { select: { name: true } } } } } } },
      }),
      prisma.reviewRequest.findMany({ where: { clientUserId: userId }, orderBy: { createdAt: "desc" }, take: 6, include: { client: { select: { fullName: true } }, studentProfile: { include: { user: { select: { fullName: true } } } }, document: { select: { title: true } } } }),
      prisma.auditLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 8, select: { action: true, entityType: true, entityId: true, createdAt: true } }),
    ]);
    return {
      summary: { totalDocuments, draftDocuments, pendingReviews, completedReviews },
      documents,
      reviewRequests: requests,
      recentActivity: activity,
      disclaimer: "Student review is preliminary feedback, not professional legal advice.",
    };
  },

  async student(userId) {
    const [profile, requests, totalRequests, pendingRequests, activeReviews, completedReviews, rating] = await Promise.all([
      studentService.getMyProfile(userId),
      reviewService.listRequests({ id: userId }, "LAW_STUDENT", { pageSize: 8 }),
      prisma.reviewRequest.count({ where: { studentProfile: { userId } } }),
      prisma.reviewRequest.count({ where: { studentProfile: { userId }, status: "PENDING" } }),
      prisma.reviewRequest.count({ where: { studentProfile: { userId }, status: { in: ["ACCEPTED", "IN_PROGRESS"] } } }),
      prisma.reviewRequest.count({ where: { studentProfile: { userId }, status: "COMPLETED" } }),
      prisma.$queryRaw`
        SELECT AVG(rating.stars)::float8 AS average_rating
        FROM review_ratings rating
        JOIN reviews review ON review.id = rating.review_id
        JOIN review_requests request ON request.id = review.review_request_id
        WHERE request.student_profile_id = (SELECT id FROM law_student_profiles WHERE user_id = ${userId}::uuid)
      `,
    ]);
    return {
      profile,
      summary: {
        totalRequests,
        pendingRequests,
        activeReviews,
        completedReviews,
        averageRating: rating[0]?.average_rating ?? null,
      },
      reviewRequests: requests.items,
      disclaimer: "Student reviews are preliminary educational feedback and are not professional legal advice.",
    };
  },

  admin(range) {
    return adminService.dashboard(range);
  },
};
