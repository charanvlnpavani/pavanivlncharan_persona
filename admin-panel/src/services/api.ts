import type { ApiErrorBody } from "@portfolio/shared";

/** An API failure with the server's error code and per-field messages. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
  }
}

type Options = { method?: string; body?: unknown; query?: Record<string, string | undefined> };

/**
 * Calls the backend through the same-origin proxy (/api → API server).
 * The CSRF header is added to every request; the session cookie is sent by
 * the browser automatically.
 */
export async function api<T>(path: string, { method = "GET", body, query }: Options = {}): Promise<T> {
  const qs = query
    ? "?" + new URLSearchParams(Object.entries(query).filter((e): e is [string, string] => e[1] !== undefined)).toString()
    : "";
  const isForm = body instanceof FormData;
  const res = await fetch(`/api${path}${qs}`, {
    method,
    credentials: "same-origin",
    headers: {
      "x-portfolio-csrf": "1",
      ...(body !== undefined && !isForm ? { "content-type": "application/json" } : {}),
    },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });

  if (res.status === 204) return undefined as T;
  const data = (await res.json().catch(() => null)) as T | ApiErrorBody | null;
  if (!res.ok) {
    const err = (data as ApiErrorBody | null)?.error;
    const fields =
      err?.code === "VALIDATION_ERROR" && err.details && typeof err.details === "object"
        ? (err.details as Record<string, string>)
        : undefined;
    throw new ApiError(res.status, err?.code ?? "HTTP_ERROR", err?.message ?? `Request failed (${res.status})`, fields);
  }
  return data as T;
}

export const errorMessage = (err: unknown) =>
  err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Something went wrong";
