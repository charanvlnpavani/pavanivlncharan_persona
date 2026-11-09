import { PDFParse } from "pdf-parse";
import request from "supertest";
import { wipeContent, seedContent } from "../prisma/seed";
import { createApp } from "../src/app";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/services/auth.service";
import { publishSite } from "../src/services/publish.service";
import { resumeQueue } from "../src/services/resume/resume.service";
import { clearRevisionCache } from "../src/services/revision.service";

export const ADMIN = { email: "admin@test.dev", password: "correct-horse-battery-9" };
export const CSRF = { "x-portfolio-csrf": "1" };

/** Fresh database with the migrated content, an admin, and a published version + resume. */
export async function resetDatabase({ publish = true } = {}) {
  await resumeQueue.idle();
  await wipeContent();
  await prisma.session.deleteMany();
  await prisma.previewToken.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.contactMessage.deleteMany();
  clearRevisionCache();

  await seedContent({ withPhoto: false, siteUrl: "https://portfolio.test" });
  await prisma.adminUser.create({
    data: { email: ADMIN.email, name: "Test Admin", passwordHash: await hashPassword(ADMIN.password) },
  });
  if (publish) {
    await publishSite({ label: "test setup" });
    await resumeQueue.idle();
  }
}

export function newApp() {
  return createApp();
}

/** A supertest agent that keeps cookies, already logged in. */
export async function loggedInAgent(app = newApp()) {
  const agent = request.agent(app);
  const res = await agent.post("/api/auth/login").set(CSRF).send(ADMIN);
  if (res.status !== 200) throw new Error(`Login failed in test helper: ${res.status} ${JSON.stringify(res.body)}`);
  return agent;
}

export async function pdfText(buffer: Buffer) {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    return (await parser.getText()).text;
  } finally {
    await parser.destroy();
  }
}

/** Supertest returns binary bodies as Buffer only with a parser. */
export function binary(res: request.Response, cb: (err: Error | null, body: Buffer) => void) {
  const chunks: Buffer[] = [];
  res.on("data", (c: Buffer) => chunks.push(c));
  res.on("end", () => cb(null, Buffer.concat(chunks)));
}

export async function downloadResume(app: ReturnType<typeof newApp>) {
  const res = await request(app).get("/api/public/resume/download").buffer(true).parse(binary);
  return { res, body: res.body as Buffer };
}

export const experienceInput = (overrides: Record<string, unknown> = {}) => ({
  company: "Acme Quantum Labs",
  designation: "Senior Software Engineer",
  employmentType: "Full-time",
  location: "Remote",
  startDate: "2026-01",
  endDate: "",
  isCurrent: true,
  summary: "",
  responsibilities: ["Led the migration of billing services to TypeScript."],
  achievements: ["Cut checkout latency by 40%."],
  technologies: ["TypeScript", "PostgreSQL"],
  logoId: null,
  isVisible: true,
  includeInResume: true,
  resumeSummary: "",
  ...overrides,
});

export const projectInput = (overrides: Record<string, unknown> = {}) => ({
  title: "Zephyr Ledger",
  slug: "zephyr-ledger",
  summary: "Double-entry ledger service with audit trails.",
  description: ["A ledger."],
  technologies: ["Go", "PostgreSQL"],
  category: "Web app",
  githubUrl: "https://github.com/example/zephyr",
  liveUrl: "",
  isFeatured: true,
  imageIds: [],
  isVisible: true,
  includeInResume: true,
  resumeSummary: "",
  ...overrides,
});
