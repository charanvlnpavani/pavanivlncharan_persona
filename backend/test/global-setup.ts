import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

/** Applies all migrations to the test database once before the suite. */
export default function setup() {
  try {
    process.loadEnvFile(".env");
  } catch {
    // CI provides variables directly.
  }
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("TEST_DATABASE_URL is not set");
  if (url === process.env.DATABASE_URL) throw new Error("TEST_DATABASE_URL must differ from DATABASE_URL");

  execSync("npx prisma migrate deploy", { stdio: "pipe", env: { ...process.env, DATABASE_URL: url } });
  rmSync("./storage-test", { recursive: true, force: true });
  return () => rmSync("./storage-test", { recursive: true, force: true });
}
