import { createBrowserRouter } from "react-router-dom";
import { RequireAuth } from "@/components/require-auth";
import { AdminLayout } from "@/layouts/admin-layout";
import { AchievementEditPage, AchievementsPage } from "@/pages/achievements";
import { BlogPage } from "@/pages/blog-list";
import { CertificationEditPage, CertificationsPage } from "@/pages/certifications";
import { DashboardPage } from "@/pages/dashboard";
import { EducationEditPage, EducationPage } from "@/pages/education";
import { ExperienceEditPage, ExperiencePage } from "@/pages/experience";
import { LoginPage } from "@/pages/login";
import { MessagesPage } from "@/pages/messages";
import { NotFoundPage } from "@/pages/not-found";
import { ProfilePage } from "@/pages/profile";
import { ProjectEditPage, ProjectsPage } from "@/pages/projects";
import { ResumePage } from "@/pages/resume";
import { SettingsPage } from "@/pages/settings";
import { SkillEditPage, SkillsPage } from "@/pages/skills";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "experience", element: <ExperiencePage /> },
          { path: "experience/:id", element: <ExperienceEditPage /> },
          { path: "projects", element: <ProjectsPage /> },
          { path: "projects/:id", element: <ProjectEditPage /> },
          { path: "skills", element: <SkillsPage /> },
          { path: "skills/:id", element: <SkillEditPage /> },
          { path: "education", element: <EducationPage /> },
          { path: "education/:id", element: <EducationEditPage /> },
          { path: "certifications", element: <CertificationsPage /> },
          { path: "certifications/:id", element: <CertificationEditPage /> },
          { path: "achievements", element: <AchievementsPage /> },
          { path: "achievements/:id", element: <AchievementEditPage /> },
          { path: "blog", element: <BlogPage /> },
          // The rich-text editor is large; load it only when a post is opened.
          { path: "blog/:id", lazy: () => import("@/pages/blog").then((m) => ({ Component: m.BlogEditPage })) },
          { path: "messages", element: <MessagesPage /> },
          { path: "resume", element: <ResumePage /> },
          { path: "settings", element: <SettingsPage /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
