import { projectSchema, type ProjectInput } from "@portfolio/shared";
import { ImagesField, LinesField, SwitchField, TagsField, TextAreaField, TextField } from "@/components/forms/fields";
import { AutoSlug } from "@/components/forms/auto-slug";
import { ItemOptions } from "@/components/forms/item-options";
import { ResourceEditor } from "@/components/resource-editor";
import { ResourceList } from "@/components/resource-list";
import { Badge, Card, CardBody, CardHeader } from "@/components/ui/primitives";
import type { AdminMedia, ItemFlags } from "@/types";

type Project = ItemFlags & ProjectInput & { images: AdminMedia[] };

const defaults: ProjectInput = {
  title: "",
  slug: "",
  summary: "",
  description: [],
  technologies: [],
  category: "Web app",
  githubUrl: "",
  liveUrl: "",
  isFeatured: false,
  imageIds: [],
  isVisible: true,
  includeInResume: true,
  resumeSummary: "",
};

export function ProjectsPage() {
  return (
    <ResourceList<Project>
      resource="projects"
      title="Projects"
      singular="project"
      basePath="/projects"
      description="Use the arrows to set the display order. Featured projects appear on the homepage and first on the resume."
      primary={(p) => p.title}
      secondary={(p) => (
        <span className="flex items-center gap-2">
          {p.isFeatured && <Badge tone="brand">Featured</Badge>}
          {p.category}
        </span>
      )}
    />
  );
}

export function ProjectEditPage() {
  return (
    <ResourceEditor<Project, ProjectInput>
      resource="projects"
      schema={projectSchema}
      defaults={defaults}
      singular="project"
      basePath="/projects"
      title={(p) => p?.title ?? "Project"}
      previewPath={(v) => (v.slug ? `/projects/${v.slug}` : "/projects")}
    >
      {({ item }) => (
        <>
          <AutoSlug isNew={!item} />
          <Card>
            <CardHeader title="Basics" />
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <TextField name="title" label="Title" />
              <TextField name="slug" label="URL slug" hint="Used in the address: /projects/your-slug" />
              <TextField name="category" label="Category" placeholder="Web app, Professional work, Open source…" />
              <div className="self-end pb-1.5">
                <SwitchField name="isFeatured" label="Featured project" hint="Shown on the homepage." />
              </div>
              <TextAreaField name="summary" label="Short summary" rows={2} className="sm:col-span-2" hint="One or two sentences for cards and the resume." />
              <LinesField name="description" label="Full description" hint="Each line becomes a paragraph on the project page." rows={6} className="sm:col-span-2" />
              <TagsField name="technologies" label="Technologies" className="sm:col-span-2" />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Links & screenshots" />
            <CardBody>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField name="liveUrl" label="Live demo URL" placeholder="https://" type="url" />
                <TextField name="githubUrl" label="GitHub URL" placeholder="https://github.com/…" type="url" />
              </div>
              <ImagesField name="imageIds" label="Screenshots" hint="JPG, PNG, WebP or AVIF, up to 5 MB each. The first one is the cover." initial={item?.images} alt={item?.title ?? ""} />
            </CardBody>
          </Card>

          <ItemOptions />
        </>
      )}
    </ResourceEditor>
  );
}
