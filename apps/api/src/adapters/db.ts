import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "../config/env.js";

// LAZY INIT — risk mitigation #1
// Do NOT call drizzle() at module load time.
// This prevents test crashes when DATABASE_URL is absent.
let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db) {
    if (!env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is required to initialize the database client"
      );
    }
    const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
    _db = drizzle(pool);
  }
  return _db;
}
