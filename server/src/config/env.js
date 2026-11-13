import "dotenv/config";
import path from "node:path";

export function getConfig() {
  const missing = [];
  if (!process.env.DATABASE_URL) missing.push("DATABASE_URL");
  if (!process.env.JWT_SECRET) missing.push("JWT_SECRET");

  const nodeEnv = process.env.NODE_ENV || "development";
  if (process.env.JWT_SECRET && Buffer.byteLength(process.env.JWT_SECRET, "utf8") < 32) {
    throw new Error("JWT_SECRET must contain at least 32 bytes.");
  }
  if (missing.length) {
    throw new Error(`Missing required backend environment variables: ${missing.join(", ")}.`);
  }

  const port = Number(process.env.PORT || 4000);
  const bcryptRounds = Number(process.env.BCRYPT_ROUNDS || 12);
  const maxUploadBytes = Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024);
  const accessTokenTtl = process.env.ACCESS_TOKEN_TTL || "15m";
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be a valid TCP port.");
  if (!Number.isInteger(bcryptRounds) || bcryptRounds < 10 || bcryptRounds > 14) {
    throw new Error("BCRYPT_ROUNDS must be an integer from 10 through 14.");
  }
  if (!Number.isSafeInteger(maxUploadBytes) || maxUploadBytes < 1024 || maxUploadBytes > 20 * 1024 * 1024) {
    throw new Error("MAX_UPLOAD_BYTES must be between 1 KB and 20 MB.");
  }
  if (!/^[1-9]\d*[smhd]$/.test(accessTokenTtl)) {
    throw new Error("ACCESS_TOKEN_TTL must be a positive duration such as 15m or 1h.");
  }

  return {
    nodeEnv,
    port,
    databaseUrl: process.env.DATABASE_URL,
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    jwtSecret: process.env.JWT_SECRET,
    accessTokenTtl,
    bcryptRounds,
    maxUploadBytes,
    privateUploadDir: path.resolve(process.cwd(), process.env.PRIVATE_UPLOAD_DIR || "storage/private"),
    adminBootstrapEmail: process.env.ADMIN_BOOTSTRAP_EMAIL,
    adminBootstrapPassword: process.env.ADMIN_BOOTSTRAP_PASSWORD,
    adminBootstrapName: process.env.ADMIN_BOOTSTRAP_NAME || "SaralDocs Admin",
  };
}

export function durationSeconds(duration) {
  const value = Number.parseInt(duration, 10);
  const unit = duration.at(-1);
  return value * ({ s: 1, m: 60, h: 3600, d: 86400 }[unit]);
}
