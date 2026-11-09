import { experienceSchema, formatDateRange, type ExperienceInput } from "@portfolio/shared";
import { useWatch } from "react-hook-form";
import { ImageField, LinesField, SwitchField, TagsField, TextAreaField, TextField } from "@/components/forms/fields";
import { ItemOptions } from "@/components/forms/item-options";
import { ResourceEditor } from "@/components/resource-editor";
import { ResourceList } from "@/components/resource-list";
import { Card, CardBody, CardHeader } from "@/components/ui/primitives";
import type { AdminMedia, ItemFlags } from "@/types";

type Experience = ItemFlags & ExperienceInput & { logo: AdminMedia | null };

const defaults: ExperienceInput = {
  company: "",
  designation: "",
  employmentType: "Full-time",
  location: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  summary: "",
  responsibilities: [],
  achievements: [],
  technologies: [],
  logoId: null,
  isVisible: true,
  includeInResume: true,
  resumeSummary: "",
};

export function ExperiencePage() {
  return (
    <ResourceList<Experience>
      resource="experience"
      title="Experience"
      singular="experience"
      basePath="/experience"
      description="Roles shown on your timeline and resume. The website orders them by date automatically."
      reorderable={false}
      primary={(e) => `${e.designation} · ${e.company}`}
      secondary={(e) => (e.startDate ? formatDateRange(e.startDate, e.endDate || null, e.isCurrent) : "")}
    />
  );
}

function EndDate() {
  const isCurrent = useWatch<ExperienceInput>({ name: "isCurrent" });
  return isCurrent ? (
    <p className="text-muted-foreground self-end pb-2 text-sm">Present</p>
  ) : (
    <TextField name="endDate" label="End date" type="month" />
  );
}

export function ExperienceEditPage() {
  return (
    <ResourceEditor<Experience, ExperienceInput>
      resource="experience"
      schema={experienceSchema}
      defaults={defaults}
      singular="experience"
      basePath="/experience"
      title={(e) => (e ? `${e.designation} · ${e.company}` : "Experience")}
      previewPath={() => "/experience"}
    >
      {({ item }) => (
        <>
          <Card>
            <CardHeader title="Role" />
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <TextField name="designation" label="Job title" placeholder="Senior Software Engineer" />
              <TextField name="company" label="Company" />
              <TextField name="employmentType" label="Employment type" placeholder="Full-time" />
              <TextField name="location" label="Location" placeholder="Hyderabad, India · Hybrid" />
              <TextField name="startDate" label="Start date" type="month" />
              <EndDate />
              <div className="sm:col-span-2">
                <SwitchField name="isCurrent" label="I currently work here" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Details" description="Achievements are listed first on the resume." />
            <CardBody>
              <TextAreaField name="summary" label="Summary (optional)" rows={3} />
              <LinesField name="achievements" label="Achievements" hint="Measurable results, one per line." rows={4} />
              <LinesField name="responsibilities" label="Responsibilities" rows={5} />
              <TagsField name="technologies" label="Technologies" />
              <ImageField name="logoId" label="Company logo (optional)" initial={item?.logo} alt={item?.company ?? ""} />
            </CardBody>
          </Card>

          <ItemOptions resumeHint="A one-line summary of the role shown above the bullet points on the resume." />
        </>
      )}
    </ResourceEditor>
  );
}
