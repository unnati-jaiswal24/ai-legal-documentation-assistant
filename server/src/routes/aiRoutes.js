import { Router } from "express";
import { z } from "zod";
import { explainQuestionnaireFields } from "../services/aiService.js";
import { generateDraftReport, reportInputSchema } from "../services/reportService.js";

const requestSchema = z.object({
  fieldKeys: z.array(z.string()).min(1).max(10),
  consent: z.literal(true),
}).strict();
const reportRequestSchema = reportInputSchema.extend({ consent: z.literal(true) }).strict();

const LIMIT = 10;
const WINDOW_MS = 60_000;
const REPORT_LIMIT = 5;

function isRateLimited(requestCounts, req, limit) {
  const clientKey = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const entry = requestCounts.get(clientKey);
  if (entry && now - entry.startedAt < WINDOW_MS && entry.count >= limit) return true;
  requestCounts.set(clientKey, entry && now - entry.startedAt < WINDOW_MS
    ? { startedAt: entry.startedAt, count: entry.count + 1 }
    : { startedAt: now, count: 1 });
  if (requestCounts.size > 500) {
    for (const [key, value] of requestCounts) {
      if (now - value.startedAt >= WINDOW_MS) requestCounts.delete(key);
    }
  }
  return false;
}

function statusFor(errorCode) {
  if (errorCode === "rate_limited") return 429;
  if (errorCode === "ai_disabled" || errorCode === "ai_not_configured") return 503;
  if (errorCode === "quota_exceeded") return 429;
  if (errorCode === "invalid_input") return 400;
  return 502;
}

export function createAiRouter({
  enabled = process.env.ENABLE_DEV_AI_ROUTE === "true" && process.env.NODE_ENV === "development",
  reportsEnabled = process.env.GEMINI_REPORT_GENERATION_ENABLED === "true",
  explainFields = explainQuestionnaireFields,
  createReport = generateDraftReport,
} = {}) {
  const router = Router();
  const requestCounts = new Map();
  const reportRequestCounts = new Map();

  router.post("/report-content", async (req, res) => {
    if (!reportsEnabled) {
      return res.status(404).json({
        status: "unavailable",
        error: "AI report generation is not enabled for this server.",
        code: "ai_route_disabled",
      });
    }

    const parsed = reportRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        status: "unavailable",
        error: "Provide report details and explicit consent.",
        code: "invalid_input",
      });
    }
    if (isRateLimited(reportRequestCounts, req, REPORT_LIMIT)) {
      return res.status(429).json({
        status: "unavailable",
        error: "Too many report requests. Please wait a minute and try again.",
        code: "rate_limited",
      });
    }

    try {
      const { consent, ...input } = parsed.data;
      const result = await createReport(input, { consent });
      if (result.status !== "ready") {
        const code = result.errorCode || "provider_error";
        const message = {
          ai_disabled: "AI report generation is disabled.",
          ai_not_configured: "Gemini is not configured on the server.",
          quota_exceeded: "The AI service quota is temporarily unavailable.",
          timeout: "The AI service took too long to respond. Please retry.",
          invalid_provider_response: "The AI service returned an invalid report.",
          invalid_input: "The report details are invalid.",
        }[code] || "AI report generation is temporarily unavailable.";
        return res.status(statusFor(code)).json({ status: "unavailable", error: message, code });
      }
      return res.json({ status: "ready", report: result.report });
    } catch (error) {
      console.error("AI report route failed unexpectedly", {
        name: error instanceof Error ? error.name : "UnknownError",
      });
      return res.status(502).json({
        status: "unavailable",
        error: "AI report generation is temporarily unavailable.",
        code: "provider_error",
      });
    }
  });

  router.post("/questionnaire-help", async (req, res) => {
    if (!enabled) {
      return res.status(404).json({
        status: "unavailable",
        error: "AI questionnaire help is not enabled for this server.",
        code: "ai_route_disabled",
      });
    }

    const parsed = requestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        status: "unavailable",
        error: "Provide generic field identifiers and explicit consent.",
        code: "invalid_input",
      });
    }

    if (isRateLimited(requestCounts, req, LIMIT)) {
      return res.status(429).json({
        status: "unavailable",
        error: "Too many AI help requests. Please wait a minute and try again.",
        code: "rate_limited",
      });
    }

    try {
      const result = await explainFields(parsed.data.fieldKeys, { consent: parsed.data.consent });
      if (result.status !== "ready") {
        const code = result.errorCode || "provider_error";
        const message = {
          ai_disabled: "AI questionnaire help is disabled.",
          ai_not_configured: "AI questionnaire help is not configured on the server.",
          quota_exceeded: "The AI service quota is temporarily unavailable.",
          timeout: "The AI service took too long to respond. Please retry.",
          invalid_input: "One or more questionnaire fields are unsupported.",
          invalid_provider_response: "The AI service returned an invalid response.",
        }[code] || "AI questionnaire help is temporarily unavailable.";
        return res.status(statusFor(code)).json({ status: "unavailable", error: message, code });
      }
      return res.json({
        status: "ready",
        guidance: result.guidance,
        disclaimer: "AI-generated general guidance only; not legal advice. No questionnaire answers or document content were sent.",
      });
    } catch (error) {
      console.error("AI questionnaire route failed unexpectedly", {
        name: error instanceof Error ? error.name : "UnknownError",
      });
      return res.status(502).json({
        status: "unavailable",
        error: "AI questionnaire help is temporarily unavailable.",
        code: "provider_error",
      });
    }
  });

  return router;
}
