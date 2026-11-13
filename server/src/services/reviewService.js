import { prisma, audit } from "../lib/db.js";
import AppError from "../utils/AppError.js";
import { pagination } from "../utils/response.js";

const requestInclude = {
  client: { select: { id: true, fullName: true } },
  studentProfile: {
    include: {
      user: { select: { id: true, fullName: true } },
      university: true,
    },
  },
  document: {
    include: {
      templateVersion: { include: { template: { include: { documentType: true } } } },
    },
  },
  documentVersion: { select: { id: true, versionNo: true, format: true, contentText: true, createdAt: true } },
  review: { include: { comments: { orderBy: { createdAt: "asc" } }, rating: true } },
};

function shapeRequest(request) {
  return {
    id: request.id,
    clientId: request.clientUserId,
    clientName: request.client.fullName,
    documentId: request.documentId,
    documentTitle: request.document.title,
    documentType: request.document.templateVersion?.template.documentType.name || "Freelance Service Agreement",
    documentVersion: request.documentVersion,
    studentId: request.studentProfileId,
    studentName: request.studentProfile.user.fullName,
    studentUniversity: request.studentProfile.university.name,
    message: request.message,
    description: request.message,
    requestedAt: request.createdAt,
    requestedCompletionAt: request.requestedCompletionAt,
    status: request.status,
    acceptedAt: request.acceptedAt,
    completedAt: request.completedAt,
    review: request.review,
  };
}

export const reviewService = {
  async createRequest(clientUserId, input) {
    try {
      return await prisma.$transaction(async (tx) => {
        const document = await tx.document.findFirst({
          where: { id: input.documentId, ownerUserId: clientUserId, deletedAt: null },
          include: { versions: { orderBy: { versionNo: "desc" }, take: 1 } },
        });
        if (!document) throw new AppError(404, "document_not_found", "The requested document was not found.");
        if (!document.versions.length) throw new AppError(409, "document_not_generated", "Generate a document version before requesting a review.");
        const student = await tx.lawStudentProfile.findFirst({
          where: { id: input.studentId, verifications: { some: { isCurrent: true, status: "APPROVED" } } },
          include: { user: { select: { id: true } } },
        });
        if (!student) throw new AppError(400, "student_not_eligible", "Only currently verified law students can receive review requests.");
        const activeRequest = await tx.reviewRequest.findFirst({
          where: {
            clientUserId,
            documentId: document.id,
            studentProfileId: student.id,
            status: { in: ["PENDING", "ACCEPTED", "IN_PROGRESS"] },
          },
          select: { id: true },
        });
        if (activeRequest) throw new AppError(409, "duplicate_review_request", "An active request already exists for this document and student.");
        const request = await tx.reviewRequest.create({
          data: {
            clientUserId,
            documentId: document.id,
            documentVersionId: document.versions[0].id,
            studentProfileId: student.id,
            message: input.message.trim(),
            requestedCompletionAt: input.requestedCompletionAt ? new Date(input.requestedCompletionAt) : null,
          },
          include: requestInclude,
        });
        await tx.document.update({ where: { id: document.id }, data: { status: "in_review" } });
        await tx.notification.create({
          data: {
            userId: student.user.id,
            kind: "review_request_received",
            title: "New document review request",
            body: `${request.client.fullName} requested feedback on ${document.title}.`,
          },
        });
        await audit(tx, clientUserId, "review.request.created", "review_requests", request.id);
        return shapeRequest(request);
      }, { isolationLevel: "Serializable" });
    } catch (error) {
      if (error.code === "P2002" || error.code === "P2034") {
        throw new AppError(409, "duplicate_review_request", "An active review request already exists for this document and student.");
      }
      throw error;
    }
  },

  async listRequests(user, role, query = {}) {
    const { skip, take, page, pageSize } = pagination(query);
    const where = role === "CLIENT"
      ? { clientUserId: user.id }
      : role === "LAW_STUDENT"
        ? { studentProfile: { userId: user.id } }
        : {};
    if (query.status) where.status = query.status;
    const [items, total] = await prisma.$transaction([
      prisma.reviewRequest.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: requestInclude }),
      prisma.reviewRequest.count({ where }),
    ]);
    return { items: items.map(shapeRequest), pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } };
  },

  async cancelRequest(clientUserId, requestId) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.reviewRequest.findFirst({
        where: { id: requestId, clientUserId, status: "PENDING" },
        include: { studentProfile: { select: { userId: true } } },
      });
      if (!request) throw new AppError(409, "request_not_cancellable", "Only your pending review requests can be cancelled.");
      const cancelled = await tx.reviewRequest.updateMany({
        where: { id: requestId, clientUserId, status: "PENDING" },
        data: { status: "CANCELLED" },
      });
      if (cancelled.count !== 1) throw new AppError(409, "request_already_handled", "This review request has already been handled.");
      const otherActive = await tx.reviewRequest.count({
        where: { documentId: request.documentId, id: { not: requestId }, status: { in: ["PENDING", "ACCEPTED", "IN_PROGRESS"] } },
      });
      if (!otherActive) await tx.document.update({ where: { id: request.documentId }, data: { status: "generated" } });
      await tx.notification.create({
        data: {
          userId: request.studentProfile.userId,
          kind: "review_request_cancelled",
          title: "Review request cancelled",
          body: "The client cancelled this pending document review request.",
        },
      });
      await audit(tx, clientUserId, "review.request.cancelled", "review_requests", requestId);
      return { id: requestId, status: "CANCELLED" };
    });
  },

  async respond(studentProfileId, studentUserId, requestId, decision) {
    return await prisma.$transaction(async (tx) => {
      const profile = await tx.lawStudentProfile.findFirst({
        where: {
          id: studentProfileId,
          userId: studentUserId,
          verifications: { some: { isCurrent: true, status: "APPROVED" } },
        },
        select: { id: true },
      });
      if (!profile) throw new AppError(403, "student_not_verified", "Only verified law students can accept or reject review assignments.");
      const request = await tx.reviewRequest.findFirst({
        where: { id: requestId, studentProfileId, status: "PENDING" },
        include: { client: { select: { id: true, fullName: true } }, document: { select: { id: true, title: true } } },
      });
      if (!request) throw new AppError(409, "request_not_pending", "This review request is no longer pending or is not assigned to you.");
      const status = decision === "accept" ? "ACCEPTED" : "REJECTED";
      if (decision === "accept") {
        const existingAssignment = await tx.reviewRequest.findFirst({
          where: {
            documentId: request.documentId,
            id: { not: request.id },
            status: { in: ["ACCEPTED", "IN_PROGRESS"] },
          },
          select: { id: true },
        });
        if (existingAssignment) throw new AppError(409, "document_already_assigned", "Another student has already accepted this document review.");
      }
      const updated = await tx.reviewRequest.updateMany({
        where: { id: request.id, status: "PENDING" },
        data: { status, ...(decision === "accept" ? { acceptedAt: new Date() } : {}) },
      });
      if (updated.count !== 1) throw new AppError(409, "request_already_handled", "This review request has already been handled.");
      if (decision === "accept") {
        const pending = await tx.reviewRequest.findMany({
          where: { documentId: request.documentId, id: { not: request.id }, status: "PENDING" },
          include: { studentProfile: { select: { userId: true } } },
        });
        await tx.reviewRequest.updateMany({
          where: { documentId: request.documentId, id: { not: request.id }, status: "PENDING" },
          data: { status: "CANCELLED" },
        });
        if (pending.length) {
          await tx.notification.createMany({
            data: pending.map(({ studentProfile }) => ({
              userId: studentProfile.userId,
              kind: "review_request_cancelled",
              title: "Review request no longer available",
              body: "Another student accepted this document review request.",
            })),
          });
        }
      }
      if (decision === "reject") {
        const otherActive = await tx.reviewRequest.count({
          where: { documentId: request.documentId, id: { not: request.id }, status: { in: ["PENDING", "ACCEPTED", "IN_PROGRESS"] } },
        });
        if (!otherActive) await tx.document.update({ where: { id: request.documentId }, data: { status: "generated" } });
      }
      await tx.notification.create({
        data: {
          userId: request.clientUserId,
          kind: `review_request_${decision}ed`,
          title: decision === "accept" ? "Review request accepted" : "Review request declined",
          body: `${request.document.title}: ${request.client.fullName}'s review request was ${decision === "accept" ? "accepted" : "declined"}.`,
        },
      });
      await audit(tx, studentUserId, `review.request.${decision}ed`, "review_requests", request.id);
      return { id: request.id, status };
    });
  },

  async startReview(studentProfileId, studentUserId, requestId) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.reviewRequest.updateMany({
        where: {
          id: requestId,
          studentProfileId,
          status: "ACCEPTED",
          studentProfile: { verifications: { some: { isCurrent: true, status: "APPROVED" } } },
        },
        data: { status: "IN_PROGRESS" },
      });
      if (updated.count !== 1) throw new AppError(409, "request_not_accepted", "Only an accepted review can be started.");
      await audit(tx, studentUserId, "review.started", "review_requests", requestId);
      return { id: requestId, status: "IN_PROGRESS" };
    });
  },

  async submit(studentProfileId, studentUserId, requestOrReviewId, input) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.reviewRequest.findFirst({
        where: {
          OR: [
            { id: requestOrReviewId },
            { review: { id: requestOrReviewId } },
          ],
          studentProfileId,
          status: { in: ["ACCEPTED", "IN_PROGRESS"] },
          studentProfile: { verifications: { some: { isCurrent: true, status: "APPROVED" } } },
        },
        include: {
          client: { select: { id: true } },
          documentVersion: { select: { id: true } },
          review: true,
        },
      });
      if (!request) throw new AppError(404, "review_not_found", "The assigned review was not found or is no longer active.");
      const requestedVersionId = request.documentVersion.id;
      const review = request.review
        ? await tx.review.update({
          where: { id: request.review.id },
          data: { summary: input.summary.trim(), submittedAt: new Date() },
        })
        : await tx.review.create({
          data: { reviewRequestId: request.id, summary: input.summary.trim() },
        });
      if (input.comments.length) {
        await tx.reviewComment.createMany({
          data: input.comments.map((body) => ({
            documentVersionId: requestedVersionId,
            authorUserId: studentUserId,
            reviewId: review.id,
            body: body.trim(),
          })),
        });
      }
      await tx.reviewRequest.update({
        where: { id: request.id },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
      await tx.document.update({ where: { id: request.documentId }, data: { status: "generated" } });
      await tx.notification.create({
        data: {
          userId: request.clientUserId,
          kind: "review_completed",
          title: "Document review completed",
          body: "Your assigned student reviewer has submitted feedback. Student feedback is preliminary and not professional legal advice.",
        },
      });
      await audit(tx, studentUserId, "review.completed", "reviews", review.id);
      return tx.review.findUnique({
        where: { id: review.id },
        include: { comments: { orderBy: { createdAt: "asc" } }, rating: true },
      });
    });
  },

  async getReview(userId, role, id) {
    const request = await prisma.reviewRequest.findFirst({
      where: {
        OR: [{ id }, { review: { id } }],
        ...(role === "CLIENT" ? { clientUserId: userId } : {}),
        ...(role === "LAW_STUDENT" ? { studentProfile: { userId } } : {}),
      },
      include: requestInclude,
    });
    if (!request) throw new AppError(404, "review_not_found", "The review request was not found.");
    return { ...shapeRequest(request), reviewRecord: request.review };
  },

  async rate(userId, reviewId, input) {
    return prisma.$transaction(async (tx) => {
      const review = await tx.review.findFirst({
        where: { id: reviewId, reviewRequest: { clientUserId: userId, status: "COMPLETED" } },
        include: { reviewRequest: { select: { id: true } }, rating: true },
      });
      if (!review) throw new AppError(404, "review_not_found", "The completed review was not found.");
      if (review.rating) throw new AppError(409, "already_rated", "This review has already been rated.");
      const rating = await tx.reviewRating.create({ data: { reviewId, stars: input.stars, comment: input.comment?.trim() || null } });
      await audit(tx, userId, "review.rated", "review_ratings", rating.id);
      return rating;
    });
  },
};
