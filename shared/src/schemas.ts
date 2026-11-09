/**
 * Validation rules for every write. The backend enforces them on each request,
 * and the admin forms reuse them, so a form can never submit something the
 * API would reject.
 */
import { z } from "zod";
import {
  HOME_SECTION_KEYS,
  RESUME_SECTION_KEYS,
  RESUME_TEMPLATES,
  SOCIAL_ICONS,
} from "./types";

const text = (max: number) => z.string().trim().max(max);
const required = (max: number) => z.string().trim().min(1, "Required").max(max);

/** http(s) only, so `javascript:` URLs can never reach an href. Empty = none. */
export const urlOrEmpty = z.union([z.literal(""), z.url({ protocol: /^https?$/, message: "Must be an http(s) URL" }).max(500)]);
const socialUrl = z.url({ protocol: /^(https?|mailto)$/, message: "Must be an http(s) or mailto: URL" }).max(500);

/** A site path ("/projects", "/#about") or an http(s) URL. */
const href = z
  .string()
  .trim()
  .max(500)
  .refine((v) => /^\/(?!\/)/.test(v) || /^https?:\/\//.test(v) || /^mailto:/.test(v), "Use a path like /projects or a full URL");

const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM");
const yearMonthOrEmpty = z.union([z.literal(""), yearMonth]);
const lines = (maxItems: number, maxLen: number) => z.array(required(maxLen)).max(maxItems);
const mediaId = z.string().max(40).nullable();

/**
 * Fields every publishable list item shares. Publish status is deliberately
 * NOT here: it only changes through the Publish / Unpublish actions.
 */
const itemBase = {
  isVisible: z.boolean().default(true),
  includeInResume: z.boolean().default(true),
  resumeSummary: text(400).default(""),
};

export const loginSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1, "Required").max(200),
});

export const profileSchema = z.object({
  fullName: required(120),
  headline: required(120),
  yearsExperience: text(40),
  location: text(120),
  email: z.email().max(254),
  phone: text(40),
  avatarId: mediaId,
  heroEyebrow: text(160),
  heroHeading: required(200),
  heroSubheading: text(600),
  heroCtas: z
    .array(z.object({ label: required(40), href, variant: z.enum(["primary", "secondary"]) }))
    .max(3),
  summary: required(1500),
  about: lines(8, 2000),
  specializations: lines(12, 160),
  interests: text(600),
});

export const settingsSchema = z.object({
  siteTitle: required(80),
  seoTitle: required(120),
  seoDescription: required(300),
  siteUrl: z.url({ protocol: /^https?$/ }).max(200),
  footerText: text(300),
  defaultTheme: z.enum(["light", "dark", "system"]),
  navItems: z.array(z.object({ label: required(40), href })).max(10),
  homeSections: z
    .array(z.object({ key: z.enum(HOME_SECTION_KEYS), visible: z.boolean() }))
    .max(HOME_SECTION_KEYS.length),
});

export const socialLinkSchema = z.object({
  label: required(40),
  url: socialUrl,
  icon: z.enum(SOCIAL_ICONS),
  isVisible: z.boolean().default(true),
});

export const skillCategorySchema = z.object({
  name: required(60),
  isVisible: z.boolean().default(true),
});

export const skillSchema = z.object({
  ...itemBase,
  name: required(60),
  categoryId: required(40),
  icon: text(60),
});

export const experienceSchema = z
  .object({
    ...itemBase,
    company: required(120),
    designation: required(120),
    employmentType: text(40),
    location: text(120),
    startDate: yearMonth,
    endDate: yearMonthOrEmpty,
    isCurrent: z.boolean().default(false),
    summary: text(1000),
    responsibilities: lines(12, 400),
    achievements: lines(12, 400),
    technologies: lines(30, 60),
    logoId: mediaId,
  })
  .refine((v) => v.isCurrent || v.endDate !== "", { path: ["endDate"], message: "Add an end date or mark as current" })
  .refine((v) => v.isCurrent || v.endDate === "" || v.endDate >= v.startDate, {
    path: ["endDate"],
    message: "End date is before start date",
  });

export const projectSchema = z.object({
  ...itemBase,
  title: required(120),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes"),
  summary: required(400),
  description: lines(10, 3000),
  technologies: lines(30, 60),
  category: required(60),
  githubUrl: urlOrEmpty,
  liveUrl: urlOrEmpty,
  isFeatured: z.boolean().default(false),
  imageIds: z.array(z.string().max(40)).max(10),
});

export const educationSchema = z.object({
  ...itemBase,
  institution: required(160),
  degree: required(120),
  field: text(120),
  location: text(120),
  startYear: z.number().int().min(1950).max(2100).nullable(),
  endYear: z.number().int().min(1950).max(2100),
  summary: text(800),
  courses: lines(20, 120),
});

export const certificationSchema = z.object({
  ...itemBase,
  name: required(160),
  issuer: required(120),
  issueDate: yearMonth,
  credentialUrl: urlOrEmpty,
  imageId: mediaId,
});

export const achievementSchema = z.object({
  ...itemBase,
  title: required(160),
  description: text(800),
  date: yearMonthOrEmpty,
  url: urlOrEmpty,
});

export const blogPostSchema = z.object({
  title: required(160),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes"),
  excerpt: required(400),
  contentHtml: z.string().max(200_000),
  category: text(60),
  tags: z.array(required(40)).max(12),
  coverImageId: mediaId,
  seoTitle: text(120),
  seoDescription: text(300),
});

export const resumeSettingsSchema = z.object({
  template: z.enum(RESUME_TEMPLATES),
  fileName: z
    .string()
    .trim()
    .max(100)
    .regex(/^[A-Za-z0-9._-]+\.pdf$/, "Letters, numbers, dot, dash or underscore, ending in .pdf"),
  sectionOrder: z.array(z.enum(RESUME_SECTION_KEYS)).length(RESUME_SECTION_KEYS.length),
  sections: z.object(
    Object.fromEntries(RESUME_SECTION_KEYS.map((k) => [k, z.boolean()])) as Record<
      (typeof RESUME_SECTION_KEYS)[number],
      z.ZodBoolean
    >,
  ),
  maxProjects: z.number().int().min(0).max(20),
  maxBulletsPerRole: z.number().int().min(1).max(10),
  includePortfolioUrl: z.boolean(),
  headlineOverride: text(120),
  summaryOverride: text(1500),
});

export const contactSchema = z.object({
  name: required(120),
  email: z.email().max(254),
  subject: text(160),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(5000),
  /** Honeypot: hidden from people, bots fill it in. Must stay empty. */
  website: z.string().max(0).optional().default(""),
});

export const messageStatusSchema = z.object({
  status: z.enum(["NEW", "READ", "ARCHIVED", "SPAM"]),
});

export const reorderSchema = z.object({
  ids: z.array(z.string().max(40)).min(1).max(500),
});

export const mediaUpdateSchema = z.object({ alt: text(200) });

export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
export type SkillCategoryInput = z.infer<typeof skillCategorySchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type CertificationInput = z.infer<typeof certificationSchema>;
export type AchievementInput = z.infer<typeof achievementSchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type ResumeSettingsInput = z.infer<typeof resumeSettingsSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
