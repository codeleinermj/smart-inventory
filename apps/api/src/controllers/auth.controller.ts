import type { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service.js";
import { Unauthorized } from "../lib/errors.js";

/**
 * POST /auth/login
 * Body validated upstream by `validate(loginRequestSchema)`.
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /auth/me
 * Returns the current user. Requires `auth` middleware upstream.
 */
export function me(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(Unauthorized("MISSING_TOKEN", "Authentication is required"));
  }
  res.status(200).json({ user: req.user });
}
