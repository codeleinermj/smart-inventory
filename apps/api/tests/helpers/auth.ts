import type { UserRole } from "@smart-inv/shared-types";
import { hashPassword } from "../../src/lib/password.js";
import { signJwt } from "../../src/lib/jwt.js";
import * as usersRepo from "../../src/repositories/users.repository.js";

export interface SeededUser {
  id: string;
  email: string;
  role: UserRole;
  password: string;
  token: string;
}

interface SeedOpts {
  email?: string;
  role?: UserRole;
  password?: string;
}

/**
 * Inserts a fresh user directly via the repository (bypassing /auth/register
 * since Phase 2 only exposes /auth/login). Returns the credentials and a
 * pre-signed JWT so tests can hit protected endpoints in one shot.
 */
export async function seedUser(opts: SeedOpts = {}): Promise<SeededUser> {
  const email = opts.email ?? `user-${Date.now()}@example.com`;
  const role: UserRole = opts.role ?? "viewer";
  const password = opts.password ?? "correct horse battery staple";

  const passwordHash = await hashPassword(password);
  const inserted = await usersRepo.insert({ email, passwordHash, role });

  const token = signJwt({
    userId: inserted.id,
    email: inserted.email,
    role: inserted.role,
  });

  return { id: inserted.id, email, role, password, token };
}
