import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  Briefcase,
  ExternalLink,
  Eye,
  FileText,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  Settings,
  Sparkles,
  Trophy,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { PUBLIC_SITE_URL } from "@/lib/config";
import { cn } from "@/lib/utils";
import { api, errorMessage } from "@/services/api";


const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/profile", label: "Profile & homepage", icon: UserRound },
  { to: "/experience", label: "Experience", icon: Briefcase },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/skills", label: "Skills", icon: Sparkles },
  { to: "/education", label: "Education", icon: GraduationCap },
  { to: "/certifications", label: "Certifications", icon: Award },
  { to: "/achievements", label: "Achievements", icon: Trophy },
  { to: "/blog", label: "Blog", icon: Newspaper },
  { to: "/messages", label: "Messages", icon: Mail },
  { to: "/resume", label: "Resume", icon: FileText },
  { to: "/settings", label: "Website settings", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { data: dash } = useQuery<{ counts: { unreadMessages: number } }>({
    queryKey: ["dashboard"],
    queryFn: () => api("/dashboard"),
    staleTime: 30_000,
  });
  return (
    <nav aria-label="Admin">
      <ul className="space-y-0.5">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive ? "bg-brand-soft text-foreground font-medium" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )
              }
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="flex-1">{label}</span>
              {to === "/messages" && (dash?.counts.unreadMessages ?? 0) > 0 && (
                <span className="bg-brand rounded-full px-1.5 text-[11px] font-semibold text-white dark:text-black">
                  {dash!.counts.unreadMessages}
                  <span className="sr-only"> unread</span>
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-3">
      <img src="/favicon.svg" alt="" className="size-7" />
      <div className="leading-tight">
        <p className="text-sm font-semibold">Portfolio</p>
        <p className="text-muted-foreground text-xs">Admin</p>
      </div>
    </div>
  );
}

/** Pending changes + one-click publish, visible on every page. */
function PublishBar() {
  const qc = useQueryClient();
  const status = useQuery<{ pendingChanges: number; latestRevision: { version: number; createdAt: string } | null }>({
    queryKey: ["publish-status"],
    queryFn: () => api("/publish"),
    refetchInterval: 30_000,
  });
  const publish = useMutation({
    mutationFn: () => api<{ revision: { version: number } }>("/publish", { method: "POST", body: {} }),
    onSuccess: (data) => {
      toast.success(`Published version ${data.revision.version}. The live site and resume are updating.`);
      void qc.invalidateQueries();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  const preview = useMutation({
    mutationFn: () => api<{ url: string }>("/preview", { method: "POST", body: { path: "/" } }),
    onSuccess: ({ url }) => window.open(url, "_blank", "noopener"),
    onError: (err) => toast.error(errorMessage(err)),
  });
  const pending = status.data?.pendingChanges ?? 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground hidden text-sm md:inline" aria-live="polite">
        {status.isPending
          ? ""
          : pending > 0
            ? `${pending} unpublished change${pending === 1 ? "" : "s"}`
            : status.data?.latestRevision
              ? `Live: version ${status.data.latestRevision.version}`
              : "Not published yet"}
      </span>
      <Button variant="ghost" size="sm" asChild>
        <a href={PUBLIC_SITE_URL} target="_blank" rel="noopener noreferrer">
          <ExternalLink /> <span className="hidden sm:inline">View site</span>
        </a>
      </Button>
      <Button variant="outline" size="sm" onClick={() => preview.mutate()} disabled={preview.isPending}>
        <Eye /> <span className="hidden sm:inline">Preview drafts</span>
      </Button>
      <Button variant="brand" size="sm" onClick={() => publish.mutate()} disabled={publish.isPending || pending === 0}>
        {publish.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
        Publish{pending > 0 ? ` (${pending})` : ""}
      </Button>
    </div>
  );
}

export function AdminLayout() {
  const { data: user } = useAuth();
  const logout = useLogout();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <a href="#main" className="bg-primary text-primary-foreground sr-only z-50 rounded px-3 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="bg-card sticky top-0 hidden h-dvh flex-col gap-6 border-r p-3 py-5 lg:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <div className="border-t px-3 pt-4">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="text-muted-foreground truncate text-xs">{user?.email}</p>
          <Button variant="ghost" size="sm" className="mt-2 -ml-3" onClick={() => logout.mutate()}>
            <LogOut /> Sign out
          </Button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="bg-background/85 sticky top-0 z-20 flex h-14 items-center gap-3 border-b px-4 backdrop-blur sm:px-8">
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
              <Dialog.Content className="bg-card fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-6 border-r p-3 py-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <Brand />
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="icon-sm" aria-label="Close menu">
                      <X />
                    </Button>
                  </Dialog.Close>
                </div>
                <Dialog.Title className="sr-only">Admin navigation</Dialog.Title>
                <div className="flex-1 overflow-y-auto">
                  <NavLinks onNavigate={() => setOpen(false)} />
                </div>
                <Button variant="ghost" size="sm" className="justify-start" onClick={() => logout.mutate()}>
                  <LogOut /> Sign out
                </Button>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          <div className="ml-auto">
            <PublishBar />
          </div>
        </header>
        <main id="main" className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
