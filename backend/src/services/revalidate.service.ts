import { env, isTest } from "../config/env";
import { logger } from "../lib/logger";

/**
 * Tells the Next.js site to drop its cached pages so the new revision shows
 * up immediately. Fire-and-forget with retries: if the site is down, it still
 * refreshes on its own within its cache lifetime.
 */
export function revalidateFrontend(tags: string[] = ["content"]) {
  if (isTest || !env.FRONTEND_REVALIDATE_URL || !env.REVALIDATE_SECRET) return;
  void (async () => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(env.FRONTEND_REVALIDATE_URL, {
          method: "POST",
          headers: { "content-type": "application/json", "x-revalidate-secret": env.REVALIDATE_SECRET },
          body: JSON.stringify({ tags }),
          signal: AbortSignal.timeout(5_000),
        });
        if (res.ok) {
          logger.info({ tags }, "Frontend cache refreshed");
          return;
        }
        logger.warn({ status: res.status, attempt }, "Frontend revalidate returned an error");
      } catch (err) {
        logger.warn({ err: (err as Error).message, attempt }, "Frontend revalidate failed");
      }
      await new Promise((r) => setTimeout(r, attempt * 1_000));
    }
  })();
}
