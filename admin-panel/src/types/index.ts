/** Shapes returned by the admin API. Inputs come from @portfolio/shared. */

export type AdminUser = { id: string; email: string; name: string };

export type AdminMedia = {
  id: string;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  kind: "IMAGE" | "DOCUMENT";
  createdAt: string;
};

/** Flags every list item carries. */
export type ItemFlags = {
  id: string;
  status?: "DRAFT" | "PUBLISHED";
  isVisible?: boolean;
  sortOrder?: number;
  isLive: boolean;
  hasUnpublishedChanges: boolean;
  updatedAt: string;
};

export type ResourceName =
  | "social-links"
  | "skill-categories"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "certifications"
  | "achievements"
  | "blog";

export type Dashboard = {
  counts: { projects: number; skills: number; experiences: number; certifications: number; blogPosts: number; unreadMessages: number };
  recentMessages: { id: string; name: string; email: string; subject: string; status: string; createdAt: string }[];
  recentActivity: { id: string; action: string; entity: string; label: string; createdAt: string; user: string | null }[];
  publishing: { pendingChanges: number; latestRevision: { version: number; createdAt: string } | null };
  resume: {
    current: { version: number; completedAt: string | null } | null;
    latest: { version: number; status: string; error: string | null; createdAt: string } | null;
  };
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "ARCHIVED" | "SPAM";
  userAgent: string | null;
  createdAt: string;
};
