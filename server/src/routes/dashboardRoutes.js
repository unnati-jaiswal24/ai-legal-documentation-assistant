import { Router } from "express";
import { dashboardController } from "../controllers/dashboardController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";
import { validateRequest } from "../validators/common.js";
import { adminDashboardQuerySchema } from "../validators/adminValidators.js";

const router = Router();
router.use(authenticateUser);
router.get("/client", authorizeRole("CLIENT"), dashboardController.client);
router.get("/student", authorizeRole("LAW_STUDENT"), dashboardController.student);
router.get("/admin", authorizeRole("ADMIN"), validateRequest({ query: adminDashboardQuerySchema }), dashboardController.admin);
export default router;
