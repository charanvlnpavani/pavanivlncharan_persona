import { ResourceList } from "@/components/resource-list";
import type { BlogPostInput } from "@portfolio/shared";
import type { AdminMedia, ItemFlags } from "@/types";

type Post = ItemFlags & BlogPostInput & { coverImage: AdminMedia | null; publishedAt: string | null };

const dateFmt = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export function BlogPage() {
  return (
    <ResourceList<Post>
      resource="blog"
      title="Blog"
      singular="post"
      basePath="/blog"
      description="Articles, newest first. Drafts are never visible on the site."
      reorderable={false}
      primary={(p) => p.title}
      secondary={(p) => (p.publishedAt ? `Published ${dateFmt.format(new Date(p.publishedAt))}` : "Not published yet")}
    />
  );
}
