import { env } from "./config/env";
import { createApp } from "./app";
import { logger } from "./lib/logger";
import { prisma } from "./lib/prisma";
import { purgeExpired } from "./services/auth.service";
import { getPdfRenderer } from "./services/resume/pdf-renderer";
import { resumeQueue } from "./services/resume/resume.service";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`API listening on http://localhost:${env.PORT}`);
  // If the latest revision has no resume yet (first boot, or a crash during
  // generation), generate one now. Unchanged content is skipped automatically.
  void resumeQueue.request();
});

const housekeeping = setInterval(() => void purgeExpired().catch(() => {}), 60 * 60 * 1000);

async function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down`);
  clearInterval(housekeeping);
  server.close();
  await resumeQueue.idle().catch(() => {});
  await getPdfRenderer().close?.();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
