import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { CSRF, experienceInput, loggedInAgent, newApp, projectInput, resetDatabase } from "./helpers";

const publicSite = async (app: ReturnType<typeof newApp>) => (await request(app).get("/api/public/site")).body;

describe("Tests 2–4, 8, 10: content is stored, drafts stay private, publishing goes live", () => {
  beforeEach(() => resetDatabase());

  it("Test 2: creating a project stores it in the database", async () => {
    const agent = await loggedInAgent();
    const res = await agent.post("/api/projects").set(CSRF).send(projectInput());
    expect(res.status).toBe(201);
    const row = await prisma.project.findUnique({ where: { slug: "zephyr-ledger" } });
    expect(row?.title).toBe("Zephyr Ledger");
    expect(row?.status).toBe("DRAFT");
  });

  it("Test 8 + 3: a draft is hidden from the public API until it is published", async () => {
    const app = newApp();
    const agent = await loggedInAgent(app);
    const { body: created } = await agent.post("/api/projects").set(CSRF).send(projectInput());

    let site = await publicSite(app);
    expect(site.projects.map((p: { slug: string }) => p.slug)).not.toContain("zephyr-ledger");
    expect((await request(app).get("/api/public/projects/zephyr-ledger")).status).toBe(404);

    // The admin draft preview does show it.
    const draft = await agent.get("/api/preview/snapshot");
    expect(draft.body.projects.map((p: { slug: string }) => p.slug)).toContain("zephyr-ledger");

    const pub = await agent.post(`/api/projects/${created.id}/publish`).set(CSRF);
    expect(pub.status).toBe(200);
    expect(pub.body.isLive).toBe(true);

    site = await publicSite(app);
    expect(site.projects.map((p: { slug: string }) => p.slug)).toContain("zephyr-ledger");
    expect((await request(app).get("/api/public/projects/zephyr-ledger")).body.title).toBe("Zephyr Ledger");
  });

  it("Test 4: editing experience changes the live site only after publishing", async () => {
    const app = newApp();
    const agent = await loggedInAgent(app);
    const exp = await prisma.experience.findFirstOrThrow({ where: { company: "Logpilot" } });
    const current = (await agent.get(`/api/experience/${exp.id}`)).body;

    const edited = { ...experienceInput(), ...pick(current), designation: "Lead Frontend Engineer" };
    expect((await agent.put(`/api/experience/${exp.id}`).set(CSRF).send(edited)).status).toBe(200);

    // Saved but not published: public still shows the old title.
    let site = await publicSite(app);
    expect(site.experiences.find((e: { id: string }) => e.id === exp.id).designation).toBe("SDE 1 · Frontend Developer");
    expect((await agent.get("/api/publish")).body.pendingChanges).toBeGreaterThan(0);

    expect((await agent.post("/api/publish").set(CSRF).send({})).status).toBe(200);
    site = await publicSite(app);
    expect(site.experiences.find((e: { id: string }) => e.id === exp.id).designation).toBe("Lead Frontend Engineer");
    expect((await agent.get("/api/publish")).body.pendingChanges).toBe(0);
  });

  it("unpublishing removes an item from the live site", async () => {
    const app = newApp();
    const agent = await loggedInAgent(app);
    const proj = await prisma.project.findFirstOrThrow({ where: { slug: "communication-app" } });
    expect((await agent.post(`/api/projects/${proj.id}/unpublish`).set(CSRF)).status).toBe(200);
    const site = await publicSite(app);
    expect(site.projects.map((p: { slug: string }) => p.slug)).not.toContain("communication-app");
  });

  it("Test 10: published data persists (it lives in Postgres, not memory)", async () => {
    const agent = await loggedInAgent();
    await agent.post("/api/projects?publish=true").set(CSRF).send(projectInput({ slug: "persisted-one", title: "Persisted One" }));
    // A brand-new app instance (like a server restart) still serves it.
    const site = await publicSite(newApp());
    expect(site.projects.map((p: { slug: string }) => p.slug)).toContain("persisted-one");
    const revisions = await prisma.contentRevision.count();
    expect(revisions).toBeGreaterThanOrEqual(2);
  });

  it("validates input on the server", async () => {
    const agent = await loggedInAgent();
    const res = await agent
      .post("/api/projects")
      .set(CSRF)
      .send(projectInput({ slug: "Bad Slug!", githubUrl: "javascript:alert(1)" }));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(Object.keys(res.body.error.details)).toEqual(expect.arrayContaining(["slug", "githubUrl"]));
  });

  it("rejects a duplicate project slug with 409", async () => {
    const agent = await loggedInAgent();
    const res = await agent.post("/api/projects").set(CSRF).send(projectInput({ slug: "ai-recipe-creator" }));
    expect(res.status).toBe(409);
  });

  it("strips dangerous HTML from blog posts", async () => {
    const agent = await loggedInAgent();
    const res = await agent.post("/api/blog?publish=true").set(CSRF).send({
      title: "Hello",
      slug: "hello",
      excerpt: "First post",
      contentHtml: '<p onclick="x()">Hi</p><script>alert(1)</script><a href="javascript:alert(1)">bad</a><img src="http://insecure/x.png">',
      category: "",
      tags: ["intro"],
      coverImageId: null,
      seoTitle: "",
      seoDescription: "",
    });
    expect(res.status).toBe(201);
    const post = (await request(newApp()).get("/api/public/blog/hello")).body;
    expect(post.contentHtml).not.toMatch(/script|onclick|javascript:|insecure/);
    expect(post.contentHtml).toContain("<p>Hi</p>");
  });
});

/** Admin GET shape → input shape for the experience form. */
function pick(row: Record<string, unknown>) {
  const keys = Object.keys(experienceInput());
  return Object.fromEntries(keys.map((k) => [k, row[k]]));
}
