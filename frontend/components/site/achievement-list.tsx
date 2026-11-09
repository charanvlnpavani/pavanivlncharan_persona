import { formatMonth, type Achievement } from "@portfolio/shared";
import { Trophy } from "lucide-react";

export function AchievementList({ items }: { items: Achievement[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {items.map((a) => (
        <li key={a.id} className="bg-card flex gap-4 rounded-xl border p-5">
          <span aria-hidden="true" className="bg-secondary text-muted-foreground grid size-10 shrink-0 place-items-center rounded-lg">
            <Trophy className="size-5" />
          </span>
          <div className="min-w-0">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-semibold tracking-tight">
                {a.url ? (
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="hover:text-brand underline-offset-4 hover:underline">
                    {a.title}
                  </a>
                ) : (
                  a.title
                )}
              </h3>
              {a.date && <time className="text-muted-foreground shrink-0 font-mono text-xs" dateTime={a.date}>{formatMonth(a.date)}</time>}
            </div>
            {a.description && <p className="text-muted-foreground mt-1 text-sm">{a.description}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
