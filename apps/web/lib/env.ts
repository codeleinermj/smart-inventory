/**
 * Server-only env access. Do NOT import from client components.
 *
 * - API_BASE_URL: Base URL of the smart-inv API. Defaults to http://localhost:3001
 *   for local dev. CI / Docker should override.
 * - AUTH_COOKIE_NAME: Name of the httpOnly cookie that stores the JWT.
 *   Constant — exposed here for single source of truth.
 * - NODE_ENV is read directly so we know whether to set `secure: true` on cookies.
 */
export const env = {
  API_BASE_URL: process.env.API_BASE_URL ?? "http://localhost:3001",
  AUTH_COOKIE_NAME: "smart_inv_session",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
};
