import { NextResponse } from "next/server";
import { proxyToApi } from "@/lib/server/api-proxy";

/**
 * GET    /api/products/[id]
 * PATCH  /api/products/[id]
 * DELETE /api/products/[id]
 *
 * In Next 15, `params` is a Promise — remember to await before reading.
 */
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, ctx: RouteContext) {
  const { id } = await ctx.params;
  const { status, data } = await proxyToApi(`/products/${encodeURIComponent(id)}`);
  return NextResponse.json(data, { status });
}

export async function PATCH(request: Request, ctx: RouteContext) {
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { status, data } = await proxyToApi(`/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
  });
  return NextResponse.json(data, { status });
}

export async function DELETE(_request: Request, ctx: RouteContext) {
  const { id } = await ctx.params;
  const { status, data } = await proxyToApi(`/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  // 204 No Content — no body.
  if (status === 204) {
    return new NextResponse(null, { status: 204 });
  }
  return NextResponse.json(data, { status });
}
