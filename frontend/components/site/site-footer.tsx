import Link from "next/link";
import type { NavItem, SocialLink } from "@/lib/types";
import { SocialLinks } from "./social-links";

type Props = {
  name: string;
  email: string;
  footerText: string;
  navItems: NavItem[];
  socials: SocialLink[];
};

export function SiteFooter({ name, email, footerText, navItems, socials }: Props) {
  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-3">
          <p className="font-semibold tracking-tight">{name}</p>
          <p className="text-muted-foreground max-w-sm text-sm">
            Have a project or role in mind? Email is the fastest way to reach me.
          </p>
          <a
            href={`mailto:${email}`}
            className="text-brand text-sm font-medium underline-offset-4 hover:underline"
          >
            {email}
          </a>
        </div>

        <nav aria-label="Footer">
          <p className="text-muted-foreground mb-3 font-mono text-xs tracking-wider uppercase">
            Pages
          </p>
          <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-brand transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-muted-foreground mb-3 font-mono text-xs tracking-wider uppercase">
            Elsewhere
          </p>
          <SocialLinks links={socials} className="-ml-2" />
        </div>
      </div>

      <div className="border-t">
        <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © <CopyrightYear /> {name}
          </p>
          <p>{footerText}</p>
        </div>
      </div>
    </footer>
  );
}

/* The year is computed at build/revalidate time. With Cache Components,
   reading the clock needs "use cache" so it can be part of the static shell. */
async function CopyrightYear() {
  "use cache";
  return <>{new Date().getFullYear()}</>;
}
