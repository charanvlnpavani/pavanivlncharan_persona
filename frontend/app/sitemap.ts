import type { MetadataRoute } from "next";
import { getSite } from "@/lib/api";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects, blog, publishedAt } = await getSite();
  const lastModified = publishedAt ? new Date(publishedAt) : undefined;
  const pages = ["", "/projects", "/experience", "/skills", "/education", "/blog", "/resume", "/contact"];
  return [
    ...pages.map((path) => ({ url: `${siteUrl}${path}`, lastModified, changeFrequency: "monthly" as const, priority: path === "" ? 1 : 0.7 })),
    ...projects.map((p) => ({ url: `${siteUrl}/projects/${p.slug}`, lastModified, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...blog.map((p) => ({ url: `${siteUrl}/blog/${p.slug}`, lastModified: new Date(p.publishedAt), changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}
