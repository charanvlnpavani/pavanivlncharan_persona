/**
 * Content for the public site, fetched from the backend.
 *
 * - Published content comes from the latest ContentRevision and is cached
 *   under the "content" tag. When you publish in the admin, the backend calls
 *   /api/revalidate, which expires the tag, so the next visitor gets the new
 *   version. Ordinary content updates never need a rebuild or redeploy.
 * - In Draft Mode (admin "Preview"), the cache is bypassed and drafts are read
 *   with a server-only secret that never reaches the browser.
 */
import type { BlogPost, Project, PublicSite } from "@portfolio/shared";
import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";
import fallbackSite from "./fallback-site.json";

/**
 * Bundled snapshot of published content, used when the API can't be reached
 * (e.g. the site is deployed before the backend). Refresh it with
 * `curl -s localhost:4000/api/public/site` once content changes.
 */
const FALLBACK_SITE = fallbackSite as PublicSite;

const BACKEND_URL = (process.env.BACKEND_URL ?? "http://localhost:4000").replace(/\/$/, "");
const SERVER_SECRET = process.env.REVALIDATE_SECRET ?? "";

/** Same-origin link (proxied to the API) that always serves the latest resume PDF. */
export const RESUME_DOWNLOAD_URL = "/api/public/resume/download";
export const RESUME_PREVIEW_URL = "/api/public/resume/preview";

export class NotFoundError extends Error {}

async function backend<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: { accept: "application/json", ...init?.headers },
    signal: AbortSignal.timeout(10_000),
  });
  if (res.status === 404) throw new NotFoundError(path);
  if (!res.ok) throw new Error(`Backend ${path} responded ${res.status}`);
  return (await res.json()) as T;
}

const draftHeaders = () => ({ "x-frontend-secret": SERVER_SECRET });

/** Cached content: refreshed on publish, and at most every 5 minutes as a fallback. */
function cachedContent() {
  cacheTag("content");
  cacheLife({ stale: 60, revalidate: 300, expire: 86_400 });
}

export async function getSite(): Promise<PublicSite & { draft?: boolean }> {
  "use cache";
  cachedContent();
  const { isEnabled } = await draftMode();
  if (isEnabled) {
    return backend<PublicSite & { draft: boolean }>("/api/preview/snapshot", { headers: draftHeaders() });
  }
  try {
    return await backend<PublicSite>("/api/public/site");
  } catch (err) {
    console.warn(`[api] ${BACKEND_URL} unreachable, serving bundled content:`, (err as Error).message);
    return FALLBACK_SITE;
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const site = await getSite();
  return site.projects.find((p) => p.slug === slug) ?? null;
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  "use cache";
  cachedContent();
  const { isEnabled } = await draftMode();
  try {
    return isEnabled
      ? await backend<BlogPost>(`/api/preview/blog/${encodeURIComponent(slug)}`, { headers: draftHeaders() })
      : await backend<BlogPost>(`/api/public/blog/${encodeURIComponent(slug)}`);
  } catch (err) {
    if (err instanceof NotFoundError || !isEnabled) return null;
    throw err;
  }
}

export type ResumeInfo = { available: boolean; version?: number; updatedAt?: string | null };

export async function getResumeInfo(): Promise<ResumeInfo> {
  "use cache";
  cacheTag("content");
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  try {
    return await backend<ResumeInfo>("/api/public/resume");
  } catch {
    return { available: false };
  }
}

/** Backend calls used by route handlers (not cached). */
export async function verifyPreviewToken(token: string) {
  try {
    const { valid } = await backend<{ valid: boolean }>("/api/preview/verify", { headers: { "x-preview-token": token } });
    return valid;
  } catch {
    return false;
  }
}
