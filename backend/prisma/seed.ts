/**
 * Seeds the database with the content migrated from the old portfolio, then
 * publishes version 1 and generates the first resume PDF.
 *
 *   npm run db:seed            # only if the database is empty (safe default)
 *   npm run db:seed -- --reset # wipe content tables and re-import
 *
 * It never touches admin accounts.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prisma } from "../src/lib/prisma";
import { saveUpload } from "../src/services/media.service";
import { publishSite } from "../src/services/publish.service";
import { getPdfRenderer } from "../src/services/resume/pdf-renderer";
import { resumeQueue } from "../src/services/resume/resume.service";
import { storage } from "../src/services/storage";
import * as data from "./seed-data";

const here = path.dirname(fileURLToPath(import.meta.url));
const ym = (v: string) => new Date(`${v}-01T00:00:00.000Z`);

export async function wipeContent() {
  // Remove stored files too, so a reset doesn't leave orphans on disk.
  const [media, resumes] = await Promise.all([
    prisma.mediaAsset.findMany({ select: { storageKey: true } }),
    prisma.resumeVersion.findMany({ where: { storageKey: { not: null } }, select: { storageKey: true } }),
  ]);
  for (const { storageKey } of [...media, ...resumes]) {
    if (storageKey) await storage.delete(storageKey).catch(() => {});
  }
  await prisma.$transaction([
    prisma.resumeSettings.deleteMany(),
    prisma.resumeVersion.deleteMany(),
    prisma.contentRevision.deleteMany(),
    prisma.activityLog.deleteMany(),
    prisma.projectImage.deleteMany(),
    prisma.project.deleteMany(),
    prisma.skill.deleteMany(),
    prisma.skillCategory.deleteMany(),
    prisma.experience.deleteMany(),
    prisma.education.deleteMany(),
    prisma.certification.deleteMany(),
    prisma.achievement.deleteMany(),
    prisma.blogPost.deleteMany(),
    prisma.socialLink.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.websiteSettings.deleteMany(),
    prisma.mediaAsset.deleteMany(),
  ]);
}

/** Imports the migrated content. Everything is created as PUBLISHED. */
export async function seedContent(opts: { withPhoto?: boolean; siteUrl?: string } = {}) {
  let avatarId: string | null = null;
  if (opts.withPhoto !== false) {
    const buffer = await readFile(path.join(here, "seed-assets/profile.jpeg"));
    const asset = await saveUpload({ buffer, originalname: "profile.jpeg" }, "Portrait of Pavani VLN Charan");
    avatarId = asset.id;
  }

  await prisma.profile.create({ data: { id: 1, ...data.profile, avatarId } });
  await prisma.websiteSettings.create({
    data: { id: 1, ...data.settings, siteUrl: opts.siteUrl ?? process.env.PUBLIC_SITE_URL ?? data.settings.siteUrl },
  });
  await prisma.resumeSettings.create({ data: { id: 1, ...data.resumeSettings } });

  await prisma.socialLink.createMany({ data: data.socials.map((s, i) => ({ ...s, sortOrder: i })) });

  for (const [ci, cat] of data.skillCategories.entries()) {
    await prisma.skillCategory.create({
      data: {
        name: cat.name,
        sortOrder: ci,
        skills: { create: cat.skills.map((name, si) => ({ name, sortOrder: si, status: "PUBLISHED" })) },
      },
    });
  }

  await prisma.experience.createMany({
    data: data.experiences.map((e, i) => ({
      ...e,
      startDate: ym(e.startDate),
      endDate: ym(e.endDate),
      achievements: [],
      status: "PUBLISHED" as const,
      sortOrder: i,
    })),
  });

  await prisma.project.createMany({
    data: data.projects.map((p, i) => ({ ...p, status: "PUBLISHED" as const, sortOrder: i })),
  });

  await prisma.education.createMany({
    data: data.education.map((e, i) => ({ ...e, courses: [], status: "PUBLISHED" as const, sortOrder: i })),
  });
}

async function main() {
  const reset = process.argv.includes("--reset");
  const hasContent = (await prisma.profile.count()) > 0;

  if (hasContent && !reset) {
    console.log("Content already exists. Nothing to do. (Use `npm run db:seed -- --reset` to re-import.)");
    return;
  }
  if (reset) {
    console.log("Resetting content tables (admin accounts are kept)…");
    await wipeContent();
  }

  console.log("Importing portfolio content…");
  await seedContent();

  console.log("Publishing version 1…");
  const revision = await publishSite({ label: "Initial import from the old portfolio" });

  console.log("Generating the first resume PDF…");
  await resumeQueue.idle();
  const version = await prisma.resumeVersion.findFirst({ orderBy: { version: "desc" } });
  console.log(
    version?.status === "SUCCEEDED"
      ? `Done. Site version ${revision.version}, resume v${version.version} (${version.sizeBytes} bytes).`
      : `Site version ${revision.version} published, but the resume failed: ${version?.error ?? "unknown error"}. Retry from the admin Resume page.`,
  );
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectRun) {
  main()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(async () => {
      await getPdfRenderer().close?.();
      await prisma.$disconnect();
    });
}
