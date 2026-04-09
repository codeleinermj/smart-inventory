import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "../config/env.js";
import * as schema from "../db/schema/index.js";

// LAZY INIT — risk mitigation #1
// Do NOT call drizzle() at module load time.
// This prevents test crashes when DATABASE_URL is absent.
let _pool: pg.Pool | null = null;
let _db: NodePgDatabase<typeof schema> | null = null;

export function getDb(): NodePgDatabase<typeof schema> {
  if (!_db) {
    if (!env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is required to initialize the database client"
      );
    }
    _pool = new pg.Pool({ connectionString: env.DATABASE_URL });
    _db = drizzle(_pool, { schema });
  }
  return _db;
}

/**
 * Test-only utility: closes the pool and resets the singleton so the next
 * getDb() call rebuilds it. Used in test teardown to avoid hanging connections.
 */
export async function closeDb(): Promise<void> {
  if (_pool) {
    await _pool.end();
    _pool = null;
    _db = null;
  }
}
