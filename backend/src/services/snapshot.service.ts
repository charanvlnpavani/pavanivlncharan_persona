import {
  HOME_SECTION_KEYS,
  initialsOf,
  type CallToAction,
  type HomeSection,
  type NavItem,
  type PublicSite,
  type ResumeMeta,
  type SiteSnapshot,
  type SocialIcon,
} from "@portfolio/shared";
import type { ContentStatus } from "../generated/prisma/client";
import type { Tx } from "../lib/prisma";
import { notFound } from "../utils/errors";
import { toMedia } from "./media.service";

export type SnapshotMode = "published" | "draft";

/** "YYYY-MM" from a DATE column. */
export const toYearMonth = (d: Date) => d.toISOString().slice(0, 7);
/** "YYYY-MM" → first day of that month (UTC). */
export const fromYearMonth = (ym: string) => new Date(`${ym}-01T00:00:00.000Z`);

const resumeMeta = (row: { includeInResume: boolean; resumeSummary: string }): ResumeMeta => ({
  include: row.includeInResume,
  summary: row.resumeSummary || null,
});

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/&[a-z#0-9]+;/gi, " ");
const readingMinutes = (html: string) =>
  Math.max(1, Math.round(stripHtml(html).split(/\s+/).filter(Boolean).length / 200));

/**
 * Builds the whole public site from the content tables.
 *
 * - "published": only rows with status PUBLISHED and isVisible. This becomes a
 *   ContentRevision, which is all the public site and the resume ever see.
 * - "draft": every visible row, drafts included. Used only for admin previews.
 */
export async function buildSnapshot(db: Tx, mode: SnapshotMode): Promise<Omit<SiteSnapshot, "version" | "publishedAt">> {
  const statusFilter: { status?: ContentStatus; isVisible: true } =
    mode === "published" ? { status: "PUBLISHED", isVisible: true } : { isVisible: true };
  const order = [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }];

  // Sequential on purpose: inside a transaction all queries share one
  // connection, and pg does not allow overlapping queries on it.
  const profile = await db.profile.findUnique({ where: { id: 1 }, include: { avatar: true } });
  const settings = await db.websiteSettings.findUnique({ where: { id: 1 } });
  const socials = await db.socialLink.findMany({ where: { isVisible: true }, orderBy: order });
  const categories = await db.skillCategory.findMany({
    where: { isVisible: true },
    orderBy: order,
    include: { skills: { where: statusFilter, orderBy: order } },
  });
  const experiences = await db.experience.findMany({ where: statusFilter, orderBy: order, include: { logo: true } });
  const projects = await db.project.findMany({
    where: statusFilter,
    orderBy: order,
    include: { images: { orderBy: { sortOrder: "asc" }, include: { media: true } } },
  });
  const education = await db.education.findMany({ where: statusFilter, orderBy: order });
  const certifications = await db.certification.findMany({ where: statusFilter, orderBy: order, include: { image: true } });
  const achievements = await db.achievement.findMany({ where: statusFilter, orderBy: order });
  const posts = await db.blogPost.findMany({
    where: statusFilter,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: { coverImage: true },
  });

  if (!profile || !settings) throw notFound("Profile or website settings (run the seed)");

  // Make sure every home section key appears exactly once, in saved order.
  const savedSections = (settings.homeSections as HomeSection[]).filter((s) => HOME_SECTION_KEYS.includes(s.key));
  const homeSections: HomeSection[] = [
    ...savedSections,
    ...HOME_SECTION_KEYS.filter((k) => !savedSections.some((s) => s.key === k)).map((key) => ({ key, visible: true })),
  ];

  return {
    settings: {
      siteTitle: settings.siteTitle,
      seoTitle: settings.seoTitle,
      seoDescription: settings.seoDescription,
      siteUrl: settings.siteUrl,
      navItems: settings.navItems as NavItem[],
      footerText: settings.footerText,
      defaultTheme: settings.defaultTheme as "light" | "dark" | "system",
      homeSections,
    },
    profile: {
      fullName: profile.fullName,
      initials: initialsOf(profile.fullName),
      headline: profile.headline,
      yearsExperience: profile.yearsExperience,
      location: profile.location,
      email: profile.email,
      phone: profile.phone || null,
      avatar: toMedia(profile.avatar),
      heroEyebrow: profile.heroEyebrow,
      heroHeading: profile.heroHeading,
      heroSubheading: profile.heroSubheading,
      heroCtas: profile.heroCtas as CallToAction[],
      summary: profile.summary,
      about: profile.about,
      specializations: profile.specializations,
      interests: profile.interests,
    },
    socials: socials.map((s) => ({ id: s.id, label: s.label, url: s.url, icon: s.icon as SocialIcon })),
    skills: categories
      .filter((c) => c.skills.length > 0)
      .map((c) => ({
        id: c.id,
        name: c.name,
        skills: c.skills.map((s) => ({ id: s.id, name: s.name, icon: s.icon || null, resume: resumeMeta(s) })),
      })),
    experiences: experiences
      .map((e) => ({
        id: e.id,
        company: e.company,
        designation: e.designation,
        employmentType: e.employmentType || null,
        location: e.location || null,
        startDate: toYearMonth(e.startDate),
        endDate: e.isCurrent || !e.endDate ? null : toYearMonth(e.endDate),
        isCurrent: e.isCurrent,
        summary: e.summary || null,
        responsibilities: e.responsibilities,
        achievements: e.achievements,
        technologies: e.technologies,
        logo: toMedia(e.logo),
        resume: resumeMeta(e),
      }))
      // Current roles first, then most recent end date.
      .sort(
        (a, b) =>
          (b.endDate ?? "9999-12").localeCompare(a.endDate ?? "9999-12") || b.startDate.localeCompare(a.startDate),
      ),
    projects: projects.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      description: p.description,
      technologies: p.technologies,
      category: p.category,
      githubUrl: p.githubUrl,
      liveUrl: p.liveUrl,
      isFeatured: p.isFeatured,
      images: p.images.map((i) => toMedia(i.media)!),
      resume: resumeMeta(p),
    })),
    education: education
      .map((e) => ({
        id: e.id,
        institution: e.institution,
        degree: e.degree,
        field: e.field || null,
        location: e.location || null,
        startYear: e.startYear,
        endYear: e.endYear,
        summary: e.summary || null,
        courses: e.courses,
        resume: resumeMeta(e),
      }))
      .sort((a, b) => b.endYear - a.endYear),
    certifications: certifications.map((c) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer,
      issueDate: toYearMonth(c.issueDate),
      credentialUrl: c.credentialUrl,
      image: toMedia(c.image),
      resume: resumeMeta(c),
    })),
    achievements: achievements.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description || null,
      date: a.date ? toYearMonth(a.date) : null,
      url: a.url,
      resume: resumeMeta(a),
    })),
    blog: posts.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      category: p.category || null,
      tags: p.tags,
      coverImage: toMedia(p.coverImage),
      publishedAt: (p.publishedAt ?? p.updatedAt).toISOString(),
      readingMinutes: readingMinutes(p.contentHtml),
      seoTitle: p.seoTitle || null,
      seoDescription: p.seoDescription || null,
      contentHtml: p.contentHtml,
    })),
  };
}

/** The public site payload: full snapshot minus blog bodies (fetched per post). */
export function toPublicSite(snapshot: SiteSnapshot): PublicSite {
  return {
    ...snapshot,
    blog: snapshot.blog.map(({ contentHtml: _omit, ...summary }) => summary),
  };
}
