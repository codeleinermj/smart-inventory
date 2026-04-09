import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/errors.js";
import logger from "../adapters/logger.js";

/**
 * Central error handler. Translates AppError into the standard JSON envelope
 * `{ code, message, details? }` with the AppError's HTTP status. Unknown
 * errors fall through to a generic 500 INTERNAL response so we never leak
 * stack traces or framework internals to clients.
 *
 * NOTE: Express recognizes this as an error handler because it has 4 args,
 * so the unused `_next` parameter must stay even though we never call it.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    if (err.status >= 500) {
      logger.error({ err, code: err.code }, "AppError 5xx");
    } else {
      logger.warn({ code: err.code, status: err.status }, err.message);
    }
    res.status(err.status).json({
      code: err.code,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  logger.error({ err }, "Unhandled error");
  res.status(500).json({
    code: "INTERNAL",
    message: "Unexpected internal error",
  });
}

/**
 * 404 catch-all for routes that didn't match. Mounted after all real routes
 * but before `errorHandler`.
 */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    code: "NOT_FOUND",
    message: "Route not found",
  });
}
