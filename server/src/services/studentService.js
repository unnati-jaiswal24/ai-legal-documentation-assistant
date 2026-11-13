import { prisma, audit } from "../lib/db.js";
import { Prisma } from "@prisma/client";
import { storeVerificationFile, removePrivateFile } from "./privateFileService.js";
import AppError from "../utils/AppError.js";
import { pagination } from "../utils/response.js";

function latestVerificationInclude() {
  return { verifications: { where: { isCurrent: true }, take: 1 } };
}

export const studentService = {
  async listExpertise() {
    return prisma.expertiseArea.findMany({ orderBy: { name: "asc" } });
  },

  async listVerified(query = {}) {
    const { skip, take, page, pageSize } = pagination(query);
    const where = {
      user: {
        isActive: true,
        ...(query.search ? { fullName: { contains: query.search, mode: "insensitive" } } : {}),
      },
      verifications: { some: { isCurrent: true, status: "APPROVED" } },
      ...(query.expertise ? { expertise: { some: { expertiseArea: { code: query.expertise } } } } : {}),
    };
    const [students, total] = await prisma.$transaction([
      prisma.lawStudentProfile.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          ...latestVerificationInclude(),
          user: { select: { id: true, fullName: true } },
          university: true,
          expertise: { include: { expertiseArea: true } },
        },
      }),
      prisma.lawStudentProfile.count({ where }),
    ]);
    const studentIds = students.map((student) => student.id);
    const ratingGroups = studentIds.length ? await prisma.$queryRaw`
      SELECT rr.student_profile_id,
             AVG(rating.stars)::float8 AS average_rating,
             COUNT(DISTINCT review.id)::int AS completed_reviews
      FROM review_requests rr
      JOIN reviews review ON review.review_request_id = rr.id
      LEFT JOIN review_ratings rating ON rating.review_id = review.id
      WHERE rr.student_profile_id IN (${Prisma.join(studentIds)})
      GROUP BY rr.student_profile_id
    ` : [];
    const ratings = new Map(ratingGroups.map((rating) => [rating.student_profile_id, rating]));
    return {
      items: students.map((student) => {
        const rating = ratings.get(student.id);
        return {
          id: student.id,
          userId: student.user.id,
          fullName: student.user.fullName,
          university: student.university,
          degree: student.degree,
          currentYear: student.currentYear,
          graduationYear: student.graduationYear,
          bio: student.bio,
          verificationStatus: "APPROVED",
          expertise: student.expertise.map(({ expertiseArea }) => expertiseArea),
          averageRating: rating?.average_rating ?? null,
          completedReviews: rating?.completed_reviews ?? 0,
          eligibleReviewer: true,
        };
      }),
      pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) },
    };
  },

  async getVerified(studentProfileId) {
    const student = await prisma.lawStudentProfile.findFirst({
      where: { id: studentProfileId, verifications: { some: { isCurrent: true, status: "APPROVED" } } },
      include: {
        ...latestVerificationInclude(),
        user: { select: { id: true, fullName: true } },
        university: true,
        expertise: { include: { expertiseArea: true } },
      },
    });
    if (!student) throw new AppError(404, "student_not_found", "The verified law student was not found.");
    return {
      id: student.id,
      userId: student.user.id,
      fullName: student.user.fullName,
      university: student.university,
      degree: student.degree,
      currentYear: student.currentYear,
      graduationYear: student.graduationYear,
      bio: student.bio,
      verificationStatus: "APPROVED",
      expertise: student.expertise.map(({ expertiseArea }) => expertiseArea),
      eligibleReviewer: true,
    };
  },

  async getMyProfile(userId) {
    const profile = await prisma.lawStudentProfile.findUnique({
      where: { userId },
      include: {
        university: true,
        expertise: { include: { expertiseArea: true } },
        ...latestVerificationInclude(),
        user: { select: { id: true, fullName: true, email: true } },
      },
    });
    if (!profile) throw new AppError(404, "student_profile_not_found", "The law student profile was not found.");
    const verification = profile.verifications[0] || null;
    return {
      id: profile.id,
      user: profile.user,
      university: profile.university,
      degree: profile.degree,
      currentYear: profile.currentYear,
      graduationYear: profile.graduationYear,
      enrollmentNumber: profile.enrollmentNumber,
      phoneNumber: profile.phoneNumber,
      bio: profile.bio,
      expertise: profile.expertise.map(({ expertiseArea }) => expertiseArea),
      verificationStatus: verification?.status || "PENDING",
      verificationSubmittedAt: verification?.submittedAt || null,
      rejectionReason: verification?.status === "REJECTED" ? verification.rejectionReason : null,
    };
  },

  async updateProfile(userId, input) {
    const profile = await prisma.lawStudentProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!profile) throw new AppError(404, "student_profile_not_found", "The law student profile was not found.");
    return prisma.$transaction(async (tx) => {
      const { expertiseCodes, ...data } = input;
      const updated = await tx.lawStudentProfile.update({
        where: { id: profile.id },
        data: {
          ...(data.phoneNumber !== undefined ? { phoneNumber: data.phoneNumber } : {}),
          ...(data.degree !== undefined ? { degree: data.degree } : {}),
          ...(data.currentYear !== undefined ? { currentYear: data.currentYear } : {}),
          ...(data.graduationYear !== undefined ? { graduationYear: data.graduationYear } : {}),
          ...(data.bio !== undefined ? { bio: data.bio } : {}),
          ...(data.universityId ? { universityId: data.universityId } : {}),
        },
      });
      if (expertiseCodes) {
        const found = await tx.expertiseArea.findMany({ where: { code: { in: expertiseCodes } }, select: { id: true } });
        if (found.length !== new Set(expertiseCodes).size) throw new AppError(400, "invalid_expertise", "One or more expertise areas are unavailable.");
        await tx.studentExpertise.deleteMany({ where: { studentProfileId: profile.id } });
        await tx.studentExpertise.createMany({ data: found.map(({ id }) => ({ studentProfileId: profile.id, expertiseAreaId: id })) });
      }
      await audit(tx, userId, "student.profile.updated", "law_student_profiles", profile.id);
      return updated;
    });
  },

  async submitVerification(userId, file) {
    const profile = await prisma.lawStudentProfile.findUnique({
      where: { userId },
      include: { verifications: { where: { isCurrent: true }, take: 1 } },
    });
    if (!profile) throw new AppError(404, "student_profile_not_found", "The law student profile was not found.");
    const current = profile.verifications[0];
    if (current?.status === "PENDING") throw new AppError(409, "verification_pending", "Your current verification is still awaiting review.");
    if (current?.status === "APPROVED") throw new AppError(409, "already_verified", "Your student profile is already verified.");
    const stored = await storeVerificationFile(file);
    try {
      return await prisma.$transaction(async (tx) => {
        if (current) await tx.studentVerification.update({ where: { id: current.id }, data: { isCurrent: false } });
        const verification = await tx.studentVerification.create({
          data: {
            studentProfileId: profile.id,
            storageKey: stored.storageKey,
            originalFileName: stored.originalFileName,
            mimeType: stored.mimeType,
            sizeBytes: stored.sizeBytes,
            status: "PENDING",
            isCurrent: true,
          },
          select: { id: true, status: true, submittedAt: true },
        });
        await audit(tx, userId, "student.verification.submitted", "student_verifications", verification.id);
        return verification;
      }, { isolationLevel: "Serializable" });
    } catch (error) {
      await removePrivateFile(stored.storageKey);
      if (error.code === "P2002" || error.code === "P2034") {
        throw new AppError(409, "verification_conflict", "A verification submission was added at the same time. Refresh the status and try again.");
      }
      throw error;
    }
  },

  async verificationStatus(userId) {
    const profile = await prisma.lawStudentProfile.findUnique({
      where: { userId },
      include: { verifications: { where: { isCurrent: true }, take: 1 } },
    });
    if (!profile) throw new AppError(404, "student_profile_not_found", "The law student profile was not found.");
    const current = profile.verifications[0];
    return {
      status: current?.status || "PENDING",
      submittedAt: current?.submittedAt || null,
      decidedAt: current?.decidedAt || null,
      rejectionReason: current?.status === "REJECTED" ? current.rejectionReason : null,
    };
  },

  async getVerificationFile(verificationId, user, role) {
    const verification = await prisma.studentVerification.findUnique({
      where: { id: verificationId },
      include: { studentProfile: { select: { userId: true } } },
    });
    if (!verification) throw new AppError(404, "verification_not_found", "The verification request was not found.");
    if (role !== "ADMIN" && verification.studentProfile.userId !== user.id) {
      throw new AppError(404, "verification_not_found", "The verification request was not found.");
    }
    return verification;
  },

  async listAdminVerifications(query = {}) {
    const { skip, take, page, pageSize } = pagination(query);
    const where = query.status ? { status: query.status } : { status: "PENDING", isCurrent: true };
    const [items, total] = await prisma.$transaction([
      prisma.studentVerification.findMany({
        where,
        skip,
        take,
        orderBy: { submittedAt: "asc" },
        include: {
          studentProfile: {
            include: {
              user: { select: { id: true, fullName: true, email: true } },
              university: true,
            },
          },
          decidedByUser: { select: { id: true, fullName: true } },
        },
      }),
      prisma.studentVerification.count({ where }),
    ]);
    return { items, pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } };
  },

  async decideVerification(verificationId, adminUserId, decision, rejectionReason) {
    return prisma.$transaction(async (tx) => {
      const verification = await tx.studentVerification.findFirst({
        where: { id: verificationId, isCurrent: true, status: "PENDING" },
        include: { studentProfile: { select: { userId: true } } },
      });
      if (!verification) throw new AppError(409, "verification_not_pending", "This verification request is no longer pending.");
      const changed = await tx.studentVerification.updateMany({
        where: { id: verificationId, isCurrent: true, status: "PENDING" },
        data: {
          status: decision,
          decidedAt: new Date(),
          decidedByUserId: adminUserId,
          rejectionReason: decision === "REJECTED" ? rejectionReason : null,
        },
      });
      if (changed.count !== 1) throw new AppError(409, "verification_already_decided", "This verification request was already decided.");
      const updated = await tx.studentVerification.findUnique({
        where: { id: verificationId },
        select: { id: true, studentProfileId: true, status: true, decidedAt: true, rejectionReason: true },
      });
      await tx.notification.create({
        data: {
          userId: verification.studentProfile.userId,
          kind: `student_verification_${decision.toLowerCase()}`,
          title: decision === "APPROVED" ? "Student profile verified" : "Verification needs attention",
          body: decision === "APPROVED"
            ? "Your student profile is verified and eligible to receive review requests."
            : `Your verification was rejected: ${rejectionReason}`,
        },
      });
      await audit(tx, adminUserId, `student.verification.${decision.toLowerCase()}`, "student_verifications", verificationId);
      return updated;
    }, { isolationLevel: "Serializable" });
  },
};
