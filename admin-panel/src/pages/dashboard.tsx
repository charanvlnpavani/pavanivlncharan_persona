import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Award, Briefcase, CheckCircle2, FileText, FolderKanban, Mail, Newspaper, Plus, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge, Card, CardBody, CardHeader, ErrorState, Skeleton } from "@/components/ui/primitives";
import { useAuth } from "@/hooks/use-auth";
import { api, errorMessage } from "@/services/api";
import type { Dashboard } from "@/types";
import { timeAgo } from "@/lib/time";

export function DashboardPage() {
  const { data: user } = useAuth();
  const q = useQuery({ queryKey: ["dashboard"], queryFn: () => api<Dashboard>("/dashboard") });

  if (q.isError) return <ErrorState message={errorMessage(q.error)} onRetry={() => q.refetch()} />;
  const d = q.data;

  const stats = [
    { label: "Projects", value: d?.counts.projects, icon: FolderKanban, to: "/projects" },
    { label: "Skills", value: d?.counts.skills, icon: Sparkles, to: "/skills" },
    { label: "Experience", value: d?.counts.experiences, icon: Briefcase, to: "/experience" },
    { label: "Certifications", value: d?.counts.certifications, icon: Award, to: "/certifications" },
    { label: "Blog posts", value: d?.counts.blogPosts, icon: Newspaper, to: "/blog" },
    { label: "Unread messages", value: d?.counts.unreadMessages, icon: Mail, to: "/messages" },
  ];

  const resumeFailed = d?.resume.latest?.status === "FAILED";

  return (
    <>
      <PageHeader
        title={`Welcome back${user?.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Edit content, then publish to update your live portfolio and regenerate your resume."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardBody className="flex items-start gap-4">
            {d && d.publishing.pendingChanges > 0 ? (
              <AlertTriangle className="text-warning mt-0.5 size-5 shrink-0" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="text-success mt-0.5 size-5 shrink-0" aria-hidden="true" />
            )}
            <div>
              <p className="font-medium">
                {!d ? <Skeleton className="h-4 w-40" /> : d.publishing.pendingChanges > 0 ? `${d.publishing.pendingChanges} unpublished changes` : "Live site is up to date"}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                {d?.publishing.latestRevision
                  ? `Version ${d.publishing.latestRevision.version}, published ${timeAgo(d.publishing.latestRevision.createdAt)}.`
                  : "Nothing published yet."}{" "}
                Use <strong>Publish</strong> in the top bar to push changes live.
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-start gap-4">
            {resumeFailed ? (
              <AlertTriangle className="text-destructive mt-0.5 size-5 shrink-0" aria-hidden="true" />
            ) : (
              <FileText className="text-brand mt-0.5 size-5 shrink-0" aria-hidden="true" />
            )}
            <div className="min-w-0">
              <p className="font-medium">
                {!d ? (
                  <Skeleton className="h-4 w-40" />
                ) : resumeFailed ? (
                  "Last resume generation failed"
                ) : d.resume.current ? (
                  `Resume v${d.resume.current.version} is live`
                ) : (
                  "No resume generated yet"
                )}
              </p>
              <p className="text-muted-foreground mt-1 truncate text-sm">
                {resumeFailed
                  ? `${d?.resume.latest?.error ?? ""} Recruiters still get the previous version.`
                  : d?.resume.current?.completedAt
                    ? `Generated ${timeAgo(d.resume.current.completedAt)} from your published content.`
                    : "It generates automatically when you publish."}
              </p>
              <Button asChild variant="link" className="mt-1 h-auto px-0">
                <Link to="/resume">{resumeFailed ? "Retry generation" : "Manage resume"}</Link>
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, to }) => (
          <li key={label}>
            <Link to={to} className="bg-card hover:border-foreground/20 flex items-center gap-4 rounded-xl border p-4 transition-colors">
              <span className="bg-muted text-muted-foreground grid size-10 place-items-center rounded-lg">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-2xl font-semibold tabular-nums">{value ?? <Skeleton className="h-7 w-8" />}</span>
                <span className="text-muted-foreground text-sm">{label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/experience/new">
            <Plus /> Add experience
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/projects/new">
            <Plus /> Add project
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/skills/new">
            <Plus /> Add skill
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/blog/new">
            <Plus /> Write a post
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Recent messages" actions={<Link to="/messages" className="text-brand text-sm hover:underline">View all</Link>} />
          {!d ? (
            <CardBody>
              <Skeleton className="h-16" />
            </CardBody>
          ) : d.recentMessages.length === 0 ? (
            <CardBody>
              <p className="text-muted-foreground text-sm">No messages yet. They appear here when visitors use the contact form.</p>
            </CardBody>
          ) : (
            <ul className="divide-y">
              {d.recentMessages.map((m) => (
                <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="text-muted-foreground truncate text-xs">{m.subject || m.email}</p>
                  </div>
                  {m.status === "NEW" && <Badge tone="brand">New</Badge>}
                  <time className="text-muted-foreground text-xs" dateTime={m.createdAt}>
                    {timeAgo(m.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Recent changes" />
          {!d ? (
            <CardBody>
              <Skeleton className="h-16" />
            </CardBody>
          ) : d.recentActivity.length === 0 ? (
            <CardBody>
              <p className="text-muted-foreground text-sm">No changes yet.</p>
            </CardBody>
          ) : (
            <ul className="divide-y">
              {d.recentActivity.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                  <Badge tone={a.action === "published" ? "success" : a.action === "deleted" ? "danger" : "neutral"} className="capitalize">
                    {a.action}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate">{a.label}</span>
                  <time className="text-muted-foreground shrink-0 text-xs" dateTime={a.createdAt}>
                    {timeAgo(a.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
