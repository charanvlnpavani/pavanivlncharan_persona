import { FileDown, Mail, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { ContactForm } from "@/components/site/contact-form";
import { PageHeader } from "@/components/site/section";
import { SocialIconGlyph } from "@/components/site/social-links";
import { Button } from "@/components/ui/button";
import { RESUME_DOWNLOAD_URL, getResumeInfo, getSite } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getSite();
  return { title: "Contact", description: `Get in touch with ${profile.fullName}.`, alternates: { canonical: "/contact" } };
}

export default async function ContactPage() {
  const [{ profile, socials }, resume] = await Promise.all([getSite(), getResumeInfo()]);
  const profiles = socials.filter((s) => !s.url.startsWith("mailto:"));

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let’s talk"
        description="Whether it’s a role, a project or just a question, send a message below or email me directly."
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        <ContactForm />

        <div className="space-y-5">
          <div className="bg-card rounded-2xl border p-6">
            <Mail className="text-brand size-5" aria-hidden="true" />
            <h2 className="mt-3 font-semibold">Email</h2>
            <a href={`mailto:${profile.email}`} className="text-muted-foreground hover:text-foreground mt-1 block break-all transition-colors">
              {profile.email}
            </a>
            {profile.location && (
              <p className="text-muted-foreground mt-4 inline-flex items-center gap-1.5 text-sm">
                <MapPin className="size-4" aria-hidden="true" /> {profile.location}
              </p>
            )}
            {resume.available && (
              <Button asChild variant="outline" className="mt-5 w-full">
                <a href={RESUME_DOWNLOAD_URL} download>
                  <FileDown aria-hidden="true" /> Download resume
                </a>
              </Button>
            )}
          </div>

          {profiles.length > 0 && (
            <div className="bg-card rounded-2xl border p-6">
              <h2 className="font-semibold">Find me online</h2>
              <ul className="mt-3 divide-y">
                {profiles.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group hover:text-brand flex items-center gap-3 py-3 transition-colors"
                    >
                      <SocialIconGlyph icon={s.icon} className="text-muted-foreground group-hover:text-brand size-4" />
                      <span className="font-medium">{s.label}</span>
                      <span className="text-muted-foreground ml-auto truncate text-sm">
                        {s.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
