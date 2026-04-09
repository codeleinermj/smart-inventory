import type { LoginRequest, LoginResponse } from "@smart-inv/shared-types";
import { Unauthorized } from "../lib/errors.js";
import { signJwt } from "../lib/jwt.js";
import { verifyPassword } from "../lib/password.js";
import * as usersRepo from "../repositories/users.repository.js";

/**
 * Login flow. Returns the same generic INVALID_CREDENTIALS error whether the
 * email is unknown or the password is wrong — preventing user enumeration.
 */
export async function login(input: LoginRequest): Promise<LoginResponse> {
  const user = await usersRepo.findByEmail(input.email);
  if (!user) {
    throw Unauthorized("INVALID_CREDENTIALS", "Invalid email or password");
  }

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    throw Unauthorized("INVALID_CREDENTIALS", "Invalid email or password");
  }

  const token = signJwt({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}
