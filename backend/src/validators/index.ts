/**
 * Request validation schemas. They live in @portfolio/shared so the admin
 * forms validate with exactly the same rules the API enforces.
 */
import { z } from "zod";

export {
  contactSchema,
  loginSchema,
  mediaUpdateSchema,
  messageStatusSchema,
  profileSchema,
  reorderSchema,
  resumeSettingsSchema,
  settingsSchema,
} from "@portfolio/shared";

export const publishNoteSchema = z.object({ note: z.string().max(200).optional() });
export const previewRequestSchema = z.object({ path: z.string().max(300).optional() });
