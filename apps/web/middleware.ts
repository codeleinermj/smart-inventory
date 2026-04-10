import { NextRequest, NextResponse } from "next/server";

/**
 * Edge middleware — protects authenticated pages.
 *
 * We only check *presence* of the session cookie here. Cryptographic
 * verification (signature, expiry, role) still happens in the API; this
 * middleware exists purely to avoid rendering authed pages for users with
 * no cookie at all. A stale/expired cookie will be caught by the BFF on
 * the next data fetch and the client will redirect to /login.
 *
 * Why not verify the JWT here? The Edge runtime doesn't have full Node
 * crypto, and we'd need to ship the secret to every edge worker. Keeping
 * the check at the API is the single source of truth.
 */
const AUTH_COOKIE_NAME = "smart_inv_session";

const PROTECTED_PREFIXES = ["/products"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsAuth = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (!needsAuth) return NextResponse.next();

  const hasSession = request.cookies.has(AUTH_COOKIE_NAME);
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/products/:path*"],
};
