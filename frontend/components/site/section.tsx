import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  /** Optional "see all" link shown beside the heading. */
  more?: { label: string; href: string };
  className?: string;
  children: React.ReactNode;
};

/** A homepage section with a consistent heading treatment. */
export function Section({ id, eyebrow, title, description, more, className, children }: SectionProps) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className={cn("reveal py-16 sm:py-20", className)}>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-2">
          {eyebrow && (
            <p className="text-brand font-mono text-xs font-medium tracking-wider uppercase">
              {eyebrow}
            </p>
          )}
          <h2 id={headingId} className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {more && (
          <Link
            href={more.href}
            className="group text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            {more.label}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

/** Top-of-page heading for dedicated pages (/projects, /experience, …). */
export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="max-w-2xl space-y-3 pt-12 pb-10 sm:pt-16">
      <p className="text-brand font-mono text-xs font-medium tracking-wider uppercase">{eyebrow}</p>
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h1>
      {description && <p className="text-muted-foreground text-lg text-pretty">{description}</p>}
    </header>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="text-muted-foreground rounded-xl border border-dashed p-10 text-center">
      <p className="text-foreground font-medium">{title}</p>
      {description && <p className="mt-1 text-sm">{description}</p>}
    </div>
  );
}
