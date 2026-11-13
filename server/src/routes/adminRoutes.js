import { Router } from "express";
import { adminController } from "../controllers/adminController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";
import { idParamsSchema, validateRequest } from "../validators/common.js";
import {
  adminDashboardQuerySchema,
  adminDocumentQuerySchema,
  activeStateSchema,
  adminReviewQuerySchema,
  adminStudentQuerySchema,
  adminUserQuerySchema,
  adminVerificationQuerySchema,
  createExpertSchema,
  createExpertiseSchema,
  rejectionSchema,
  roleSchema,
} from "../validators/adminValidators.js";

const router = Router();
router.use(authenticateUser, authorizeRole("ADMIN"));
router.get("/dashboard", validateRequest({ query: adminDashboardQuerySchema }), adminController.dashboard);
router.get("/users", validateRequest({ query: adminUserQuerySchema }), adminController.users);
router.patch("/users/:id/status", validateRequest({ params: idParamsSchema, body: activeStateSchema }), adminController.updateUser);
router.patch("/users/:id/role", validateRequest({ params: idParamsSchema, body: roleSchema }), adminController.updateUserRole);
router.get("/expertise", adminController.expertise);
router.post("/expertise", validateRequest({ body: createExpertiseSchema }), adminController.createExpertise);
router.post("/experts", validateRequest({ body: createExpertSchema }), adminController.createExpert);
router.get("/students", validateRequest({ query: adminStudentQuerySchema }), adminController.students);
router.get("/verifications", validateRequest({ query: adminVerificationQuerySchema }), adminController.verifications);
router.get("/verifications/:id/document", validateRequest({ params: idParamsSchema }), adminController.verificationFile);
router.patch("/verifications/:id/approve", validateRequest({ params: idParamsSchema }), adminController.approve);
router.patch("/verifications/:id/reject", validateRequest({ params: idParamsSchema, body: rejectionSchema }), adminController.reject);
router.get("/documents", validateRequest({ query: adminDocumentQuerySchema }), adminController.documents);
router.get("/reviews", validateRequest({ query: adminReviewQuerySchema }), adminController.reviews);
router.get("/review-requests", validateRequest({ query: adminReviewQuerySchema }), adminController.reviewRequests);
export default router;
