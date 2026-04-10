import { NextResponse } from "next/server";
import { proxyToApi } from "@/lib/server/api-proxy";

/**
 * GET /api/products — list products, forwarding pagination query params.
 * POST /api/products — create a product (upstream enforces admin role).
 *
 * Validation happens upstream; we pass through the envelope verbatim so the
 * shared error shape stays consistent.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const qs = url.searchParams.toString();
  const upstreamPath = `/products${qs ? `?${qs}` : ""}`;

  const { status, data } = await proxyToApi(upstreamPath);
  return NextResponse.json(data, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { status, data } = await proxyToApi("/products", {
    method: "POST",
    body,
  });
  return NextResponse.json(data, { status });
}
