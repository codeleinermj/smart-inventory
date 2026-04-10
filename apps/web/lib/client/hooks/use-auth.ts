"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { LoginRequest, UserPublic } from "@smart-inv/shared-types";
import { ApiErrorResponse, apiFetch } from "../api";

/**
 * Auth hooks sit entirely against the BFF (`/api/auth/*`).
 * The browser never sees the JWT — it's held in an httpOnly cookie set by
 * the Next route handler on successful login.
 */

const ME_KEY = ["auth", "me"] as const;

interface MeResponse {
  user: UserPublic;
}

export function useMe() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: async ({ signal }) => {
      try {
        const data = await apiFetch<MeResponse>("/api/auth/me", { signal });
        return data.user;
      } catch (err) {
        // A missing/expired session is not an error at the hook boundary —
        // it's just "logged out".
        if (err instanceof ApiErrorResponse && err.status === 401) {
          return null;
        }
        throw err;
      }
    },
    staleTime: 60_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (input: LoginRequest) => {
      const data = await apiFetch<MeResponse>("/api/auth/login", {
        method: "POST",
        body: input,
      });
      return data.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(ME_KEY, user);
      // Pick up the `?next=` redirect target the middleware might have set.
      const next =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("next")
          : null;
      router.replace(next ?? "/products");
      router.refresh();
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await apiFetch<void>("/api/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      queryClient.setQueryData(ME_KEY, null);
      queryClient.clear();
      router.replace("/login");
      router.refresh();
    },
  });
}
