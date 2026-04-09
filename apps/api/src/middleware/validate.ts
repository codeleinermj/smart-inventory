import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { ZodError } from "zod";
import { ValidationError } from "../lib/errors.js";

type Source = "body" | "query" | "params";

/**
 * Builds a middleware that validates `req[source]` against the given Zod
 * schema. On success, replaces `req[source]` with the parsed (typed) value
 * so downstream handlers can trust it. On failure, throws ValidationError
 * with the Zod issues as `details`.
 */
export function validate(schema: ZodSchema, source: Source = "body") {
  return function validateMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction
  ): void {
    try {
      const parsed = schema.parse(req[source]);
      // Replace the raw input with the parsed value so handlers see the
      // coerced/typed shape (e.g. limit/offset converted to numbers).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any)[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(
          ValidationError({
            issues: err.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
              code: issue.code,
            })),
          })
        );
      }
      next(err);
    }
  };
}
