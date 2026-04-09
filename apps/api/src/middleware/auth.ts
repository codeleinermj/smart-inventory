import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@smart-inv/shared-types";
import { verifyJwt } from "../lib/jwt.js";
import { Forbidden, Unauthorized } from "../lib/errors.js";

/**
 * Auth middleware. Reads `Authorization: Bearer <token>`, verifies it, and
 * populates `req.user` with the decoded claims. Throws AppError on failure
 * so the central error handler can serialize it as the JSON envelope.
 */
export function auth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(
      Unauthorized("MISSING_TOKEN", "Authorization bearer token is required")
    );
  }

  const token = header.slice("Bearer ".length).trim();

  if (!token) {
    return next(
      Unauthorized("MISSING_TOKEN", "Authorization bearer token is required")
    );
  }

  try {
    const payload = verifyJwt(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Role guard. Must run AFTER `auth` so `req.user` is populated. Returns 403
 * FORBIDDEN if the user's role does not match. Accepts a single role string
 * for now (Phase 2 only has admin/viewer).
 */
export function requireRole(role: UserRole) {
  return function roleGuard(
    req: Request,
    _res: Response,
    next: NextFunction
  ): void {
    if (!req.user) {
      return next(
        Unauthorized("MISSING_TOKEN", "Authentication is required")
      );
    }
    if (req.user.role !== role) {
      return next(Forbidden(`Requires role: ${role}`));
    }
    next();
  };
}
