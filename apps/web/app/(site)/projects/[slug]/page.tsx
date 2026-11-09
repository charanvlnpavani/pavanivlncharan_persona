import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SocialIconGlyph } from "@/components/site/social-links";
import { getProjectBySlug, getProjects } from "@/lib/content";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: project.title, description: project.summary, type: "article" },
  };
}

/* Per the Cache Components guidance, `params` is awaited inside <Suspense>
   so the page shell can be served instantly for slugs added later. */
export default function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  return (
    <article className="mx-auto max-w-3xl pt-10 sm:pt-14">
      <Link
        href="/projects"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> All projects
      </Link>
      <Suspense fallback={<ProjectSkeleton />}>
        <ProjectDetails params={params} />
      </Suspense>
    </article>
  );
}

async function ProjectDetails({ params }: Pick<PageProps<"/projects/[slug]">, "params">) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <>
      <header className="mt-8 space-y-4">
        <p className="text-brand font-mono text-xs font-medium tracking-wider uppercase">
          {project.category}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{project.title}</h1>
        <p className="text-muted-foreground text-lg text-pretty">{project.summary}</p>
        {(project.liveUrl || project.githubUrl) && (
          <div className="flex flex-wrap gap-3 pt-2">
            {project.liveUrl && (
              <Button asChild>
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  Visit live site <ArrowUpRight aria-hidden="true" />
                </a>
              </Button>
            )}
            {project.githubUrl && (
              <Button asChild variant="outline">
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <SocialIconGlyph icon="github" className="size-4" /> View source
                </a>
              </Button>
            )}
          </div>
        )}
      </header>

      {project.images.length > 0 && (
        <div className="mt-10 space-y-6">
          {project.images.map((img) => (
            <Image
              key={img.url}
              src={img.url}
              alt={img.alt}
              width={img.width}
              height={img.height}
              sizes="(min-width: 768px) 768px, 100vw"
              className="rounded-xl border"
            />
          ))}
        </div>
      )}

      {project.description && project.description.length > 0 && (
        <section aria-labelledby="overview" className="mt-12">
          <h2 id="overview" className="text-xl font-semibold tracking-tight">
            Overview
          </h2>
          <div className="text-muted-foreground mt-4 space-y-4 leading-relaxed">
            {project.description.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="stack" className="mt-12 border-t pt-8">
        <h2 id="stack" className="text-xl font-semibold tracking-tight">
          Tech stack
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {project.technologies.map((t) => (
            <li key={t}>
              <Badge className="text-sm">{t}</Badge>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function ProjectSkeleton() {
  return (
    <div className="mt-8 space-y-4" aria-busy="true" aria-label="Loading project">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-2/3" />
    </div>
  );
}
