import { Eye } from "lucide-react";
import { draftMode } from "next/headers";

/** Shown only while the admin is previewing unpublished drafts. */
export async function DraftBanner() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;
  return (
    <div role="status" className="bg-brand text-brand-foreground sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm sm:px-6">
        <span className="inline-flex items-center gap-2 font-medium">
          <Eye className="size-4" aria-hidden="true" />
          Preview mode: you’re seeing unpublished drafts. Visitors don’t see these.
        </span>
        <form action="/api/draft/disable" method="post">
          <button type="submit" className="rounded-md bg-black/15 px-3 py-1 font-medium hover:bg-black/25">
            Exit preview
          </button>
        </form>
      </div>
    </div>
  );
}
