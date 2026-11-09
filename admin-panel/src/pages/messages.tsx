import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Mail, MailOpen, ShieldAlert, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge, Card, EmptyState, ErrorState, Skeleton } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { api, errorMessage } from "@/services/api";
import type { ContactMessage } from "@/types";
import { timeAgo } from "@/lib/time";

const filters = [
  { value: undefined, label: "Inbox" },
  { value: "NEW", label: "Unread" },
  { value: "ARCHIVED", label: "Archived" },
  { value: "SPAM", label: "Spam" },
] as const;

export function MessagesPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<(typeof filters)[number]["value"]>(undefined);
  const [openId, setOpenId] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["messages", status],
    queryFn: () => api<ContactMessage[]>("/contact", { query: { status } }),
  });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["messages"] });
    void qc.invalidateQueries({ queryKey: ["dashboard"] });
  };
  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContactMessage["status"] }) => api(`/contact/${id}`, { method: "PATCH", body: { status } }),
    onSuccess: refresh,
    onError: (err) => toast.error(errorMessage(err)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api(`/contact/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      refresh();
      toast.success("Message deleted");
    },
  });

  const open = (m: ContactMessage) => {
    setOpenId(openId === m.id ? null : m.id);
    if (m.status === "NEW") update.mutate({ id: m.id, status: "READ" });
  };

  return (
    <>
      <PageHeader title="Messages" description="Submissions from your website’s contact form. Rate-limited and spam-filtered." />
      <div role="tablist" aria-label="Filter messages" className="mb-4 flex gap-1">
        {filters.map((f) => (
          <button
            key={f.label}
            role="tab"
            aria-selected={status === f.value}
            onClick={() => setStatus(f.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm",
              status === f.value ? "bg-brand-soft font-medium" : "text-muted-foreground hover:bg-accent",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {q.isPending ? (
        <Skeleton className="h-40" />
      ) : q.isError ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => q.refetch()} />
      ) : q.data.length === 0 ? (
        <EmptyState title="No messages here" description="When someone uses the contact form, their message appears here." />
      ) : (
        <Card>
          <ul className="divide-y">
            {q.data.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => open(m)} aria-expanded={openId === m.id} className="hover:bg-accent/50 flex w-full items-center gap-3 px-4 py-3 text-left">
                  {m.status === "NEW" ? <Mail className="text-brand size-4 shrink-0" aria-hidden="true" /> : <MailOpen className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />}
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate text-sm", m.status === "NEW" && "font-semibold")}>
                      {m.name} <span className="text-muted-foreground font-normal">· {m.email}</span>
                    </span>
                    <span className="text-muted-foreground block truncate text-sm">{m.subject || m.message.slice(0, 90)}</span>
                  </span>
                  {m.status === "NEW" && <Badge tone="brand">New</Badge>}
                  {m.status === "SPAM" && <Badge tone="danger">Spam</Badge>}
                  <time className="text-muted-foreground shrink-0 text-xs" dateTime={m.createdAt}>
                    {timeAgo(m.createdAt)}
                  </time>
                </button>
                {openId === m.id && (
                  <div className="bg-muted/30 border-t px-4 py-4">
                    {m.subject && <p className="mb-2 font-medium">{m.subject}</p>}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.message}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button asChild size="sm">
                        <a href={`mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent(`Re: ${m.subject || "Your message"}`)}`}>
                          <Mail /> Reply by email
                        </a>
                      </Button>
                      {m.status !== "ARCHIVED" && (
                        <Button size="sm" variant="outline" onClick={() => update.mutate({ id: m.id, status: "ARCHIVED" })}>
                          <Archive /> Archive
                        </Button>
                      )}
                      {m.status !== "SPAM" ? (
                        <Button size="sm" variant="outline" onClick={() => update.mutate({ id: m.id, status: "SPAM" })}>
                          <ShieldAlert /> Mark as spam
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => update.mutate({ id: m.id, status: "READ" })}>
                          Not spam
                        </Button>
                      )}
                      <ConfirmDialog
                        title="Delete this message?"
                        description="This can’t be undone."
                        onConfirm={() => remove.mutateAsync(m.id)}
                        trigger={
                          <Button size="sm" variant="ghost" className="hover:text-destructive">
                            <Trash2 /> Delete
                          </Button>
                        }
                      />
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
