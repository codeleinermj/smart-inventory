"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ProductForm } from "@/components/product-form";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useProduct,
  useUpdateProduct,
} from "@/lib/client/hooks/use-products";
import {
  useMovements,
  useCreateMovement,
  usePrediction,
} from "@/lib/client/hooks/use-movements";
import { ApiErrorResponse } from "@/lib/client/api";
import type { StockMovementType } from "@smart-inv/shared-types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: product, isLoading, isError, error } = useProduct(id);
  const update = useUpdateProduct(id);
  const { data: movements = [] } = useMovements(id);
  const createMovement = useCreateMovement(id);
  const prediction = usePrediction(
    product
      ? {
          productId: id,
          currentStock: product.stock,
          minStock: product.minStock,
          recentMovements: movements,
        }
      : null
  );

  const [movType, setMovType] = useState<StockMovementType>("in");
  const [movQty, setMovQty] = useState("");
  const [movReason, setMovReason] = useState("");
  const [movError, setMovError] = useState("");

  if (isLoading) {
    return (
      <PageTransition>
        <div className="h-96 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] animate-pulse" />
      </PageTransition>
    );
  }

  if (isError || !product) {
    return (
      <PageTransition>
        <Card className="border-[var(--color-danger)]/40 bg-[var(--color-danger)]/5">
          <p className="text-[var(--color-danger)]">
            {error instanceof ApiErrorResponse
              ? error.error.message
              : "Producto no encontrado."}
          </p>
          <div className="mt-4">
            <Link href="/products">
              <Button variant="secondary">Volver a productos</Button>
            </Link>
          </div>
        </Card>
      </PageTransition>
    );
  }

  const handleMovement = async () => {
    const qty = parseInt(movQty, 10);
    if (isNaN(qty) || qty < 1) {
      setMovError("La cantidad debe ser mayor a 0");
      return;
    }
    setMovError("");
    try {
      await createMovement.mutateAsync({
        type: movType,
        quantity: qty,
        reason: movReason || null,
      });
      setMovQty("");
      setMovReason("");
    } catch (e) {
      setMovError(e instanceof ApiErrorResponse ? e.error.message : "Error al registrar movimiento");
    }
  };

  const pred = prediction.data;
  const statusColors: Record<string, string> = {
    critical: "var(--color-danger)",
    low: "var(--color-warning)",
    normal: "var(--color-accent)",
    excess: "var(--color-success)",
  };
  const statusLabels: Record<string, string> = {
    critical: "Crítico",
    low: "Stock bajo",
    normal: "Normal",
    excess: "Exceso de stock",
  };

  return (
    <PageTransition>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
            {product.sku}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-fg)]">
            {product.name}
          </h1>
        </div>
        <Link href="/products">
          <Button variant="ghost">← Volver</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit form */}
        <div className="lg:col-span-2 space-y-6">
          <ProductForm
            initial={product}
            submitLabel="Guardar cambios"
            submitting={update.isPending}
            submitError={update.error}
            onCancel={() => router.push("/products")}
            onSubmit={async (values) => {
              const { sku: _omit, ...patch } = values;
              await update.mutateAsync(patch);
              router.push("/products");
            }}
          />

          {/* Stock movements */}
          <Card>
            <h2 className="text-base font-semibold text-[var(--color-fg)] mb-4">
              Movimiento de stock
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {/* Type */}
              <div className="flex rounded-xl overflow-hidden border border-[var(--color-border)]">
                {(["in", "out", "adjustment"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setMovType(t)}
                    className={[
                      "flex-1 px-3 py-2 text-sm font-medium transition-colors",
                      movType === t
                        ? t === "in"
                          ? "bg-[var(--color-success)]/20 text-[var(--color-success)]"
                          : t === "out"
                            ? "bg-[var(--color-danger)]/20 text-[var(--color-danger)]"
                            : "bg-[var(--color-brand)]/20 text-[var(--color-brand)]"
                        : "bg-[var(--color-bg-elevated)] text-[var(--color-fg-muted)]",
                    ].join(" ")}
                  >
                    {t === "in" ? "Entrada" : t === "out" ? "Salida" : "Ajuste"}
                  </button>
                ))}
              </div>

              {/* Qty */}
              <input
                type="number"
                min={1}
                placeholder="Cantidad"
                value={movQty}
                onChange={(e) => setMovQty(e.target.value)}
                className="w-32 h-10 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-fg)] text-sm focus:border-[var(--color-brand)] focus:outline-none"
              />

              {/* Reason */}
              <input
                type="text"
                placeholder="Motivo (opcional)"
                value={movReason}
                onChange={(e) => setMovReason(e.target.value)}
                className="flex-1 h-10 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-fg)] text-sm focus:border-[var(--color-brand)] focus:outline-none"
              />

              <Button
                size="sm"
                loading={createMovement.isPending}
                onClick={handleMovement}
              >
                Registrar
              </Button>
            </div>

            {movError && (
              <p className="text-sm text-[var(--color-danger)] mb-3">{movError}</p>
            )}

            {/* Movements history */}
            {movements.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {movements.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--color-bg-elevated)]"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background:
                              m.type === "in"
                                ? "rgba(34,197,94,0.15)"
                                : m.type === "out"
                                  ? "rgba(255,77,109,0.15)"
                                  : "rgba(124,92,255,0.15)",
                            color:
                              m.type === "in"
                                ? "var(--color-success)"
                                : m.type === "out"
                                  ? "var(--color-danger)"
                                  : "var(--color-brand)",
                          }}
                        >
                          {m.type === "in" ? "▲ Entrada" : m.type === "out" ? "▼ Salida" : "⟳ Ajuste"}
                        </span>
                        <span className="text-sm font-semibold text-[var(--color-fg)]">
                          {m.type === "out" ? "-" : "+"}{m.quantity}
                        </span>
                        {m.reason && (
                          <span className="text-sm text-[var(--color-fg-muted)] truncate max-w-[200px]">
                            {m.reason}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[var(--color-fg-subtle)] shrink-0">
                        {new Date(m.createdAt).toLocaleDateString("es", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-fg-subtle)]">
                Sin movimientos registrados aún.
              </p>
            )}
          </Card>
        </div>

        {/* Right column: stock + ML prediction */}
        <div className="space-y-4">
          {/* Current stock */}
          <Card>
            <h3 className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)] mb-3">
              Estado actual
            </h3>
            <div className="flex items-end gap-2 mb-3">
              <span
                className="text-4xl font-bold tabular-nums"
                style={{
                  color:
                    product.stock === 0
                      ? "var(--color-danger)"
                      : product.stock <= product.minStock
                        ? "var(--color-warning)"
                        : "var(--color-success)",
                }}
              >
                {product.stock}
              </span>
              <span className="text-[var(--color-fg-muted)] mb-1">unidades</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--color-border)] mb-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, product.minStock > 0 ? (product.stock / (product.minStock * 4)) * 100 : 100)}%`,
                  background:
                    product.stock <= product.minStock
                      ? "var(--color-warning)"
                      : "var(--color-success)",
                }}
              />
            </div>
            <p className="text-xs text-[var(--color-fg-subtle)]">
              Mínimo: {product.minStock} unidades
            </p>
          </Card>

          {/* ML Prediction */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
                Predicción ML
              </h3>
              {pred && (
                <span className="text-xs text-[var(--color-fg-subtle)]">
                  {Math.round(pred.confidence * 100)}% confianza
                </span>
              )}
            </div>

            {prediction.isLoading && (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-5 rounded bg-[var(--color-border)] animate-pulse" />
                ))}
              </div>
            )}

            {prediction.isError && (
              <p className="text-xs text-[var(--color-fg-subtle)]">
                Servicio ML no disponible
              </p>
            )}

            {pred && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ background: statusColors[pred.status] }}
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: statusColors[pred.status] }}
                  >
                    {statusLabels[pred.status]}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-[var(--color-bg-elevated)] p-3">
                    <p className="text-xs text-[var(--color-fg-subtle)] mb-1">
                      Días hasta reorden
                    </p>
                    <p className="text-xl font-bold text-[var(--color-fg)]">
                      {pred.days_until_reorder ?? 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[var(--color-bg-elevated)] p-3">
                    <p className="text-xs text-[var(--color-fg-subtle)] mb-1">
                      Qty recomendada
                    </p>
                    <p className="text-xl font-bold text-[var(--color-accent)]">
                      {pred.recommended_reorder_qty}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[var(--color-fg-subtle)]">
                  Uso estimado: {pred.avg_daily_usage} u/día
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}