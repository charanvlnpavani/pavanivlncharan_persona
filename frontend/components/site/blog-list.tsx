import type { BlogPostSummary } from "@portfolio/shared";
import Link from "next/link";

const dateFmt = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });

export function BlogList({ posts }: { posts: BlogPostSummary[] }) {
  return (
    <ul className="divide-y border-y">
      {posts.map((p) => (
        <li key={p.id} className="group relative py-6">
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs">
            <time dateTime={p.publishedAt}>{dateFmt.format(new Date(p.publishedAt))}</time>
            <span aria-hidden="true">·</span>
            <span>{p.readingMinutes} min read</span>
            {p.category && (
              <>
                <span aria-hidden="true">·</span>
                <span>{p.category}</span>
              </>
            )}
          </div>
          <h3 className="mt-2 text-lg font-semibold tracking-tight">
            <Link href={`/blog/${p.slug}`} className="group-hover:text-brand transition-colors after:absolute after:inset-0">
              {p.title}
            </Link>
          </h3>
          <p className="text-muted-foreground mt-1 max-w-3xl text-sm leading-relaxed">{p.excerpt}</p>
        </li>
      ))}
    </ul>
  );
}
