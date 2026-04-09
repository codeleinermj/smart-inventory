import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { closeDb } from "../../src/adapters/db.js";
import { truncateAllTables } from "../helpers/db.js";
import { seedUser, type SeededUser } from "../helpers/auth.js";

describe("Products CRUD", () => {
  let admin: SeededUser;
  let viewer: SeededUser;

  beforeEach(async () => {
    await truncateAllTables();
    admin = await seedUser({ email: "admin@p.com", role: "admin" });
    viewer = await seedUser({ email: "viewer@p.com", role: "viewer" });
  });

  afterAll(async () => {
    await closeDb();
  });

  function authHeader(token: string): { Authorization: string } {
    return { Authorization: `Bearer ${token}` };
  }

  describe("POST /products", () => {
    it("creates a product as admin", async () => {
      const res = await request(app)
        .post("/products")
        .set(authHeader(admin.token))
        .send({
          sku: "SKU-001",
          name: "Widget",
          description: "Round metal thing",
          price: "9.99",
          stock: 10,
          minStock: 2,
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        sku: "SKU-001",
        name: "Widget",
        description: "Round metal thing",
        price: "9.99",
        stock: 10,
        minStock: 2,
      });
      expect(res.body.id).toEqual(expect.any(String));
    });

    it("rejects viewer role with 403 FORBIDDEN", async () => {
      const res = await request(app)
        .post("/products")
        .set(authHeader(viewer.token))
        .send({ sku: "SKU-002", name: "X", price: "1.00" });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("FORBIDDEN");
    });

    it("rejects unauthenticated with 401 MISSING_TOKEN", async () => {
      const res = await request(app)
        .post("/products")
        .send({ sku: "SKU-003", name: "X", price: "1.00" });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("MISSING_TOKEN");
    });

    it("returns 400 VALIDATION_ERROR for malformed price", async () => {
      const res = await request(app)
        .post("/products")
        .set(authHeader(admin.token))
        .send({ sku: "BAD", name: "X", price: "not-a-number" });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("VALIDATION_ERROR");
    });

    it("returns 409 SKU_CONFLICT on duplicate active SKU", async () => {
      await request(app)
        .post("/products")
        .set(authHeader(admin.token))
        .send({ sku: "DUP", name: "First", price: "1.00" });

      const res = await request(app)
        .post("/products")
        .set(authHeader(admin.token))
        .send({ sku: "DUP", name: "Second", price: "2.00" });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe("SKU_CONFLICT");
    });
  });

  describe("GET /products", () => {
    it("lists products with pagination as viewer", async () => {
      // Seed 3 products via admin
      for (const sku of ["A", "B", "C"]) {
        await request(app)
          .post("/products")
          .set(authHeader(admin.token))
          .send({ sku, name: `prod-${sku}`, price: "1.00" });
      }

      const res = await request(app)
        .get("/products?limit=2&offset=0")
        .set(authHeader(viewer.token));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.total).toBe(3);
    });

    it("returns 401 unauthenticated", async () => {
      const res = await request(app).get("/products");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /products/:id", () => {
    it("returns the product by id as viewer", async () => {
      const created = await request(app)
        .post("/products")
        .set(authHeader(admin.token))
        .send({ sku: "G1", name: "GetMe", price: "5.00" });

      const res = await request(app)
        .get(`/products/${created.body.id}`)
        .set(authHeader(viewer.token));

      expect(res.status).toBe(200);
      expect(res.body.sku).toBe("G1");
    });

    it("returns 404 NOT_FOUND for missing id", async () => {
      const res = await request(app)
        .get("/products/00000000-0000-0000-0000-000000000000")
        .set(authHeader(viewer.token));

      expect(res.status).toBe(404);
      expect(res.body.code).toBe("NOT_FOUND");
    });
  });

  describe("PATCH /products/:id", () => {
    it("updates a product as admin", async () => {
      const created = await request(app)
        .post("/products")
        .set(authHeader(admin.token))
        .send({ sku: "P1", name: "Before", price: "1.00", stock: 5 });

      const res = await request(app)
        .patch(`/products/${created.body.id}`)
        .set(authHeader(admin.token))
        .send({ name: "After", stock: 99 });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("After");
      expect(res.body.stock).toBe(99);
      expect(res.body.sku).toBe("P1");
    });

    it("rejects viewer with 403", async () => {
      const created = await request(app)
        .post("/products")
        .set(authHeader(admin.token))
        .send({ sku: "P2", name: "x", price: "1.00" });

      const res = await request(app)
        .patch(`/products/${created.body.id}`)
        .set(authHeader(viewer.token))
        .send({ name: "Hacked" });

      expect(res.status).toBe(403);
    });

    it("returns 404 for missing id", async () => {
      const res = await request(app)
        .patch("/products/00000000-0000-0000-0000-000000000000")
        .set(authHeader(admin.token))
        .send({ name: "ghost" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /products/:id", () => {
    it("soft-deletes as admin and frees the SKU for reuse", async () => {
      const created = await request(app)
        .post("/products")
        .set(authHeader(admin.token))
        .send({ sku: "REUSE", name: "v1", price: "1.00" });

      const del = await request(app)
        .delete(`/products/${created.body.id}`)
        .set(authHeader(admin.token));
      expect(del.status).toBe(204);

      // Should disappear from list
      const list = await request(app)
        .get("/products")
        .set(authHeader(admin.token));
      expect(list.body.total).toBe(0);

      // SKU can now be reused
      const reused = await request(app)
        .post("/products")
        .set(authHeader(admin.token))
        .send({ sku: "REUSE", name: "v2", price: "2.00" });
      expect(reused.status).toBe(201);
    });

    it("rejects viewer with 403", async () => {
      const created = await request(app)
        .post("/products")
        .set(authHeader(admin.token))
        .send({ sku: "DEL", name: "x", price: "1.00" });

      const res = await request(app)
        .delete(`/products/${created.body.id}`)
        .set(authHeader(viewer.token));

      expect(res.status).toBe(403);
    });

    it("returns 404 for missing id", async () => {
      const res = await request(app)
        .delete("/products/00000000-0000-0000-0000-000000000000")
        .set(authHeader(admin.token));

      expect(res.status).toBe(404);
    });
  });
});
