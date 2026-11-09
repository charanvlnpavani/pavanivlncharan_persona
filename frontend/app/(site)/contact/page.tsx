import { FileDown, Mail, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/section";
import { SocialIconGlyph } from "@/components/site/social-links";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Pavani VLN Charan.",
  alternates: { canonical: "/contact" },
};

/* The contact form (stored messages, spam protection) arrives in Phase 5
   once the backend exists. Until then this page lists direct channels. */
export default async function ContactPage() {
  const { profile, socials } = await getSiteContent();
  const profiles = socials.filter((s) => !s.url.startsWith("mailto:"));

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let’s talk"
        description="Whether it’s a role, a project or just a question, email is the quickest way to reach me."
      />
      <div className="grid gap-5 md:grid-cols-2">
        <div className="bg-card rounded-2xl border p-8">
          <Mail className="text-brand size-6" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold">Email</h2>
          <a
            href={`mailto:${profile.publicEmail}`}
            className="text-muted-foreground hover:text-foreground mt-1 block break-all transition-colors"
          >
            {profile.publicEmail}
          </a>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <a href={`mailto:${profile.publicEmail}`}>Send an email</a>
            </Button>
            <Button asChild variant="outline">
              <a href={profile.resumeUrl} download>
                <FileDown aria-hidden="true" /> Resume
              </a>
            </Button>
          </div>
          <p className="text-muted-foreground mt-6 inline-flex items-center gap-1.5 text-sm">
            <MapPin className="size-4" aria-hidden="true" /> {profile.location}
          </p>
        </div>

        <div className="bg-card rounded-2xl border p-8">
          <h2 className="text-lg font-semibold">Find me online</h2>
          <ul className="mt-4 divide-y">
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
      </div>
    </>
  );
}
