import { defineConfig } from "prisma/config";

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
    // Not env("DATABASE_URL"): that throws when the variable is missing, which
    // breaks `prisma generate` (postinstall) in installs that have no database,
    // e.g. the Vercel frontend build and the Docker build stage. Commands that
    // do need a database (migrate, seed, studio) still fail clearly without it.
    url: process.env.DATABASE_URL ?? "",
  },
});
