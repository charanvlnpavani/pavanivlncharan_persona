import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { JsonLd } from "@/components/site/json-ld";
import { Skeleton } from "@/components/ui/skeleton";
import { getBlogPost, getSite } from "@/lib/api";
import { siteUrl } from "@/lib/site";

const dateFmt = new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" });

export async function generateStaticParams() {
  const { blog } = await getSite();
  // Cache Components needs at least one param at build time. With nothing
  // published yet, a placeholder resolves to "not found"; real slugs published
  // later are rendered on first visit and then cached.
  return blog.length ? blog.map((p) => ({ slug: p.slug })) : [{ slug: "__placeholder__" }];
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Post not found", robots: { index: false } };
  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { title, description, type: "article", publishedTime: post.publishedAt, tags: post.tags },
  };
}

export default function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  return (
    <article className="mx-auto max-w-2xl pt-10 sm:pt-14">
      <Link href="/blog" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors">
        <ArrowLeft className="size-4" aria-hidden="true" /> All articles
      </Link>
      <Suspense
        fallback={
          <div className="mt-8 space-y-4" aria-busy="true" aria-label="Loading article">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <PostBody params={params} />
      </Suspense>
    </article>
  );
}

async function PostBody({ params }: Pick<PageProps<"/blog/[slug]">, "params">) {
  const { slug } = await params;
  const [post, site] = await Promise.all([getBlogPost(slug), getSite()]);
  if (!post) notFound();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.publishedAt,
          author: { "@type": "Person", name: site.profile.fullName, url: siteUrl },
          url: `${siteUrl}/blog/${post.slug}`,
        }}
      />
      <header className="mt-8">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{post.title}</h1>
        <p className="text-muted-foreground mt-4 font-mono text-xs">
          <time dateTime={post.publishedAt}>{dateFmt.format(new Date(post.publishedAt))}</time> · {post.readingMinutes} min read
          {post.category ? ` · ${post.category}` : ""}
        </p>
        {post.tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tags">
            {post.tags.map((t) => (
              <li key={t} className="bg-secondary rounded px-2 py-0.5 font-mono text-xs">
                #{t}
              </li>
            ))}
          </ul>
        )}
      </header>
      {post.coverImage && (
        <Image
          src={post.coverImage.url}
          alt={post.coverImage.alt}
          width={post.coverImage.width ?? 1600}
          height={post.coverImage.height ?? 900}
          unoptimized
          loading="eager"
          className="mt-8 w-full rounded-xl border"
        />
      )}
      {/* Sanitized server-side with an allow-list before it was saved. */}
      <div className="prose-content mt-10" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
    </>
  );
}
