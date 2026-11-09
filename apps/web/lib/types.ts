/**
 * Content types for the public site.
 *
 * These mirror the shapes the backend API will return in Phase 3. In Phase 5
 * they move to `packages/shared` so the API, the admin forms and the site all
 * use one definition.
 */

export type SocialIcon = "github" | "linkedin" | "x" | "mail";

export type SocialLink = {
  id: string;
  label: string;
  url: string;
  icon: SocialIcon;
};

export type CallToAction = {
  label: string;
  href: string;
  variant: "primary" | "secondary";
};

export type Profile = {
  fullName: string;
  initials: string;
  title: string;
  yearsExperience: string;
  location: string;
  publicEmail: string;
  avatar: { url: string; width: number; height: number; alt: string };
  resumeUrl: string;
  availability?: string;
};

export type Hero = {
  eyebrow: string;
  heading: string;
  subheading: string;
  ctas: CallToAction[];
};

export type About = {
  biography: string[];
  specializations: string[];
  interests: string;
};

export type Experience = {
  id: string;
  company: string;
  designation: string;
  employmentType?: string;
  location?: string;
  /** ISO month, e.g. "2024-12" */
  startDate: string;
  /** ISO month; null while `isCurrent` */
  endDate: string | null;
  isCurrent: boolean;
  summary?: string;
  responsibilities: string[];
  technologies: string[];
};

export type ProjectImage = { url: string; alt: string; width: number; height: number };

export type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description?: string[];
  technologies: string[];
  category: string;
  githubUrl?: string;
  liveUrl?: string;
  isFeatured: boolean;
  images: ProjectImage[];
};

export type Skill = { id: string; name: string };

export type SkillCategory = {
  id: string;
  name: string;
  skills: Skill[];
};

export type Education = {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  location?: string;
  startYear?: number;
  endYear: number;
  summary?: string;
  courses: string[];
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
};

export type NavItem = { label: string; href: string };

export type SiteSettings = {
  siteTitle: string;
  seoTitle: string;
  seoDescription: string;
  navItems: NavItem[];
  footerText: string;
};

export type SiteContent = {
  settings: SiteSettings;
  profile: Profile;
  hero: Hero;
  about: About;
  socials: SocialLink[];
};
