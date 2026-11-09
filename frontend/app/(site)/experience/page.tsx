import type { Metadata } from "next";
import { ExperienceTimeline } from "@/components/site/experience-timeline";
import { EmptyState, PageHeader } from "@/components/site/section";
import { getSite } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getSite();
  return {
    title: "Experience",
    description: `Professional experience of ${profile.fullName}, ${profile.headline}.`,
    alternates: { canonical: "/experience" },
  };
}

export default async function ExperiencePage() {
  const { experiences } = await getSite();
  return (
    <>
      <PageHeader
        eyebrow="Experience"
        title="Where I’ve worked"
        description="Frontend and full-stack roles across product companies, SaaS and enterprise projects."
      />
      {experiences.length === 0 ? <EmptyState title="No experience entries yet" /> : <ExperienceTimeline items={experiences} />}
    </>
  );
}
