import type { Metadata } from "next";
import { EducationList } from "@/components/site/education-list";
import { EmptyState, PageHeader } from "@/components/site/section";
import { getCertifications, getEducation } from "@/lib/content";

export const metadata: Metadata = {
  title: "Education",
  description: "Academic background and certifications of Pavani VLN Charan.",
  alternates: { canonical: "/education" },
};

export default async function EducationPage() {
  const [education, certifications] = await Promise.all([getEducation(), getCertifications()]);
  return (
    <>
      <PageHeader eyebrow="Education" title="Academic background" />
      {education.length === 0 ? <EmptyState title="No education entries yet" /> : <EducationList items={education} />}

      {certifications.length > 0 && (
        <section aria-labelledby="certifications" className="mt-16">
          <h2 id="certifications" className="text-2xl font-semibold tracking-tight">
            Certifications
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {certifications.map((c) => (
              <li key={c.id} className="bg-card rounded-xl border p-5">
                <p className="font-medium">{c.name}</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {c.issuer} · {c.issueDate}
                </p>
                {c.credentialUrl && (
                  <a
                    href={c.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand mt-3 inline-block text-sm font-medium hover:underline"
                  >
                    View credential
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
