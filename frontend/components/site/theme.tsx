"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}

const order = ["light", "dark", "system"] as const;
const labels = { light: "Light theme", dark: "Dark theme", system: "System theme" } as const;
const icons = { light: Sun, dark: Moon, system: Monitor } as const;

// True only after hydration. The stored theme isn't known on the server, so
// rendering the real icon before then would cause a hydration mismatch.
const subscribe = () => () => {};
function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

/** Cycles light → dark → system. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const hydrated = useHydrated();

  const current = (hydrated && order.includes(theme as (typeof order)[number])
    ? theme
    : "system") as (typeof order)[number];
  const next = order[(order.indexOf(current) + 1) % order.length];
  const Icon = icons[current];

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next)}
      aria-label={`${labels[current]} (switch to ${labels[next].toLowerCase()})`}
      title={labels[current]}
    >
      <Icon className="size-4" aria-hidden="true" />
    </Button>
  );
}
