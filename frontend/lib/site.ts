/**
 * Public base URL of the site, used for canonical URLs, the sitemap and
 * Open Graph tags. Set NEXT_PUBLIC_SITE_URL in production (see .env.example).
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);
