import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { closeDb } from "../../src/adapters/db.js";
import { truncateAllTables } from "../helpers/db.js";
import { seedUser } from "../helpers/auth.js";

describe("POST /auth/login", () => {
  beforeAll(async () => {
    await truncateAllTables();
  });

  beforeEach(async () => {
    await truncateAllTables();
  });

  afterAll(async () => {
    await closeDb();
  });

  it("returns 200 with token + user for valid credentials", async () => {
    const seeded = await seedUser({
      email: "login@example.com",
      role: "admin",
      password: "s3cret-correct",
    });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "login@example.com", password: "s3cret-correct" });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.token.length).toBeGreaterThan(20);
    expect(res.body.user).toEqual({
      id: seeded.id,
      email: "login@example.com",
      role: "admin",
    });
    // Must NOT leak the hash
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("returns 401 INVALID_CREDENTIALS for unknown email", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "ghost@example.com", password: "whatever" });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns 401 INVALID_CREDENTIALS for wrong password (no user enumeration)", async () => {
    await seedUser({
      email: "login@example.com",
      password: "right-password",
    });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "login@example.com", password: "WRONG-password" });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns 400 VALIDATION_ERROR for malformed body", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "not-an-email", password: "" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("issues a usable token (round-trip against /auth/me)", async () => {
    await seedUser({
      email: "rt@example.com",
      role: "viewer",
      password: "rt-password",
    });

    const login = await request(app)
      .post("/auth/login")
      .send({ email: "rt@example.com", password: "rt-password" });
    expect(login.status).toBe(200);

    const me = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe("rt@example.com");
    expect(me.body.user.role).toBe("viewer");
  });
});
