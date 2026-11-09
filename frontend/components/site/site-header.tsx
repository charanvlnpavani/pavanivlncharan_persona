"use client";

import { FileDown, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { NavItem } from "@portfolio/shared";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme";

type Props = {
  siteTitle: string;
  initials: string;
  navItems: NavItem[];
  /** Stable link to the latest resume PDF, or null if none is published yet. */
  resumeUrl: string | null;
};

function isActive(pathname: string, href: string) {
  if (href.startsWith("/#")) return false; // in-page anchors are never "current"
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({ siteTitle, initials, navItems, resumeUrl }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-background/80 supports-[backdrop-filter]:bg-background/65 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="focus-visible:ring-ring/50 flex items-center gap-2.5 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-[3px]"
        >
          <span
            aria-hidden="true"
            className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg font-mono text-xs"
          >
            {initials}
          </span>
          <span className="hidden sm:inline">{siteTitle}</span>
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "focus-visible:ring-ring/50 rounded-md px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-[3px]",
                      active
                        ? "text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          {resumeUrl && (
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <a href={resumeUrl} download>
                <FileDown aria-hidden="true" />
                Resume
              </a>
            </Button>
          )}
          <ThemeToggle />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>{siteTitle}</SheetTitle>
                <SheetDescription className="sr-only">Site navigation</SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile" className="px-4">
                <ul className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const active = isActive(pathname, item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "hover:bg-accent block rounded-md px-3 py-2.5 text-base",
                            active ? "bg-accent font-medium" : "text-muted-foreground",
                          )}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                {resumeUrl && (
                  <Button asChild variant="outline" className="mt-6 w-full">
                    <a href={resumeUrl} download>
                      <FileDown aria-hidden="true" />
                      Download resume
                    </a>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
