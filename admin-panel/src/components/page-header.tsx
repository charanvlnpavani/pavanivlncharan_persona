import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function PageHeader({
  title,
  description,
  actions,
  back,
  badges,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  back?: { to: string; label: string };
  badges?: React.ReactNode;
}) {
  return (
    <header className="mb-6">
      {back && (
        <Link to={back.to} className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1.5 text-sm">
          <ArrowLeft className="size-4" aria-hidden="true" /> {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {badges}
          </div>
          {description && <p className="text-muted-foreground mt-1 max-w-2xl text-sm">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  );
}
