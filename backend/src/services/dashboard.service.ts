import { prisma } from "../lib/prisma";
import { pendingChangeCount } from "./activity.service";

export async function getDashboard() {
  const [
    projects,
    skills,
    experiences,
    certifications,
    blogPosts,
    unreadMessages,
    recentMessages,
    recentActivity,
    latestRevision,
    pendingChanges,
    resumeSettings,
    latestResume,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.skill.count(),
    prisma.experience.count(),
    prisma.certification.count(),
    prisma.blogPost.count(),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.contactMessage.findMany({
      where: { status: { not: "SPAM" } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, subject: true, status: true, createdAt: true },
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { id: true, action: true, entity: true, label: true, createdAt: true, user: { select: { name: true } } },
    }),
    prisma.contentRevision.findFirst({ orderBy: { version: "desc" }, select: { version: true, createdAt: true } }),
    pendingChangeCount(),
    prisma.resumeSettings.findUnique({
      where: { id: 1 },
      select: { currentVersion: { select: { version: true, completedAt: true } } },
    }),
    prisma.resumeVersion.findFirst({ orderBy: { version: "desc" }, select: { version: true, status: true, error: true, createdAt: true } }),
  ]);

  return {
    counts: { projects, skills, experiences, certifications, blogPosts, unreadMessages },
    recentMessages: recentMessages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() })),
    recentActivity: recentActivity.map((a) => ({ ...a, user: a.user?.name ?? null, createdAt: a.createdAt.toISOString() })),
    publishing: {
      pendingChanges,
      latestRevision: latestRevision ? { version: latestRevision.version, createdAt: latestRevision.createdAt.toISOString() } : null,
    },
    resume: {
      current: resumeSettings?.currentVersion
        ? { version: resumeSettings.currentVersion.version, completedAt: resumeSettings.currentVersion.completedAt?.toISOString() ?? null }
        : null,
      latest: latestResume ? { ...latestResume, createdAt: latestResume.createdAt.toISOString() } : null,
    },
  };
}
