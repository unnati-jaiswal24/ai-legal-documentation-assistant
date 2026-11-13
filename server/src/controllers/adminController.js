import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { adminService } from "../services/adminService.js";
import { studentService } from "../services/studentService.js";
import { privateFilePath } from "../services/privateFileService.js";
import { reviewService } from "../services/reviewService.js";

export const adminController = {
  async dashboard(req, res) {
    return res.json(await adminService.dashboard(req.query.range));
  },
  async users(req, res) {
    return res.json(await adminService.listUsers(req.query));
  },
  async updateUser(req, res) {
    return res.json({ user: await adminService.setUserActive(req.user.id, req.params.id, req.body.isActive) });
  },
  async updateUserRole(req, res) {
    return res.json({ user: await adminService.setUserRole(req.user.id, req.params.id, req.body.role) });
  },
  async expertise(_req, res) {
    return res.json(await adminService.listExpertise());
  },
  async createExpertise(req, res) {
    return res.status(201).json({ expertise: await adminService.createExpertise(req.body, req.user.id) });
  },
  async createExpert(req, res) {
    return res.status(201).json({ expert: await adminService.createExpert(req.body, req.user.id) });
  },
  async students(req, res) {
    return res.json(await adminService.listStudents(req.query));
  },
  async verifications(req, res) {
    return res.json(await studentService.listAdminVerifications(req.query));
  },
  async verificationFile(req, res) {
    const verification = await studentService.getVerificationFile(req.params.id, req.user, "ADMIN");
    res.set({
      "Content-Type": verification.mimeType,
      "Content-Disposition": `attachment; filename="${verification.storageKey}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    });
    await pipeline(createReadStream(privateFilePath(verification.storageKey)), res);
  },
  async approve(req, res) {
    return res.json({ verification: await studentService.decideVerification(req.params.id, req.user.id, "APPROVED") });
  },
  async reject(req, res) {
    return res.json({ verification: await studentService.decideVerification(req.params.id, req.user.id, "REJECTED", req.body.reason) });
  },
  async documents(req, res) {
    return res.json(await adminService.listDocuments(req.query));
  },
  async reviews(req, res) {
    return res.json(await adminService.listReviews(req.query));
  },
  async reviewRequests(req, res) {
    return res.json(await reviewService.listRequests(req.user, "ADMIN", req.query));
  },
};
