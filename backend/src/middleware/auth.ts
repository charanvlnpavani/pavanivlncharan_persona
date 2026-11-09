import type { RequestHandler } from "express";
import { env } from "../config/env";
import { SESSION_COOKIE, findSessionUser } from "../services/auth.service";
import { forbidden, unauthorized } from "../utils/errors";

export type AuthUser = { id: string; email: string; name: string };

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/** Attaches req.user when a valid session cookie is present. Never blocks. */
export const loadSession: RequestHandler = async (req, _res, next) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (typeof token === "string" && token.length > 0) {
    const user = await findSessionUser(token);
    if (user) req.user = user;
  }
  next();
};

/** Blocks the request unless an admin is logged in. */
export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (!req.user) throw unauthorized();
  next();
};

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * CSRF protection for cookie-authenticated writes:
 * 1. The browser must send our custom header. Cross-site pages cannot add
 *    custom headers without a CORS preflight, which our allowlist rejects.
 * 2. If an Origin header is present, it must be one of our own origins.
 */
export const csrfProtection: RequestHandler = (req, _res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();
  if (req.get("x-portfolio-csrf") !== "1") throw forbidden("Missing CSRF header");
  const origin = req.get("origin");
  if (origin && !env.CORS_ORIGINS.includes(origin)) throw forbidden("Origin not allowed");
  next();
};
