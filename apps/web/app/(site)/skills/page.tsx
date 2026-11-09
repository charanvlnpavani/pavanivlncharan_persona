import type { Metadata } from "next";
import { EmptyState, PageHeader } from "@/components/site/section";
import { SkillGroups } from "@/components/site/skill-groups";
import { getSkillCategories } from "@/lib/content";

export const metadata: Metadata = {
  title: "Skills",
  description: "Languages, frameworks, databases and tools Pavani VLN Charan works with.",
  alternates: { canonical: "/skills" },
};

export default async function SkillsPage() {
  const categories = await getSkillCategories();
  return (
    <>
      <PageHeader
        eyebrow="Skills"
        title="My toolkit"
        description="The languages, frameworks and tools I use to take products from idea to production."
      />
      {categories.length === 0 ? <EmptyState title="No skills listed yet" /> : <SkillGroups categories={categories} />}
    </>
  );
}
