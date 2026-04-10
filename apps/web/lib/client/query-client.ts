"use client";

import { QueryClient } from "@tanstack/react-query";
import { ApiErrorResponse } from "./api";

/**
 * Factory so we can create one QueryClient per browser tab (via the provider)
 * instead of sharing a singleton across requests.
 *
 * Defaults tuned for a small BFF-backed inventory app:
 * - `staleTime` 30s — avoids refetch storms on tab focus
 * - No retries for 4xx auth errors — re-trying a 401 just wastes a round trip
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiErrorResponse) {
            // Don't retry client errors — they won't magically become 200s.
            if (error.status >= 400 && error.status < 500) return false;
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}
