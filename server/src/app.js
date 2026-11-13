import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { prisma } from "./lib/db.js";
import { authController } from "./controllers/authController.js";
import { authenticateUser } from "./middleware/authMiddleware.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
import { validateRequest } from "./validators/common.js";
import { profileSchema } from "./validators/authValidators.js";
import { createAiRouter } from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import consultationRoutes from "./routes/consultationRoutes.js";

export function createApp() {
  const app = express();
  const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || origin === allowedOrigin) return callback(null, true);
      return callback(null, false);
    },
  }));
  app.use(express.json({ limit: "1mb" }));

  const sensitiveLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many sensitive requests. Please try again later.", code: "rate_limited" },
  });
  app.use("/api/auth/login", sensitiveLimiter);
  app.use("/api/auth/signup", sensitiveLimiter);
  app.use("/api/auth/register", sensitiveLimiter);

  app.get("/health", async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return res.json({ ok: true });
    } catch {
      return res.status(503).json({ ok: false, error: "Database unavailable.", code: "database_unavailable" });
    }
  });
  app.use("/api/auth", authRoutes);
  app.get("/api/me", authenticateUser, authController.me);
  app.put("/api/me", authenticateUser, validateRequest({ body: profileSchema }), authController.updateMe);
  app.use("/api", documentRoutes);
  app.use("/api/students", studentRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api", consultationRoutes);
  app.use("/api/ai", createAiRouter());
  app.use("/api", notFoundHandler);
  app.use(errorHandler);
  return app;
}

export const app = createApp();
