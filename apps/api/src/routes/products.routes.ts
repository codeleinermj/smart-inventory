import { Router } from "express";
import {
  createProductSchema,
  createMovementSchema,
  listProductsQuerySchema,
  updateProductSchema,
} from "@smart-inv/shared-types";
import { auth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as productsController from "../controllers/products.controller.js";
import * as movementsController from "../controllers/movements.controller.js";

export const productsRouter: Router = Router();

// Read endpoints — any authenticated user
productsRouter.get(
  "/",
  auth,
  validate(listProductsQuerySchema, "query"),
  productsController.list
);

productsRouter.get("/:id", auth, productsController.getById);

// Write endpoints — admin only
productsRouter.post(
  "/",
  auth,
  requireRole("admin"),
  validate(createProductSchema, "body"),
  productsController.create
);

productsRouter.patch(
  "/:id",
  auth,
  requireRole("admin"),
  validate(updateProductSchema, "body"),
  productsController.update
);

productsRouter.delete(
  "/:id",
  auth,
  requireRole("admin"),
  productsController.remove
);

// Stock movements — GET (any auth), POST (admin only)
productsRouter.get("/:id/movements", auth, movementsController.list);
productsRouter.post(
  "/:id/movements",
  auth,
  requireRole("admin"),
  validate(createMovementSchema, "body"),
  movementsController.create
);
