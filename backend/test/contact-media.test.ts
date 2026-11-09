import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { CSRF, loggedInAgent, newApp, resetDatabase } from "./helpers";

// 1×1 transparent PNG
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

describe("Contact form", () => {
  beforeAll(() => resetDatabase());

  it("stores a valid message and shows it to the admin", async () => {
    const app = newApp();
    const res = await request(app)
      .post("/api/public/contact")
      .send({ name: "Recruiter", email: "r@company.com", subject: "Role", message: "We'd love to talk about a role." });
    expect(res.status).toBe(201);
    const agent = await loggedInAgent(app);
    const list = (await agent.get("/api/contact")).body;
    expect(list[0].email).toBe("r@company.com");
    expect(list[0].ipHash).toBeUndefined();
  });

  it("silently drops honeypot submissions", async () => {
    const before = await prisma.contactMessage.count();
    const res = await request(newApp())
      .post("/api/public/contact")
      .send({ name: "Bot", email: "b@spam.com", subject: "", message: "Buy cheap things now!!!", website: "x" });
    // Either accepted-and-dropped or rejected by validation; never stored.
    expect([201, 400]).toContain(res.status);
    expect(await prisma.contactMessage.count()).toBe(before);
  });

  it("validates input", async () => {
    const res = await request(newApp()).post("/api/public/contact").send({ name: "", email: "nope", message: "hi" });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.error.details)).toEqual(expect.arrayContaining(["name", "email", "message"]));
  });
});

describe("Secure uploads", () => {
  beforeAll(() => resetDatabase({ publish: false }));

  it("accepts a real PNG and serves it", async () => {
    const app = newApp();
    const agent = await loggedInAgent(app);
    const res = await agent.post("/api/media").set(CSRF).attach("file", PNG, "pixel.png");
    expect(res.status).toBe(201);
    expect(res.body.width).toBe(1);
    expect(res.body.url).toMatch(/^\/uploads\/[0-9a-f-]+\.png$/);
    const file = await request(app).get(res.body.url);
    expect(file.status).toBe(200);
    expect(file.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("rejects a script disguised as an image", async () => {
    const agent = await loggedInAgent();
    const res = await agent.post("/api/media").set(CSRF).attach("file", Buffer.from("<script>alert(1)</script>"), {
      filename: "evil.png",
      contentType: "image/png",
    });
    expect(res.status).toBe(400);
  });

  it("rejects SVG files", async () => {
    const agent = await loggedInAgent();
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    const res = await agent.post("/api/media").set(CSRF).attach("file", svg, { filename: "x.svg", contentType: "image/svg+xml" });
    expect(res.status).toBe(400);
  });

  it("requires login to upload", async () => {
    const res = await request(newApp()).post("/api/media").set(CSRF).attach("file", PNG, "pixel.png");
    expect(res.status).toBe(401);
  });
});
