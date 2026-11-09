import { Loader2, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Sticky Save / Save & publish bar for single-record forms. */
export function FormActions({ dirty, busy, onSave, onPublish }: { dirty: boolean; busy: boolean; onSave: () => void; onPublish: () => void }) {
  return (
    <div className="bg-background/90 sticky bottom-0 z-10 -mx-4 mt-8 border-t px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="text-muted-foreground mr-auto text-xs" aria-live="polite">
          {dirty ? "Unsaved changes" : "All changes saved"}
        </span>
        <Button variant="outline" onClick={onSave} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Save />} Save without publishing
        </Button>
        <Button variant="brand" onClick={onPublish} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Upload />} Save &amp; publish
        </Button>
      </div>
    </div>
  );
}
