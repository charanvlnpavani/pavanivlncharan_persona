import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { createChromeRenderer, setPdfRenderer } from "../src/services/resume/pdf-renderer";
import { resumeQueue } from "../src/services/resume/resume.service";
import { CSRF, downloadResume, experienceInput, loggedInAgent, newApp, pdfText, projectInput, resetDatabase } from "./helpers";

const currentVersion = async () =>
  (await prisma.resumeSettings.findUnique({ where: { id: 1 }, include: { currentVersion: true } }))?.currentVersion;

describe("Tests 5–9: automatic resume generation and recruiter download", () => {
  beforeEach(async () => {
    setPdfRenderer(createChromeRenderer());
    await resetDatabase();
  });
  afterEach(() => resumeQueue.idle());

  it("the seed produces a downloadable resume with correct headers", async () => {
    const { res, body } = await downloadResume(newApp());
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("application/pdf");
    expect(res.headers["content-disposition"]).toBe('attachment; filename="Pavani_VLN_Charan_Resume.pdf"');
    expect(res.headers["cache-control"]).toContain("no-cache");
    expect(res.headers.etag).toMatch(/^"resume-v\d+-/);
    expect(body.subarray(0, 5).toString()).toBe("%PDF-");
    const text = await pdfText(body);
    expect(text).toContain("Pavani VLN Charan");
    expect(text).toContain("Logpilot");
  });

  it("Test 5 + 7: publishing new experience regenerates the PDF and the download returns it", async () => {
    const app = newApp();
    const before = await currentVersion();
    const agent = await loggedInAgent(app);

    const res = await agent.post("/api/experience?publish=true").set(CSRF).send(experienceInput());
    expect(res.status).toBe(201);
    await resumeQueue.idle();

    const after = await currentVersion();
    expect(after?.status).toBe("SUCCEEDED");
    expect(after!.version).toBeGreaterThan(before!.version);

    const { res: dl, body } = await downloadResume(app);
    expect(dl.headers["x-resume-version"]).toBe(String(after!.version));
    const text = await pdfText(body);
    expect(text).toContain("Acme Quantum Labs");
    expect(text).toContain("Cut checkout latency by 40%.");
  });

  it("Test 6: a new skill appears on the website and in the resume", async () => {
    const app = newApp();
    const agent = await loggedInAgent(app);
    const category = await prisma.skillCategory.findFirstOrThrow({ where: { name: "Backend" } });
    const res = await agent.post("/api/skills?publish=true").set(CSRF).send({
      name: "Kubernetes",
      categoryId: category.id,
      icon: "",
      isVisible: true,
      includeInResume: true,
      resumeSummary: "",
    });
    expect(res.status).toBe(201);
    await resumeQueue.idle();

    const site = (await request(app).get("/api/public/site")).body;
    const backend = site.skills.find((c: { name: string }) => c.name === "Backend");
    expect(backend.skills.map((s: { name: string }) => s.name)).toContain("Kubernetes");

    const { body } = await downloadResume(app);
    expect(await pdfText(body)).toContain("Kubernetes");
  });

  it("Test 8: unpublished drafts never reach the public resume", async () => {
    const app = newApp();
    const agent = await loggedInAgent(app);
    // Saved as draft (no ?publish) …
    await agent.post("/api/projects").set(CSRF).send(projectInput({ title: "Secret Draft Project", slug: "secret-draft" }));
    await agent.post("/api/experience").set(CSRF).send(experienceInput({ company: "Hidden Draft Corp" }));
    // … then something else gets published, which regenerates the resume.
    const profile = (await agent.get("/api/profile")).body;
    await agent
      .put("/api/profile?publish=true")
      .set(CSRF)
      .send({ ...pickProfile(profile), headline: "Full-Stack Engineer" });
    await resumeQueue.idle();

    const text = await pdfText((await downloadResume(app)).body);
    expect(text).toContain("Full-Stack Engineer");
    expect(text).not.toContain("Secret Draft Project");
    expect(text).not.toContain("Hidden Draft Corp");

    // The admin-only draft preview does include drafts.
    const draft = await agent.get("/api/resume/draft-preview").buffer(true).parse((res, cb) => {
      const chunks: Buffer[] = [];
      res.on("data", (c: Buffer) => chunks.push(c));
      res.on("end", () => cb(null, Buffer.concat(chunks)));
    });
    expect(draft.status).toBe(200);
    expect(await pdfText(draft.body as Buffer)).toContain("Hidden Draft Corp");
    // And it is not reachable without logging in.
    expect((await request(app).get("/api/resume/draft-preview")).status).toBe(401);
  });

  it("Test 9: a failed generation keeps the previous resume; retry recovers", async () => {
    const app = newApp();
    const agent = await loggedInAgent(app);
    const good = await currentVersion();
    const goodPdf = (await downloadResume(app)).body;

    setPdfRenderer({
      render: async () => {
        throw new Error("Simulated Chrome crash");
      },
    });
    await agent.post("/api/experience?publish=true").set(CSRF).send(experienceInput({ company: "Failure Test Inc" }));
    await resumeQueue.idle();

    const failed = await prisma.resumeVersion.findFirstOrThrow({ orderBy: { version: "desc" } });
    expect(failed.status).toBe("FAILED");
    expect(failed.error).toContain("Simulated Chrome crash");
    expect((await currentVersion())?.id).toBe(good!.id); // pointer unchanged

    const { res, body } = await downloadResume(app);
    expect(res.status).toBe(200);
    expect(res.headers["x-resume-version"]).toBe(String(good!.version));
    expect(body.equals(goodPdf)).toBe(true);

    // The failure is visible to the admin…
    const overview = (await agent.get("/api/resume")).body;
    expect(overview.versions[0].status).toBe("FAILED");

    // …and retry succeeds once Chrome works again.
    setPdfRenderer(createChromeRenderer());
    const retry = await agent.post("/api/resume/regenerate").set(CSRF);
    expect(retry.status).toBe(200);
    const recovered = await currentVersion();
    expect(recovered!.version).toBeGreaterThan(failed.version);
    expect(await pdfText((await downloadResume(app)).body)).toContain("Failure Test Inc");
  });

  it("unchanged content does not create a new resume version", async () => {
    const agent = await loggedInAgent();
    const before = await prisma.resumeVersion.count();
    await agent.post("/api/publish").set(CSRF).send({});
    await resumeQueue.idle();
    expect(await prisma.resumeVersion.count()).toBe(before);
  });

  it("supports conditional requests (304 when the PDF hasn't changed)", async () => {
    const app = newApp();
    const first = await request(app).get("/api/public/resume/download");
    const again = await request(app).get("/api/public/resume/download").set("If-None-Match", first.headers.etag);
    expect(again.status).toBe(304);
  });

  it("preview serves the same PDF inline", async () => {
    const res = await request(newApp()).get("/api/public/resume/preview");
    expect(res.status).toBe(200);
    expect(res.headers["content-disposition"]).toMatch(/^inline;/);
  });

  it("returns a clear 404 when no resume has been published", async () => {
    await prisma.resumeSettings.update({ where: { id: 1 }, data: { currentVersionId: null } });
    const res = await request(newApp()).get("/api/public/resume/download").set("Accept", "application/json");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("RESUME_NOT_AVAILABLE");
  });

  it("resume settings limit projects and change the template", async () => {
    const app = newApp();
    const agent = await loggedInAgent(app);
    const { settings } = (await agent.get("/api/resume")).body;
    const res = await agent
      .put("/api/resume/settings")
      .set(CSRF)
      .send({ ...settings, template: "modern", maxProjects: 1, headlineOverride: "", summaryOverride: "" });
    expect(res.status).toBe(200);
    await resumeQueue.idle();
    const text = await pdfText((await downloadResume(app)).body);
    expect(text).toContain("CoffeeQueue Pro");
    expect(text).not.toContain("AI Recipe Creator");
  });
});

function pickProfile(p: Record<string, unknown>) {
  const keys = [
    "fullName", "headline", "yearsExperience", "location", "email", "phone", "avatarId", "heroEyebrow",
    "heroHeading", "heroSubheading", "heroCtas", "summary", "about", "specializations", "interests",
  ];
  return Object.fromEntries(keys.map((k) => [k, p[k]]));
}
