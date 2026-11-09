import type { RequestHandler } from "express";
import type { ProfileInput, ResumeSettingsInput, SettingsInput } from "@portfolio/shared";
import { messageStatusSchema, resumeSettingsSchema } from "@portfolio/shared";
import type { MessageStatus } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { pendingChangeCount, logActivity } from "../services/activity.service";
import { createPreviewToken } from "../services/auth.service";
import { deleteMessage, listMessages, setMessageStatus } from "../services/contact.service";
import { getDashboard } from "../services/dashboard.service";
import { deleteMedia, saveUpload, toAdminMedia } from "../services/media.service";
import { publishSite } from "../services/publish.service";
import {
  getResumeSettings,
  getVersionFile,
  listResumeVersions,
  renderDraftPreview,
  resumeQueue,
  saveResumeSettings,
  settingsFromInput,
} from "../services/resume/resume.service";
import { getLatestRevision } from "../services/revision.service";
import { getProfile, getSettings, updateProfile, updateSettings } from "../services/site.service";
import { buildSnapshot, toPublicSite } from "../services/snapshot.service";
import { env } from "../config/env";
import { badRequest, notFound } from "../utils/errors";

const wantsPublish = (q: unknown) => (q as Record<string, unknown>)?.publish === "true";
const idParam = (p: unknown) => String((p as Record<string, string>).id);

/* ───── Dashboard & publishing ───── */

export const dashboard: RequestHandler = async (_req, res) => {
  res.json(await getDashboard());
};

export const publishStatus: RequestHandler = async (_req, res) => {
  const latest = await prisma.contentRevision.findFirst({ orderBy: { version: "desc" }, select: { version: true, createdAt: true } });
  res.json({ pendingChanges: await pendingChangeCount(), latestRevision: latest });
};

export const publishAll: RequestHandler = async (req, res) => {
  const note = typeof req.body?.note === "string" ? req.body.note.slice(0, 200) : "";
  const revision = await publishSite({ userId: req.user?.id, note });
  res.json({ revision, pendingChanges: 0 });
};

/* ───── Singletons ───── */

export const showProfile: RequestHandler = async (_req, res) => res.json(await getProfile());
export const saveProfile: RequestHandler = async (req, res) =>
  res.json(await updateProfile(req.body as ProfileInput, { userId: req.user?.id, publish: wantsPublish(req.query) }));

export const showSettings: RequestHandler = async (_req, res) => res.json(await getSettings());
export const saveSettings: RequestHandler = async (req, res) =>
  res.json(await updateSettings(req.body as SettingsInput, { userId: req.user?.id, publish: wantsPublish(req.query) }));

/* ───── Media ───── */

export const listMedia: RequestHandler = async (_req, res) => {
  const rows = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  res.json(rows.map(toAdminMedia));
};

export const uploadMedia: RequestHandler = async (req, res) => {
  if (!req.file) throw badRequest("Attach a file in the 'file' field");
  const asset = await saveUpload(req.file, typeof req.body?.alt === "string" ? req.body.alt : "");
  await logActivity(prisma, { userId: req.user?.id, action: "uploaded", entity: "media", entityId: asset.id, label: asset.originalName });
  res.status(201).json(toAdminMedia(asset));
};

export const updateMedia: RequestHandler = async (req, res) => {
  const asset = await prisma.mediaAsset.update({ where: { id: idParam(req.params) }, data: { alt: req.body.alt } });
  res.json(toAdminMedia(asset));
};

export const removeMedia: RequestHandler = async (req, res) => {
  await deleteMedia(idParam(req.params));
  res.status(204).end();
};

/* ───── Contact messages ───── */

export const messages: RequestHandler = async (req, res) => {
  const status = typeof req.query.status === "string" ? messageStatusSchema.shape.status.parse(req.query.status) : undefined;
  res.json(await listMessages(status as MessageStatus | undefined));
};
export const updateMessage: RequestHandler = async (req, res) =>
  res.json(await setMessageStatus(idParam(req.params), req.body.status as MessageStatus, req.user?.id));
export const removeMessage: RequestHandler = async (req, res) => {
  await deleteMessage(idParam(req.params), req.user?.id);
  res.status(204).end();
};

/* ───── Draft preview of the public site ───── */

/** Returns a URL that turns on preview (Draft Mode) on the public site for 30 minutes. */
export const createPreview: RequestHandler = async (req, res) => {
  const token = await createPreviewToken();
  const path = typeof req.body?.path === "string" && req.body.path.startsWith("/") ? req.body.path : "/";
  const url = new URL("/api/draft", env.PUBLIC_SITE_URL);
  url.searchParams.set("token", token);
  url.searchParams.set("path", path);
  res.json({ url: url.toString(), expiresInMinutes: 30 });
};

/** Draft content in the public shape. Reached with a session or a preview token. */
export const draftSnapshot: RequestHandler = async (_req, res) => {
  const content = await buildSnapshot(prisma, "draft");
  const latest = await getLatestRevision();
  res.set("Cache-Control", "no-store");
  res.json({
    ...toPublicSite({ ...content, version: latest?.version ?? 0, publishedAt: new Date().toISOString() }),
    draft: true,
  });
};

export const draftBlogPost: RequestHandler = async (req, res) => {
  const content = await buildSnapshot(prisma, "draft");
  const post = content.blog.find((p) => p.slug === req.params.slug);
  if (!post) throw notFound("Post");
  res.set("Cache-Control", "no-store");
  res.json(post);
};

/* ───── Resume administration ───── */

export const resumeOverview: RequestHandler = async (_req, res) => {
  const [settings, versions] = await Promise.all([getResumeSettings(), listResumeVersions()]);
  res.json({ settings, versions });
};

export const updateResumeSettings: RequestHandler = async (req, res) => {
  res.json(await saveResumeSettings(req.body as ResumeSettingsInput, req.user?.id));
};

/** Retry / force: waits for generation so the admin sees the outcome. */
export const regenerateResume: RequestHandler = async (_req, res) => {
  await resumeQueue.request({ force: true });
  await resumeQueue.idle();
  res.json({ versions: await listResumeVersions() });
};

/**
 * Draft preview PDF (admin only, never stored). POST with unsaved settings to
 * preview them; GET uses the saved settings.
 */
export const draftResumePdf: RequestHandler = async (req, res) => {
  const override = req.method === "POST" ? settingsFromInput(resumeSettingsSchema.parse(req.body)) : undefined;
  const pdf = await renderDraftPreview(override);
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": 'inline; filename="draft-preview.pdf"',
    "Cache-Control": "no-store",
  });
  res.send(pdf);
};

export const resumeVersionFile: RequestHandler = async (req, res) => {
  const file = await getVersionFile(idParam(req.params));
  if (!file) throw notFound("Resume version");
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `inline; filename="resume-v${file.version.version}.pdf"`,
    "Cache-Control": "private, max-age=3600",
  });
  res.send(file.data);
};
