import { Check, FileDown, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EducationList } from "@/components/site/education-list";
import { ExperienceTimeline } from "@/components/site/experience-timeline";
import { Hero } from "@/components/site/hero";
import { JsonLd } from "@/components/site/json-ld";
import { ProjectCard } from "@/components/site/project-card";
import { EmptyState, Section } from "@/components/site/section";
import { SkillGroups } from "@/components/site/skill-groups";
import {
  getEducation,
  getExperiences,
  getFeaturedProjects,
  getSiteContent,
  getSkillCategories,
} from "@/lib/content";
import { siteUrl } from "@/lib/site";

export default async function HomePage() {
  const [{ profile, hero, about, socials }, featured, experiences, skills, education] =
    await Promise.all([
      getSiteContent(),
      getFeaturedProjects(),
      getExperiences(),
      getSkillCategories(),
      getEducation(),
    ]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: profile.fullName,
          jobTitle: profile.title,
          url: siteUrl,
          image: `${siteUrl}${profile.avatar.url}`,
          email: `mailto:${profile.publicEmail}`,
          address: { "@type": "PostalAddress", addressLocality: profile.location },
          sameAs: socials.filter((s) => !s.url.startsWith("mailto:")).map((s) => s.url),
        }}
      />

      <Hero hero={hero} profile={profile} socials={socials} />

      <Section id="about" eyebrow="About" title="Building reliable products end to end">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="text-muted-foreground space-y-4 leading-relaxed">
            {about.biography.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>
          <aside className="bg-card h-fit rounded-xl border p-6">
            <h3 className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
              Specializations
            </h3>
            <ul className="mt-4 space-y-3">
              {about.specializations.map((s) => (
                <li key={s} className="flex gap-3 text-sm">
                  <Check className="text-brand mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {s}
                </li>
              ))}
            </ul>
            <dl className="mt-6 grid grid-cols-2 gap-4 border-t pt-6 text-sm">
              <div>
                <dt className="text-muted-foreground">Experience</dt>
                <dd className="mt-1 font-medium">{profile.yearsExperience}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Based in</dt>
                <dd className="mt-1 font-medium">{profile.location}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </Section>

      <Section
        id="projects"
        eyebrow="Selected work"
        title="Featured projects"
        more={{ label: "All projects", href: "/projects" }}
      >
        {featured.length === 0 ? (
          <EmptyState title="Projects coming soon" />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </Section>

      <Section
        id="experience"
        eyebrow="Career"
        title="Experience"
        more={{ label: "Full history", href: "/experience" }}
      >
        <ExperienceTimeline items={experiences} compact />
      </Section>

      <Section id="skills" eyebrow="Toolkit" title="Skills" more={{ label: "All skills", href: "/skills" }}>
        <SkillGroups categories={skills} />
      </Section>

      <Section id="education" eyebrow="Background" title="Education">
        <EducationList items={education} />
      </Section>

      <Section id="contact" eyebrow="Contact" title="Let’s work together">
        <div className="bg-card flex flex-col gap-6 rounded-2xl border p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
          <p className="text-muted-foreground max-w-xl text-lg">
            Have a role, a project or a question? Send me a message, or grab my resume.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href={`mailto:${profile.publicEmail}`}>
                <Mail aria-hidden="true" /> Email me
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={profile.resumeUrl} download>
                <FileDown aria-hidden="true" /> Resume
              </a>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
