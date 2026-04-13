import type { CreateMovementInput } from "@smart-inv/shared-types";
import { NotFound } from "../lib/errors.js";
import * as movementsRepo from "../repositories/movements.repository.js";
import * as productsRepo from "../repositories/products.repository.js";
import type { StockMovement } from "../db/schema/movements.js";

export async function listByProduct(productId: string): Promise<StockMovement[]> {
  const product = await productsRepo.findById(productId);
  if (!product) throw NotFound("Product not found");
  return movementsRepo.listByProduct(productId);
}

export async function create(
  productId: string,
  input: CreateMovementInput,
  userId: string
): Promise<{ movement: StockMovement; newStock: number }> {
  const product = await productsRepo.findById(productId);
  if (!product) throw NotFound("Product not found");

  return movementsRepo.applyMovement(productId, {
    productId,
    type: input.type,
    quantity: input.quantity,
    reason: input.reason ?? null,
    userId,
  });
}