import { cookies } from "next/headers";
import { env } from "../env";

/**
 * Server-only helpers for the auth session cookie.
 *
 * The JWT lives ONLY in an httpOnly cookie set by the BFF — client JS never
 * sees it. Route handlers use these helpers; client components hit the BFF
 * which forwards the cookie automatically.
 */

interface SessionTokenOptions {
  /** JWT expiry in seconds. Aligns with API JWT_EXPIRES_IN. */
  maxAgeSeconds?: number;
}

const DEFAULT_MAX_AGE = 60 * 60 * 24; // 24h, matches API default

export async function setSessionToken(
  token: string,
  opts: SessionTokenOptions = {}
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name: env.AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: env.IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge: opts.maxAgeSeconds ?? DEFAULT_MAX_AGE,
  });
}

export async function clearSessionToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name: env.AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: env.IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(env.AUTH_COOKIE_NAME)?.value ?? null;
}
