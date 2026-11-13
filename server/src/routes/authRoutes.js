import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { validateRequest } from "../validators/common.js";
import { loginSchema, profileSchema, registerSchema } from "../validators/authValidators.js";

const router = Router();
router.post("/register", validateRequest({ body: registerSchema }), authController.register);
router.post("/signup", validateRequest({ body: registerSchema }), authController.register);
router.post("/login", validateRequest({ body: loginSchema }), authController.login);
router.post("/logout", authenticateUser, authController.logout);
router.get("/me", authenticateUser, authController.me);
router.put("/me", authenticateUser, validateRequest({ body: profileSchema }), authController.updateMe);
export default router;
