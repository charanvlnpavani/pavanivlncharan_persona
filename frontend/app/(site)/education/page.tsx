import type { Metadata } from "next";
import { AchievementList } from "@/components/site/achievement-list";
import { CertificationList, EducationList } from "@/components/site/education-list";
import { EmptyState, PageHeader } from "@/components/site/section";
import { getSite } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getSite();
  return {
    title: "Education",
    description: `Academic background, certifications and achievements of ${profile.fullName}.`,
    alternates: { canonical: "/education" },
  };
}

export default async function EducationPage() {
  const { education, certifications, achievements } = await getSite();
  return (
    <>
      <PageHeader eyebrow="Education" title="Academic background" />
      {education.length === 0 ? <EmptyState title="No education entries yet" /> : <EducationList items={education} />}

      {certifications.length > 0 && (
        <section aria-labelledby="certifications" className="mt-16">
          <h2 id="certifications" className="text-2xl font-semibold tracking-tight">
            Certifications
          </h2>
          <div className="mt-6">
            <CertificationList items={certifications} />
          </div>
        </section>
      )}

      {achievements.length > 0 && (
        <section aria-labelledby="achievements" className="mt-16">
          <h2 id="achievements" className="text-2xl font-semibold tracking-tight">
            Achievements
          </h2>
          <div className="mt-6">
            <AchievementList items={achievements} />
          </div>
        </section>
      )}
    </>
  );
}
