import type { SiteSnapshot } from "@portfolio/shared";
import { prisma } from "../lib/prisma";

/**
 * The latest published snapshot, with a tiny in-process cache. The cache is
 * cleared on publish, and also expires after a few seconds so multiple API
 * instances converge quickly.
 */
let cache: { at: number; value: { id: string; version: number; snapshot: SiteSnapshot } | null } | null = null;
const TTL_MS = 5_000;

export async function getLatestRevision() {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value;
  const row = await prisma.contentRevision.findFirst({
    orderBy: { version: "desc" },
    select: { id: true, version: true, snapshot: true },
  });
  const value = row ? { id: row.id, version: row.version, snapshot: row.snapshot as unknown as SiteSnapshot } : null;
  cache = { at: Date.now(), value };
  return value;
}

export function clearRevisionCache() {
  cache = null;
}
