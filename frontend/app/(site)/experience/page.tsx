import type { Metadata } from "next";
import { ExperienceTimeline } from "@/components/site/experience-timeline";
import { EmptyState, PageHeader } from "@/components/site/section";
import { getExperiences } from "@/lib/content";

export const metadata: Metadata = {
  title: "Experience",
  description: "Professional experience of Pavani VLN Charan, full-stack and frontend developer.",
  alternates: { canonical: "/experience" },
};

export default async function ExperiencePage() {
  const experiences = await getExperiences();
  return (
    <>
      <PageHeader
        eyebrow="Experience"
        title="Where I’ve worked"
        description="Frontend and full-stack roles across product companies, SaaS and enterprise projects."
      />
      {experiences.length === 0 ? (
        <EmptyState title="No experience entries yet" />
      ) : (
        <ExperienceTimeline items={experiences} />
      )}
    </>
  );
}
