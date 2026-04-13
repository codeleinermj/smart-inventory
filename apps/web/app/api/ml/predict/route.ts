import { NextResponse } from "next/server";
import { env } from "@/lib/env";

/**
 * POST /api/ml/predict — proxies directly to the ML service.
 * The ML service is internal only; the web never calls it from the browser.
 */
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

  const ML_URL = process.env.ML_SERVICE_URL ?? "http://localhost:8000";

  try {
    const res = await fetch(`${ML_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { code: "ML_UNAVAILABLE", message: "ML service is unavailable" },
      { status: 503 }
    );
  }
}