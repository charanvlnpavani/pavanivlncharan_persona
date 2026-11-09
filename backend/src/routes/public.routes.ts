import { Router } from "express";
import * as pub from "../controllers/public.controller";
import { createContactLimiter, createPublicLimiter } from "../middleware/rate-limit";
import { validateBody } from "../middleware/validate";
import { contactSchema } from "../validators";

/** Read-only published content, plus the contact form. No login required. */
export function publicRoutes() {
  const r = Router();
  r.use(createPublicLimiter());

  r.get("/site", pub.getSite);
  r.get("/projects/:slug", pub.getProject);
  r.get("/blog", pub.listBlog);
  r.get("/blog/:slug", pub.getBlogPost);
  r.post("/contact", createContactLimiter(), validateBody(contactSchema), pub.postContact);

  r.get("/resume", pub.getResumeInfo);
  r.get("/resume/download", pub.downloadResume);
  r.get("/resume/preview", pub.previewResume);
  return r;
}
