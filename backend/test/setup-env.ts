/**
 * Runs before each test file (before any app module is imported), so the app
 * connects to the throwaway test database and a separate storage folder.
 */
try {
  process.loadEnvFile(".env");
} catch {
  // CI provides variables directly.
}
if (!process.env.TEST_DATABASE_URL) {
  throw new Error("Set TEST_DATABASE_URL (a separate, disposable database) to run tests.");
}
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.NODE_ENV = "test";
process.env.STORAGE_DIR = "./storage-test";
process.env.IP_HASH_SALT ??= "test-salt-123456";
