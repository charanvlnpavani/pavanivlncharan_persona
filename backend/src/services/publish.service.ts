import type { SiteSnapshot } from "@portfolio/shared";
import type { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { logActivity } from "./activity.service";
import { resumeQueue } from "./resume/resume.service";
import { revalidateFrontend } from "./revalidate.service";
import { clearRevisionCache } from "./revision.service";
import { buildSnapshot } from "./snapshot.service";

/** Any constant works; it just has to be the same for every publish. */
const PUBLISH_LOCK_KEY = 724_011;

/**
 * Publishes the site: freezes every published + visible row into a new
 * ContentRevision. Runs under a Postgres advisory lock so two publishes can't
 * interleave; revision versions only ever increase.
 *
 * After the transaction commits, the public site cache is refreshed and the
 * resume generator is queued for the new revision.
 */
export async function publishSite(opts: { userId?: string; note?: string; label?: string } = {}) {
  const revision = await prisma.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(${PUBLISH_LOCK_KEY})::text AS locked`;
      const content = await buildSnapshot(tx, "published");
      const created = await tx.contentRevision.create({
        data: { snapshot: {}, note: opts.note ?? "", createdById: opts.userId },
      });
      const snapshot: SiteSnapshot = {
        ...content,
        version: created.version,
        publishedAt: created.createdAt.toISOString(),
      };
      await logActivity(tx, {
        userId: opts.userId,
        action: "published",
        entity: "site",
        entityId: created.id,
        label: opts.label ?? `Published version ${created.version}`,
      });
      return tx.contentRevision.update({
        where: { id: created.id },
        data: { snapshot: snapshot as unknown as Prisma.InputJsonValue },
        select: { id: true, version: true, createdAt: true },
      });
    },
    { timeout: 20_000 },
  );

  clearRevisionCache();
  revalidateFrontend();
  void resumeQueue.request();
  return revision;
}
