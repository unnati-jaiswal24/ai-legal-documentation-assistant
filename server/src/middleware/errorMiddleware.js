import { Prisma } from "@prisma/client";

export function notFoundHandler(_req, res) {
  return res.status(404).json({ error: "The requested API resource was not found.", code: "not_found" });
}

export function errorHandler(error, _req, res, _next) {
  if (res.headersSent) return;
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ error: "The request body contains invalid JSON.", code: "invalid_json" });
  }
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "The uploaded file exceeds the configured size limit.", code: "file_too_large" });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") return res.status(404).json({ error: "The requested resource was not found.", code: "not_found" });
    if (error.code === "P2002") return res.status(409).json({ error: "A resource with these unique details already exists.", code: "conflict" });
    if (error.code === "P2003") return res.status(400).json({ error: "The request references an invalid resource.", code: "invalid_reference" });
  }
  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 600 ? error.status : 500;
  const payload = {
    error: status === 500 ? "An unexpected server error occurred." : error.message,
    code: status === 500 ? "internal_error" : (error.code || "request_error"),
  };
  if (error.details) payload.details = error.details;
  if (status === 500) console.error("Unhandled API error", { name: error.name, code: error.code });
  return res.status(status).json(payload);
}
