import { and, asc, count, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "../adapters/db.js";
import {
  products,
  type NewProduct,
  type Product,
} from "../db/schema/products.js";

/**
 * Products repository. All queries scope to non-soft-deleted rows
 * (`deleted_at IS NULL`). Soft delete is implemented via `deletedAt` set
 * to NOW() instead of a real DELETE so the partial unique index on `sku`
 * can free the value for reuse.
 */

export interface ListOptions {
  limit: number;
  offset: number;
}

export interface ListResult {
  items: Product[];
  total: number;
}

const activeFilter = isNull(products.deletedAt);

export async function list(opts: ListOptions): Promise<ListResult> {
  const db = getDb();

  const [items, totals] = await Promise.all([
    db
      .select()
      .from(products)
      .where(activeFilter)
      .orderBy(asc(products.createdAt))
      .limit(opts.limit)
      .offset(opts.offset),
    db.select({ value: count() }).from(products).where(activeFilter),
  ]);

  return { items, total: totals[0]?.value ?? 0 };
}

export async function findById(id: string): Promise<Product | null> {
  const rows = await getDb()
    .select()
    .from(products)
    .where(and(eq(products.id, id), activeFilter))
    .limit(1);
  return rows[0] ?? null;
}

export async function findBySku(sku: string): Promise<Product | null> {
  const rows = await getDb()
    .select()
    .from(products)
    .where(and(eq(products.sku, sku), activeFilter))
    .limit(1);
  return rows[0] ?? null;
}

export async function insert(input: NewProduct): Promise<Product> {
  const rows = await getDb().insert(products).values(input).returning();
  return rows[0]!;
}

export async function update(
  id: string,
  patch: Partial<Omit<NewProduct, "id" | "createdAt">>
): Promise<Product | null> {
  const rows = await getDb()
    .update(products)
    .set({ ...patch, updatedAt: sql`now()` })
    .where(and(eq(products.id, id), activeFilter))
    .returning();
  return rows[0] ?? null;
}

export async function softDelete(id: string): Promise<Product | null> {
  const rows = await getDb()
    .update(products)
    .set({ deletedAt: sql`now()`, updatedAt: sql`now()` })
    .where(and(eq(products.id, id), activeFilter))
    .returning();
  return rows[0] ?? null;
}
