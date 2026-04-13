"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateMovementInput, StockMovement } from "@smart-inv/shared-types";
import { apiFetch } from "../api";
import { productsKeys } from "./use-products";

export const movementsKeys = {
  byProduct: (productId: string) => ["movements", productId] as const,
};

export function useMovements(productId: string) {
  return useQuery({
    queryKey: movementsKeys.byProduct(productId),
    queryFn: ({ signal }) =>
      apiFetch<StockMovement[]>(
        `/api/products/${encodeURIComponent(productId)}/movements`,
        { signal }
      ),
    enabled: !!productId,
  });
}

export function useCreateMovement(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMovementInput) =>
      apiFetch<{ movement: StockMovement; newStock: number }>(
        `/api/products/${encodeURIComponent(productId)}/movements`,
        { method: "POST", body: input }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movementsKeys.byProduct(productId) });
      // Invalidate product detail so stock number refreshes
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(productId) });
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
    },
  });
}

// ─── ML prediction hook ───────────────────────────────────────────────────────

export interface PredictResponse {
  product_id: string;
  status: "critical" | "low" | "normal" | "excess";
  days_until_reorder: number | null;
  recommended_reorder_qty: number;
  avg_daily_usage: number;
  confidence: number;
}

interface PredictParams {
  productId: string;
  currentStock: number;
  minStock: number;
  recentMovements: StockMovement[];
}

export function usePrediction(params: PredictParams | null) {
  return useQuery({
    queryKey: ["prediction", params?.productId, params?.currentStock],
    enabled: !!params,
    queryFn: async ({ signal }) => {
      const body = {
        product_id: params!.productId,
        current_stock: params!.currentStock,
        min_stock: params!.minStock,
        recent_movements: params!.recentMovements.map((m) => ({
          type: m.type,
          quantity: m.quantity,
          created_at: m.createdAt,
        })),
      };
      const res = await fetch("/api/ml/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal,
        cache: "no-store",
      });
      if (!res.ok) throw new Error("ML service unavailable");
      return res.json() as Promise<PredictResponse>;
    },
    staleTime: 60_000,
  });
}