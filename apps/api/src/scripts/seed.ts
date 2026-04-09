import "dotenv/config";
import { closeDb, getDb } from "../adapters/db.js";
import { env } from "../config/env.js";
import { hashPassword } from "../lib/password.js";
import * as usersRepo from "../repositories/users.repository.js";

/**
 * Seeds the initial admin user from ADMIN_EMAIL/ADMIN_PASSWORD env vars.
 * Idempotent: a second run is a no-op when the user already exists.
 *
 * NEVER seeds in production unless ADMIN_EMAIL and ADMIN_PASSWORD are
 * BOTH set explicitly — there is no built-in default password.
 */
async function main(): Promise<void> {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    console.error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the initial admin"
    );
    process.exit(1);
  }

  // Force lazy DB init early so connection errors fail fast.
  getDb();

  const existing = await usersRepo.findByEmail(env.ADMIN_EMAIL);
  if (existing) {
    console.log(
      `Admin user already exists for ${env.ADMIN_EMAIL} — skipping (idempotent)`
    );
    await closeDb();
    return;
  }

  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);
  const created = await usersRepo.insert({
    email: env.ADMIN_EMAIL,
    passwordHash,
    role: "admin",
  });

  console.log(`Seeded admin user ${created.email} (id=${created.id})`);
  await closeDb();
}

main().catch(async (err) => {
  console.error("Seed failed:", err);
  await closeDb().catch(() => {});
  process.exit(1);
});
