import { prisma, type Tx } from "../lib/prisma";

export type ActivityAction = "created" | "updated" | "deleted" | "published" | "unpublished" | "reordered" | "uploaded";

/** Records an admin change. Every content change since the last publish counts as "unpublished". */
export function logActivity(
  db: Tx,
  entry: { userId?: string; action: ActivityAction; entity: string; entityId?: string; label: string },
) {
  return db.activityLog.create({
    data: {
      userId: entry.userId,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
      label: entry.label.slice(0, 200),
    },
  });
}

/** Content changes made since the latest publish. */
export async function pendingChangeCount() {
  const latest = await prisma.contentRevision.findFirst({ orderBy: { version: "desc" }, select: { createdAt: true } });
  return prisma.activityLog.count({
    where: {
      action: { notIn: ["published", "uploaded"] },
      entity: { notIn: ["message", "resume-settings", "media", "session"] },
      ...(latest ? { createdAt: { gt: latest.createdAt } } : {}),
    },
  });
}
