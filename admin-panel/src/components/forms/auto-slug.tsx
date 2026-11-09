import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { slugify } from "@/lib/slug";

/** Fills the slug from the title until the slug is edited by hand. */
export function AutoSlug({ isNew }: { isNew: boolean }) {
  const { setValue, getFieldState } = useFormContext();
  const title = useWatch({ name: "title" }) as string;
  useEffect(() => {
    if (isNew && !getFieldState("slug").isDirty) setValue("slug", slugify(title ?? ""), { shouldValidate: false });
  }, [title, isNew, setValue, getFieldState]);
  return null;
}
