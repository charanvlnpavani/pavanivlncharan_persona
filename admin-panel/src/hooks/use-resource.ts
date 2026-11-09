import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, errorMessage } from "@/services/api";
import type { ItemFlags, ResourceName } from "@/types";

/**
 * Data hooks for one content type. Every write refreshes the list, the
 * publish bar and the dashboard so counts and badges stay in sync.
 */
export function useResource<T extends ItemFlags>(name: ResourceName) {
  const qc = useQueryClient();
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: [name] });
    void qc.invalidateQueries({ queryKey: ["publish-status"] });
    void qc.invalidateQueries({ queryKey: ["dashboard"] });
    void qc.invalidateQueries({ queryKey: ["resume"] });
  };

  const list = useQuery({ queryKey: [name], queryFn: () => api<T[]>(`/${name}`) });

  const save = useMutation({
    mutationFn: ({ id, input, publish }: { id?: string; input: unknown; publish?: boolean }) =>
      api<T>(id ? `/${name}/${id}` : `/${name}`, {
        method: id ? "PUT" : "POST",
        body: input,
        query: { publish: publish ? "true" : undefined },
      }),
    onSuccess: (item, vars) => {
      qc.setQueryData([name, item.id], item);
      refresh();
      toast.success(vars.publish ? "Saved and published. The live site is updated." : "Saved as draft.");
    },
  });

  const setStatus = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      api<T>(`/${name}/${id}/${publish ? "publish" : "unpublish"}`, { method: "POST" }),
    onSuccess: (_item, vars) => {
      refresh();
      toast.success(vars.publish ? "Published. It’s now on the live site." : "Unpublished. Removed from the live site.");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api<void>(`/${name}/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      refresh();
      toast.success("Deleted. Publish to remove it from the live site.");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const reorder = useMutation({
    mutationFn: (ids: string[]) => api<T[]>(`/${name}/reorder`, { method: "PATCH", body: { ids } }),
    onMutate: async (ids) => {
      // Optimistic: move rows immediately.
      await qc.cancelQueries({ queryKey: [name] });
      const prev = qc.getQueryData<T[]>([name]);
      if (prev) qc.setQueryData([name], ids.map((id) => prev.find((r) => r.id === id)!).filter(Boolean));
      return { prev };
    },
    onError: (err, _ids, ctx) => {
      if (ctx?.prev) qc.setQueryData([name], ctx.prev);
      toast.error(errorMessage(err));
    },
    onSettled: refresh,
  });

  return { list, save, setStatus, remove, reorder };
}

export function useItem<T>(name: ResourceName, id: string | undefined) {
  return useQuery({
    queryKey: [name, id],
    queryFn: () => api<T>(`/${name}/${id}`),
    enabled: Boolean(id),
  });
}
