import type { Project } from "@portfolio/shared";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SocialIconGlyph } from "./social-links";

const MAX_TAGS = 5;

/**
 * The whole card links to the project page via a stretched title link.
 * External links sit above it (relative z-10) so they stay separately
 * clickable, with no invalid <a><button></a> nesting.
 */
export function ProjectCard({ project }: { project: Project }) {
  const extra = project.technologies.length - MAX_TAGS;
  const cover = project.images[0];
  return (
    <article className="group bg-card hover:border-foreground/20 relative flex h-full flex-col overflow-hidden rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      {cover && (
        <Image
          src={cover.url}
          alt=""
          width={cover.width ?? 1200}
          height={cover.height ?? 675}
          unoptimized
          className="aspect-video w-full border-b object-cover"
        />
      )}
      <div className="flex flex-1 flex-col p-6">
        <p className="text-muted-foreground font-mono text-xs">{project.category}</p>
        <h3 className="mt-2 text-lg font-semibold tracking-tight">
          <Link
            href={`/projects/${project.slug}`}
            className="focus-visible:ring-ring/50 rounded-sm outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:ring-[3px]"
          >
            {project.title}
          </Link>
        </h3>
        <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">{project.summary}</p>

        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies">
          {project.technologies.slice(0, MAX_TAGS).map((t) => (
            <li key={t}>
              <Badge>{t}</Badge>
            </li>
          ))}
          {extra > 0 && (
            <li>
              <Badge variant="outline">+{extra}</Badge>
            </li>
          )}
        </ul>

        {(project.liveUrl || project.githubUrl) && (
          <div className="relative z-10 mt-5 flex gap-4 border-t pt-4 text-sm">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand inline-flex items-center gap-1 font-medium transition-colors"
              >
                Live demo <ArrowUpRight className="size-3.5" aria-hidden="true" />
                <span className="sr-only">for {project.title} (opens in a new tab)</span>
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand inline-flex items-center gap-1.5 font-medium transition-colors"
              >
                <SocialIconGlyph icon="github" className="size-3.5" /> Source
                <span className="sr-only">code for {project.title} (opens in a new tab)</span>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
