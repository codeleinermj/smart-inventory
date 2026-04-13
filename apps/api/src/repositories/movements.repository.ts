import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "../adapters/db.js";
import { stockMovements, type StockMovement, type NewStockMovement } from "../db/schema/movements.js";
import { products } from "../db/schema/products.js";

export async function listByProduct(productId: string): Promise<StockMovement[]> {
  return getDb()
    .select()
    .from(stockMovements)
    .where(eq(stockMovements.productId, productId))
    .orderBy(desc(stockMovements.createdAt))
    .limit(50);
}

export async function insert(input: NewStockMovement): Promise<StockMovement> {
  const rows = await getDb().insert(stockMovements).values(input).returning();
  return rows[0]!;
}

/**
 * Apply movement and update product stock atomically in a transaction.
 * Returns the new stock value.
 */
export async function applyMovement(
  productId: string,
  movement: NewStockMovement
): Promise<{ movement: StockMovement; newStock: number }> {
  const db = getDb();

  return db.transaction(async (tx) => {
    // Determine stock delta
    const delta =
      movement.type === "in"
        ? movement.quantity
        : movement.type === "out"
          ? -movement.quantity
          : movement.quantity; // adjustment: signed value applied directly

    // Update product stock
    const updated = await tx
      .update(products)
      .set({
        stock: sql`GREATEST(0, ${products.stock} + ${delta})`,
        updatedAt: sql`now()`,
      })
      .where(eq(products.id, productId))
      .returning({ stock: products.stock });

    if (!updated[0]) throw new Error("Product not found");

    // Record movement
    const rows = await tx.insert(stockMovements).values(movement).returning();
    return { movement: rows[0]!, newStock: updated[0].stock };
  });
}