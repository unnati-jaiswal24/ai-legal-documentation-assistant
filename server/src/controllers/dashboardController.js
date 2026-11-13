import { dashboardService } from "../services/dashboardService.js";

export const dashboardController = {
  async client(req, res) {
    return res.json(await dashboardService.client(req.user.id));
  },
  async student(req, res) {
    return res.json(await dashboardService.student(req.user.id));
  },
  async admin(req, res) {
    return res.json(await dashboardService.admin(req.query.range));
  },
};
