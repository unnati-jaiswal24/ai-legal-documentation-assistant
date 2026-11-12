import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

export const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
export const geminiEnabled = process.env.GEMINI_GENERIC_EXPLANATIONS_ENABLED === "true";

export const geminiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { timeout: 15_000 },
  })
  : null;
