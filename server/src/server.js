import "dotenv/config";
import { createApp } from "./app.js";
import { getConfig } from "./config/env.js";
import { prisma } from "./lib/db.js";

export function startServer() {
  const config = getConfig();
  const server = createApp().listen(config.port, () => {
    console.info(`SaralDocs API listening on port ${config.port}.`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  return server;
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) startServer();
