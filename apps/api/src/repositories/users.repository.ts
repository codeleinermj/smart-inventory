import { eq } from "drizzle-orm";
import { getDb } from "../adapters/db.js";
import { users, type NewUser, type User } from "../db/schema/users.js";

/**
 * Users repository. Thin Drizzle wrapper — no domain logic, no error mapping.
 * Services are responsible for translating misses/conflicts into AppError.
 */

export async function findByEmail(email: string): Promise<User | null> {
  const rows = await getDb()
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return rows[0] ?? null;
}

export async function findById(id: string): Promise<User | null> {
  const rows = await getDb()
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function insert(input: NewUser): Promise<User> {
  const rows = await getDb().insert(users).values(input).returning();
  return rows[0]!;
}
