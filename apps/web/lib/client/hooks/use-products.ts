"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  CreateProductInput,
  ListProductsResponse,
  Product,
  UpdateProductInput,
} from "@smart-inv/shared-types";
import { apiFetch } from "../api";

/**
 * Products hooks — all traffic is to the BFF. Query keys are structured so
 * mutations can selectively invalidate either the list or a single product.
 */

export const productsKeys = {
  all: ["products"] as const,
  list: (params: { limit: number; offset: number }) =>
    ["products", "list", params] as const,
  detail: (id: string) => ["products", "detail", id] as const,
};

interface ListParams {
  limit?: number;
  offset?: number;
}

export function useProducts(params: ListParams = {}) {
  const limit = params.limit ?? 50;
  const offset = params.offset ?? 0;

  return useQuery({
    queryKey: productsKeys.list({ limit, offset }),
    queryFn: ({ signal }) => {
      const qs = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });
      return apiFetch<ListProductsResponse>(`/api/products?${qs.toString()}`, {
        signal,
      });
    },
  });
}

export function useProduct(id: string | null) {
  return useQuery({
    queryKey: id ? productsKeys.detail(id) : ["products", "detail", "none"],
    enabled: !!id,
    queryFn: ({ signal }) =>
      apiFetch<Product>(`/api/products/${encodeURIComponent(id!)}`, { signal }),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductInput) =>
      apiFetch<Product>("/api/products", { method: "POST", body: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
    },
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProductInput) =>
      apiFetch<Product>(`/api/products/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: input,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(productsKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/products/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
    },
  });
}
