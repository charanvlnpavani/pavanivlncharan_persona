/**
 * Public content shapes.
 *
 * `SiteSnapshot` is what one published ContentRevision contains. The public
 * website, the resume generator and the admin draft preview all render from
 * this one shape, so the three can never drift apart.
 */

export const HOME_SECTION_KEYS = [
  "about",
  "projects",
  "experience",
  "skills",
  "education",
  "certifications",
  "achievements",
  "blog",
  "contact",
] as const;
export type HomeSectionKey = (typeof HOME_SECTION_KEYS)[number];

export const RESUME_SECTION_KEYS = [
  "summary",
  "skills",
  "experience",
  "projects",
  "education",
  "certifications",
  "achievements",
] as const;
export type ResumeSectionKey = (typeof RESUME_SECTION_KEYS)[number];

export const RESUME_TEMPLATES = ["classic", "modern"] as const;
export type ResumeTemplate = (typeof RESUME_TEMPLATES)[number];

export const SOCIAL_ICONS = ["github", "linkedin", "x", "mail", "website"] as const;
export type SocialIcon = (typeof SOCIAL_ICONS)[number];

export type ContentStatus = "DRAFT" | "PUBLISHED";

export type Media = {
  id: string;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
};

/** Resume-only overrides carried by each list item. */
export type ResumeMeta = {
  include: boolean;
  summary: string | null;
};

export type NavItem = { label: string; href: string };
export type CallToAction = { label: string; href: string; variant: "primary" | "secondary" };
export type HomeSection = { key: HomeSectionKey; visible: boolean };

export type SiteSettings = {
  siteTitle: string;
  seoTitle: string;
  seoDescription: string;
  navItems: NavItem[];
  footerText: string;
  defaultTheme: "light" | "dark" | "system";
  homeSections: HomeSection[];
  siteUrl: string;
};

export type Profile = {
  fullName: string;
  initials: string;
  headline: string;
  yearsExperience: string;
  location: string;
  email: string;
  phone: string | null;
  avatar: Media | null;
  heroEyebrow: string;
  heroHeading: string;
  heroSubheading: string;
  heroCtas: CallToAction[];
  summary: string;
  about: string[];
  specializations: string[];
  interests: string;
};

export type SocialLink = { id: string; label: string; url: string; icon: SocialIcon };

export type Skill = { id: string; name: string; icon: string | null; resume: ResumeMeta };
export type SkillCategory = { id: string; name: string; skills: Skill[] };

export type Experience = {
  id: string;
  company: string;
  designation: string;
  employmentType: string | null;
  location: string | null;
  /** "YYYY-MM" */
  startDate: string;
  /** "YYYY-MM", null while current */
  endDate: string | null;
  isCurrent: boolean;
  summary: string | null;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
  logo: Media | null;
  resume: ResumeMeta;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string[];
  technologies: string[];
  category: string;
  githubUrl: string | null;
  liveUrl: string | null;
  isFeatured: boolean;
  images: Media[];
  resume: ResumeMeta;
};

export type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string | null;
  location: string | null;
  startYear: number | null;
  endYear: number;
  summary: string | null;
  courses: string[];
  resume: ResumeMeta;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  /** "YYYY-MM" */
  issueDate: string;
  credentialUrl: string | null;
  image: Media | null;
  resume: ResumeMeta;
};

export type Achievement = {
  id: string;
  title: string;
  description: string | null;
  /** "YYYY-MM" or null */
  date: string | null;
  url: string | null;
  resume: ResumeMeta;
};

export type BlogPostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string | null;
  tags: string[];
  coverImage: Media | null;
  publishedAt: string;
  readingMinutes: number;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type BlogPost = BlogPostSummary & { contentHtml: string };

export type SiteSnapshot = {
  version: number;
  publishedAt: string;
  settings: SiteSettings;
  profile: Profile;
  socials: SocialLink[];
  skills: SkillCategory[];
  experiences: Experience[];
  projects: Project[];
  education: Education[];
  certifications: Certification[];
  achievements: Achievement[];
  blog: BlogPost[];
};

/** `GET /api/public/site`: the snapshot without full blog bodies. */
export type PublicSite = Omit<SiteSnapshot, "blog"> & { blog: BlogPostSummary[] };

export type ResumeSettings = {
  template: ResumeTemplate;
  fileName: string;
  sectionOrder: ResumeSectionKey[];
  sections: Record<ResumeSectionKey, boolean>;
  maxProjects: number;
  maxBulletsPerRole: number;
  includePortfolioUrl: boolean;
  headlineOverride: string | null;
  summaryOverride: string | null;
};

export type ResumeVersionStatus = "PENDING" | "SUCCEEDED" | "FAILED";

export type ResumeVersionInfo = {
  id: string;
  version: number;
  revisionVersion: number;
  status: ResumeVersionStatus;
  error: string | null;
  sizeBytes: number | null;
  durationMs: number | null;
  createdAt: string;
  completedAt: string | null;
  isCurrent: boolean;
};

export type ApiErrorBody = {
  error: { code: string; message: string; details?: unknown };
};
