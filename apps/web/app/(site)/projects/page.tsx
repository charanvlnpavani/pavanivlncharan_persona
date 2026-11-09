import type { Metadata } from "next";
import { ProjectCard } from "@/components/site/project-card";
import { EmptyState, PageHeader } from "@/components/site/section";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description: "Web applications and professional work by Pavani VLN Charan.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  // Group by category, keeping the order categories first appear in.
  const groups = projects.reduce<Map<string, typeof projects>>((map, p) => {
    map.set(p.category, [...(map.get(p.category) ?? []), p]);
    return map;
  }, new Map());

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Things I’ve built"
        description="Side projects I designed and shipped, plus highlights from professional work."
      />
      {projects.length === 0 ? (
        <EmptyState title="No projects yet" description="Check back soon." />
      ) : (
        <div className="space-y-16">
          {[...groups].map(([category, items]) => (
            <section key={category} aria-labelledby={`cat-${category}`}>
              <h2
                id={`cat-${category}`}
                className="text-muted-foreground mb-5 font-mono text-xs tracking-wider uppercase"
              >
                {category} <span className="text-muted-foreground/60">({items.length})</span>
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
