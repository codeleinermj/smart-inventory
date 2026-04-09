import { sql } from "drizzle-orm";
import { getDb } from "../../src/adapters/db.js";

/**
 * Truncates every domain table to give each test a clean slate.
 * RESTART IDENTITY isn't strictly needed (we use uuids), but CASCADE
 * is essential because future foreign keys would otherwise block.
 *
 * Tables are listed explicitly so we never wipe drizzle's `__drizzle_migrations`.
 */
export async function truncateAllTables(): Promise<void> {
  await getDb().execute(
    sql`TRUNCATE TABLE products, users RESTART IDENTITY CASCADE`
  );
}
