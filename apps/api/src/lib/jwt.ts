import jwt from "jsonwebtoken";
import type { JwtPayload, UserRole } from "@smart-inv/shared-types";
import { env } from "../config/env.js";
import { Unauthorized } from "./errors.js";

interface SignInput {
  userId: string;
  email: string;
  role: UserRole;
}

function getSecret(): string {
  if (!env.JWT_SECRET) {
    // This should be unreachable in any execution path that signs/verifies —
    // tests/setup.ts injects a secret, runtime requires it via env validation.
    throw new Error("JWT_SECRET is required to sign or verify tokens");
  }
  return env.JWT_SECRET;
}

export function signJwt(input: SignInput): string {
  return jwt.sign(
    { sub: input.userId, email: input.email, role: input.role },
    getSecret(),
    {
      algorithm: "HS256",
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    }
  );
}

export function verifyJwt(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, getSecret(), {
      algorithms: ["HS256"],
    });
    if (typeof decoded === "string") {
      throw Unauthorized("INVALID_TOKEN", "Token payload is malformed");
    }
    return decoded as unknown as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw Unauthorized("TOKEN_EXPIRED", "Token has expired");
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw Unauthorized("INVALID_TOKEN", "Token is invalid");
    }
    throw err;
  }
}
