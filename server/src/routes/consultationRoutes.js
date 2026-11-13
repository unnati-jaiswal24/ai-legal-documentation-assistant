import { Router } from "express";
import { consultationController } from "../controllers/consultationController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";
import { validateRequest } from "../validators/common.js";
import { createConsultationSchema } from "../validators/consultationValidators.js";

const router = Router();
const client = [authenticateUser, authorizeRole("CLIENT")];
router.get("/experts", ...client, consultationController.experts);
router.get("/consultations", ...client, consultationController.list);
router.post("/consultations", ...client, validateRequest({ body: createConsultationSchema }), consultationController.create);
export default router;
