import { Router } from "express";
import { notificationController } from "../controllers/notificationController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { idParamsSchema, validateRequest } from "../validators/common.js";

const router = Router();
router.use(authenticateUser);
router.get("/", notificationController.list);
router.patch("/:id/read", validateRequest({ params: idParamsSchema }), notificationController.markRead);
export default router;
