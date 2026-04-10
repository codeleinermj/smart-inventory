import { NextResponse } from "next/server";
import { proxyToApi } from "@/lib/server/api-proxy";

/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated user, or a 401 envelope if the session
 * cookie is missing/invalid/expired. The token itself is never echoed back.
 */
export async function GET() {
  const { status, data } = await proxyToApi("/auth/me");
  return NextResponse.json(data, { status });
}
