import { timingSafeEqual } from "node:crypto";
import { Router, type RequestHandler } from "express";
import { env } from "../config/env";
import * as admin from "../controllers/admin.controller";
import { contentController } from "../controllers/content.controller";
import { requireAdmin } from "../middleware/auth";
import { uploadSingle } from "../middleware/upload";
import { validateBody } from "../middleware/validate";
import { isValidPreviewToken } from "../services/auth.service";
import { adapters, resourceNames } from "../services/content.service";
import { unauthorized } from "../utils/errors";
import {
  mediaUpdateSchema,
  messageStatusSchema,
  previewRequestSchema,
  profileSchema,
  publishNoteSchema,
  reorderSchema,
  resumeSettingsSchema,
  settingsSchema,
} from "../validators";

/** Constant-time compare of the server-to-server secret. */
function isFrontendServer(header: string | undefined) {
  if (!header || !env.REVALIDATE_SECRET) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(env.REVALIDATE_SECRET);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Draft content is readable by: a logged-in admin, a valid short-lived preview
 * token, or the Next.js server itself (shared secret, never sent to browsers).
 */
const adminOrPreviewToken: RequestHandler = async (req, _res, next) => {
  if (req.user) return next();
  if (isFrontendServer(req.get("x-frontend-secret"))) return next();
  if (await isValidPreviewToken(req.get("x-preview-token"))) return next();
  throw unauthorized();
};

/** Everything here changes content and requires a logged-in admin. */
export function adminRoutes() {
  const r = Router();

  // Draft preview data: admin session OR preview token.
  r.get("/preview/snapshot", adminOrPreviewToken, admin.draftSnapshot);
  r.get("/preview/blog/:slug", adminOrPreviewToken, admin.draftBlogPost);
  // Lets the site's /api/draft route check a token before enabling preview.
  r.get("/preview/verify", async (req, res) => {
    res.set("Cache-Control", "no-store");
    res.json({ valid: await isValidPreviewToken(req.get("x-preview-token")) });
  });

  r.use(requireAdmin);

  r.get("/dashboard", admin.dashboard);
  r.get("/publish", admin.publishStatus);
  r.post("/publish", validateBody(publishNoteSchema), admin.publishAll);
  r.post("/preview", validateBody(previewRequestSchema), admin.createPreview);

  r.get("/profile", admin.showProfile);
  r.put("/profile", validateBody(profileSchema), admin.saveProfile);
  r.get("/settings", admin.showSettings);
  r.put("/settings", validateBody(settingsSchema), admin.saveSettings);

  r.get("/media", admin.listMedia);
  r.post("/media", uploadSingle, admin.uploadMedia);
  r.patch("/media/:id", validateBody(mediaUpdateSchema), admin.updateMedia);
  r.delete("/media/:id", admin.removeMedia);

  r.get("/contact", admin.messages);
  r.patch("/contact/:id", validateBody(messageStatusSchema), admin.updateMessage);
  r.delete("/contact/:id", admin.removeMessage);

  r.get("/resume", admin.resumeOverview);
  r.put("/resume/settings", validateBody(resumeSettingsSchema), admin.updateResumeSettings);
  r.post("/resume/regenerate", admin.regenerateResume);
  r.get("/resume/draft-preview", admin.draftResumePdf);
  r.post("/resume/draft-preview", admin.draftResumePdf);
  r.get("/resume/versions/:id/file", admin.resumeVersionFile);

  // Content types: /api/projects, /api/experience, /api/skills, …
  for (const name of resourceNames) {
    const c = contentController(name);
    const validate = validateBody(adapters[name].schema);
    r.get(`/${name}`, c.list);
    r.post(`/${name}`, validate, c.create);
    r.patch(`/${name}/reorder`, validateBody(reorderSchema), c.reorder);
    r.get(`/${name}/:id`, c.show);
    r.put(`/${name}/:id`, validate, c.update);
    r.delete(`/${name}/:id`, c.remove);
    if (adapters[name].publishable) {
      r.post(`/${name}/:id/publish`, c.publish);
      r.post(`/${name}/:id/unpublish`, c.unpublish);
    }
  }
  return r;
}
