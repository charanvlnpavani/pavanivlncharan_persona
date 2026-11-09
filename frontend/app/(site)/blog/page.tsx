import type { Metadata } from "next";
import { BlogList } from "@/components/site/blog-list";
import { EmptyState, PageHeader } from "@/components/site/section";
import { getSite } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getSite();
  return { title: "Blog", description: `Articles by ${profile.fullName}.`, alternates: { canonical: "/blog" } };
}

export default async function BlogPage() {
  const { blog } = await getSite();
  return (
    <>
      <PageHeader eyebrow="Blog" title="Writing" description="Notes on building web applications, tools and lessons learned." />
      {blog.length === 0 ? <EmptyState title="No articles yet" description="The first post is on its way." /> : <BlogList posts={blog} />}
    </>
  );
}
