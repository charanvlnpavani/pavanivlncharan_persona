"use client";

import { contactSchema } from "@portfolio/shared";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Errors = Partial<Record<"name" | "email" | "subject" | "message" | "_form", string>>;

const textareaClass =
  "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30 min-h-36 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:ring-[3px] md:text-sm";

/**
 * Contact form. Validated in the browser with the same rules the API uses,
 * stored in the database, and visible in the admin "Messages" page.
 * The hidden "website" field is a honeypot for bots.
 */
export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]) as keyof Errors;
        next[key] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setErrors(body?.error?.details ?? { _form: body?.error?.message ?? "Something went wrong. Please try again." });
        setStatus("idle");
        return;
      }
      form.reset();
      setStatus("sent");
    } catch {
      setErrors({ _form: "Couldn’t send right now. Please check your connection and try again." });
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="bg-card flex flex-col items-start gap-3 rounded-2xl border p-8">
        <CheckCircle2 className="text-brand size-8" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Message sent</h2>
        <p className="text-muted-foreground">Thanks for reaching out. I’ll get back to you by email.</p>
        <Button variant="outline" onClick={() => setStatus("idle")}>
          Send another
        </Button>
      </div>
    );
  }

  const field = (name: keyof Errors, label: string, input: React.ReactNode) => (
    <div className="space-y-1.5">
      <label htmlFor={`contact-${name}`} className="text-sm font-medium">
        {label}
      </label>
      {input}
      {errors[name] && (
        <p id={`contact-${name}-error`} className="text-destructive text-xs">
          {errors[name]}
        </p>
      )}
    </div>
  );
  const aria = (name: keyof Errors) => ({
    id: `contact-${name}`,
    name,
    "aria-invalid": Boolean(errors[name]) || undefined,
    "aria-describedby": errors[name] ? `contact-${name}-error` : undefined,
  });

  return (
    <form onSubmit={onSubmit} noValidate className="bg-card space-y-4 rounded-2xl border p-6 sm:p-8">
      <h2 className="text-lg font-semibold">Send a message</h2>
      {errors._form && (
        <p role="alert" className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
          {errors._form}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {field("name", "Your name", <Input {...aria("name")} autoComplete="name" required maxLength={120} />)}
        {field("email", "Email", <Input {...aria("email")} type="email" autoComplete="email" required maxLength={254} />)}
      </div>
      {field("subject", "Subject (optional)", <Input {...aria("subject")} maxLength={160} />)}
      {field("message", "Message", <textarea {...aria("message")} required maxLength={5000} className={cn(textareaClass)} />)}
      {/* Honeypot: invisible to people, tempting to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <Button type="submit" disabled={status === "sending"}>
        {status === "sending" ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
        {status === "sending" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
