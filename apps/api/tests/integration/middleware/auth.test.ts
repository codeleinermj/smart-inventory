import { describe, it, expect, beforeAll } from "vitest";
import express, { type Express, type Request, type Response } from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { auth, requireRole } from "../../../src/middleware/auth.js";
import { signJwt } from "../../../src/lib/jwt.js";
import { AppError } from "../../../src/lib/errors.js";

/**
 * Builds a tiny express app that exercises the auth middleware in isolation.
 * The protected route echoes req.user so we can assert the middleware
 * actually populated it from the JWT claims.
 */
function buildApp(): Express {
  const app = express();
  app.use(express.json());

  app.get("/protected", auth, (req: Request, res: Response) => {
    res.status(200).json({ user: req.user });
  });

  app.get(
    "/admin-only",
    auth,
    requireRole("admin"),
    (_req: Request, res: Response) => {
      res.status(200).json({ ok: true });
    }
  );

  // Local error handler so AppError → JSON envelope works inside the suite
  // without depending on the real error middleware (tested separately).
  app.use(
    (
      err: unknown,
      _req: Request,
      res: Response,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _next: (e?: unknown) => void
    ) => {
      if (err instanceof AppError) {
        res
          .status(err.status)
          .json({ code: err.code, message: err.message, details: err.details });
        return;
      }
      res
        .status(500)
        .json({ code: "INTERNAL", message: "Unexpected error" });
    }
  );

  return app;
}

describe("auth middleware", () => {
  let app: Express;
  const userId = "11111111-1111-1111-1111-111111111111";
  const adminId = "22222222-2222-2222-2222-222222222222";

  beforeAll(() => {
    app = buildApp();
  });

  describe("auth (token verification)", () => {
    it("returns 200 and populates req.user with a valid token", async () => {
      const token = signJwt({
        userId,
        email: "viewer@example.com",
        role: "viewer",
      });

      const res = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toEqual({
        id: userId,
        email: "viewer@example.com",
        role: "viewer",
      });
    });

    it("returns 401 MISSING_TOKEN when Authorization header is absent", async () => {
      const res = await request(app).get("/protected");

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("MISSING_TOKEN");
    });

    it("returns 401 MISSING_TOKEN when Authorization header is not Bearer", async () => {
      const res = await request(app)
        .get("/protected")
        .set("Authorization", "Basic abc123");

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("MISSING_TOKEN");
    });

    it("returns 401 INVALID_TOKEN for a malformed token", async () => {
      const res = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer not-a-real-jwt");

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("INVALID_TOKEN");
    });

    it("returns 401 INVALID_TOKEN when signed with the wrong secret", async () => {
      const tampered = jwt.sign(
        { sub: userId, email: "x@example.com", role: "viewer" },
        "different-secret-32chars-padding-pad",
        { algorithm: "HS256", expiresIn: "1h" }
      );

      const res = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${tampered}`);

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("INVALID_TOKEN");
    });

    it("returns 401 TOKEN_EXPIRED when the token is past its exp", async () => {
      const expired = jwt.sign(
        { sub: userId, email: "x@example.com", role: "viewer" },
        process.env.JWT_SECRET as string,
        { algorithm: "HS256", expiresIn: "-1s" }
      );

      const res = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${expired}`);

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("TOKEN_EXPIRED");
    });
  });

  describe("requireRole", () => {
    it("returns 200 when the user has the required role", async () => {
      const token = signJwt({
        userId: adminId,
        email: "admin@example.com",
        role: "admin",
      });

      const res = await request(app)
        .get("/admin-only")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
    });

    it("returns 403 FORBIDDEN when the user lacks the required role", async () => {
      const token = signJwt({
        userId,
        email: "viewer@example.com",
        role: "viewer",
      });

      const res = await request(app)
        .get("/admin-only")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("FORBIDDEN");
    });
  });
});