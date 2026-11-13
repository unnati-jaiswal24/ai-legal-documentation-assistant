import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { getConfig } from "../config/env.js";
import AppError from "../utils/AppError.js";

const extensionByMime = new Map([
  ["application/pdf", "pdf"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
]);

function detectedMime(buffer) {
  if (buffer.subarray(0, 5).toString() === "%PDF-") return "application/pdf";
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  return null;
}

export async function storeVerificationFile(file) {
  if (!file?.buffer) throw new AppError(400, "file_required", "Upload a university ID card or enrollment proof.");
  const config = getConfig();
  if (file.size > config.maxUploadBytes) throw new AppError(413, "file_too_large", "The verification file exceeds the configured size limit.");
  const mimeType = detectedMime(file.buffer);
  if (!mimeType || file.mimetype !== mimeType) {
    throw new AppError(415, "unsupported_file", "Upload a valid PDF, JPEG, or PNG verification document.");
  }
  const id = randomUUID();
  const storageKey = `${id}.${extensionByMime.get(mimeType)}`;
  await mkdir(config.privateUploadDir, { recursive: true, mode: 0o700 });
  const absolutePath = path.join(config.privateUploadDir, storageKey);
  await writeFile(absolutePath, file.buffer, { flag: "wx", mode: 0o600 });
  return {
    storageKey,
    mimeType,
    sizeBytes: file.size,
    originalFileName: path.basename(file.originalname || "verification-document").slice(0, 255),
  };
}

export async function removePrivateFile(storageKey) {
  if (!storageKey || path.basename(storageKey) !== storageKey) return;
  const config = getConfig();
  await unlink(path.join(config.privateUploadDir, storageKey)).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
}

export function privateFilePath(storageKey) {
  if (!storageKey || path.basename(storageKey) !== storageKey) {
    throw new AppError(404, "file_not_found", "The requested verification file was not found.");
  }
  return path.join(getConfig().privateUploadDir, storageKey);
}
