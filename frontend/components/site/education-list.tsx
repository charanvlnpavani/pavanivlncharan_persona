import { formatMonth, type Certification, type Education } from "@portfolio/shared";
import { Award, GraduationCap } from "lucide-react";

export function EducationList({ items }: { items: Education[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {items.map((e) => (
        <li key={e.id} className="bg-card flex gap-4 rounded-xl border p-5">
          <span aria-hidden="true" className="bg-secondary text-muted-foreground grid size-10 shrink-0 place-items-center rounded-lg">
            <GraduationCap className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-semibold tracking-tight">
                {e.degree}
                {e.field && <span className="text-muted-foreground font-normal"> · {e.field}</span>}
              </h3>
              <p className="text-muted-foreground shrink-0 font-mono text-xs">
                {e.startYear ? `${e.startYear} – ` : ""}
                {e.endYear}
              </p>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {e.institution}
              {e.location ? ` · ${e.location}` : ""}
            </p>
            {e.summary && <p className="mt-2 text-sm">{e.summary}</p>}
            {e.courses.length > 0 && (
              <ul className="text-muted-foreground mt-2 list-disc pl-5 text-sm">
                {e.courses.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CertificationList({ items }: { items: Certification[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {items.map((c) => (
        <li key={c.id} className="bg-card flex gap-4 rounded-xl border p-5">
          <span aria-hidden="true" className="bg-brand-soft text-brand grid size-10 shrink-0 place-items-center rounded-lg">
            <Award className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold tracking-tight">{c.name}</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {c.issuer} · <time dateTime={c.issueDate}>{formatMonth(c.issueDate)}</time>
            </p>
            {c.credentialUrl && (
              <a
                href={c.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand mt-2 inline-block text-sm font-medium hover:underline"
              >
                Verify credential<span className="sr-only"> for {c.name} (opens in a new tab)</span>
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
