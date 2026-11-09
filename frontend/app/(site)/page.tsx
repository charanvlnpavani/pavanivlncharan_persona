import type { HomeSectionKey, PublicSite } from "@portfolio/shared";
import { Check, FileDown, Mail } from "lucide-react";
import Link from "next/link";
import { AchievementList } from "@/components/site/achievement-list";
import { BlogList } from "@/components/site/blog-list";
import { CertificationList, EducationList } from "@/components/site/education-list";
import { ExperienceTimeline } from "@/components/site/experience-timeline";
import { Hero } from "@/components/site/hero";
import { JsonLd } from "@/components/site/json-ld";
import { ProjectCard } from "@/components/site/project-card";
import { Section } from "@/components/site/section";
import { SkillGroups } from "@/components/site/skill-groups";
import { Button } from "@/components/ui/button";
import { RESUME_DOWNLOAD_URL, getResumeInfo, getSite } from "@/lib/api";
import { siteUrl } from "@/lib/site";

/**
 * Homepage. Section order and visibility come from Website settings in the
 * admin; sections with no published content are skipped automatically.
 */
export default async function HomePage() {
  const [site, resume] = await Promise.all([getSite(), getResumeInfo()]);
  const { profile, socials, settings } = site;

  const sections: Record<HomeSectionKey, () => React.ReactNode> = {
    about: () => <About site={site} />,
    projects: () => {
      const featured = site.projects.filter((p) => p.isFeatured);
      const list = featured.length ? featured : site.projects.slice(0, 3);
      return list.length ? (
        <Section id="projects" eyebrow="Selected work" title="Featured projects" more={{ label: "All projects", href: "/projects" }}>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </Section>
      ) : null;
    },
    experience: () =>
      site.experiences.length ? (
        <Section id="experience" eyebrow="Career" title="Experience" more={{ label: "Full history", href: "/experience" }}>
          <ExperienceTimeline items={site.experiences} compact />
        </Section>
      ) : null,
    skills: () =>
      site.skills.length ? (
        <Section id="skills" eyebrow="Toolkit" title="Skills" more={{ label: "All skills", href: "/skills" }}>
          <SkillGroups categories={site.skills} />
        </Section>
      ) : null,
    education: () =>
      site.education.length ? (
        <Section id="education" eyebrow="Background" title="Education">
          <EducationList items={site.education} />
        </Section>
      ) : null,
    certifications: () =>
      site.certifications.length ? (
        <Section id="certifications" eyebrow="Credentials" title="Certifications">
          <CertificationList items={site.certifications} />
        </Section>
      ) : null,
    achievements: () =>
      site.achievements.length ? (
        <Section id="achievements" eyebrow="Recognition" title="Achievements">
          <AchievementList items={site.achievements} />
        </Section>
      ) : null,
    blog: () =>
      site.blog.length ? (
        <Section id="blog" eyebrow="Writing" title="Latest articles" more={{ label: "All articles", href: "/blog" }}>
          <BlogList posts={site.blog.slice(0, 3)} />
        </Section>
      ) : null,
    contact: () => (
      <Section id="contact" eyebrow="Contact" title="Let’s work together">
        <div className="bg-card flex flex-col gap-6 rounded-2xl border p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
          <p className="text-muted-foreground max-w-xl text-lg">Have a role, a project or a question? Send me a message, or grab my resume.</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/contact">
                <Mail aria-hidden="true" /> Contact me
              </Link>
            </Button>
            {resume.available && (
              <Button asChild size="lg" variant="outline">
                <a href={RESUME_DOWNLOAD_URL} download>
                  <FileDown aria-hidden="true" /> Download resume
                </a>
              </Button>
            )}
          </div>
        </div>
      </Section>
    ),
  };

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: profile.fullName,
          jobTitle: profile.headline,
          url: siteUrl,
          ...(profile.avatar ? { image: `${siteUrl}${profile.avatar.url}` } : {}),
          email: `mailto:${profile.email}`,
          address: { "@type": "PostalAddress", addressLocality: profile.location },
          sameAs: socials.filter((s) => !s.url.startsWith("mailto:")).map((s) => s.url),
        }}
      />
      <Hero profile={profile} socials={socials} resumeAvailable={resume.available} />
      {settings.homeSections
        .filter((s) => s.visible)
        .map((s) => (
          <div key={s.key}>{sections[s.key]()}</div>
        ))}
    </>
  );
}

function About({ site }: { site: PublicSite }) {
  const { profile } = site;
  return (
    <Section id="about" eyebrow="About" title="Building reliable products end to end">
      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="text-muted-foreground space-y-4 leading-relaxed">
          {(profile.about.length ? profile.about : [profile.summary]).map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>
        <aside className="bg-card h-fit rounded-xl border p-6">
          {profile.specializations.length > 0 && (
            <>
              <h3 className="text-muted-foreground font-mono text-xs tracking-wider uppercase">Specializations</h3>
              <ul className="mt-4 space-y-3">
                {profile.specializations.map((s) => (
                  <li key={s} className="flex gap-3 text-sm">
                    <Check className="text-brand mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    {s}
                  </li>
                ))}
              </ul>
            </>
          )}
          <dl className="mt-6 grid grid-cols-2 gap-4 border-t pt-6 text-sm first:mt-0 first:border-t-0 first:pt-0">
            {profile.yearsExperience && (
              <div>
                <dt className="text-muted-foreground">Experience</dt>
                <dd className="mt-1 font-medium">{profile.yearsExperience}</dd>
              </div>
            )}
            {profile.location && (
              <div>
                <dt className="text-muted-foreground">Based in</dt>
                <dd className="mt-1 font-medium">{profile.location}</dd>
              </div>
            )}
          </dl>
          {profile.interests && <p className="text-muted-foreground mt-6 border-t pt-6 text-sm">{profile.interests}</p>}
        </aside>
      </div>
    </Section>
  );
}
