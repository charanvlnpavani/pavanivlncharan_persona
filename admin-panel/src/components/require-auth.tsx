import { Loader2 } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ErrorState } from "@/components/ui/primitives";
import { useAuth } from "@/hooks/use-auth";
import { errorMessage } from "@/services/api";

/** Only logged-in admins get past this point. */
export function RequireAuth() {
  const { data: user, isPending, isError, error, refetch } = useAuth();
  const location = useLocation();
  if (isPending) {
    return (
      <div className="grid min-h-dvh place-items-center" role="status">
        <Loader2 className="text-muted-foreground size-6 animate-spin" aria-label="Loading" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="mx-auto max-w-md p-8">
        <ErrorState message={`Can’t reach the API. Is the backend running? (${errorMessage(error)})`} onRetry={() => refetch()} />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

