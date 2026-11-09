import type { Request, RequestHandler, Response } from "express";
import type { ContactInput } from "@portfolio/shared";
import { submitMessage } from "../services/contact.service";
import { getCurrentResume } from "../services/resume/resume.service";
import { getLatestRevision } from "../services/revision.service";
import { toPublicSite } from "../services/snapshot.service";
import { AppError, notFound } from "../utils/errors";

/**
 * Public, read-only endpoints. Everything comes from the latest published
 * ContentRevision, so draft content can never appear here.
 */

async function latestSnapshot() {
  const latest = await getLatestRevision();
  if (!latest) throw new AppError(503, "NOT_PUBLISHED", "The site has not been published yet");
  return latest.snapshot;
}

export const getSite: RequestHandler = async (_req, res) => {
  const snapshot = await latestSnapshot();
  res.set("Cache-Control", "public, max-age=0, must-revalidate");
  res.json(toPublicSite(snapshot));
};

export const getProject: RequestHandler = async (req, res) => {
  const snapshot = await latestSnapshot();
  const project = snapshot.projects.find((p) => p.slug === req.params.slug);
  if (!project) throw notFound("Project");
  res.json(project);
};

export const listBlog: RequestHandler = async (_req, res) => {
  const site = toPublicSite(await latestSnapshot());
  res.json(site.blog);
};

export const getBlogPost: RequestHandler = async (req, res) => {
  const snapshot = await latestSnapshot();
  const post = snapshot.blog.find((p) => p.slug === req.params.slug);
  if (!post) throw notFound("Post");
  res.json(post);
};

export const postContact: RequestHandler = async (req, res) => {
  await submitMessage(req.body as ContactInput, { ip: req.ip, userAgent: req.get("user-agent") });
  res.status(201).json({ ok: true, message: "Thanks! Your message has been sent." });
};

/* ───────────── Resume ───────────── */

function noResume(req: Request, res: Response) {
  res.set("Cache-Control", "no-store");
  if (req.accepts(["json", "html"]) === "html") {
    res
      .status(404)
      .type("html")
      .send(
        `<!doctype html><meta charset="utf-8"><title>Resume not available</title>` +
          `<body style="font-family:system-ui;max-width:32rem;margin:15vh auto;padding:0 1rem;line-height:1.5">` +
          `<h1 style="font-size:1.4rem">Resume not available yet</h1>` +
          `<p>A resume hasn't been published yet. Please check back soon.</p></body>`,
      );
    return;
  }
  res.status(404).json({ error: { code: "RESUME_NOT_AVAILABLE", message: "No resume has been published yet" } });
}

/** Metadata so the site can show "Updated <date>" next to the button. */
export const getResumeInfo: RequestHandler = async (_req, res) => {
  const current = await getCurrentResume().catch(() => null);
  res.set("Cache-Control", "no-cache");
  res.json(
    current
      ? {
          available: true,
          version: current.version.version,
          updatedAt: current.version.completedAt?.toISOString() ?? null,
          fileName: current.fileName,
          sizeBytes: current.version.sizeBytes,
        }
      : { available: false },
  );
};

/**
 * Stable URL that always returns the latest successfully generated resume.
 * `no-cache` + ETag: browsers and CDNs must check back every time, so a
 * recruiter never gets an outdated PDF, yet an unchanged file isn't re-sent.
 */
const sendResume =
  (disposition: "attachment" | "inline"): RequestHandler =>
  async (req, res) => {
    const current = await getCurrentResume();
    if (!current) return noResume(req, res);

    const etag = `"resume-v${current.version.version}-${(current.version.sha256 ?? "").slice(0, 12)}"`;
    res.set({
      "Cache-Control": "no-cache, must-revalidate",
      ETag: etag,
      "X-Resume-Version": String(current.version.version),
      "X-Content-Type-Options": "nosniff",
    });
    if (req.get("if-none-match") === etag) {
      res.status(304).end();
      return;
    }
    const name = current.fileName.replace(/[^A-Za-z0-9._-]/g, "_");
    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": String(current.data.length),
      "Content-Disposition": `${disposition}; filename="${name}"`,
    });
    res.send(current.data);
  };

export const downloadResume = sendResume("attachment");
export const previewResume = sendResume("inline");
