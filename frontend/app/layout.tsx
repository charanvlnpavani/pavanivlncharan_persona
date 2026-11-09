import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/site/theme";
import { getSite } from "@/lib/api";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

/** SEO defaults come from Website settings in the admin. */
export async function generateMetadata(): Promise<Metadata> {
  const { settings, profile } = await getSite();
  return {
    metadataBase: new URL(siteUrl),
    title: { default: settings.seoTitle, template: `%s · ${settings.siteTitle}` },
    description: settings.seoDescription,
    authors: [{ name: profile.fullName }],
    creator: profile.fullName,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: settings.siteTitle,
      title: settings.seoTitle,
      description: settings.seoDescription,
      url: "/",
      locale: "en_US",
    },
    twitter: { card: "summary_large_image", title: settings.seoTitle, description: settings.seoDescription },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfd" },
    { media: "(prefers-color-scheme: dark)", color: "#16171b" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { settings } = await getSite();
  return (
    // suppressHydrationWarning: next-themes sets the theme class before React hydrates.
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh">
        <ThemeProvider defaultTheme={settings.defaultTheme}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
