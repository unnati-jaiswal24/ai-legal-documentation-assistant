import { aiDocumentReviewService } from "../services/aiDocumentReviewService.js";

export const aiDocumentReviewController = {
  async create(req, res) {
    const review = await aiDocumentReviewService.create(
      req.user.id,
      req.params.documentId,
      req.params.versionId,
      { consent: req.body.consent },
    );
    return res.status(201).json({
      review,
      disclaimer: "AI-generated issue spotting for information only; not legal advice. Consult a qualified Indian legal professional.",
    });
  },

  async list(req, res) {
    return res.json({
      items: await aiDocumentReviewService.listForDocument(req.user.id, req.params.documentId),
    });
  },
};
