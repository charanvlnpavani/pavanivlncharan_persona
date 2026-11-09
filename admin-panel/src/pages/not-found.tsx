import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <p className="text-brand font-mono text-sm">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
      <Button asChild variant="outline" className="mt-6">
        <Link to="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
