import { ExternalLink, FileDown } from "lucide-react";
import type { Metadata } from "next";
import { EmptyState, PageHeader } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { RESUME_DOWNLOAD_URL, RESUME_PREVIEW_URL, getResumeInfo, getSite } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getSite();
  return {
    title: "Resume",
    description: `Download the latest resume of ${profile.fullName}, ${profile.headline}.`,
    alternates: { canonical: "/resume" },
  };
}

const dateFmt = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });

/**
 * The resume is generated from the same published content as this site, so
 * it is always current. The links below always serve the newest version.
 */
export default async function ResumePage() {
  const [{ profile }, resume] = await Promise.all([getSite(), getResumeInfo()]);

  return (
    <>
      <PageHeader
        eyebrow="Resume"
        title={`${profile.fullName} · Resume`}
        description={
          resume.available && resume.updatedAt
            ? `Always up to date. Last updated ${dateFmt.format(new Date(resume.updatedAt))}.`
            : "Always generated from the latest published information on this site."
        }
      />
      {resume.available ? (
        <>
          <div className="mb-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href={RESUME_DOWNLOAD_URL} download>
                <FileDown aria-hidden="true" /> Download PDF
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={RESUME_PREVIEW_URL} target="_blank" rel="noopener noreferrer">
                <ExternalLink aria-hidden="true" /> Open in new tab
              </a>
            </Button>
          </div>
          <div className="bg-card hidden overflow-hidden rounded-xl border md:block">
            <iframe
              title={`${profile.fullName} resume`}
              src={`${RESUME_PREVIEW_URL}?v=${resume.version}`}
              className="h-[80vh] w-full bg-white"
            />
          </div>
          <p className="text-muted-foreground text-sm md:hidden">On a phone? Use the buttons above to view or download the PDF.</p>
        </>
      ) : (
        <EmptyState title="Resume coming soon" description="Please check back shortly, or get in touch via the contact page." />
      )}
    </>
  );
}
