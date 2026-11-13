import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { studentController } from "../controllers/studentController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";
import AppError from "../utils/AppError.js";
import { idParamsSchema, validateRequest } from "../validators/common.js";
import { studentListQuerySchema, studentProfileUpdateSchema } from "../validators/studentValidators.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024), files: 1, fields: 2 },
  fileFilter: (_req, file, callback) => {
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.mimetype)) {
      callback(new AppError(415, "unsupported_file", "Upload a PDF, JPEG, or PNG verification document."));
      return;
    }
    callback(null, true);
  },
});
const verificationUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many verification uploads. Try again later.", code: "rate_limited" },
});

router.get("/expertise", studentController.expertise);
router.use(authenticateUser);
router.get("/", authorizeRole("CLIENT"), validateRequest({ query: studentListQuerySchema }), studentController.list);
router.get("/profile", authorizeRole("LAW_STUDENT"), studentController.myProfile);
router.patch("/profile", authorizeRole("LAW_STUDENT"), validateRequest({ body: studentProfileUpdateSchema }), studentController.updateProfile);
router.post("/verification", authorizeRole("LAW_STUDENT"), verificationUploadLimiter, upload.single("file"), studentController.submitVerification);
router.get("/verification/status", authorizeRole("LAW_STUDENT"), studentController.verificationStatus);
router.get("/verification/:id/document", validateRequest({ params: idParamsSchema }), studentController.verificationFile);
router.get("/:id", authorizeRole("CLIENT"), validateRequest({ params: idParamsSchema }), studentController.get);
export default router;
