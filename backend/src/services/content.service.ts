import sanitizeHtml from "sanitize-html";
import {
  achievementSchema,
  blogPostSchema,
  certificationSchema,
  educationSchema,
  experienceSchema,
  projectSchema,
  skillCategorySchema,
  skillSchema,
  socialLinkSchema,
  type AchievementInput,
  type BlogPostInput,
  type CertificationInput,
  type EducationInput,
  type ExperienceInput,
  type ProjectInput,
  type SiteSnapshot,
  type SkillCategoryInput,
  type SkillInput,
  type SocialLinkInput,
} from "@portfolio/shared";
import type { z } from "zod";
import { prisma, type Tx } from "../lib/prisma";
import { notFound } from "../utils/errors";
import { logActivity } from "./activity.service";
import { toAdminMedia } from "./media.service";
import { publishSite } from "./publish.service";
import { getLatestRevision } from "./revision.service";
import { fromYearMonth, toYearMonth } from "./snapshot.service";

/* eslint-disable @typescript-eslint/no-explicit-any -- Prisma delegates differ per model; the adapter keeps each one typed at its edges. */
type Delegate = {
  findMany(args?: any): Promise<any[]>;
  findUnique(args: any): Promise<any>;
  create(args: any): Promise<any>;
  update(args: any): Promise<any>;
  delete(args: any): Promise<any>;
  aggregate(args: any): Promise<any>;
};

type Adapter<Input> = {
  /** URL segment, e.g. "projects". */
  name: string;
  /** Human name for activity logs. */
  entity: string;
  schema: z.ZodType<Input>;
  /** Has DRAFT/PUBLISHED status (social links and categories don't). */
  publishable: boolean;
  delegate: (db: Tx) => Delegate;
  include?: object;
  orderBy?: object[];
  toData(input: Input): Record<string, unknown>;
  toAdmin(row: any): Record<string, unknown>;
  label(row: any): string;
  /** Ids of this resource in the published snapshot (for the "Live" badge). */
  liveIds(snapshot: SiteSnapshot): string[];
  /** Extra writes in the same transaction (e.g. project screenshots). */
  afterWrite?(tx: Tx, id: string, input: Input): Promise<void>;
};

const defaultOrder = [{ sortOrder: "asc" }, { createdAt: "asc" }];

/** Fields every publishable item shares, in the admin's shape. */
const itemFields = (row: any) => ({
  id: row.id,
  status: row.status,
  isVisible: row.isVisible,
  sortOrder: row.sortOrder,
  includeInResume: row.includeInResume,
  resumeSummary: row.resumeSummary,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});
const itemData = (input: { isVisible: boolean; includeInResume: boolean; resumeSummary: string }) => ({
  isVisible: input.isVisible,
  includeInResume: input.includeInResume,
  resumeSummary: input.resumeSummary,
});
const nullIfEmpty = (v: string) => (v === "" ? null : v);

/** Rich-text allow-list for blog posts. Everything else is stripped on save. */
export function sanitizeBlogHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "hr", "h2", "h3", "h4", "strong", "em", "s", "u", "code", "pre", "blockquote", "ul", "ol", "li", "a", "img"],
    allowedAttributes: { a: ["href", "title"], img: ["src", "alt", "width", "height"] },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
    // Allow our own uploaded images (relative /uploads/ paths).
    exclusiveFilter: (frame) => frame.tag === "img" && !/^(https:\/\/|\/uploads\/)/.test(frame.attribs.src ?? ""),
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow", target: "_blank" }),
    },
  });
}

export const adapters = {
  "social-links": {
    name: "social-links",
    entity: "social link",
    schema: socialLinkSchema,
    publishable: false,
    delegate: (db) => db.socialLink,
    toData: (i) => ({ label: i.label, url: i.url, icon: i.icon, isVisible: i.isVisible }),
    toAdmin: (r) => ({
      id: r.id,
      label: r.label,
      url: r.url,
      icon: r.icon,
      isVisible: r.isVisible,
      sortOrder: r.sortOrder,
      updatedAt: r.updatedAt.toISOString(),
    }),
    label: (r) => r.label,
    liveIds: (s) => s.socials.map((x) => x.id),
  } satisfies Adapter<SocialLinkInput>,

  "skill-categories": {
    name: "skill-categories",
    entity: "skill category",
    schema: skillCategorySchema,
    publishable: false,
    delegate: (db) => db.skillCategory,
    include: { _count: { select: { skills: true } } },
    toData: (i) => ({ name: i.name, isVisible: i.isVisible }),
    toAdmin: (r) => ({
      id: r.id,
      name: r.name,
      isVisible: r.isVisible,
      sortOrder: r.sortOrder,
      skillCount: r._count?.skills ?? 0,
      updatedAt: r.updatedAt.toISOString(),
    }),
    label: (r) => r.name,
    liveIds: (s) => s.skills.map((x) => x.id),
  } satisfies Adapter<SkillCategoryInput>,

  skills: {
    name: "skills",
    entity: "skill",
    schema: skillSchema,
    publishable: true,
    delegate: (db) => db.skill,
    include: { category: { select: { id: true, name: true, sortOrder: true } } },
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }, { createdAt: "asc" }],
    toData: (i) => ({ ...itemData(i), name: i.name, icon: i.icon, categoryId: i.categoryId }),
    toAdmin: (r) => ({ ...itemFields(r), name: r.name, icon: r.icon, categoryId: r.categoryId, categoryName: r.category?.name }),
    label: (r) => r.name,
    liveIds: (s) => s.skills.flatMap((c) => c.skills.map((x) => x.id)),
  } satisfies Adapter<SkillInput>,

  experience: {
    name: "experience",
    entity: "experience",
    schema: experienceSchema as unknown as z.ZodType<ExperienceInput>,
    publishable: true,
    delegate: (db) => db.experience,
    include: { logo: true },
    toData: (i) => ({
      ...itemData(i),
      company: i.company,
      designation: i.designation,
      employmentType: i.employmentType,
      location: i.location,
      startDate: fromYearMonth(i.startDate),
      endDate: i.isCurrent || !i.endDate ? null : fromYearMonth(i.endDate),
      isCurrent: i.isCurrent,
      summary: i.summary,
      responsibilities: i.responsibilities,
      achievements: i.achievements,
      technologies: i.technologies,
      logoId: i.logoId,
    }),
    toAdmin: (r) => ({
      ...itemFields(r),
      company: r.company,
      designation: r.designation,
      employmentType: r.employmentType,
      location: r.location,
      startDate: toYearMonth(r.startDate),
      endDate: r.endDate ? toYearMonth(r.endDate) : "",
      isCurrent: r.isCurrent,
      summary: r.summary,
      responsibilities: r.responsibilities,
      achievements: r.achievements,
      technologies: r.technologies,
      logoId: r.logoId,
      logo: r.logo ? toAdminMedia(r.logo) : null,
    }),
    label: (r) => `${r.designation} at ${r.company}`,
    liveIds: (s) => s.experiences.map((x) => x.id),
  } satisfies Adapter<ExperienceInput>,

  projects: {
    name: "projects",
    entity: "project",
    schema: projectSchema,
    publishable: true,
    delegate: (db) => db.project,
    include: { images: { orderBy: { sortOrder: "asc" }, include: { media: true } } },
    toData: (i) => ({
      ...itemData(i),
      title: i.title,
      slug: i.slug,
      summary: i.summary,
      description: i.description,
      technologies: i.technologies,
      category: i.category,
      githubUrl: nullIfEmpty(i.githubUrl),
      liveUrl: nullIfEmpty(i.liveUrl),
      isFeatured: i.isFeatured,
    }),
    toAdmin: (r) => ({
      ...itemFields(r),
      title: r.title,
      slug: r.slug,
      summary: r.summary,
      description: r.description,
      technologies: r.technologies,
      category: r.category,
      githubUrl: r.githubUrl ?? "",
      liveUrl: r.liveUrl ?? "",
      isFeatured: r.isFeatured,
      imageIds: (r.images ?? []).map((i: any) => i.mediaId),
      images: (r.images ?? []).map((i: any) => toAdminMedia(i.media)),
    }),
    label: (r) => r.title,
    liveIds: (s) => s.projects.map((x) => x.id),
    async afterWrite(tx, id, input) {
      await tx.projectImage.deleteMany({ where: { projectId: id } });
      const unique = [...new Set(input.imageIds)];
      if (unique.length) {
        await tx.projectImage.createMany({
          data: unique.map((mediaId, i) => ({ projectId: id, mediaId, sortOrder: i })),
        });
      }
    },
  } satisfies Adapter<ProjectInput>,

  education: {
    name: "education",
    entity: "education",
    schema: educationSchema,
    publishable: true,
    delegate: (db) => db.education,
    toData: (i) => ({
      ...itemData(i),
      institution: i.institution,
      degree: i.degree,
      field: i.field,
      location: i.location,
      startYear: i.startYear,
      endYear: i.endYear,
      summary: i.summary,
      courses: i.courses,
    }),
    toAdmin: (r) => ({
      ...itemFields(r),
      institution: r.institution,
      degree: r.degree,
      field: r.field,
      location: r.location,
      startYear: r.startYear,
      endYear: r.endYear,
      summary: r.summary,
      courses: r.courses,
    }),
    label: (r) => `${r.degree}, ${r.institution}`,
    liveIds: (s) => s.education.map((x) => x.id),
  } satisfies Adapter<EducationInput>,

  certifications: {
    name: "certifications",
    entity: "certification",
    schema: certificationSchema,
    publishable: true,
    delegate: (db) => db.certification,
    include: { image: true },
    toData: (i) => ({
      ...itemData(i),
      name: i.name,
      issuer: i.issuer,
      issueDate: fromYearMonth(i.issueDate),
      credentialUrl: nullIfEmpty(i.credentialUrl),
      imageId: i.imageId,
    }),
    toAdmin: (r) => ({
      ...itemFields(r),
      name: r.name,
      issuer: r.issuer,
      issueDate: toYearMonth(r.issueDate),
      credentialUrl: r.credentialUrl ?? "",
      imageId: r.imageId,
      image: r.image ? toAdminMedia(r.image) : null,
    }),
    label: (r) => r.name,
    liveIds: (s) => s.certifications.map((x) => x.id),
  } satisfies Adapter<CertificationInput>,

  achievements: {
    name: "achievements",
    entity: "achievement",
    schema: achievementSchema,
    publishable: true,
    delegate: (db) => db.achievement,
    toData: (i) => ({
      ...itemData(i),
      title: i.title,
      description: i.description,
      date: i.date ? fromYearMonth(i.date) : null,
      url: nullIfEmpty(i.url),
    }),
    toAdmin: (r) => ({
      ...itemFields(r),
      title: r.title,
      description: r.description,
      date: r.date ? toYearMonth(r.date) : "",
      url: r.url ?? "",
    }),
    label: (r) => r.title,
    liveIds: (s) => s.achievements.map((x) => x.id),
  } satisfies Adapter<AchievementInput>,

  blog: {
    name: "blog",
    entity: "blog post",
    schema: blogPostSchema,
    publishable: true,
    delegate: (db) => db.blogPost,
    include: { coverImage: true },
    orderBy: [{ createdAt: "desc" }],
    toData: (i) => ({
      title: i.title,
      slug: i.slug,
      excerpt: i.excerpt,
      contentHtml: sanitizeBlogHtml(i.contentHtml),
      category: i.category,
      tags: [...new Set(i.tags)],
      coverImageId: i.coverImageId,
      seoTitle: i.seoTitle,
      seoDescription: i.seoDescription,
    }),
    toAdmin: (r) => ({
      id: r.id,
      status: r.status,
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt,
      contentHtml: r.contentHtml,
      category: r.category,
      tags: r.tags,
      coverImageId: r.coverImageId,
      coverImage: r.coverImage ? toAdminMedia(r.coverImage) : null,
      seoTitle: r.seoTitle,
      seoDescription: r.seoDescription,
      publishedAt: r.publishedAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }),
    label: (r) => r.title,
    liveIds: (s) => s.blog.map((x) => x.id),
  } satisfies Adapter<BlogPostInput>,
} as const;

export type ResourceName = keyof typeof adapters;
export const resourceNames = Object.keys(adapters) as ResourceName[];
type AnyAdapter = Adapter<any>;
const get = (name: ResourceName) => adapters[name] as AnyAdapter;

async function liveState() {
  const latest = await getLatestRevision();
  const at = latest
    ? (await prisma.contentRevision.findUnique({ where: { id: latest.id }, select: { createdAt: true } }))?.createdAt
    : undefined;
  return { snapshot: latest?.snapshot ?? null, at };
}

function withFlags(a: AnyAdapter, row: any, live: Set<string>, at?: Date) {
  return {
    ...a.toAdmin(row),
    isLive: live.has(row.id),
    hasUnpublishedChanges: !at || row.updatedAt > at,
  };
}

export async function listItems(name: ResourceName) {
  const a = get(name);
  const [rows, { snapshot, at }] = await Promise.all([
    a.delegate(prisma).findMany({ include: a.include, orderBy: a.orderBy ?? defaultOrder }),
    liveState(),
  ]);
  const live = new Set(snapshot ? a.liveIds(snapshot) : []);
  return rows.map((r) => withFlags(a, r, live, at));
}

export async function getItem(name: ResourceName, id: string) {
  const a = get(name);
  const [row, { snapshot, at }] = await Promise.all([
    a.delegate(prisma).findUnique({ where: { id }, include: a.include }),
    liveState(),
  ]);
  if (!row) throw notFound(a.entity);
  return withFlags(a, row, new Set(snapshot ? a.liveIds(snapshot) : []), at);
}

type WriteOpts = { userId?: string; publish?: boolean };

async function maybePublish(a: AnyAdapter, id: string, label: string, opts: WriteOpts) {
  if (!opts.publish) return;
  await publishSite({ userId: opts.userId, label: `Published ${a.entity}: ${label}` });
}

export async function createItem(name: ResourceName, input: unknown, opts: WriteOpts) {
  const a = get(name);
  const data = a.toData(input);
  const row = await prisma.$transaction(async (tx) => {
    const max = await a.delegate(tx).aggregate({ _max: { sortOrder: true } });
    const created = await a.delegate(tx).create({
      data: {
        ...data,
        sortOrder: (max._max.sortOrder ?? -1) + 1,
        ...(a.publishable && opts.publish ? { status: "PUBLISHED" } : {}),
        ...(name === "blog" && opts.publish ? { publishedAt: new Date() } : {}),
      },
    });
    await a.afterWrite?.(tx, created.id, input);
    await logActivity(tx, { userId: opts.userId, action: "created", entity: a.entity, entityId: created.id, label: a.label(created) });
    return created;
  });
  await maybePublish(a, row.id, a.label(row), opts);
  return getItem(name, row.id);
}

export async function updateItem(name: ResourceName, id: string, input: unknown, opts: WriteOpts) {
  const a = get(name);
  const data = a.toData(input);
  const row = await prisma.$transaction(async (tx) => {
    const existing = await a.delegate(tx).findUnique({ where: { id } });
    if (!existing) throw notFound(a.entity);
    const updated = await a.delegate(tx).update({
      where: { id },
      data: {
        ...data,
        ...(a.publishable && opts.publish ? { status: "PUBLISHED" } : {}),
        ...(name === "blog" && opts.publish && !existing.publishedAt ? { publishedAt: new Date() } : {}),
      },
    });
    await a.afterWrite?.(tx, id, input);
    await logActivity(tx, { userId: opts.userId, action: "updated", entity: a.entity, entityId: id, label: a.label(updated) });
    return updated;
  });
  await maybePublish(a, id, a.label(row), opts);
  return getItem(name, id);
}

/** Publish or unpublish one item, then publish the site so it takes effect. */
export async function setItemStatus(name: ResourceName, id: string, status: "DRAFT" | "PUBLISHED", userId?: string) {
  const a = get(name);
  if (!a.publishable) throw notFound("Publish action");
  const row = await prisma.$transaction(async (tx) => {
    const existing = await a.delegate(tx).findUnique({ where: { id } });
    if (!existing) throw notFound(a.entity);
    const updated = await a.delegate(tx).update({
      where: { id },
      data: { status, ...(name === "blog" && status === "PUBLISHED" && !existing.publishedAt ? { publishedAt: new Date() } : {}) },
    });
    await logActivity(tx, {
      userId,
      action: status === "PUBLISHED" ? "published" : "unpublished",
      entity: a.entity,
      entityId: id,
      label: a.label(updated),
    });
    return updated;
  });
  await publishSite({
    userId,
    label: `${status === "PUBLISHED" ? "Published" : "Unpublished"} ${a.entity}: ${a.label(row)}`,
  });
  return getItem(name, id);
}

export async function deleteItem(name: ResourceName, id: string, userId?: string) {
  const a = get(name);
  await prisma.$transaction(async (tx) => {
    const existing = await a.delegate(tx).findUnique({ where: { id } });
    if (!existing) throw notFound(a.entity);
    await a.delegate(tx).delete({ where: { id } });
    await logActivity(tx, { userId, action: "deleted", entity: a.entity, entityId: id, label: a.label(existing) });
  });
}

/** Saves a new display order: `ids` in the order they should appear. */
export async function reorderItems(name: ResourceName, ids: string[], userId?: string) {
  const a = get(name);
  await prisma.$transaction(async (tx) => {
    for (const [index, id] of ids.entries()) {
      await a.delegate(tx).update({ where: { id }, data: { sortOrder: index } });
    }
    await logActivity(tx, { userId, action: "reordered", entity: a.entity, label: `Reordered ${a.entity} list` });
  });
}
