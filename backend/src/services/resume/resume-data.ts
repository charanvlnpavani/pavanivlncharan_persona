import {
  formatDateRange,
  formatMonth,
  type ResumeSectionKey,
  type ResumeSettings,
  type ResumeTemplate,
  type SiteSnapshot,
} from "@portfolio/shared";

/**
 * Turns a published snapshot + resume settings into exactly what the PDF
 * shows. Everything the resume needs comes from here, so the website and the
 * resume always come from the same published content.
 */

type Link = { label: string; url: string; display: string };

export type ResumeSection =
  | { key: "summary"; title: string; text: string }
  | { key: "skills"; title: string; groups: { name: string; items: string[] }[] }
  | {
      key: "experience";
      title: string;
      items: { role: string; org: string; location: string | null; dates: string; summary: string | null; bullets: string[]; tech: string[] }[];
    }
  | { key: "projects"; title: string; items: { name: string; link: Link | null; summary: string; tech: string[] }[] }
  | { key: "education"; title: string; items: { degree: string; institution: string; location: string | null; dates: string; summary: string | null }[] }
  | { key: "certifications"; title: string; items: { name: string; issuer: string; date: string; link: Link | null }[] }
  | { key: "achievements"; title: string; items: { title: string; description: string | null; date: string | null }[] };

export type ResumeData = {
  template: ResumeTemplate;
  name: string;
  headline: string;
  contact: string[];
  links: Link[];
  sections: ResumeSection[];
};

const TITLES: Record<ResumeSectionKey, string> = {
  summary: "Professional Summary",
  skills: "Technical Skills",
  experience: "Professional Experience",
  projects: "Projects",
  education: "Education",
  certifications: "Certifications",
  achievements: "Achievements",
};

const displayUrl = (url: string) => url.replace(/^mailto:/, "").replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
const link = (label: string, url: string | null): Link | null => (url ? { label, url, display: displayUrl(url) } : null);

export function buildResumeData(snapshot: SiteSnapshot, settings: ResumeSettings): ResumeData {
  const { profile } = snapshot;

  const links: Link[] = snapshot.socials
    .filter((s) => !s.url.startsWith("mailto:"))
    .map((s) => ({ label: s.label, url: s.url, display: displayUrl(s.url) }));
  if (settings.includePortfolioUrl && snapshot.settings.siteUrl) {
    links.push({ label: "Portfolio", url: snapshot.settings.siteUrl, display: displayUrl(snapshot.settings.siteUrl) });
  }

  const builders: Record<ResumeSectionKey, () => ResumeSection | null> = {
    summary: () => {
      const text = settings.summaryOverride || profile.summary;
      return text ? { key: "summary", title: TITLES.summary, text } : null;
    },
    skills: () => {
      const groups = snapshot.skills
        .map((c) => ({ name: c.name, items: c.skills.filter((s) => s.resume.include).map((s) => s.name) }))
        .filter((g) => g.items.length > 0);
      return groups.length ? { key: "skills", title: TITLES.skills, groups } : null;
    },
    experience: () => {
      const items = snapshot.experiences
        .filter((e) => e.resume.include)
        .map((e) => ({
          role: e.designation,
          org: e.company,
          location: e.location,
          dates: formatDateRange(e.startDate, e.endDate, e.isCurrent),
          summary: e.resume.summary,
          bullets: [...e.achievements, ...e.responsibilities].slice(0, settings.maxBulletsPerRole),
          tech: e.technologies,
        }));
      return items.length ? { key: "experience", title: TITLES.experience, items } : null;
    },
    projects: () => {
      const items = snapshot.projects
        .filter((p) => p.resume.include)
        // Featured projects first, then the admin's order.
        .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
        .slice(0, settings.maxProjects)
        .map((p) => ({
          name: p.title,
          link: link(p.liveUrl ? "Live" : "Source", p.liveUrl ?? p.githubUrl),
          summary: p.resume.summary ?? p.summary,
          tech: p.technologies,
        }));
      return items.length ? { key: "projects", title: TITLES.projects, items } : null;
    },
    education: () => {
      const items = snapshot.education
        .filter((e) => e.resume.include)
        .map((e) => ({
          degree: [e.degree, e.field].filter(Boolean).join(", "),
          institution: e.institution,
          location: e.location,
          dates: e.startYear ? `${e.startYear} – ${e.endYear}` : String(e.endYear),
          summary: e.resume.summary ?? e.summary,
        }));
      return items.length ? { key: "education", title: TITLES.education, items } : null;
    },
    certifications: () => {
      const items = snapshot.certifications
        .filter((c) => c.resume.include)
        .map((c) => ({ name: c.name, issuer: c.issuer, date: formatMonth(c.issueDate), link: link("Credential", c.credentialUrl) }));
      return items.length ? { key: "certifications", title: TITLES.certifications, items } : null;
    },
    achievements: () => {
      const items = snapshot.achievements
        .filter((a) => a.resume.include)
        .map((a) => ({ title: a.title, description: a.resume.summary ?? a.description, date: a.date ? formatMonth(a.date) : null }));
      return items.length ? { key: "achievements", title: TITLES.achievements, items } : null;
    },
  };

  const sections = settings.sectionOrder
    .filter((key) => settings.sections[key])
    .map((key) => builders[key]())
    .filter((s): s is ResumeSection => s !== null);

  return {
    template: settings.template,
    name: profile.fullName,
    headline: settings.headlineOverride || profile.headline,
    contact: [profile.location, profile.email, profile.phone].filter((v): v is string => Boolean(v)),
    links,
    sections,
  };
}
