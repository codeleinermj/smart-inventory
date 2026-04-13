import { NextResponse } from "next/server";
import { proxyToApi } from "@/lib/server/api-proxy";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  const { status, data } = await proxyToApi(`/products/${id}/movements`);
  return NextResponse.json(data, { status });
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Invalid JSON body" },
      { status: 400 }
    );
  }
  const { status, data } = await proxyToApi(`/products/${id}/movements`, {
    method: "POST",
    body,
  });
  return NextResponse.json(data, { status });
}