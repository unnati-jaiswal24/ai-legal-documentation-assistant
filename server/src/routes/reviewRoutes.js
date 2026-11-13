import { Router } from "express";
import { reviewController } from "../controllers/reviewController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRole, requireVerifiedStudent } from "../middleware/roleMiddleware.js";
import { idParamsSchema, validateRequest } from "../validators/common.js";
import {
  createReviewRequestSchema,
  reviewListQuerySchema,
  reviewRatingSchema,
  submitReviewSchema,
} from "../validators/reviewValidators.js";

const router = Router();
router.use(authenticateUser);
router.post("/requests", authorizeRole("CLIENT"), validateRequest({ body: createReviewRequestSchema }), reviewController.createRequest);
router.get("/requests", authorizeRole("CLIENT", "LAW_STUDENT", "ADMIN"), validateRequest({ query: reviewListQuerySchema }), reviewController.listRequests);
router.patch("/requests/:id/cancel", authorizeRole("CLIENT"), validateRequest({ params: idParamsSchema }), reviewController.cancel);
router.patch("/requests/:id/accept", authorizeRole("LAW_STUDENT"), requireVerifiedStudent, validateRequest({ params: idParamsSchema }), reviewController.accept);
router.patch("/requests/:id/reject", authorizeRole("LAW_STUDENT"), requireVerifiedStudent, validateRequest({ params: idParamsSchema }), reviewController.reject);
router.patch("/requests/:id/start", authorizeRole("LAW_STUDENT"), requireVerifiedStudent, validateRequest({ params: idParamsSchema }), reviewController.start);
router.post("/:id/submit", authorizeRole("LAW_STUDENT"), requireVerifiedStudent, validateRequest({ params: idParamsSchema, body: submitReviewSchema }), reviewController.submit);
router.post("/:id/rating", authorizeRole("CLIENT"), validateRequest({ params: idParamsSchema, body: reviewRatingSchema }), reviewController.rate);
router.get("/:id", authorizeRole("CLIENT", "LAW_STUDENT", "ADMIN"), validateRequest({ params: idParamsSchema }), reviewController.get);
export default router;
