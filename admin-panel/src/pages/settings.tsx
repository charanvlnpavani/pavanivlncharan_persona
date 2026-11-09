import { HOME_SECTION_KEYS, settingsSchema, type SettingsInput } from "@portfolio/shared";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Controller, FormProvider, useFieldArray, useFormContext } from "react-hook-form";
import { SelectField, TextAreaField, TextField } from "@/components/forms/fields";
import { FormActions } from "@/components/form-actions";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, ErrorState, Input, Skeleton } from "@/components/ui/primitives";
import { useSingletonForm } from "@/hooks/use-singleton";
import { errorMessage } from "@/services/api";

const defaults: SettingsInput = {
  siteTitle: "",
  seoTitle: "",
  seoDescription: "",
  siteUrl: "http://localhost:3000",
  footerText: "",
  defaultTheme: "system",
  navItems: [],
  homeSections: HOME_SECTION_KEYS.map((key) => ({ key, visible: true })),
};

const sectionLabels: Record<(typeof HOME_SECTION_KEYS)[number], string> = {
  about: "About",
  projects: "Featured projects",
  experience: "Experience",
  skills: "Skills",
  education: "Education",
  certifications: "Certifications",
  achievements: "Achievements",
  blog: "Latest blog posts",
  contact: "Contact",
};

function NavEditor() {
  const { control, register, formState } = useFormContext<SettingsInput>();
  const { fields, append, remove, move } = useFieldArray({ control, name: "navItems" });
  return (
    <div className="space-y-2">
      {fields.map((f, i) => (
        <div key={f.id} className="flex flex-wrap items-center gap-2 rounded-lg border p-2">
          <div className="flex flex-col">
            <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, i - 1)} className="text-muted-foreground disabled:opacity-25">
              <ArrowUp className="size-3.5" />
            </button>
            <button type="button" aria-label="Move down" disabled={i === fields.length - 1} onClick={() => move(i, i + 1)} className="text-muted-foreground disabled:opacity-25">
              <ArrowDown className="size-3.5" />
            </button>
          </div>
          <Input aria-label={`Menu item ${i + 1} label`} className="w-36" {...register(`navItems.${i}.label`)} />
          <Input aria-label={`Menu item ${i + 1} link`} className="min-w-40 flex-1" {...register(`navItems.${i}.href`)} />
          <Button variant="ghost" size="icon-sm" aria-label="Remove menu item" onClick={() => remove(i)}>
            <Trash2 />
          </Button>
          {formState.errors.navItems?.[i] && (
            <p className="text-destructive w-full text-xs">{formState.errors.navItems[i]?.href?.message ?? formState.errors.navItems[i]?.label?.message}</p>
          )}
        </div>
      ))}
      {fields.length < 10 && (
        <Button variant="outline" size="sm" onClick={() => append({ label: "", href: "/" })}>
          <Plus /> Add menu item
        </Button>
      )}
    </div>
  );
}

function HomeSections() {
  const { control } = useFormContext<SettingsInput>();
  const { fields, move } = useFieldArray({ control, name: "homeSections" });
  return (
    <ul className="divide-y rounded-lg border">
      {fields.map((f, i) => (
        <li key={f.id} className="flex items-center gap-3 px-3 py-2">
          <div className="flex flex-col">
            <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, i - 1)} className="text-muted-foreground disabled:opacity-25">
              <ArrowUp className="size-3.5" />
            </button>
            <button type="button" aria-label="Move down" disabled={i === fields.length - 1} onClick={() => move(i, i + 1)} className="text-muted-foreground disabled:opacity-25">
              <ArrowDown className="size-3.5" />
            </button>
          </div>
          <span className="flex-1 text-sm">{sectionLabels[f.key]}</span>
          <Controller
            control={control}
            name={`homeSections.${i}.visible`}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                Visible
              </label>
            )}
          />
        </li>
      ))}
    </ul>
  );
}

export function SettingsPage() {
  const { query, form, save, submit } = useSingletonForm<SettingsInput, SettingsInput>("/settings", settingsSchema, defaults);

  if (query.isError) return <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()} />;
  if (query.isPending) return <Skeleton className="h-96" />;

  return (
    <>
      <PageHeader title="Website settings" description="Site name, SEO, menu, homepage sections, theme and footer." />
      <FormProvider {...form}>
        <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
          <Card>
            <CardHeader title="Site & SEO" description="How your site appears in search results and link previews." />
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <TextField name="siteTitle" label="Site name" />
              <TextField name="siteUrl" label="Public site URL" type="url" hint="Your real domain in production. Used for SEO and on the resume." />
              <TextField name="seoTitle" label="SEO title" className="sm:col-span-2" />
              <TextAreaField name="seoDescription" label="SEO description" rows={2} className="sm:col-span-2" hint="About 150 characters works best." />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Navigation" description="Links in the top menu and footer." />
            <CardBody>
              <NavEditor />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Homepage sections" description="Order and visibility of sections on the homepage. Empty sections hide automatically." />
            <CardBody>
              <HomeSections />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Theme & footer" />
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <SelectField
                name="defaultTheme"
                label="Default theme"
                hint="Visitors can still switch themes."
                options={[
                  { value: "system", label: "Match visitor’s device" },
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                ]}
              />
              <TextField name="footerText" label="Footer text" />
            </CardBody>
          </Card>

          <FormActions dirty={form.formState.isDirty} busy={save.isPending} onSave={() => void submit(false)} onPublish={() => void submit(true)} />
        </form>
      </FormProvider>
    </>
  );
}
