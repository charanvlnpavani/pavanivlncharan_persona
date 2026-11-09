import { Suspense } from "react";
import { DraftBanner } from "@/components/site/draft-banner";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { RESUME_DOWNLOAD_URL, getResumeInfo, getSite } from "@/lib/api";

/** Shell for every public page: preview banner, skip link, header, main, footer. */
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [{ settings, profile, socials }, resume] = await Promise.all([getSite(), getResumeInfo()]);
  const resumeUrl = resume.available ? RESUME_DOWNLOAD_URL : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <Suspense fallback={null}>
        <DraftBanner />
      </Suspense>
      <a
        href="#main"
        className="bg-primary text-primary-foreground sr-only z-50 rounded-md px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SiteHeader siteTitle={settings.siteTitle} initials={profile.initials} navItems={settings.navItems} resumeUrl={resumeUrl} />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">
        {children}
      </main>
      <SiteFooter
        name={profile.fullName}
        email={profile.email}
        footerText={settings.footerText}
        navItems={settings.navItems}
        socials={socials}
      />
    </div>
  );
}
