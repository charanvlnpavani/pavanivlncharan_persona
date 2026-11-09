import { CircleDot, EyeOff, PencilLine } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import type { ItemFlags } from "@/types";

/**
 * What the admin needs to know about an item at a glance:
 * - Live / Draft: is it on the public site right now?
 * - Unpublished changes: saved edits the live site doesn't show yet.
 * - Hidden: kept, but never shown publicly.
 */
export function StatusBadges({ item }: { item: ItemFlags }) {
  const publishable = item.status !== undefined;
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {publishable &&
        (item.isLive ? (
          <Badge tone="success">
            <CircleDot className="size-3" aria-hidden="true" /> Live
          </Badge>
        ) : item.status === "PUBLISHED" ? (
          <Badge tone="warning">Publish pending</Badge>
        ) : (
          <Badge>Draft</Badge>
        ))}
      {item.isLive && item.hasUnpublishedChanges && (
        <Badge tone="warning">
          <PencilLine className="size-3" aria-hidden="true" /> Unpublished changes
        </Badge>
      )}
      {item.isVisible === false && (
        <Badge>
          <EyeOff className="size-3" aria-hidden="true" /> Hidden
        </Badge>
      )}
    </span>
  );
}
