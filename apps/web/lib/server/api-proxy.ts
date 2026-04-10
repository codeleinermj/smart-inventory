import { env } from "../env";
import { getSessionToken } from "./session";

/**
 * Server-only fetch wrapper that talks to the smart-inv API.
 *
 * - Resolves the JWT from the httpOnly cookie automatically.
 * - Forwards the upstream JSON envelope `{ code, message, details? }` for
 *   error responses so the client BFF can pass it through verbatim.
 * - Returns a normalized `{ status, data }` tuple. Callers decide how to map
 *   it back to NextResponse.
 *
 * Do NOT import from client components.
 */

interface ProxyResult {
  status: number;
  data: unknown;
}

interface ProxyInit {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  body?: unknown;
  /** When true, the upstream call is unauthenticated even if a cookie exists. */
  noAuth?: boolean;
}

export async function proxyToApi(
  path: string,
  init: ProxyInit = {}
): Promise<ProxyResult> {
  const url = `${env.API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (!init.noAuth) {
    const token = await getSessionToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: init.method ?? "GET",
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    // Always pass through to the API; never use Next's HTTP cache for these.
    cache: "no-store",
  });

  // 204 No Content (DELETE) — no body
  if (res.status === 204) {
    return { status: 204, data: null };
  }

  // Try to parse JSON; if the upstream sent garbage, surface a 502.
  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      return {
        status: 502,
        data: {
          code: "UPSTREAM_INVALID_JSON",
          message: "Upstream API returned a non-JSON response",
        },
      };
    }
  }

  return { status: res.status, data };
}
