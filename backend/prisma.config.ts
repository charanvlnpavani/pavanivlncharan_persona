import { defineConfig, env } from "prisma/config";

// Prisma CLI does not load .env automatically; Node does it for us here.
try {
  process.loadEnvFile(".env");
} catch {
  // No .env file (CI/production): variables come from the real environment.
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
