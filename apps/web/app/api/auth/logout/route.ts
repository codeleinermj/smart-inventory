import { NextResponse } from "next/server";
import { clearSessionToken } from "@/lib/server/session";

/**
 * POST /api/auth/logout
 *
 * Clears the httpOnly session cookie. Stateless on the API side — JWTs expire
 * on their own — so there's nothing to call upstream.
 */
export async function POST() {
  await clearSessionToken();
  return new NextResponse(null, { status: 204 });
}
