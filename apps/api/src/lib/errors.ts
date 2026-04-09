/**
 * Domain error class. Carries a stable code, an HTTP status, and an optional
 * details payload. The error middleware translates these into the standard
 * `{ code, message, details? }` JSON envelope.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    status: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const Unauthorized = (
  code: string,
  message: string,
  details?: Record<string, unknown>
): AppError => new AppError(code, message, 401, details);

export const Forbidden = (
  message = "Forbidden",
  details?: Record<string, unknown>
): AppError => new AppError("FORBIDDEN", message, 403, details);

export const NotFound = (
  message = "Not found",
  details?: Record<string, unknown>
): AppError => new AppError("NOT_FOUND", message, 404, details);

export const Conflict = (
  code: string,
  message: string,
  details?: Record<string, unknown>
): AppError => new AppError(code, message, 409, details);

export const ValidationError = (
  details: Record<string, unknown>
): AppError =>
  new AppError("VALIDATION_ERROR", "Request validation failed", 400, details);
