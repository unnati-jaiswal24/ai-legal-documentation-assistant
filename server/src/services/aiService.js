import { Type } from "@google/genai";
import { z } from "zod";
import { geminiClient, geminiEnabled, geminiModel } from "../config/aiConfig.js";

const clauseSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().trim().min(1).max(160),
  legalText: z.string().trim().min(1).max(5000),
  reviewStatus: z.literal("advocate_reviewed"),
}).strict();

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    explanations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          clauseId: { type: Type.STRING },
          explanation: { type: Type.STRING },
        },
        required: ["clauseId", "explanation"],
      },
    },
  },
  required: ["explanations"],
};

const explanationsSchema = z.object({
  explanations: z.array(z.object({
    clauseId: z.string().min(1).max(100),
    explanation: z.string().trim().min(1).max(1200),
  }).strict()).max(20),
}).strict();

const questionnaireFields = {
  effective_date: "the date the agreement should begin",
  freelancer_name: "the freelancer's legal name",
  client_name: "the client's legal name",
  scope_description: "the services and work included in the project",
  fee_amount: "the total contractual fee",
  payment_days: "the number of days allowed for an invoice to be paid",
  include_nda: "whether the parties want confidentiality terms",
  notice_days: "the notice period stated in the agreement",
  arbitration_city: "the city named for dispute resolution",
  deliverables: "the items or outcomes the freelancer will provide",
  project_timeline: "the project start, milestone, and completion dates",
  ip_arrangement: "the intended ownership or licence arrangement for work product",
  confidentiality_requirements: "the kinds of information the parties intend to keep confidential",
  termination_conditions: "the circumstances and process for ending the agreement",
  governing_law: "the law the parties propose to govern the agreement",
  jurisdiction: "the location the parties propose for dispute proceedings",
  payment_milestones: "the contractual fee schedule and milestone amounts",
};

const questionnaireResponseSchema = {
  type: Type.OBJECT,
  properties: {
    guidance: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          fieldKey: { type: Type.STRING },
          explanation: { type: Type.STRING },
          questions: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["fieldKey", "explanation", "questions"],
      },
    },
  },
  required: ["guidance"],
};

const questionnaireGuidanceSchema = z.object({
  guidance: z.array(z.object({
    fieldKey: z.string(),
    explanation: z.string().trim().min(1).max(700),
    questions: z.array(z.string().trim().min(1).max(220)).max(3),
  }).strict()).max(10),
}).strict();

function containsPersonalData(text) {
  const patterns = [
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
    /(?:\+?91[\s-]?)?[6-9]\d{9}\b/,
    /\b[A-Z]{5}\d{4}[A-Z]\b/i,
    /\b\d{12}\b/,
  ];
  return patterns.some((pattern) => pattern.test(text));
}

function getErrorCode(error) {
  const status = Number(error?.status || error?.statusCode);
  const message = String(error?.message || "").toLowerCase();
  if (status === 429 || message.includes("quota") || message.includes("rate limit")) return "quota_exceeded";
  if (status === 408 || message.includes("timeout") || message.includes("timed out")) return "timeout";
  if (status === 401 || status === 403) return "provider_rejected";
  if (status >= 500) return "provider_unavailable";
  return "provider_error";
}

function unavailable(errorCode) {
  return { status: "unavailable", explanations: [], errorCode };
}

export async function explainReviewedClauses(
  inputClauses,
  { consent = false, client = geminiClient, enabled = geminiEnabled } = {},
) {
  if (!consent) return { status: "not_requested", explanations: [], errorCode: null };
  if (!enabled) return unavailable("ai_disabled");
  if (!client) return unavailable("ai_not_configured");
  if (!Array.isArray(inputClauses) || inputClauses.length > 20) return unavailable("invalid_clause_input");

  const clauses = [];
  for (const input of inputClauses) {
    const parsed = clauseSchema.safeParse(input);
    if (!parsed.success) return unavailable("review_not_confirmed");
    if (containsPersonalData(parsed.data.title) || containsPersonalData(parsed.data.legalText)) {
      return unavailable("personal_data_blocked");
    }
    clauses.push({
      id: parsed.data.id,
      title: parsed.data.title,
      legalText: parsed.data.legalText,
    });
  }
  if (!clauses.length) return { status: "ready", explanations: [], errorCode: null };

  let response;
  try {
    response = await client.models.generateContent({
      model: geminiModel,
      contents: JSON.stringify(clauses),
      config: {
        systemInstruction: [
          "Explain each supplied, advocate-reviewed clause in simple, neutral language.",
          "Do not draft, rewrite, complete, or suggest legal clauses.",
          "Do not invent legal citations, statutes, or facts not present in the input.",
          "Do not claim enforceability and do not provide legal advice.",
          "Return only concise explanations mapped to the supplied clause IDs in the required JSON schema.",
        ].join(" "),
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    });
  } catch (error) {
    const errorCode = getErrorCode(error);
    console.warn("Gemini clause explanation request failed", { code: errorCode });
    return unavailable(errorCode);
  }

  let parsedOutput;
  try {
    parsedOutput = JSON.parse(response.text || "");
  } catch {
    return unavailable("invalid_provider_response");
  }
  const parsedResponse = explanationsSchema.safeParse(parsedOutput);
  if (!parsedResponse.success) return unavailable("invalid_provider_response");

  const allowedIds = new Set(clauses.map(({ id }) => id));
  const explanations = parsedResponse.data.explanations
    .filter(({ clauseId }) => allowedIds.has(clauseId));

  return { status: "ready", explanations, errorCode: null };
}

export async function explainQuestionnaireFields(
  inputFieldKeys,
  { consent = false, client = geminiClient, enabled = geminiEnabled } = {},
) {
  if (!consent) return { status: "not_requested", guidance: [], errorCode: null };
  if (!enabled) return { status: "unavailable", guidance: [], errorCode: "ai_disabled" };
  if (!client) return { status: "unavailable", guidance: [], errorCode: "ai_not_configured" };
  if (
    !Array.isArray(inputFieldKeys)
    || inputFieldKeys.length < 1
    || inputFieldKeys.length > 10
    || inputFieldKeys.some((key) => typeof key !== "string" || !Object.hasOwn(questionnaireFields, key))
  ) {
    return { status: "unavailable", guidance: [], errorCode: "invalid_input" };
  }

  const fieldKeys = [...new Set(inputFieldKeys)];
  const safeFields = fieldKeys.map((fieldKey) => ({
    fieldKey,
    meaning: questionnaireFields[fieldKey],
  }));
  let response;
  try {
    response = await client.models.generateContent({
      model: geminiModel,
      contents: JSON.stringify(safeFields),
      config: {
        systemInstruction: [
          "Help a user understand what information a freelance service agreement questionnaire field is asking for.",
          "Only explain the supplied generic field descriptions and suggest neutral clarifying questions.",
          "Do not ask for, infer, or produce personal data, contract wording, legal advice, legal conclusions, citations, or statutes.",
          "Do not recommend payment services or handle transactions.",
          "Return a short explanation for each supplied field key in the required JSON schema.",
        ].join(" "),
        responseMimeType: "application/json",
        responseSchema: questionnaireResponseSchema,
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    });
  } catch (error) {
    const errorCode = getErrorCode(error);
    console.warn("Gemini questionnaire help request failed", { code: errorCode });
    return { status: "unavailable", guidance: [], errorCode };
  }

  let output;
  try {
    output = JSON.parse(response.text || "");
  } catch {
    return { status: "unavailable", guidance: [], errorCode: "invalid_provider_response" };
  }
  const parsed = questionnaireGuidanceSchema.safeParse(output);
  if (!parsed.success) {
    return { status: "unavailable", guidance: [], errorCode: "invalid_provider_response" };
  }

  const allowedKeys = new Set(fieldKeys);
  const guidance = parsed.data.guidance.filter(({ fieldKey }) => allowedKeys.has(fieldKey));
  if (
    guidance.length !== fieldKeys.length
    || new Set(guidance.map(({ fieldKey }) => fieldKey)).size !== fieldKeys.length
  ) {
    return { status: "unavailable", guidance: [], errorCode: "invalid_provider_response" };
  }
  return { status: "ready", guidance, errorCode: null };
}
