import type { CookieOptions, RequestHandler } from "express";
import type { LoginInput } from "@portfolio/shared";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { SESSION_COOKIE, SESSION_TTL_MS, createSession, deleteSession, verifyCredentials } from "../services/auth.service";
import { logActivity } from "../services/activity.service";
import { unauthorized } from "../utils/errors";

const cookieOptions: CookieOptions = {
  httpOnly: true, // not readable by JavaScript (XSS can't steal it)
  secure: env.COOKIE_SECURE, // HTTPS only in production
  sameSite: "lax", // not sent on cross-site POSTs
  path: "/",
};

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body as LoginInput;
  const user = await verifyCredentials(email, password);
  // Same message for unknown email and wrong password.
  if (!user) throw unauthorized("Incorrect email or password");

  const token = await createSession(user.id, { ip: req.ip, userAgent: req.get("user-agent") });
  await logActivity(prisma, { userId: user.id, action: "updated", entity: "session", label: "Signed in" }).catch(() => {});
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions, maxAge: SESSION_TTL_MS });
  res.json({ user: { id: user.id, email: user.email, name: user.name } });
};

export const logout: RequestHandler = async (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (typeof token === "string") await deleteSession(token);
  res.clearCookie(SESSION_COOKIE, cookieOptions);
  res.status(204).end();
};

export const me: RequestHandler = (req, res) => {
  if (!req.user) throw unauthorized();
  res.json({ user: req.user });
};
