import AppError from "../utils/AppError.js";
import { prisma } from "../lib/db.js";

export function authorizeRole(...roles) {
  return (req, _res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return next(new AppError(403, "forbidden", "You are not authorized to perform this action."));
    }
    return next();
  };
}

export async function requireVerifiedStudent(req, _res, next) {
  try {
    if (req.auth?.role !== "LAW_STUDENT") {
      return next(new AppError(403, "forbidden", "A law student account is required."));
    }
    const profile = await prisma.lawStudentProfile.findUnique({
      where: { userId: req.user.id },
      include: { verifications: { orderBy: { submittedAt: "desc" }, take: 1 } },
    });
    if (profile?.verifications[0]?.status !== "APPROVED") {
      return next(new AppError(403, "student_not_verified", "Only verified law students can accept or complete review assignments."));
    }
    req.studentProfile = profile;
    return next();
  } catch (error) {
    return next(error);
  }
}
