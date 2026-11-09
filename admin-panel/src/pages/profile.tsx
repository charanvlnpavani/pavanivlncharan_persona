import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileSchema, socialLinkSchema, SOCIAL_ICONS, type ProfileInput, type SocialLinkInput } from "@portfolio/shared";
import { ArrowUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { FormProvider, useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { ImageField, LinesField, TextAreaField, TextField } from "@/components/forms/fields";
import { FormActions } from "@/components/form-actions";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge, Card, CardBody, CardHeader, ErrorState, Input, Select, Skeleton } from "@/components/ui/primitives";
import { useResource } from "@/hooks/use-resource";
import { useSingletonForm } from "@/hooks/use-singleton";
import { api, errorMessage } from "@/services/api";
import type { AdminMedia, ItemFlags } from "@/types";

const defaults: ProfileInput = {
  fullName: "",
  headline: "",
  yearsExperience: "",
  location: "",
  email: "",
  phone: "",
  avatarId: null,
  heroEyebrow: "",
  heroHeading: "",
  heroSubheading: "",
  heroCtas: [],
  summary: "",
  about: [],
  specializations: [],
  interests: "",
};

function HeroButtons() {
  const { control, register, formState } = useFormContext<ProfileInput>();
  const { fields, append, remove, move } = useFieldArray({ control, name: "heroCtas" });
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">Call-to-action buttons</span>
      {fields.map((f, i) => (
        <div key={f.id} className="flex flex-wrap items-start gap-2 rounded-lg border p-2">
          <Input aria-label={`Button ${i + 1} label`} placeholder="Label" className="w-36" {...register(`heroCtas.${i}.label`)} />
          <Input aria-label={`Button ${i + 1} link`} placeholder="/projects or https://…" className="min-w-40 flex-1" {...register(`heroCtas.${i}.href`)} />
          <Select aria-label={`Button ${i + 1} style`} className="w-32" {...register(`heroCtas.${i}.variant`)}>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
          </Select>
          <Button variant="ghost" size="icon-sm" aria-label="Move up" disabled={i === 0} onClick={() => move(i, i - 1)}>
            <ArrowUp />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Remove button" onClick={() => remove(i)}>
            <Trash2 />
          </Button>
          {formState.errors.heroCtas?.[i] && (
            <p className="text-destructive w-full text-xs">
              {formState.errors.heroCtas[i]?.label?.message ?? formState.errors.heroCtas[i]?.href?.message}
            </p>
          )}
        </div>
      ))}
      {fields.length < 3 && (
        <Button variant="outline" size="sm" onClick={() => append({ label: "", href: "/", variant: "secondary" })}>
          <Plus /> Add button
        </Button>
      )}
    </div>
  );
}

type Social = ItemFlags & SocialLinkInput;

/** Social links: inline add / edit / reorder / delete. */
function SocialLinks() {
  const qc = useQueryClient();
  const { list, remove, reorder } = useResource<Social>("social-links");
  const [draft, setDraft] = useState<SocialLinkInput>({ label: "", url: "https://", icon: "github", isVisible: true });
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["social-links"] });
    void qc.invalidateQueries({ queryKey: ["publish-status"] });
  };
  const save = useMutation({
    mutationFn: ({ id, input }: { id?: string; input: SocialLinkInput }) => {
      const parsed = socialLinkSchema.safeParse(input);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid link");
      return api(id ? `/social-links/${id}` : "/social-links", { method: id ? "PUT" : "POST", body: parsed.data });
    },
    onSuccess: (_d, { id }) => {
      refresh();
      if (!id) setDraft({ label: "", url: "https://", icon: "github", isVisible: true });
      toast.success("Link saved. Publish to update the site.");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  const links = list.data ?? [];

  return (
    <Card>
      <CardHeader title="Social links" description="Shown in the hero, footer and contact page, and on the resume (except email)." />
      <CardBody className="space-y-3">
        {links.map((l, i) => (
          <SocialRow
            key={`${l.id}-${l.updatedAt}`}
            link={l}
            first={i === 0}
            onSave={(input) => save.mutate({ id: l.id, input })}
            onUp={() => {
              const ids = links.map((x) => x.id);
              [ids[i - 1], ids[i]] = [ids[i], ids[i - 1]];
              reorder.mutate(ids);
            }}
            onDelete={() => remove.mutateAsync(l.id)}
          />
        ))}
        <form
          className="flex flex-wrap gap-2 rounded-lg border border-dashed p-2"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate({ input: draft });
          }}
        >
          <Input aria-label="New link label" placeholder="Label" className="w-36" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
          <Input aria-label="New link URL" placeholder="https://… or mailto:…" className="min-w-48 flex-1" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} />
          <Select aria-label="New link icon" className="w-32" value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value as SocialLinkInput["icon"] })}>
            {SOCIAL_ICONS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="outline" disabled={save.isPending}>
            <Plus /> Add link
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

function SocialRow({
  link,
  first,
  onSave,
  onUp,
  onDelete,
}: {
  link: Social;
  first: boolean;
  onSave: (input: SocialLinkInput) => void;
  onUp: () => void;
  onDelete: () => Promise<unknown>;
}) {
  const [v, setV] = useState<SocialLinkInput>({ label: link.label, url: link.url, icon: link.icon, isVisible: link.isVisible });
  const changed = v.label !== link.label || v.url !== link.url || v.icon !== link.icon || v.isVisible !== link.isVisible;
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border p-2">
      <Button variant="ghost" size="icon-sm" aria-label={`Move ${link.label} up`} disabled={first} onClick={onUp}>
        <ArrowUp />
      </Button>
      <Input aria-label="Label" className="w-36" value={v.label} onChange={(e) => setV({ ...v, label: e.target.value })} />
      <Input aria-label="URL" className="min-w-48 flex-1" value={v.url} onChange={(e) => setV({ ...v, url: e.target.value })} />
      <Select aria-label="Icon" className="w-28" value={v.icon} onChange={(e) => setV({ ...v, icon: e.target.value as SocialLinkInput["icon"] })}>
        {SOCIAL_ICONS.map((i) => (
          <option key={i} value={i}>
            {i}
          </option>
        ))}
      </Select>
      <label className="flex items-center gap-1.5 text-sm">
        <input type="checkbox" checked={v.isVisible} onChange={(e) => setV({ ...v, isVisible: e.target.checked })} /> Visible
      </label>
      {link.isLive && link.hasUnpublishedChanges && <Badge tone="warning">Unpublished</Badge>}
      <Button size="sm" variant={changed ? "default" : "ghost"} disabled={!changed} onClick={() => onSave(v)}>
        Save
      </Button>
      <ConfirmDialog
        title={`Delete ${link.label}?`}
        description="The link disappears from the site at the next publish."
        onConfirm={onDelete}
        trigger={
          <Button variant="ghost" size="icon-sm" aria-label={`Delete ${link.label}`} className="hover:text-destructive">
            <Trash2 />
          </Button>
        }
      />
    </div>
  );
}

export function ProfilePage() {
  const { query, form, save, submit } = useSingletonForm<ProfileInput, ProfileInput & { avatar: AdminMedia | null }>(
    "/profile",
    profileSchema,
    defaults,
  );

  if (query.isError) return <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()} />;
  if (query.isPending) return <Skeleton className="h-96" />;

  return (
    <>
      <PageHeader
        title="Profile & homepage"
        description="Your name, headline, hero section and about text. The professional summary also opens your resume."
      />
      <FormProvider {...form}>
        <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
          <Card>
            <CardHeader title="Basics" />
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <TextField name="fullName" label="Full name" autoComplete="name" />
              <TextField name="headline" label="Professional title" placeholder="Full-Stack Developer" />
              <TextField name="yearsExperience" label="Experience" placeholder="3+ years" />
              <TextField name="location" label="Location" />
              <TextField name="email" label="Public email" type="email" />
              <TextField name="phone" label="Phone (optional)" hint="Shown on the resume only if filled in." />
              <div className="sm:col-span-2">
                <ImageField name="avatarId" label="Profile photo" hint="Square or portrait, at least 600px wide." initial={query.data?.avatar} alt={query.data?.fullName ?? ""} />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Homepage hero" description="The first thing visitors see." />
            <CardBody>
              <TextField name="heroEyebrow" label="Small label above the heading" />
              <TextAreaField name="heroHeading" label="Heading" rows={2} />
              <TextAreaField name="heroSubheading" label="Subheading" rows={3} />
              <HeroButtons />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="About" />
            <CardBody>
              <TextAreaField name="summary" label="Professional summary" rows={4} hint="2–4 sentences. Used at the top of your resume." />
              <LinesField name="about" label="About me" hint="Each line becomes a paragraph on the About section." rows={6} />
              <LinesField name="specializations" label="Specializations" />
              <TextAreaField name="interests" label="Interests" rows={2} />
            </CardBody>
          </Card>

          <FormActions dirty={form.formState.isDirty} busy={save.isPending} onSave={() => void submit(false)} onPublish={() => void submit(true)} />
        </form>
      </FormProvider>
      <div className="mt-8">
        <SocialLinks />
      </div>
    </>
  );
}
