import { authService } from "../services/authService.js";
import { publicUser } from "../utils/response.js";

export const authController = {
  async register(req, res) {
    const result = await authService.register(req.body);
    return res.status(201).json(result);
  },
  async login(req, res) {
    return res.json(await authService.login(req.body));
  },
  async logout(req, res) {
    await authService.logout(req.auth);
    return res.status(204).end();
  },
  me(req, res) {
    return res.json({ user: publicUser(req.user) });
  },
  async updateMe(req, res) {
    return res.json({ user: await authService.updateProfile(req.user.id, req.body) });
  },
};
