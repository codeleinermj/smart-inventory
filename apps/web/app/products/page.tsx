"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useProducts, useDeleteProduct } from "@/lib/client/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageTransition } from "@/components/page-transition";
import { useMe } from "@/lib/client/hooks/use-auth";
import { ApiErrorResponse } from "@/lib/client/api";
import { useDebounce } from "@/lib/client/hooks/use-debounce";

const PAGE_SIZE = 20;

type Status = "all" | "low" | "ok";

export default function ProductsPage() {
  const { data: me } = useMe();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status>("all");
  const [page, setPage] = useState(0);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, error, refetch } = useProducts({
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
    search: debouncedSearch || undefined,
    status,
  });

  const deleteProduct = useDeleteProduct();
  const isAdmin = me?.role === "admin";

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  // Reset page when filters change
  const handleSearch = useCallback((v: string) => {
    setSearch(v);
    setPage(0);
  }, []);
  const handleStatus = useCallback((v: Status) => {
    setStatus(v);
    setPage(0);
  }, []);

  return (
    <PageTransition>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-fg)]">
            Productos
          </h1>
          <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
            {data
              ? `${data.total} resultado${data.total !== 1 ? "s" : ""}${debouncedSearch ? ` para "${debouncedSearch}"` : ""}`
              : "Cargando…"}
          </p>
        </div>
        {isAdmin && (
          <Link href="/products/new">
            <Button>+ Nuevo producto</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)] pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre o SKU…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-glow)] text-sm"
          />
          {search && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex gap-2">
          {(["all", "ok", "low"] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleStatus(s)}
              className={[
                "px-4 h-10 rounded-xl text-sm font-medium border transition-colors",
                status === s
                  ? s === "low"
                    ? "border-[var(--color-warning)]/60 bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
                    : s === "ok"
                      ? "border-[var(--color-success)]/60 bg-[var(--color-success)]/10 text-[var(--color-success)]"
                      : "border-[var(--color-brand)]/60 bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
                  : "border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]",
              ].join(" ")}
            >
              {s === "all" ? "Todos" : s === "ok" ? "OK" : "Stock bajo"}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && <SkeletonGrid />}

      {/* Error */}
      {isError && (
        <Card className="border-[var(--color-danger)]/40 bg-[var(--color-danger)]/5">
          <p className="text-[var(--color-danger)]">
            {error instanceof ApiErrorResponse
              ? error.error.message
              : "No pudimos cargar los productos."}
          </p>
          <div className="mt-3">
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        </Card>
      )}

      {/* Empty */}
      {data && data.data.length === 0 && (
        <Card>
          <p className="text-[var(--color-fg-muted)]">
            {debouncedSearch
              ? `No hay productos que coincidan con "${debouncedSearch}".`
              : status !== "all"
                ? `No hay productos con estado "${status}".`
                : isAdmin
                  ? "Aún no hay productos. Crea el primero para comenzar."
                  : "No hay productos disponibles."}
          </p>
        </Card>
      )}

      {/* Grid */}
      {data && data.data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.data.map((p) => {
              const low = p.stock <= p.minStock;
              const stockPct = p.minStock > 0
                ? Math.min(100, Math.round((p.stock / (p.minStock * 4)) * 100))
                : 100;

              return (
                <div
                  key={p.id}
                >
                  <Card interactive className="flex flex-col gap-3 h-full">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
                          {p.sku}
                        </p>
                        <Link
                          href={`/products/${p.id}`}
                          className="block truncate text-lg font-semibold text-[var(--color-fg)] hover:text-[var(--color-brand)]"
                        >
                          {p.name}
                        </Link>
                      </div>
                      <span
                        className={
                          low
                            ? "shrink-0 rounded-full border border-[var(--color-warning)]/40 bg-[var(--color-warning)]/10 px-2 py-0.5 text-xs text-[var(--color-warning)]"
                            : "shrink-0 rounded-full border border-[var(--color-success)]/40 bg-[var(--color-success)]/10 px-2 py-0.5 text-xs text-[var(--color-success)]"
                        }
                      >
                        {low ? "Stock bajo" : "OK"}
                      </span>
                    </div>

                    {p.description && (
                      <p className="line-clamp-2 text-sm text-[var(--color-fg-muted)]">
                        {p.description}
                      </p>
                    )}

                    {/* Stock progress bar */}
                    <div className="space-y-1">
                      <div className="h-1.5 w-full rounded-full bg-[var(--color-border)]">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${stockPct}%`,
                            background: low
                              ? "var(--color-warning)"
                              : stockPct > 60
                                ? "var(--color-success)"
                                : "var(--color-accent)",
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-auto flex items-end justify-between pt-3 border-t border-[var(--color-border)]">
                      <div>
                        <p className="text-xs text-[var(--color-fg-subtle)]">Precio</p>
                        <p className="text-xl font-semibold text-[var(--color-fg)]">
                          ${p.price}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[var(--color-fg-subtle)]">Stock</p>
                        <p
                          className={`text-xl font-semibold ${low ? "text-[var(--color-warning)]" : "text-[var(--color-fg)]"}`}
                        >
                          {p.stock}
                          <span className="text-xs text-[var(--color-fg-subtle)] ml-1">
                            / mín {p.minStock}
                          </span>
                        </p>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex gap-2 pt-2">
                        <Link href={`/products/${p.id}`} className="flex-1">
                          <Button variant="secondary" size="sm" className="w-full">
                            Editar
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={
                            deleteProduct.isPending && deleteProduct.variables === p.id
                          }
                          onClick={() => {
                            if (confirm(`¿Eliminar "${p.name}"?\nEsta acción no se puede deshacer.`)) {
                              deleteProduct.mutate(p.id);
                            }
                          }}
                        >
                          Eliminar
                        </Button>
                      </div>
                    )}
                  </Card>
                </div>
              );
            })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Anterior
          </Button>
          <span className="text-sm text-[var(--color-fg-muted)]">
            Página {page + 1} de {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente →
          </Button>
        </div>
      )}
    </PageTransition>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-52 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] animate-pulse"
        />
      ))}
    </div>
  );
}