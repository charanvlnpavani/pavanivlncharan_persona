import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="max-w-md text-center">
        <p className="text-brand font-mono text-sm font-medium">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Page not found</h1>
        <p className="text-muted-foreground mt-4">
          The page you’re looking for doesn’t exist or has moved.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link href="/">
              <ArrowLeft aria-hidden="true" /> Back home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/projects">See projects</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
