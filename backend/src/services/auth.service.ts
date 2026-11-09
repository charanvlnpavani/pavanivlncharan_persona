import { createHash, randomBytes } from "node:crypto";
import argon2 from "argon2";
import { prisma } from "../lib/prisma";

export const SESSION_COOKIE = "pf_session";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const PREVIEW_TTL_MS = 30 * 60 * 1000; // 30 minutes

/** Tokens are random; only their SHA-256 is stored, so a DB leak can't be replayed. */
export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const newToken = () => randomBytes(32).toString("base64url");

export function hashPassword(password: string) {
  return argon2.hash(password, { type: argon2.argon2id });
}

// Verified against when the email doesn't exist, so response time doesn't
// reveal which emails have accounts.
let dummyHash: Promise<string> | null = null;

/** Returns the user on success, null on any failure. */
export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    dummyHash ??= hashPassword("dummy-password-for-timing");
    await argon2.verify(await dummyHash, password).catch(() => false);
    return null;
  }
  const ok = await argon2.verify(user.passwordHash, password).catch(() => false);
  return ok ? user : null;
}

export async function createSession(userId: string, meta: { ip?: string; userAgent?: string }) {
  const token = newToken();
  await prisma.session.create({
    data: {
      tokenHash: sha256(token),
      userId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      ip: meta.ip,
      userAgent: meta.userAgent?.slice(0, 300),
    },
  });
  await prisma.adminUser.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
  return token;
}

export async function findSessionUser(token: string) {
  const session = await prisma.session.findUnique({
    where: { tokenHash: sha256(token) },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  // Touch at most once a minute to avoid a write on every request.
  if (Date.now() - session.lastSeenAt.getTime() > 60_000) {
    await prisma.session.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } }).catch(() => {});
  }
  return session.user;
}

export async function deleteSession(token: string) {
  await prisma.session.deleteMany({ where: { tokenHash: sha256(token) } });
}

export async function purgeExpired() {
  const now = new Date();
  await prisma.session.deleteMany({ where: { expiresAt: { lt: now } } });
  await prisma.previewToken.deleteMany({ where: { expiresAt: { lt: now } } });
}

/** Preview tokens let the public Next.js site render draft content for 30 minutes. */
export async function createPreviewToken() {
  const token = newToken();
  await prisma.previewToken.create({
    data: { tokenHash: sha256(token), expiresAt: new Date(Date.now() + PREVIEW_TTL_MS) },
  });
  return token;
}

export async function isValidPreviewToken(token: string | undefined) {
  if (!token) return false;
  const row = await prisma.previewToken.findUnique({ where: { tokenHash: sha256(token) } });
  return Boolean(row && row.expiresAt > new Date());
}
