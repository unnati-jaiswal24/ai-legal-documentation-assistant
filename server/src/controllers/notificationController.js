import { notificationService } from "../services/notificationService.js";

export const notificationController = {
  async list(req, res) {
    return res.json(await notificationService.list(req.user.id, req.query));
  },
  async markRead(req, res) {
    return res.json({ notification: await notificationService.markRead(req.user.id, req.params.id) });
  },
};
