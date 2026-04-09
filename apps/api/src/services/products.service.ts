import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from "@smart-inv/shared-types";
import { Conflict, NotFound } from "../lib/errors.js";
import * as productsRepo from "../repositories/products.repository.js";
import type { Product } from "../db/schema/products.js";

export async function list(query: ListProductsQuery): Promise<{
  data: Product[];
  total: number;
}> {
  const { items, total } = await productsRepo.list({
    limit: query.limit,
    offset: query.offset,
  });
  return { data: items, total };
}

export async function getById(id: string): Promise<Product> {
  const found = await productsRepo.findById(id);
  if (!found) throw NotFound("Product not found");
  return found;
}

export async function create(input: CreateProductInput): Promise<Product> {
  // Cheap pre-check on SKU. The unique index is the source of truth, but
  // checking first lets us return a clean 409 instead of catching a pg error.
  const dup = await productsRepo.findBySku(input.sku);
  if (dup) {
    throw Conflict("SKU_CONFLICT", `SKU "${input.sku}" already exists`);
  }

  try {
    return await productsRepo.insert({
      sku: input.sku,
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      stock: input.stock ?? 0,
      minStock: input.minStock ?? 0,
    });
  } catch (err) {
    // Race condition fallback: another request inserted the same SKU
    // between our findBySku and insert. Translate the unique violation.
    if (isUniqueViolation(err)) {
      throw Conflict("SKU_CONFLICT", `SKU "${input.sku}" already exists`);
    }
    throw err;
  }
}

export async function update(
  id: string,
  patch: UpdateProductInput
): Promise<Product> {
  const updated = await productsRepo.update(id, {
    ...(patch.sku !== undefined ? { sku: patch.sku } : {}),
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.description !== undefined
      ? { description: patch.description }
      : {}),
    ...(patch.price !== undefined ? { price: patch.price } : {}),
    ...(patch.stock !== undefined ? { stock: patch.stock } : {}),
    ...(patch.minStock !== undefined ? { minStock: patch.minStock } : {}),
  });
  if (!updated) throw NotFound("Product not found");
  return updated;
}

export async function remove(id: string): Promise<void> {
  const removed = await productsRepo.softDelete(id);
  if (!removed) throw NotFound("Product not found");
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "23505"
  );
}
