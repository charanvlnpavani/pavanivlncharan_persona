import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  RESUME_SECTION_KEYS,
  RESUME_TEMPLATES,
  resumeSettingsSchema,
  type ResumeSettings,
  type ResumeSettingsInput,
  type ResumeVersionInfo,
} from "@portfolio/shared";
import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle2, Download, ExternalLink, Eye, Loader2, RefreshCw, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { NumberField, SwitchField, TextAreaField, TextField } from "@/components/forms/fields";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge, Card, CardBody, CardHeader, ErrorState, Skeleton } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { ApiError, api, errorMessage } from "@/services/api";
import { timeAgo } from "@/lib/time";

type Overview = { settings: ResumeSettings; versions: ResumeVersionInfo[] };

const sectionLabels: Record<(typeof RESUME_SECTION_KEYS)[number], string> = {
  summary: "Professional summary",
  skills: "Technical skills",
  experience: "Professional experience",
  projects: "Projects",
  education: "Education",
  certifications: "Certifications",
  achievements: "Achievements",
};

const toInput = (s: ResumeSettings): ResumeSettingsInput => ({
  ...s,
  headlineOverride: s.headlineOverride ?? "",
  summaryOverride: s.summaryOverride ?? "",
});

/** Section order is a list of keys; the include toggles live in `sections`. */
function SectionOrder() {
  const { control } = useFormContext<ResumeSettingsInput>();
  return (
    <Controller
      control={control}
      name="sectionOrder"
      render={({ field }) => {
        const order = (field.value ?? []) as (typeof RESUME_SECTION_KEYS)[number][];
        const move = (i: number, dir: -1 | 1) => {
          const next = [...order];
          [next[i], next[i + dir]] = [next[i + dir], next[i]];
          field.onChange(next);
        };
        return (
          <ul className="divide-y rounded-lg border">
            {order.map((key, i) => (
              <li key={key} className="flex items-center gap-3 px-3 py-2">
                <div className="flex flex-col">
                  <button type="button" aria-label={`Move ${sectionLabels[key]} up`} disabled={i === 0} onClick={() => move(i, -1)} className="text-muted-foreground disabled:opacity-25">
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button type="button" aria-label={`Move ${sectionLabels[key]} down`} disabled={i === order.length - 1} onClick={() => move(i, 1)} className="text-muted-foreground disabled:opacity-25">
                    <ArrowDown className="size-3.5" />
                  </button>
                </div>
                <span className="flex-1 text-sm">{sectionLabels[key]}</span>
                <Controller
                  control={control}
                  name={`sections.${key}`}
                  render={({ field: toggle }) => (
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={Boolean(toggle.value)} onChange={(e) => toggle.onChange(e.target.checked)} /> Include
                    </label>
                  )}
                />
              </li>
            ))}
          </ul>
        );
      }}
    />
  );
}

function VersionStatus({ v }: { v: ResumeVersionInfo }) {
  if (v.status === "SUCCEEDED") return <Badge tone="success">Generated</Badge>;
  if (v.status === "FAILED") return <Badge tone="danger">Failed</Badge>;
  return (
    <Badge tone="warning">
      <Loader2 className="size-3 animate-spin" /> Generating
    </Badge>
  );
}

export function ResumePage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["resume"],
    queryFn: () => api<Overview>("/resume"),
    // Poll while a generation is running.
    refetchInterval: (query) => (query.state.data?.versions.some((v) => v.status === "PENDING") ? 2000 : false),
  });
  const form = useForm<ResumeSettingsInput>({ resolver: zodResolver(resumeSettingsSchema) });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (q.data) form.reset(toInput(q.data.settings));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.data?.settings]);
  useEffect(() => () => void (previewUrl && URL.revokeObjectURL(previewUrl)), [previewUrl]);

  const save = useMutation({
    mutationFn: (values: ResumeSettingsInput) => api<ResumeSettings>("/resume/settings", { method: "PUT", body: values }),
    onSuccess: () => {
      toast.success("Settings saved. Regenerating your published resume…");
      void qc.invalidateQueries({ queryKey: ["resume"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => {
      if (err instanceof ApiError && err.fields) for (const [f, m] of Object.entries(err.fields)) form.setError(f as never, { message: m });
      toast.error(errorMessage(err));
    },
  });

  const regenerate = useMutation({
    mutationFn: () => api<{ versions: ResumeVersionInfo[] }>("/resume/regenerate", { method: "POST" }),
    onSuccess: (data) => {
      const latest = data.versions[0];
      if (latest?.status === "FAILED") toast.error(`Generation failed: ${latest.error}`);
      else toast.success("Resume regenerated");
      void qc.invalidateQueries({ queryKey: ["resume"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  /** Renders drafts + the unsaved settings on the form. Admin-only, not stored. */
  const draftPreview = useMutation({
    mutationFn: async () => {
      const values = resumeSettingsSchema.parse(form.getValues());
      const res = await fetch("/api/resume/draft-preview", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json", "x-portfolio-csrf": "1" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? `Preview failed (${res.status})`);
      }
      return URL.createObjectURL(await res.blob());
    },
    onSuccess: (url) => setPreviewUrl(url),
    onError: (err) => toast.error(errorMessage(err)),
  });

  if (q.isError) return <ErrorState message={errorMessage(q.error)} onRetry={() => q.refetch()} />;
  if (q.isPending) return <Skeleton className="h-96" />;

  const current = q.data.versions.find((v) => v.isCurrent);
  const latest = q.data.versions[0];
  const failed = latest?.status === "FAILED";

  return (
    <>
      <PageHeader
        title="Resume"
        description="Generated automatically from your published content every time you publish. Recruiters always download the latest successful version."
        actions={
          <>
            <Button asChild variant="outline">
              <a href="/api/public/resume/preview" target="_blank" rel="noopener noreferrer">
                <ExternalLink /> View published
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/api/public/resume/download">
                <Download /> Download
              </a>
            </Button>
          </>
        }
      />

      <Card className={cn("mb-6", failed && "border-destructive/40")}>
        <CardBody className="flex flex-wrap items-start gap-4">
          {failed ? (
            <AlertTriangle className="text-destructive mt-0.5 size-5" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="text-success mt-0.5 size-5" aria-hidden="true" />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium">
              {current ? `Live resume: version ${current.version}` : "No resume published yet"}
              {current?.completedAt && <span className="text-muted-foreground font-normal"> · generated {timeAgo(current.completedAt)}</span>}
            </p>
            {failed ? (
              <p className="text-destructive mt-1 text-sm">
                The latest generation (v{latest.version}) failed: {latest.error}. Recruiters still receive version {current?.version ?? "–"}.
              </p>
            ) : (
              <p className="text-muted-foreground mt-1 text-sm">
                Public link: <code className="bg-muted rounded px-1">/api/public/resume/download</code>
              </p>
            )}
          </div>
          <Button variant={failed ? "brand" : "outline"} onClick={() => regenerate.mutate()} disabled={regenerate.isPending}>
            {regenerate.isPending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            {failed ? "Retry generation" : "Regenerate now"}
          </Button>
        </CardBody>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <FormProvider {...form}>
          <form
            noValidate
            className="space-y-6"
            onSubmit={form.handleSubmit((v) => save.mutate(v), () => toast.error("Please fix the highlighted fields."))}
          >
            <Card>
              <CardHeader title="Template & file" />
              <CardBody>
                <Controller
                  control={form.control}
                  name="template"
                  render={({ field }) => (
                    <fieldset>
                      <legend className="mb-2 text-sm font-medium">Template</legend>
                      <div className="grid grid-cols-2 gap-3">
                        {RESUME_TEMPLATES.map((t) => (
                          <label
                            key={t}
                            className={cn(
                              "hover:bg-accent cursor-pointer rounded-lg border p-3 text-sm",
                              field.value === t && "border-brand bg-brand-soft",
                            )}
                          >
                            <input type="radio" className="sr-only" name="template" value={t} checked={field.value === t} onChange={() => field.onChange(t)} />
                            <span className="block font-medium capitalize">{t}</span>
                            <span className="text-muted-foreground text-xs">
                              {t === "classic" ? "Centered header, black rules. Most conservative." : "Left-aligned, subtle teal headings."}
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  )}
                />
                <TextField name="fileName" label="Download file name" hint="e.g. Pavani_VLN_Charan_Resume.pdf" />
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Sections" description="Order and include/exclude. Per-item choices live on each item’s page." />
              <CardBody>
                <SectionOrder />
                <div className="grid grid-cols-2 gap-4">
                  <NumberField name="maxProjects" label="Max projects" hint="Featured first." />
                  <NumberField name="maxBulletsPerRole" label="Max bullets per role" />
                </div>
                <SwitchField name="includePortfolioUrl" label="Include portfolio URL" hint="Uses the site URL from Website settings." />
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Resume-only text (optional)" description="Leave empty to use your profile." />
              <CardBody>
                <TextField name="headlineOverride" label="Headline" />
                <TextAreaField name="summaryOverride" label="Summary" rows={4} />
              </CardBody>
            </Card>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="brand" disabled={save.isPending}>
                {save.isPending ? <Loader2 className="animate-spin" /> : <Save />} Save &amp; regenerate
              </Button>
              <Button variant="outline" onClick={() => draftPreview.mutate()} disabled={draftPreview.isPending}>
                {draftPreview.isPending ? <Loader2 className="animate-spin" /> : <Eye />} Preview with drafts
              </Button>
            </div>
          </form>
        </FormProvider>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader
              title={previewUrl ? "Draft preview" : "Published resume"}
              description={previewUrl ? "Includes unpublished drafts and unsaved settings. Not public." : "Exactly what recruiters download."}
              actions={
                previewUrl && (
                  <Button size="sm" variant="ghost" onClick={() => setPreviewUrl(null)}>
                    Show published
                  </Button>
                )
              }
            />
            {current || previewUrl ? (
              <iframe
                key={previewUrl ?? current?.id}
                title={previewUrl ? "Draft resume preview" : "Published resume"}
                src={previewUrl ?? `/api/public/resume/preview?v=${current?.version}`}
                className="h-[42rem] w-full bg-white"
              />
            ) : (
              <CardBody>
                <p className="text-muted-foreground text-sm">Publish your site to generate the first resume.</p>
              </CardBody>
            )}
          </Card>

          <Card>
            <CardHeader title="Version history" />
            <ul className="divide-y">
              {q.data.versions.map((v) => (
                <li key={v.id} className="flex flex-wrap items-center gap-3 px-5 py-2.5 text-sm">
                  <span className="w-10 font-mono text-xs">v{v.version}</span>
                  <VersionStatus v={v} />
                  {v.isCurrent && <Badge tone="brand">Current</Badge>}
                  <span className="text-muted-foreground flex-1 text-xs">
                    site v{v.revisionVersion} · {timeAgo(v.createdAt)}
                    {v.durationMs ? ` · ${(v.durationMs / 1000).toFixed(1)}s` : ""}
                  </span>
                  {v.status === "SUCCEEDED" && (
                    <a href={`/api/resume/versions/${v.id}/file`} target="_blank" rel="noopener noreferrer" className="text-brand text-xs hover:underline">
                      Open
                    </a>
                  )}
                  {v.error && <p className="text-destructive w-full truncate text-xs">{v.error}</p>}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
