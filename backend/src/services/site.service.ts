import type { ProfileInput, SettingsInput } from "@portfolio/shared";
import type { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { notFound } from "../utils/errors";
import { logActivity } from "./activity.service";
import { toAdminMedia } from "./media.service";
import { publishSite } from "./publish.service";

/** Profile and website settings are single rows (id = 1). */

export async function getProfile() {
  const p = await prisma.profile.findUnique({ where: { id: 1 }, include: { avatar: true } });
  if (!p) throw notFound("Profile");
  const { id: _id, updatedAt, avatar, ...rest } = p;
  return { ...rest, avatar: avatar ? toAdminMedia(avatar) : null, updatedAt: updatedAt.toISOString() };
}

export async function updateProfile(input: ProfileInput, opts: { userId?: string; publish?: boolean }) {
  const data = { ...input, heroCtas: input.heroCtas as unknown as Prisma.InputJsonValue };
  await prisma.profile.upsert({ where: { id: 1 }, create: { id: 1, ...data }, update: data });
  await logActivity(prisma, { userId: opts.userId, action: "updated", entity: "profile", label: "Profile" });
  if (opts.publish) await publishSite({ userId: opts.userId, label: "Published profile changes" });
  return getProfile();
}

export async function getSettings() {
  const s = await prisma.websiteSettings.findUnique({ where: { id: 1 } });
  if (!s) throw notFound("Website settings");
  const { id: _id, updatedAt, ...rest } = s;
  return { ...rest, updatedAt: updatedAt.toISOString() };
}

export async function updateSettings(input: SettingsInput, opts: { userId?: string; publish?: boolean }) {
  const data = {
    ...input,
    navItems: input.navItems as unknown as Prisma.InputJsonValue,
    homeSections: input.homeSections as unknown as Prisma.InputJsonValue,
  };
  await prisma.websiteSettings.upsert({ where: { id: 1 }, create: { id: 1, ...data }, update: data });
  await logActivity(prisma, { userId: opts.userId, action: "updated", entity: "settings", label: "Website settings" });
  if (opts.publish) await publishSite({ userId: opts.userId, label: "Published website settings" });
  return getSettings();
}
