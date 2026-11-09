import { Router } from "express";
import * as auth from "../controllers/auth.controller";
import { createLoginLimiter } from "../middleware/rate-limit";
import { validateBody } from "../middleware/validate";
import { loginSchema } from "../validators";

export function authRoutes() {
  const r = Router();
  r.post("/login", createLoginLimiter(), validateBody(loginSchema), auth.login);
  r.post("/logout", auth.logout);
  r.get("/me", auth.me);
  return r;
}
