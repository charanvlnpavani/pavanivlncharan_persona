import { educationSchema, type EducationInput } from "@portfolio/shared";
import { LinesField, NumberField, TextAreaField, TextField } from "@/components/forms/fields";
import { ItemOptions } from "@/components/forms/item-options";
import { ResourceEditor } from "@/components/resource-editor";
import { ResourceList } from "@/components/resource-list";
import { Card, CardBody, CardHeader } from "@/components/ui/primitives";
import type { ItemFlags } from "@/types";

type Education = ItemFlags & EducationInput;

const defaults: EducationInput = {
  institution: "",
  degree: "",
  field: "",
  location: "",
  startYear: null,
  endYear: new Date().getFullYear(),
  summary: "",
  courses: [],
  isVisible: true,
  includeInResume: true,
  resumeSummary: "",
};

export function EducationPage() {
  return (
    <ResourceList<Education>
      resource="education"
      title="Education"
      singular="qualification"
      basePath="/education"
      description="Qualifications, newest first on the website."
      reorderable={false}
      primary={(e) => [e.degree, e.field].filter(Boolean).join(", ")}
      secondary={(e) => `${e.institution} · ${e.startYear ? `${e.startYear} – ` : ""}${e.endYear}`}
    />
  );
}

export function EducationEditPage() {
  return (
    <ResourceEditor<Education, EducationInput>
      resource="education"
      schema={educationSchema}
      defaults={defaults}
      singular="qualification"
      basePath="/education"
      title={(e) => (e ? `${e.degree}, ${e.institution}` : "Education")}
      previewPath={() => "/education"}
    >
      {() => (
        <>
          <Card>
            <CardHeader title="Qualification" />
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <TextField name="degree" label="Degree" placeholder="B.Tech" />
              <TextField name="field" label="Field of study" placeholder="Computer Science and Engineering" />
              <TextField name="institution" label="Institution" className="sm:col-span-2" />
              <TextField name="location" label="Location" />
              <div className="grid grid-cols-2 gap-4">
                <NumberField name="startYear" label="Start year" nullable />
                <NumberField name="endYear" label="End year" />
              </div>
              <TextAreaField name="summary" label="Summary (optional)" rows={3} className="sm:col-span-2" />
              <LinesField name="courses" label="Notable courses (optional)" className="sm:col-span-2" />
            </CardBody>
          </Card>
          <ItemOptions />
        </>
      )}
    </ResourceEditor>
  );
}
