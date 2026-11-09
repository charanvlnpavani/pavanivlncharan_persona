import { z } from "zod";

/**
 * All configuration comes from environment variables, validated once at
 * startup. A missing or malformed value stops the server immediately with a
 * clear message instead of failing later at runtime.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000,http://localhost:5173")
    .transform((v) => v.split(",").map((s) => s.trim()).filter(Boolean)),
  PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  FRONTEND_REVALIDATE_URL: z.string().default(""),
  REVALIDATE_SECRET: z.string().default(""),
  IP_HASH_SALT: z.string().min(8, "IP_HASH_SALT must be at least 8 characters"),
  STORAGE_DIR: z.string().default("./storage"),
  CHROME_PATH: z.string().default(""),
  COOKIE_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  TRUST_PROXY: z.coerce.number().int().min(0).default(1),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const problems = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
  console.error(`Invalid environment configuration:\n${problems}\n\nSee backend/.env.example.`);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";

if (isProd && !env.COOKIE_SECURE) {
  console.warn("WARNING: COOKIE_SECURE=false in production. Admin cookies will be sent over plain HTTP.");
}
