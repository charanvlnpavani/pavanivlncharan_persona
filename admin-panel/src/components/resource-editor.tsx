import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, Loader2, Save, Trash2, Upload } from "lucide-react";
import { useEffect } from "react";
import { FormProvider, useForm, type FieldValues, type Path, type UseFormReturn } from "react-hook-form";
import { useBlocker, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { z } from "zod";
import { StatusBadges } from "@/components/status-badges";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ErrorState, Skeleton } from "@/components/ui/primitives";
import { useItem, useResource } from "@/hooks/use-resource";
import { ApiError, api, errorMessage } from "@/services/api";
import type { ItemFlags, ResourceName } from "@/types";
import { PageHeader } from "./page-header";

type Props<T extends ItemFlags, I extends FieldValues> = {
  resource: ResourceName;
  schema: z.ZodType<I, FieldValues>;
  defaults: I;
  singular: string;
  basePath: string;
  title: (item: T | undefined) => string;
  /** Public page to open in preview, e.g. "/projects/my-slug". */
  previewPath?: (values: I) => string;
  children: (ctx: { item: T | undefined; form: UseFormReturn<I> }) => React.ReactNode;
};

/** Copies only the form's own fields out of an API item. */
function toFormValues<I extends FieldValues>(item: Record<string, unknown>, defaults: I): I {
  return Object.fromEntries(Object.keys(defaults).map((k) => [k, item[k] ?? defaults[k]])) as I;
}

/**
 * Create/edit page for one content item.
 * "Save draft" keeps the live site unchanged; "Save & publish" updates it
 * immediately (and regenerates the resume if the content is on it).
 */
export function ResourceEditor<T extends ItemFlags, I extends FieldValues>({
  resource,
  schema,
  defaults,
  singular,
  basePath,
  title,
  previewPath,
  children,
}: Props<T, I>) {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const item = useItem<T>(resource, isNew ? undefined : id);
  const { save, remove } = useResource<T>(resource);

  const form = useForm<I>({
    resolver: zodResolver(schema as never) as never,
    defaultValues: defaults as never,
    mode: "onTouched",
  });

  // Load the saved item into the form once it arrives.
  useEffect(() => {
    if (item.data) form.reset(toFormValues(item.data as Record<string, unknown>, defaults));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.data]);

  // Warn before leaving with unsaved edits.
  const dirty = form.formState.isDirty && !save.isPending;
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname);
  useEffect(() => {
    if (blocker.state === "blocked") {
      if (window.confirm("You have unsaved changes. Leave without saving?")) blocker.proceed();
      else blocker.reset();
    }
  }, [blocker]);
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const submit = (publish: boolean) =>
    form.handleSubmit(async (values) => {
      try {
        const saved = await save.mutateAsync({ id: isNew ? undefined : id, input: values, publish });
        form.reset(toFormValues(saved as Record<string, unknown>, defaults));
        if (isNew) navigate(`${basePath}/${saved.id}`, { replace: true });
      } catch (err) {
        if (err instanceof ApiError && err.fields) {
          for (const [field, message] of Object.entries(err.fields)) form.setError(field as Path<I>, { message });
          toast.error("Please fix the highlighted fields.");
        } else {
          toast.error(errorMessage(err));
        }
      }
    }, () => toast.error("Please fix the highlighted fields."))();

  const preview = useMutation({
    mutationFn: async () => {
      const { url } = await api<{ url: string }>("/preview", {
        method: "POST",
        body: { path: previewPath ? previewPath(form.getValues()) : "/" },
      });
      return url;
    },
    onSuccess: (url) => window.open(url, "_blank", "noopener"),
    onError: (err) => toast.error(errorMessage(err)),
  });

  if (!isNew && item.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (!isNew && item.isError) return <ErrorState message={errorMessage(item.error)} onRetry={() => item.refetch()} />;

  const isLive = item.data?.isLive || item.data?.status === "PUBLISHED";
  const busy = save.isPending;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit(false);
        }}
        noValidate
      >
        <PageHeader
          back={{ to: basePath, label: `All ${basePath.replace("/", "")}` }}
          title={isNew ? `New ${singular}` : title(item.data)}
          badges={item.data && <StatusBadges item={item.data} />}
          actions={
            !isNew && (
              <>
                {previewPath && (
                  <Button variant="outline" onClick={() => preview.mutate()} disabled={preview.isPending}>
                    <Eye /> Preview
                  </Button>
                )}
                <ConfirmDialog
                  title={`Delete this ${singular}?`}
                  description="This can’t be undone."
                  onConfirm={async () => {
                    await remove.mutateAsync(id!);
                    form.reset();
                    navigate(basePath);
                  }}
                  trigger={
                    <Button variant="outline" className="hover:text-destructive">
                      <Trash2 /> Delete
                    </Button>
                  }
                />
              </>
            )
          }
        />

        <div className="space-y-6">{children({ item: item.data, form })}</div>

        {/* Sticky action bar */}
        <div className="bg-background/90 sticky bottom-0 z-10 -mx-4 mt-8 border-t px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="text-muted-foreground mr-auto text-xs" aria-live="polite">
              {form.formState.isDirty ? "Unsaved changes" : isNew ? "" : "All changes saved"}
            </span>
            <Button type="submit" variant="outline" disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : <Save />}
              {isLive ? "Save without publishing" : "Save draft"}
            </Button>
            <Button variant="brand" disabled={busy} onClick={() => void submit(true)}>
              {busy ? <Loader2 className="animate-spin" /> : <Upload />}
              Save &amp; publish
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
