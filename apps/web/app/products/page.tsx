"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts, useDeleteProduct } from "@/lib/client/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageTransition } from "@/components/page-transition";
import { useMe } from "@/lib/client/hooks/use-auth";
import { ApiErrorResponse } from "@/lib/client/api";

export default function ProductsPage() {
  const { data: me } = useMe();
  const { data, isLoading, isError, error, refetch } = useProducts();
  const deleteProduct = useDeleteProduct();

  const isAdmin = me?.role === "admin";

  return (
    <PageTransition>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-fg)]">
            Productos
          </h1>
          <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
            {data ? `${data.total} en total` : "Cargando inventario…"}
          </p>
        </div>
        {isAdmin && (
          <Link href="/products/new">
            <Button>+ Nuevo producto</Button>
          </Link>
        )}
      </div>

      {isLoading && <SkeletonGrid />}

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

      {data && data.data.length === 0 && (
        <Card>
          <p className="text-[var(--color-fg-muted)]">
            Aún no hay productos. {isAdmin && "Crea el primero para comenzar."}
          </p>
        </Card>
      )}

      {data && data.data.length > 0 && (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.05 } },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {data.data.map((p) => {
              const low = p.stock <= p.minStock;
              return (
                <motion.div
                  key={p.id}
                  layout
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show: { opacity: 1, y: 0 },
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
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

                    <div className="mt-auto flex items-end justify-between pt-3 border-t border-[var(--color-border)]">
                      <div>
                        <p className="text-xs text-[var(--color-fg-subtle)]">Precio</p>
                        <p className="text-xl font-semibold text-[var(--color-fg)]">
                          ${p.price}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[var(--color-fg-subtle)]">Stock</p>
                        <p className="text-xl font-semibold text-[var(--color-fg)]">
                          {p.stock}
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
                            deleteProduct.isPending &&
                            deleteProduct.variables === p.id
                          }
                          onClick={() => {
                            if (confirm(`¿Eliminar "${p.name}"?`)) {
                              deleteProduct.mutate(p.id);
                            }
                          }}
                        >
                          Eliminar
                        </Button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
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
          className="h-48 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] animate-pulse"
        />
      ))}
    </div>
  );
}
