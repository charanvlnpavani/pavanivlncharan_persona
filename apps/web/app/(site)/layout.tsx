import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getSiteContent } from "@/lib/content";

/** Shell for every public page: skip link, sticky header, main, footer. */
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const { settings, profile, socials } = await getSiteContent();

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="bg-primary text-primary-foreground sr-only z-50 rounded-md px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SiteHeader
        siteTitle={settings.siteTitle}
        initials={profile.initials}
        navItems={settings.navItems}
        resumeUrl={profile.resumeUrl}
      />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">
        {children}
      </main>
      <SiteFooter
        name={profile.fullName}
        email={profile.publicEmail}
        footerText={settings.footerText}
        navItems={settings.navItems}
        socials={socials}
      />
    </div>
  );
}
