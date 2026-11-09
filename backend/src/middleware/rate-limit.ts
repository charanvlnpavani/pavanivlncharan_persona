import rateLimit from "express-rate-limit";
import { isTest } from "../config/env";

const json = (message: string) => ({ error: { code: "RATE_LIMITED", message } });

/** 5 failed logins per 15 minutes per IP. Successful logins don't count. */
export const createLoginLimiter = () => rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: json("Too many login attempts. Try again in 15 minutes."),
});

/** Contact form: 5 messages per hour per IP. */
export const createContactLimiter = () => rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: isTest ? 1000 : 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: json("Too many messages. Please try again later."),
});

/** General ceiling for the public API. */
export const createPublicLimiter = () => rateLimit({
  windowMs: 60 * 1000,
  limit: isTest ? 10_000 : 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: json("Too many requests. Slow down a little."),
});
