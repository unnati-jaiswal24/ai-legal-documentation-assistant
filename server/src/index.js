import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./lib/db.js";
import { createAiRouter } from "./routes/aiRoutes.js";

const app = express();

// Allow your React dev server (Vite default is 5173; CRA is 3000)
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.use("/api/ai", createAiRouter());

app.get("/health", async (_req, res) => {
  try {
    const fields = await prisma.templateField.count();
    res.json({ ok: true, templateFields: fields });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));