"use client";

import { RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/** Shown if a public page throws (e.g. the API is unreachable once it exists). */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto max-w-md py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="text-muted-foreground mt-3">
        This page couldn’t load right now. Please try again in a moment.
      </p>
      <Button onClick={reset} variant="outline" className="mt-6">
        <RotateCcw aria-hidden="true" /> Try again
      </Button>
    </div>
  );
}
