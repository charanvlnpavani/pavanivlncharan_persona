import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import { csrfProtection, loadSession } from "./middleware/auth";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { adminRoutes } from "./routes/admin.routes";
import { authRoutes } from "./routes/auth.routes";
import { publicRoutes } from "./routes/public.routes";
import { storage } from "./services/storage";

/**
 * Builds the Express app. Kept separate from server.ts so tests can create
 * a fresh app without opening a port.
 */
export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", env.TRUST_PROXY);

  app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
  app.use(
    cors({
      origin: (origin, cb) => cb(null, !origin || env.CORS_ORIGINS.includes(origin)),
      credentials: true,
    }),
  );
  app.use(
    pinoHttp({
      logger,
      autoLogging: { ignore: (req) => req.url === "/api/health" },
      customLogLevel: (_req, res, err) => (err || res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info"),
    }),
  );
  app.use(express.json({ limit: "512kb" }));
  app.use(cookieParser());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  // Uploaded images are public (they only appear once content using them is
  // published, and their names are random UUIDs). Generated resumes are NOT
  // served from here; only through the resume endpoints.
  app.use(
    "/uploads",
    express.static(storage.root("uploads"), {
      dotfiles: "deny",
      index: false,
      maxAge: "30d",
      immutable: true,
      setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff"),
    }),
  );

  app.use("/api/public", publicRoutes());
  app.use("/api/auth", loadSession, csrfProtection, authRoutes());
  app.use("/api", loadSession, csrfProtection, adminRoutes());

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
