import { documentService } from "../services/documentService.js";

export const documentController = {
  async listTypes(_req, res) {
    return res.json(await documentService.listTypes());
  },
  async listTemplates(_req, res) {
    return res.json(await documentService.listTemplates());
  },
  async listDrafts(req, res) {
    return res.json(await documentService.listDrafts(req.user.id));
  },
  async createDraft(req, res) {
    return res.status(201).json(await documentService.createDraft(req.user.id, req.body.templateId));
  },
  async getDraft(req, res) {
    return res.json(await documentService.getDraft(req.user.id, req.params.id).then(({ shaped }) => shaped));
  },
  async saveValues(req, res) {
    return res.json(await documentService.saveValues(req.user.id, req.params.id, req.body.values));
  },
  async validateDraft(req, res) {
    return res.json(await documentService.validateDraft(req.user.id, req.params.id));
  },
  async getClauses(req, res) {
    return res.json(await documentService.getClauses(req.user.id, req.params.id));
  },
  async generate(req, res) {
    return res.status(201).json(await documentService.generate(req.user.id, req.params.id));
  },
  async listVersions(req, res) {
    return res.json(await documentService.listVersions(req.user.id, req.params.id));
  },
  async downloadVersion(req, res) {
    const version = await documentService.getVersionContent(req.user.id, req.params.id, req.params.versionId);
    res.set({ "Content-Type": "text/plain; charset=utf-8", "Content-Disposition": `attachment; filename="agreement-${version.versionNo}.txt"`, "X-Content-Type-Options": "nosniff" });
    return res.send(version.contentText || "");
  },
  async listDocuments(req, res) {
    return res.json(await documentService.listDocuments(req.user.id, req.query));
  },
  async getDocument(req, res) {
    return res.json({ document: await documentService.getDraft(req.user.id, req.params.id).then(({ shaped }) => shaped) });
  },
  async updateDocument(req, res) {
    return res.json({ document: await documentService.updateDocument(req.user.id, req.params.id, req.body) });
  },
  async deleteDocument(req, res) {
    await documentService.deleteDocument(req.user.id, req.params.id);
    return res.status(204).end();
  },
};
