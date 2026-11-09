import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, Upload, Undo2 } from "lucide-react";
import { Link } from "react-router-dom";
import { StatusBadges } from "@/components/status-badges";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, EmptyState, ErrorState, Skeleton } from "@/components/ui/primitives";
import { useResource } from "@/hooks/use-resource";
import { errorMessage } from "@/services/api";
import type { ItemFlags, ResourceName } from "@/types";
import { PageHeader } from "./page-header";

type Props<T extends ItemFlags> = {
  resource: ResourceName;
  title: string;
  description: string;
  singular: string;
  basePath: string;
  primary: (item: T) => string;
  secondary?: (item: T) => React.ReactNode;
  reorderable?: boolean;
  /** Optional filter, e.g. skills by category. */
  filter?: (item: T) => boolean;
  headerExtra?: React.ReactNode;
  emptyHint?: string;
};

/** List page used by every content type. */
export function ResourceList<T extends ItemFlags>({
  resource,
  title,
  description,
  singular,
  basePath,
  primary,
  secondary,
  reorderable = true,
  filter,
  headerExtra,
  emptyHint,
}: Props<T>) {
  const { list, setStatus, remove, reorder } = useResource<T>(resource);
  const all = list.data ?? [];
  const items = filter ? all.filter(filter) : all;

  const move = (index: number, dir: -1 | 1) => {
    const ids = all.map((i) => i.id);
    const a = all.findIndex((i) => i.id === items[index].id);
    const b = all.findIndex((i) => i.id === items[index + dir]?.id);
    if (a < 0 || b < 0) return;
    [ids[a], ids[b]] = [ids[b], ids[a]];
    reorder.mutate(ids);
  };

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button asChild>
            <Link to={`${basePath}/new`}>
              <Plus /> Add {singular}
            </Link>
          </Button>
        }
      />
      {headerExtra}

      {list.isPending ? (
        <Card className="divide-y">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="ml-auto h-4 w-16" />
            </div>
          ))}
        </Card>
      ) : list.isError ? (
        <ErrorState message={errorMessage(list.error)} onRetry={() => list.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          title={`No ${title.toLowerCase()} yet`}
          description={emptyHint ?? `Add your first ${singular}. It stays a draft until you publish it.`}
          action={
            <Button asChild variant="outline">
              <Link to={`${basePath}/new`}>
                <Plus /> Add {singular}
              </Link>
            </Button>
          }
        />
      ) : (
        <Card>
          <ul className="divide-y">
            {items.map((item, index) => (
              <li key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                {reorderable && (
                  <div className="hidden flex-col sm:flex">
                    <button
                      type="button"
                      aria-label={`Move ${primary(item)} up`}
                      disabled={index === 0 || reorder.isPending}
                      onClick={() => move(index, -1)}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-25"
                    >
                      <ArrowUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${primary(item)} down`}
                      disabled={index === items.length - 1 || reorder.isPending}
                      onClick={() => move(index, 1)}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-25"
                    >
                      <ArrowDown className="size-4" />
                    </button>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <Link to={`${basePath}/${item.id}`} className="font-medium hover:underline">
                    {primary(item)}
                  </Link>
                  {secondary && <div className="text-muted-foreground mt-0.5 truncate text-sm">{secondary(item)}</div>}
                </div>
                <StatusBadges item={item} />
                <div className="flex items-center gap-1">
                  {item.status !== undefined &&
                    (item.isLive || item.status === "PUBLISHED" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={setStatus.isPending}
                        onClick={() => setStatus.mutate({ id: item.id, publish: false })}
                      >
                        <Undo2 /> Unpublish
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={setStatus.isPending}
                        onClick={() => setStatus.mutate({ id: item.id, publish: true })}
                      >
                        <Upload /> Publish
                      </Button>
                    ))}
                  <Button asChild variant="ghost" size="icon-sm" aria-label={`Edit ${primary(item)}`}>
                    <Link to={`${basePath}/${item.id}`}>
                      <Pencil />
                    </Link>
                  </Button>
                  <ConfirmDialog
                    title={`Delete “${primary(item)}”?`}
                    description="This can’t be undone. If it’s live, it disappears from the site at the next publish."
                    onConfirm={() => remove.mutateAsync(item.id)}
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label={`Delete ${primary(item)}`} className="hover:text-destructive">
                        <Trash2 />
                      </Button>
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
