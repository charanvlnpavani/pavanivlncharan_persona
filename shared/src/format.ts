/** Date helpers shared by the website, the admin panel and the resume. */

const monthFormatter = new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" });

/** "2024-12" → "Dec 2024" */
export function formatMonth(isoMonth: string): string {
  const [year, month] = isoMonth.split("-").map(Number);
  return monthFormatter.format(new Date(Date.UTC(year, (month || 1) - 1, 1)));
}

/** "Dec 2024 – Jun 2025", or "… – Present" for a current role. */
export function formatDateRange(start: string, end: string | null, isCurrent: boolean): string {
  return `${formatMonth(start)} – ${isCurrent || !end ? "Present" : formatMonth(end)}`;
}

/** Inclusive month count between two ISO months: "7 mos", "1 yr 2 mos". */
export function formatDuration(start: string, end: string): string {
  const [sy, sm] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  const total = (ey - sy) * 12 + (em - sm) + 1;
  const years = Math.floor(total / 12);
  const months = total % 12;
  const parts: string[] = [];
  if (years) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (months) parts.push(`${months} mo${months > 1 ? "s" : ""}`);
  return parts.join(" ") || "1 mo";
}

/** "Pavani VLN Charan" → "PC" */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}
