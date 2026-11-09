import { Badge } from "@/components/ui/badge";
import { formatDateRange, formatDuration } from "@/lib/format";
import type { Experience } from "@/lib/types";

/**
 * Vertical timeline. `compact` (homepage) hides responsibilities and
 * shows fewer tags; the /experience page shows everything.
 */
export function ExperienceTimeline({
  items,
  compact = false,
}: {
  items: Experience[];
  compact?: boolean;
}) {
  return (
    <ol className="relative space-y-10 border-l pl-6 sm:pl-8">
      {items.map((exp) => (
        <li key={exp.id} className="relative">
          <span
            aria-hidden="true"
            className={
              "absolute top-1.5 -left-[calc(1.5rem+5px)] size-2.5 rounded-full ring-4 ring-background sm:-left-[calc(2rem+5px)] " +
              (exp.isCurrent ? "bg-brand" : "bg-muted-foreground/40")
            }
          />
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
            <h3 className="font-semibold tracking-tight">
              {exp.designation}
              <span className="text-muted-foreground font-normal"> · {exp.company}</span>
            </h3>
            <p className="text-muted-foreground shrink-0 font-mono text-xs">
              <time dateTime={exp.startDate}>{formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}</time>
              {exp.endDate && !exp.isCurrent && (
                <span className="hidden lg:inline"> · {formatDuration(exp.startDate, exp.endDate)}</span>
              )}
            </p>
          </div>
          {(exp.location || exp.employmentType) && (
            <p className="text-muted-foreground mt-1 text-sm">
              {[exp.employmentType, exp.location].filter(Boolean).join(" · ")}
            </p>
          )}

          {compact ? (
            exp.responsibilities[0] && (
              <p className="text-muted-foreground mt-3 max-w-3xl text-sm leading-relaxed">
                {exp.responsibilities[0]}
              </p>
            )
          ) : (
            <>
              {exp.summary && <p className="mt-3 max-w-3xl text-sm leading-relaxed">{exp.summary}</p>}
              <ul className="text-muted-foreground mt-3 max-w-3xl list-disc space-y-1.5 pl-5 text-sm leading-relaxed marker:text-muted-foreground/50">
                {exp.responsibilities.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </>
          )}

          {exp.technologies.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
              {(compact ? exp.technologies.slice(0, 4) : exp.technologies).map((t) => (
                <li key={t}>
                  <Badge>{t}</Badge>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}
