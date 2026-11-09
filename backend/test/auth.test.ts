import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { ADMIN, CSRF, loggedInAgent, newApp, resetDatabase } from "./helpers";

describe("Test 1: admin authentication", () => {
  beforeAll(() => resetDatabase({ publish: false }));

  it("logs in with correct credentials and sets an httpOnly session cookie", async () => {
    const app = newApp();
    const res = await request(app).post("/api/auth/login").set(CSRF).send(ADMIN);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(ADMIN.email);
    const cookie = String(res.headers["set-cookie"]);
    expect(cookie).toMatch(/pf_session=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("rejects a wrong password with a generic message", async () => {
    const res = await request(newApp()).post("/api/auth/login").set(CSRF).send({ ...ADMIN, password: "nope-nope-nope" });
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe("Incorrect email or password");
  });

  it("rejects an unknown email with the same message", async () => {
    const res = await request(newApp()).post("/api/auth/login").set(CSRF).send({ email: "who@x.dev", password: "whatever-123" });
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe("Incorrect email or password");
  });

  it("blocks admin APIs without a session", async () => {
    const app = newApp();
    expect((await request(app).get("/api/projects")).status).toBe(401);
    expect((await request(app).get("/api/dashboard")).status).toBe(401);
    expect((await request(app).post("/api/publish").set(CSRF)).status).toBe(401);
  });

  it("requires the CSRF header on writes", async () => {
    const agent = await loggedInAgent();
    const res = await agent.post("/api/publish").send({});
    expect(res.status).toBe(403);
  });

  it("rejects writes from a foreign Origin", async () => {
    const agent = await loggedInAgent();
    const res = await agent.post("/api/publish").set(CSRF).set("Origin", "https://evil.example").send({});
    expect(res.status).toBe(403);
  });

  it("returns the user from /me and logs out", async () => {
    const agent = await loggedInAgent();
    expect((await agent.get("/api/auth/me")).body.user.email).toBe(ADMIN.email);
    expect((await agent.post("/api/auth/logout").set(CSRF)).status).toBe(204);
    expect((await agent.get("/api/auth/me")).status).toBe(401);
  });

  it("rate-limits repeated failed logins (429 after 5 failures)", async () => {
    const app = newApp();
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const r = await request(app).post("/api/auth/login").set(CSRF).send({ ...ADMIN, password: `wrong-${i}-password` });
      statuses.push(r.status);
    }
    expect(statuses.slice(0, 5).every((s) => s === 401)).toBe(true);
    expect(statuses[5]).toBe(429);
  });
});
