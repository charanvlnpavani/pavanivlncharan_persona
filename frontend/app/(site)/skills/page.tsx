import type { Metadata } from "next";
import { EmptyState, PageHeader } from "@/components/site/section";
import { SkillGroups } from "@/components/site/skill-groups";
import { getSite } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getSite();
  return {
    title: "Skills",
    description: `Languages, frameworks, databases and tools ${profile.fullName} works with.`,
    alternates: { canonical: "/skills" },
  };
}

export default async function SkillsPage() {
  const { skills } = await getSite();
  return (
    <>
      <PageHeader
        eyebrow="Skills"
        title="My toolkit"
        description="The languages, frameworks and tools I use to take products from idea to production."
      />
      {skills.length === 0 ? <EmptyState title="No skills listed yet" /> : <SkillGroups categories={skills} />}
    </>
  );
}
