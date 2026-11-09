import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm, type FieldValues, type Path } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { ApiError, api, errorMessage } from "@/services/api";

/** Load + save a single-record form (profile, settings). */
export function useSingletonForm<I extends FieldValues, R extends Record<string, unknown>>(
  path: "/profile" | "/settings",
  schema: z.ZodType<I, FieldValues>,
  defaults: I,
) {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: [path], queryFn: () => api<R>(path) });
  const form = useForm<I>({ resolver: zodResolver(schema as never) as never, defaultValues: defaults as never, mode: "onTouched" });

  const pick = (row: Record<string, unknown>) =>
    Object.fromEntries(Object.keys(defaults).map((k) => [k, row[k] ?? defaults[k]])) as I;

  useEffect(() => {
    if (query.data) form.reset(pick(query.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);

  const save = useMutation({
    mutationFn: ({ values, publish }: { values: I; publish: boolean }) =>
      api<R>(path, { method: "PUT", body: values, query: { publish: publish ? "true" : undefined } }),
    onSuccess: (row, { publish }) => {
      qc.setQueryData([path], row);
      form.reset(pick(row));
      void qc.invalidateQueries({ queryKey: ["publish-status"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(publish ? "Saved and published. The live site is updated." : "Saved. Publish when you’re ready.");
    },
    onError: (err) => {
      if (err instanceof ApiError && err.fields) {
        for (const [f, message] of Object.entries(err.fields)) form.setError(f as Path<I>, { message });
        toast.error("Please fix the highlighted fields.");
      } else toast.error(errorMessage(err));
    },
  });

  const submit = (publish: boolean) =>
    form.handleSubmit(
      (values) => save.mutate({ values, publish }),
      () => toast.error("Please fix the highlighted fields."),
    )();

  return { query, form, save, submit };
}
