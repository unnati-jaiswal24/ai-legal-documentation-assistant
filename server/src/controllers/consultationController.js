import { consultationService } from "../services/consultationService.js";

export const consultationController = {
  async experts(_req, res) {
    return res.json(await consultationService.listExperts());
  },
  async create(req, res) {
    return res.status(201).json({ consultation: await consultationService.create(req.user.id, req.body) });
  },
  async list(req, res) {
    return res.json(await consultationService.list(req.user.id));
  },
};
