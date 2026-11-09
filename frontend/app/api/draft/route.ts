import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { verifyPreviewToken } from "@/lib/api";

/**
 * Entry point for the admin "Preview" button. The backend issues a
 * short-lived token; we verify it with the backend, turn on Draft Mode and go
 * to the requested page.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const path = url.searchParams.get("path") ?? "/";

  if (!token || !(await verifyPreviewToken(token))) {
    return new Response("This preview link is invalid or has expired. Click Preview in the admin again.", { status: 401 });
  }
  // Only same-site paths: blocks open redirects like //evil.com or https://…
  const safePath = /^\/(?![/\\])[^\s]*$/.test(path) ? path : "/";

  (await draftMode()).enable();
  redirect(safePath);
}
