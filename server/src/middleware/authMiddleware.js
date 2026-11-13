import { authService } from "../services/authService.js";
import AppError from "../utils/AppError.js";

export async function authenticateUser(req, _res, next) {
  const authorization = req.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+([^\s]+)$/i);
  if (!match) return next(new AppError(401, "authentication_required", "Authentication is required."));
  try {
    req.auth = await authService.authenticate(match[1]);
    req.user = req.auth.user;
    return next();
  } catch (error) {
    return next(error);
  }
}
