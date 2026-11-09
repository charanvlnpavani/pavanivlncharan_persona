import { createHash } from "node:crypto";
import type { ContactInput } from "@portfolio/shared";
import { env } from "../config/env";
import type { MessageStatus } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { notFound } from "../utils/errors";
import { logActivity } from "./activity.service";

/** Store a salted hash of the IP (for abuse checks), never the raw address. */
const hashIp = (ip: string | undefined) =>
  ip ? createHash("sha256").update(`${env.IP_HASH_SALT}:${ip}`).digest("hex").slice(0, 32) : null;

/** Very small spam heuristic on top of the honeypot and rate limit. */
function looksLikeSpam(input: ContactInput) {
  const links = (input.message.match(/https?:\/\//g) ?? []).length;
  return links > 3;
}

export async function submitMessage(input: ContactInput, meta: { ip?: string; userAgent?: string }) {
  // Honeypot filled in: pretend success so bots learn nothing, store nothing.
  if (input.website) return { ok: true };
  await prisma.contactMessage.create({
    data: {
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
      status: looksLikeSpam(input) ? "SPAM" : "NEW",
      ipHash: hashIp(meta.ip),
      userAgent: meta.userAgent?.slice(0, 300),
    },
  });
  return { ok: true };
}

export async function listMessages(status?: MessageStatus) {
  const rows = await prisma.contactMessage.findMany({
    where: status ? { status } : { status: { not: "SPAM" } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return rows.map(({ ipHash: _ip, ...m }) => ({ ...m, createdAt: m.createdAt.toISOString() }));
}

export async function setMessageStatus(id: string, status: MessageStatus, userId?: string) {
  const msg = await prisma.contactMessage.update({ where: { id }, data: { status } }).catch(() => null);
  if (!msg) throw notFound("Message");
  await logActivity(prisma, { userId, action: "updated", entity: "message", entityId: id, label: `Message from ${msg.name} → ${status}` });
  return msg;
}

export async function deleteMessage(id: string, userId?: string) {
  const msg = await prisma.contactMessage.delete({ where: { id } }).catch(() => null);
  if (!msg) throw notFound("Message");
  await logActivity(prisma, { userId, action: "deleted", entity: "message", entityId: id, label: `Message from ${msg.name}` });
}
