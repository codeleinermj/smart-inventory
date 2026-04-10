"use client";

import type { ApiError } from "@smart-inv/shared-types";

/**
 * Thin client-side fetch wrapper that talks to our BFF (`/api/*`), never the
 * upstream API directly. Cookies are forwarded automatically by the browser.
 *
 * On non-2xx responses we throw an `ApiErrorResponse` that carries the
 * upstream envelope so UI layers can branch on `.error.code` without having
 * to re-parse text.
 */

export class ApiErrorResponse extends Error {
  readonly status: number;
  readonly error: ApiError;

  constructor(status: number, error: ApiError) {
    super(error.message);
    this.name = "ApiErrorResponse";
    this.status = status;
    this.error = error;
  }
}

interface FetchInit {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  body?: unknown;
  signal?: AbortSignal;
}

export async function apiFetch<T>(path: string, init: FetchInit = {}): Promise<T> {
  const res = await fetch(path, {
    method: init.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    signal: init.signal,
    credentials: "same-origin",
    cache: "no-store",
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  const data: unknown = text ? safeParse(text) : null;

  if (!res.ok) {
    const fallback: ApiError = {
      code: "NETWORK_ERROR",
      message: res.statusText || "Request failed",
    };
    const err =
      data && typeof data === "object" && "code" in data
        ? (data as ApiError)
        : fallback;
    throw new ApiErrorResponse(res.status, err);
  }

  return data as T;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
