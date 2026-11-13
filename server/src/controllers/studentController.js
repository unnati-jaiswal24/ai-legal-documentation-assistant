import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { studentService } from "../services/studentService.js";
import { privateFilePath } from "../services/privateFileService.js";

export const studentController = {
  async list(req, res) {
    return res.json(await studentService.listVerified(req.query));
  },
  async expertise(_req, res) {
    return res.json(await studentService.listExpertise());
  },
  async get(req, res) {
    return res.json({ student: await studentService.getVerified(req.params.id) });
  },
  async myProfile(req, res) {
    return res.json({ profile: await studentService.getMyProfile(req.user.id) });
  },
  async updateProfile(req, res) {
    return res.json({ profile: await studentService.updateProfile(req.user.id, req.body) });
  },
  async submitVerification(req, res) {
    return res.status(201).json({ verification: await studentService.submitVerification(req.user.id, req.file) });
  },
  async verificationStatus(req, res) {
    return res.json({ verification: await studentService.verificationStatus(req.user.id) });
  },
  async verificationFile(req, res) {
    const verification = await studentService.getVerificationFile(req.params.id, req.user, req.auth.role);
    res.set({
      "Content-Type": verification.mimeType,
      "Content-Disposition": `attachment; filename="${verification.storageKey}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    });
    await pipeline(createReadStream(privateFilePath(verification.storageKey)), res);
  },
};
