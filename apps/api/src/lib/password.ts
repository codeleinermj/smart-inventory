import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

/**
 * Hashes a plaintext password using bcryptjs with the configured cost factor.
 * Production defaults to 12 rounds; tests override to 4 via BCRYPT_ROUNDS.
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, env.BCRYPT_ROUNDS);
}

/**
 * Constant-time verification of a plaintext password against a stored hash.
 * Returns false on any failure (invalid hash format, mismatch, etc.) — never throws.
 */
export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}
