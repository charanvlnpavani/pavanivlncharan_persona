import { achievementSchema, formatMonth, type AchievementInput } from "@portfolio/shared";
import { TextAreaField, TextField } from "@/components/forms/fields";
import { ItemOptions } from "@/components/forms/item-options";
import { ResourceEditor } from "@/components/resource-editor";
import { ResourceList } from "@/components/resource-list";
import { Card, CardBody, CardHeader } from "@/components/ui/primitives";
import type { ItemFlags } from "@/types";

type Achievement = ItemFlags & AchievementInput;

const defaults: AchievementInput = {
  title: "",
  description: "",
  date: "",
  url: "",
  isVisible: true,
  includeInResume: true,
  resumeSummary: "",
};

export function AchievementsPage() {
  return (
    <ResourceList<Achievement>
      resource="achievements"
      title="Achievements"
      singular="achievement"
      basePath="/achievements"
      description="Awards, recognitions, talks, open-source milestones."
      primary={(a) => a.title}
      secondary={(a) => (a.date ? formatMonth(a.date) : "")}
    />
  );
}

export function AchievementEditPage() {
  return (
    <ResourceEditor<Achievement, AchievementInput>
      resource="achievements"
      schema={achievementSchema}
      defaults={defaults}
      singular="achievement"
      basePath="/achievements"
      title={(a) => a?.title ?? "Achievement"}
      previewPath={() => "/#achievements"}
    >
      {() => (
        <>
          <Card>
            <CardHeader title="Achievement" />
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <TextField name="title" label="Title" className="sm:col-span-2" />
              <TextField name="date" label="Date (optional)" type="month" />
              <TextField name="url" label="Link (optional)" type="url" placeholder="https://" />
              <TextAreaField name="description" label="Description" rows={3} className="sm:col-span-2" />
            </CardBody>
          </Card>
          <ItemOptions />
        </>
      )}
    </ResourceEditor>
  );
}
