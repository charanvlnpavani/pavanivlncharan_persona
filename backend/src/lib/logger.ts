import pino from "pino";
import { env, isProd, isTest } from "../config/env";

/**
 * Structured JSON logs in production, readable logs in development.
 * Passwords, cookies and auth headers are always redacted.
 */
export const logger = pino({
  level: isTest ? "silent" : isProd ? "info" : "debug",
  redact: {
    paths: [
      "req.headers.cookie",
      "req.headers.authorization",
      'res.headers["set-cookie"]',
      "password",
      "*.password",
      "passwordHash",
    ],
    censor: "[redacted]",
  },
  ...(env.NODE_ENV === "development"
    ? { transport: { target: "pino-pretty", options: { colorize: true, ignore: "pid,hostname" } } }
    : {}),
});
