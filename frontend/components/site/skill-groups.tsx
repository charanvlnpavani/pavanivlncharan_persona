import type { SkillCategory } from "@portfolio/shared";

export function SkillGroups({ categories }: { categories: SkillCategory[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((cat) => (
        <section key={cat.id} aria-labelledby={`skills-${cat.id}`} className="bg-card hover:border-foreground/20 rounded-xl border p-5 transition-colors">
          <h3 id={`skills-${cat.id}`} className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
            {cat.name}
          </h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {cat.skills.map((s) => (
              <li key={s.id} className="bg-secondary hover:bg-brand-soft rounded-md px-2.5 py-1 text-sm transition-colors">
                {s.name}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
