import { NextResponse } from "next/server";
import { loginRequestSchema, loginResponseSchema } from "@smart-inv/shared-types";
import { proxyToApi } from "@/lib/server/api-proxy";
import { setSessionToken } from "@/lib/server/session";

/**
 * POST /api/auth/login
 *
 * BFF login endpoint. Validates the payload client-side-first, forwards to the
 * upstream API, and — on success — stashes the JWT in an httpOnly cookie so
 * the browser never sees it. The response body only exposes the user object.
 */
export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = loginRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        code: "VALIDATION_ERROR",
        message: "Invalid login payload",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  const { status, data } = await proxyToApi("/auth/login", {
    method: "POST",
    body: parsed.data,
    noAuth: true,
  });

  if (status !== 200) {
    return NextResponse.json(data, { status });
  }

  // Upstream must return { token, user } — anything else is an upstream bug.
  const shape = loginResponseSchema.safeParse(data);
  if (!shape.success) {
    return NextResponse.json(
      {
        code: "UPSTREAM_INVALID_SHAPE",
        message: "Upstream login response did not match expected shape",
      },
      { status: 502 }
    );
  }

  await setSessionToken(shape.data.token);

  // Strip the token from the client response — it's now in the cookie.
  return NextResponse.json({ user: shape.data.user }, { status: 200 });
}
