import { prisma, audit } from "../lib/db.js";
import { pagination } from "../utils/response.js";
import AppError from "../utils/AppError.js";

const DAY = 24 * 60 * 60 * 1000;

function rangeStart(range = "6m") {
  const now = new Date();
  if (range === "30d") return new Date(now.getTime() - 30 * DAY);
  if (range === "90d") return new Date(now.getTime() - 90 * DAY);
  const months = range === "12m" ? 12 : 6;
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - months + 1, 1));
}

function countsByKey(groups, key) {
  return Object.fromEntries(groups.map((group) => [group[key], group._count._all]));
}

export const adminService = {
  async dashboard(range = "6m") {
    const from = rangeStart(range);
    const clientRole = { roleAssignments: { some: { role: { code: "CLIENT" } } } };
    const studentRole = { roleAssignments: { some: { role: { code: "LAW_STUDENT" } } } };
    const [
      totalUsers,
      totalClients,
      totalLawStudents,
      verifiedStudents,
      pendingVerifications,
      rejectedVerifications,
      totalDocuments,
      totalReviewRequests,
      completedReviews,
      registrationGroups,
      documentGroups,
      reviewGroups,
      documentTypes,
      documentTrend,
      turnaround,
      activeUsers,
      suspendedUsers,
      studentActivity,
      expertiseDistribution,
      popularTemplates,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: clientRole }),
      prisma.lawStudentProfile.count(),
      prisma.studentVerification.count({ where: { status: "APPROVED", isCurrent: true } }),
      prisma.studentVerification.count({ where: { status: "PENDING", isCurrent: true } }),
      prisma.studentVerification.count({ where: { status: "REJECTED", isCurrent: true } }),
      prisma.document.count({ where: { deletedAt: null } }),
      prisma.reviewRequest.count(),
      prisma.reviewRequest.count({ where: { status: "COMPLETED" } }),
      prisma.$queryRaw`
        SELECT date_trunc('month', created_at)::date AS month, count(*)::int AS total,
               count(*) FILTER (WHERE EXISTS (
                 SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id
                 WHERE ur.user_id = users.id AND r.code = 'CLIENT'
               ))::int AS clients,
               count(*) FILTER (WHERE EXISTS (
                 SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id
                 WHERE ur.user_id = users.id AND r.code = 'LAW_STUDENT'
               ))::int AS students
        FROM users WHERE created_at >= ${from}
        GROUP BY 1 ORDER BY 1
      `,
      prisma.document.groupBy({ by: ["status"], where: { deletedAt: null }, _count: { _all: true } }),
      prisma.reviewRequest.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.$queryRaw`
        SELECT dt.name AS name, count(d.id)::int AS total
        FROM documents d
        JOIN template_versions tv ON tv.id = d.template_version_id
        JOIN templates t ON t.id = tv.template_id
        JOIN document_types dt ON dt.id = t.document_type_id
        WHERE d.deleted_at IS NULL
        GROUP BY dt.id, dt.name ORDER BY total DESC
      `,
      prisma.$queryRaw`
        SELECT date_trunc('month', created_at)::date AS month, count(*)::int AS total
        FROM documents WHERE deleted_at IS NULL AND created_at >= ${from}
        GROUP BY 1 ORDER BY 1
      `,
      prisma.$queryRaw`
        SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600), 0)::float8 AS average_hours
        FROM review_requests WHERE status = 'COMPLETED' AND completed_at IS NOT NULL
      `,
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.$queryRaw`
        SELECT lsp.id AS student_id, u.full_name AS name,
               count(review.id)::int AS completed_reviews,
               AVG(rating.stars)::float8 AS average_rating
        FROM law_student_profiles lsp
        JOIN users u ON u.id = lsp.user_id
        LEFT JOIN review_requests rr ON rr.student_profile_id = lsp.id AND rr.status = 'COMPLETED'
        LEFT JOIN reviews review ON review.review_request_id = rr.id
        LEFT JOIN review_ratings rating ON rating.review_id = review.id
        GROUP BY lsp.id, u.full_name
        ORDER BY completed_reviews DESC, average_rating DESC NULLS LAST
        LIMIT 10
      `,
      prisma.studentExpertise.groupBy({ by: ["expertiseAreaId"], _count: { _all: true } }),
      prisma.$queryRaw`
        SELECT tv.id AS template_id, tv.title, count(d.id)::int AS total
        FROM template_versions tv
        LEFT JOIN documents d ON d.template_version_id = tv.id AND d.deleted_at IS NULL
        GROUP BY tv.id, tv.title
        ORDER BY total DESC, tv.title ASC
        LIMIT 10
      `,
    ]);

    const expertiseIds = expertiseDistribution.map((item) => item.expertiseAreaId);
    const expertiseAreas = expertiseIds.length
      ? await prisma.expertiseArea.findMany({ where: { id: { in: expertiseIds } }, select: { id: true, name: true } })
      : [];
    const expertiseName = new Map(expertiseAreas.map((item) => [item.id, item.name]));
    const pending = await prisma.reviewRequest.count({ where: { status: "PENDING" } });
    const accepted = await prisma.reviewRequest.count({ where: { status: "ACCEPTED" } });
    const rejected = await prisma.reviewRequest.count({ where: { status: "REJECTED" } });
    const cancelled = await prisma.reviewRequest.count({ where: { status: "CANCELLED" } });
    const completionRate = totalReviewRequests ? Number((completedReviews / totalReviewRequests * 100).toFixed(1)) : 0;

    return {
      range,
      summary: {
        totalUsers,
        totalClients,
        totalLawStudents,
        verifiedStudents,
        pendingVerifications,
        rejectedVerifications,
        totalDocuments,
        totalReviewRequests,
        completedReviews,
        pendingRequests: pending,
        acceptedRequests: accepted,
        rejectedRequests: rejected,
        cancelledRequests: cancelled,
        reviewCompletionRate: completionRate,
        averageReviewTurnaroundHours: Number(turnaround[0]?.average_hours || 0),
        activeUsers,
        suspendedUsers,
      },
      registrations: registrationGroups.map(({ month, total, clients, students }) => ({ month, total, clients, lawStudents: students })),
      documents: {
        byStatus: countsByKey(documentGroups, "status"),
        byType: documentTypes,
        creations: documentTrend,
      },
      reviews: { byStatus: countsByKey(reviewGroups, "status") },
      students: {
        mostActive: studentActivity,
        expertise: expertiseDistribution.map((item) => ({ name: expertiseName.get(item.expertiseAreaId), total: item._count._all })),
      },
      popularTemplates,
    };
  },

  async listUsers(query = {}) {
    const { skip, take, page, pageSize } = pagination(query);
    const where = {
      ...(query.search ? { OR: [
        { fullName: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ] } : {}),
      ...(query.status === "active" ? { isActive: true } : {}),
      ...(query.status === "suspended" ? { isActive: false } : {}),
      ...(query.role ? { roleAssignments: { some: { role: { code: query.role } } } } : {}),
    };
    const [items, total] = await prisma.$transaction([
      prisma.user.findMany({
        where, skip, take, orderBy: { createdAt: "desc" },
        select: {
          id: true, fullName: true, email: true, isActive: true, createdAt: true,
          roleAssignments: { include: { role: { select: { code: true, name: true } } } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    return { items, pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } };
  },

  async setUserActive(adminId, userId, isActive) {
    if (adminId === userId && !isActive) throw new AppError(400, "cannot_suspend_self", "An administrator cannot suspend their own account.");
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.update({ where: { id: userId }, data: { isActive }, select: { id: true, fullName: true, email: true, isActive: true } });
      if (!isActive) await tx.authSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
      await audit(tx, adminId, isActive ? "user.activated" : "user.suspended", "users", userId);
      return user;
    });
  },

  async setUserRole(adminId, userId, roleCode) {
    if (adminId === userId && roleCode !== "ADMIN") {
      throw new AppError(400, "cannot_demote_self", "An administrator cannot remove their own administrator role.");
    }
    return prisma.$transaction(async (tx) => {
      const [user, role] = await Promise.all([
        tx.user.findUnique({
          where: { id: userId },
          include: { roleAssignments: { include: { role: true } }, clientProfile: true, studentProfile: true },
        }),
        tx.role.findUnique({ where: { code: roleCode } }),
      ]);
      if (!user || !role) throw new AppError(404, "user_or_role_not_found", "The requested user or role was not found.");
      if (roleCode === "LAW_STUDENT" && !user.studentProfile) {
        throw new AppError(409, "student_profile_required", "Create a law student profile through student registration before assigning that role.");
      }
      if (roleCode === "CLIENT" && !user.clientProfile) {
        await tx.clientProfile.create({ data: { userId } });
      }
      const wasAdmin = user.roleAssignments.some(({ role: assigned }) => assigned.code === "ADMIN");
      if (wasAdmin && roleCode !== "ADMIN") {
        const adminCount = await tx.user.count({ where: { roleAssignments: { some: { role: { code: "ADMIN" } } } } });
        if (adminCount <= 1) throw new AppError(409, "last_admin", "The last administrator cannot be demoted.");
      }
      await tx.userRole.deleteMany({ where: { userId } });
      await tx.userRole.create({ data: { userId, roleId: role.id } });
      await audit(tx, adminId, "user.role.updated", "users", userId);
      return tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true, fullName: true, email: true, isActive: true,
          roleAssignments: { include: { role: { select: { code: true, name: true } } } },
        },
      });
    }, { isolationLevel: "Serializable" });
  },

  async listExpertise() {
    return prisma.expertiseArea.findMany({ orderBy: { name: "asc" } });
  },

  async createExpert(input, adminId) {
    return prisma.$transaction(async (tx) => {
      const expert = await tx.expert.create({
        data: {
          name: input.name.trim(),
          specialization: input.specialization.trim(),
          barCouncilId: input.barCouncilId?.trim() || null,
          isAvailable: input.isAvailable ?? true,
        },
      });
      await audit(tx, adminId, "expert.created", "experts", expert.id);
      return expert;
    });
  },

  async createExpertise(input, adminId) {
    return prisma.$transaction(async (tx) => {
      const expertise = await tx.expertiseArea.create({
        data: { code: input.code.trim().toLowerCase().replaceAll(/\s+/g, "-"), name: input.name.trim() },
      });
      await audit(tx, adminId, "expertise.created", "expertise_areas", expertise.id);
      return expertise;
    });
  },

  async listDocuments(query = {}) {
    const { skip, take, page, pageSize } = pagination(query);
    const where = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search ? { OR: [
        { title: { contains: query.search, mode: "insensitive" } },
        { owner: { fullName: { contains: query.search, mode: "insensitive" } } },
      ] } : {}),
    };
    const [items, total] = await prisma.$transaction([
      prisma.document.findMany({
        where, skip, take, orderBy: { createdAt: "desc" },
        select: {
          id: true, title: true, status: true, createdAt: true, updatedAt: true,
          owner: { select: { id: true, fullName: true, email: true } },
          templateVersion: { select: { title: true, template: { select: { documentType: { select: { name: true } } } } } },
        },
      }),
      prisma.document.count({ where }),
    ]);
    return { items, pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } };
  },

  async listReviews(query = {}) {
    const { skip, take, page, pageSize } = pagination(query);
    const where = query.status ? { status: query.status } : {};
    const [items, total] = await prisma.$transaction([
      prisma.reviewRequest.findMany({
        where, skip, take, orderBy: { createdAt: "desc" },
        include: {
          client: { select: { id: true, fullName: true, email: true } },
          document: { select: { id: true, title: true, status: true } },
          studentProfile: { include: { user: { select: { id: true, fullName: true } } } },
          review: { include: { rating: true } },
        },
      }),
      prisma.reviewRequest.count({ where }),
    ]);
    return { items, pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } };
  },

  async listStudents(query = {}) {
    const { skip, take, page, pageSize } = pagination(query);
    const where = {
      ...(query.search ? {
        user: {
          OR: [
            { fullName: { contains: query.search, mode: "insensitive" } },
            { email: { contains: query.search, mode: "insensitive" } },
          ],
        },
      } : {}),
      ...(query.status ? { verifications: { some: { isCurrent: true, status: query.status } } } : {}),
    };
    const [items, total] = await prisma.$transaction([
      prisma.lawStudentProfile.findMany({
        where, skip, take, orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, fullName: true, email: true, isActive: true, createdAt: true } },
          university: true,
          expertise: { include: { expertiseArea: true } },
          verifications: { where: { isCurrent: true }, take: 1 },
        },
      }),
      prisma.lawStudentProfile.count({ where }),
    ]);
    return { items, pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } };
  },
};
