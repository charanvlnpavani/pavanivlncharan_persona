import { blogPostSchema, type BlogPostInput } from "@portfolio/shared";
import { ImageField, TagsField, TextAreaField, TextField } from "@/components/forms/fields";
import { RichTextField } from "@/components/forms/rich-text-field";
import { ResourceEditor } from "@/components/resource-editor";
import { Card, CardBody, CardHeader } from "@/components/ui/primitives";
import type { AdminMedia, ItemFlags } from "@/types";
import { AutoSlug } from "@/components/forms/auto-slug";

type Post = ItemFlags & BlogPostInput & { coverImage: AdminMedia | null; publishedAt: string | null };

const defaults: BlogPostInput = {
  title: "",
  slug: "",
  excerpt: "",
  contentHtml: "",
  category: "",
  tags: [],
  coverImageId: null,
  seoTitle: "",
  seoDescription: "",
};

export function BlogEditPage() {
  return (
    <ResourceEditor<Post, BlogPostInput>
      resource="blog"
      schema={blogPostSchema}
      defaults={defaults}
      singular="post"
      basePath="/blog"
      title={(p) => p?.title ?? "Post"}
      previewPath={(v) => (v.slug ? `/blog/${v.slug}` : "/blog")}
    >
      {({ item }) => (
        <>
          <AutoSlug isNew={!item} />
          <Card>
            <CardHeader title="Article" />
            <CardBody>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField name="title" label="Title" />
                <TextField name="slug" label="URL slug" hint="/blog/your-slug" />
              </div>
              <TextAreaField name="excerpt" label="Excerpt" rows={2} hint="Shown in the post list and as the default search description." />
              <RichTextField name="contentHtml" label="Content" />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Organisation & SEO" />
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <TextField name="category" label="Category" placeholder="Engineering" />
              <TagsField name="tags" label="Tags" />
              <TextField name="seoTitle" label="SEO title (optional)" hint="Defaults to the post title." />
              <TextField name="seoDescription" label="SEO description (optional)" hint="Defaults to the excerpt." />
              <div className="sm:col-span-2">
                <ImageField name="coverImageId" label="Cover image" initial={item?.coverImage} alt={item?.title ?? ""} />
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </ResourceEditor>
  );
}
