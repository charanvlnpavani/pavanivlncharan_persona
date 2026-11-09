import {
  RESUME_SECTION_KEYS,
  type ResumeSectionKey,
  type ResumeSettings,
  type ResumeSettingsInput,
  type ResumeVersionInfo,
  type SiteSnapshot,
} from "@portfolio/shared";
import type { Prisma, ResumeSettings as ResumeSettingsRow, ResumeVersion } from "../../generated/prisma/client";
import { logger } from "../../lib/logger";
import { prisma } from "../../lib/prisma";
import { logActivity } from "../activity.service";
import { sha256 } from "../auth.service";
import { buildSnapshot } from "../snapshot.service";
import { storage } from "../storage";
import { getPdfRenderer } from "./pdf-renderer";
import { buildResumeData } from "./resume-data";
import { renderResumeHtml } from "./templates";

const RESUME_LOCK_KEY = 724_012;
const RENDER_TIMEOUT_MS = 90_000;

export const DEFAULT_RESUME_SETTINGS: ResumeSettings = {
  template: "classic",
  fileName: "Resume.pdf",
  sectionOrder: [...RESUME_SECTION_KEYS],
  sections: Object.fromEntries(RESUME_SECTION_KEYS.map((k) => [k, true])) as Record<ResumeSectionKey, boolean>,
  maxProjects: 3,
  maxBulletsPerRole: 4,
  includePortfolioUrl: true,
  headlineOverride: null,
  summaryOverride: null,
};

function toSettings(row: ResumeSettingsRow | null): ResumeSettings {
  if (!row) return DEFAULT_RESUME_SETTINGS;
  const savedOrder = (row.sectionOrder as ResumeSectionKey[]).filter((k) => RESUME_SECTION_KEYS.includes(k));
  const sectionOrder = [...savedOrder, ...RESUME_SECTION_KEYS.filter((k) => !savedOrder.includes(k))];
  return {
    template: row.template === "modern" ? "modern" : "classic",
    fileName: row.fileName,
    sectionOrder,
    sections: { ...DEFAULT_RESUME_SETTINGS.sections, ...(row.sections as Record<ResumeSectionKey, boolean>) },
    maxProjects: row.maxProjects,
    maxBulletsPerRole: row.maxBulletsPerRole,
    includePortfolioUrl: row.includePortfolioUrl,
    headlineOverride: row.headlineOverride || null,
    summaryOverride: row.summaryOverride || null,
  };
}

export async function getResumeSettings() {
  return toSettings(await prisma.resumeSettings.findUnique({ where: { id: 1 } }));
}

export const settingsFromInput = (input: ResumeSettingsInput): ResumeSettings => ({
  ...input,
  headlineOverride: input.headlineOverride || null,
  summaryOverride: input.summaryOverride || null,
});

export async function saveResumeSettings(input: ResumeSettingsInput, userId?: string) {
  const data = {
    template: input.template,
    fileName: input.fileName,
    sectionOrder: input.sectionOrder as unknown as Prisma.InputJsonValue,
    sections: input.sections as unknown as Prisma.InputJsonValue,
    maxProjects: input.maxProjects,
    maxBulletsPerRole: input.maxBulletsPerRole,
    includePortfolioUrl: input.includePortfolioUrl,
    headlineOverride: input.headlineOverride,
    summaryOverride: input.summaryOverride,
  };
  await prisma.resumeSettings.upsert({ where: { id: 1 }, create: { id: 1, ...data }, update: data });
  await logActivity(prisma, { userId, action: "updated", entity: "resume-settings", label: "Resume settings" });
  // Settings shape the published resume directly, so regenerate now.
  void resumeQueue.request();
  return getResumeSettings();
}

function renderHtml(snapshot: SiteSnapshot, settings: ResumeSettings) {
  return renderResumeHtml(buildResumeData(snapshot, settings));
}

async function renderPdf(html: string) {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`PDF rendering timed out after ${RENDER_TIMEOUT_MS / 1000}s`)), RENDER_TIMEOUT_MS);
  });
  try {
    const pdf = await Promise.race([getPdfRenderer().render(html), timeout]);
    if (pdf.subarray(0, 5).toString("latin1") !== "%PDF-") throw new Error("Renderer did not return a valid PDF");
    return pdf;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Generates a resume for the latest published revision.
 *
 * Safety rules (acceptance tests 5, 8, 9):
 * - Only the published snapshot is used, never draft rows.
 * - The PDF is fully written to storage before the version is marked SUCCEEDED.
 * - `currentVersionId` moves only to a SUCCEEDED version, and only forward.
 *   A failure leaves the previous resume as the one recruiters download.
 * - If nothing on the resume changed, no new version is created.
 */
export async function generateLatestResume({ force = false } = {}): Promise<ResumeVersion | null> {
  const revision = await prisma.contentRevision.findFirst({ orderBy: { version: "desc" } });
  if (!revision) return null;

  const settings = await getResumeSettings();
  const html = renderHtml(revision.snapshot as unknown as SiteSnapshot, settings);
  const hash = sha256(html);

  const current = (await prisma.resumeSettings.findUnique({ where: { id: 1 }, include: { currentVersion: true } }))
    ?.currentVersion;
  if (!force && current?.status === "SUCCEEDED" && current.sha256 === hash) {
    return current; // Resume content unchanged; keep serving the same file.
  }

  const version = await prisma.resumeVersion.create({
    data: { revisionId: revision.id, template: settings.template, status: "PENDING" },
  });
  const started = Date.now();

  try {
    const pdf = await renderPdf(html);
    const storageKey = `resumes/resume-v${version.version}-${hash.slice(0, 12)}.pdf`;
    await storage.put(storageKey, pdf);

    return await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(${RESUME_LOCK_KEY})::text AS locked`;
      const done = await tx.resumeVersion.update({
        where: { id: version.id },
        data: {
          status: "SUCCEEDED",
          storageKey,
          sha256: hash,
          sizeBytes: pdf.length,
          durationMs: Date.now() - started,
          completedAt: new Date(),
        },
      });
      const settingsRow = await tx.resumeSettings.findUnique({
        where: { id: 1 },
        include: { currentVersion: { select: { version: true } } },
      });
      if (!settingsRow?.currentVersion || settingsRow.currentVersion.version < done.version) {
        await tx.resumeSettings.upsert({
          where: { id: 1 },
          create: {
            id: 1,
            sectionOrder: DEFAULT_RESUME_SETTINGS.sectionOrder as unknown as Prisma.InputJsonValue,
            sections: DEFAULT_RESUME_SETTINGS.sections as unknown as Prisma.InputJsonValue,
            currentVersionId: done.id,
          },
          update: { currentVersionId: done.id },
        });
      }
      logger.info({ version: done.version, revision: revision.version, ms: done.durationMs }, "Resume PDF generated");
      return done;
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ err: message, version: version.version }, "Resume generation failed; previous resume kept");
    return prisma.resumeVersion.update({
      where: { id: version.id },
      data: { status: "FAILED", error: message.slice(0, 1000), durationMs: Date.now() - started, completedAt: new Date() },
    });
  }
}

/**
 * Serial, coalescing job queue. Only one generation runs at a time; requests
 * that arrive meanwhile collapse into a single follow-up run that uses the
 * newest revision. Older revisions are never rendered after newer ones.
 */
class ResumeQueue {
  private running: Promise<void> | null = null;
  private again = false;
  private force = false;

  request(opts: { force?: boolean } = {}): Promise<void> {
    if (opts.force) this.force = true;
    if (this.running) {
      this.again = true;
      return this.running;
    }
    this.running = this.loop().finally(() => {
      this.running = null;
    });
    return this.running;
  }

  private async loop() {
    do {
      this.again = false;
      const force = this.force;
      this.force = false;
      try {
        await generateLatestResume({ force });
      } catch (err) {
        logger.error({ err }, "Resume queue error");
      }
    } while (this.again);
  }

  /** Resolves when no generation is running or queued. */
  async idle() {
    while (this.running) await this.running;
  }
}

export const resumeQueue = new ResumeQueue();

/** Admin-only: renders unpublished draft content to a PDF. Never stored, never public. */
export async function renderDraftPreview(override?: ResumeSettings) {
  const content = await buildSnapshot(prisma, "draft");
  const snapshot: SiteSnapshot = { ...content, version: 0, publishedAt: new Date().toISOString() };
  return renderPdf(renderHtml(snapshot, override ?? (await getResumeSettings())));
}

/** The file recruiters download: the current SUCCEEDED version, or null. */
export async function getCurrentResume() {
  const row = await prisma.resumeSettings.findUnique({ where: { id: 1 }, include: { currentVersion: true } });
  const v = row?.currentVersion;
  if (!row || !v || v.status !== "SUCCEEDED" || !v.storageKey) return null;
  return { version: v, fileName: row.fileName, data: await storage.get(v.storageKey) };
}

export async function getVersionFile(id: string) {
  const v = await prisma.resumeVersion.findUnique({ where: { id } });
  if (!v || v.status !== "SUCCEEDED" || !v.storageKey) return null;
  return { version: v, data: await storage.get(v.storageKey) };
}

export async function listResumeVersions(limit = 20): Promise<ResumeVersionInfo[]> {
  const [rows, settings] = await Promise.all([
    prisma.resumeVersion.findMany({
      orderBy: { version: "desc" },
      take: limit,
      include: { revision: { select: { version: true } } },
    }),
    prisma.resumeSettings.findUnique({ where: { id: 1 }, select: { currentVersionId: true } }),
  ]);
  return rows.map((r) => ({
    id: r.id,
    version: r.version,
    revisionVersion: r.revision.version,
    status: r.status,
    error: r.error,
    sizeBytes: r.sizeBytes,
    durationMs: r.durationMs,
    createdAt: r.createdAt.toISOString(),
    completedAt: r.completedAt?.toISOString() ?? null,
    isCurrent: r.id === settings?.currentVersionId,
  }));
}
