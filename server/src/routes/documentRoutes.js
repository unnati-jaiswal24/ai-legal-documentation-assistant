import { Router } from "express";
import { documentController } from "../controllers/documentController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";
import { idParamsSchema, validateRequest } from "../validators/common.js";
import {
  createDraftSchema,
  documentListQuerySchema,
  saveValuesSchema,
  updateDocumentSchema,
} from "../validators/documentValidators.js";

const router = Router();
const client = [authenticateUser, authorizeRole("CLIENT")];
router.get("/document-types", ...client, documentController.listTypes);
router.get("/templates", ...client, documentController.listTemplates);
router.get("/drafts", ...client, documentController.listDrafts);
router.post("/drafts", ...client, validateRequest({ body: createDraftSchema }), documentController.createDraft);
router.get("/drafts/:id", ...client, validateRequest({ params: idParamsSchema }), documentController.getDraft);
router.put("/drafts/:id/values", ...client, validateRequest({ params: idParamsSchema, body: saveValuesSchema }), documentController.saveValues);
router.post("/drafts/:id/validate", ...client, validateRequest({ params: idParamsSchema }), documentController.validateDraft);
router.get("/drafts/:id/clauses", ...client, validateRequest({ params: idParamsSchema }), documentController.getClauses);
router.post("/drafts/:id/generate", ...client, validateRequest({ params: idParamsSchema }), documentController.generate);
router.get("/drafts/:id/documents", ...client, validateRequest({ params: idParamsSchema }), documentController.listVersions);
router.get("/drafts/:id/documents/:versionId/download", ...client, validateRequest({ params: idParamsSchema.extend({ versionId: idParamsSchema.shape.id }) }), documentController.downloadVersion);
router.get("/documents", ...client, validateRequest({ query: documentListQuerySchema }), documentController.listDocuments);
router.get("/documents/:id", ...client, validateRequest({ params: idParamsSchema }), documentController.getDocument);
router.patch("/documents/:id", ...client, validateRequest({ params: idParamsSchema, body: updateDocumentSchema }), documentController.updateDocument);
router.delete("/documents/:id", ...client, validateRequest({ params: idParamsSchema }), documentController.deleteDocument);
export default router;
