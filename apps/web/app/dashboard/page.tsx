"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useProducts } from "@/lib/client/hooks/use-products";
import { PageTransition } from "@/components/page-transition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, type: "spring", stiffness: 260, damping: 24 },
  }),
};

export default function DashboardPage() {
  // Load all products for stats (max 200)
  const { data, isLoading } = useProducts({ limit: 200, offset: 0 });

  const products = data?.data ?? [];

  const totalProducts = data?.total ?? 0;
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const totalValue = products.reduce(
    (sum, p) => sum + parseFloat(p.price) * p.stock,
    0
  );

  const categories = products.reduce<Record<string, number>>((acc, p) => {
    const prefix = p.sku.split("-")[0] ?? "OTHER";
    acc[prefix] = (acc[prefix] ?? 0) + 1;
    return acc;
  }, {});

  const topByValue = [...products]
    .sort((a, b) => parseFloat(b.price) * b.stock - parseFloat(a.price) * a.stock)
    .slice(0, 5);

  const lowStockProducts = products
    .filter((p) => p.stock <= p.minStock)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  const stats = [
    {
      label: "Total productos",
      value: isLoading ? "…" : totalProducts.toLocaleString(),
      sub: "en inventario",
      color: "var(--color-brand)",
      icon: "📦",
    },
    {
      label: "Valor total",
      value: isLoading ? "…" : `$${totalValue.toLocaleString("es", { maximumFractionDigits: 0 })}`,
      sub: "stock × precio",
      color: "var(--color-accent)",
      icon: "💰",
    },
    {
      label: "Stock bajo",
      value: isLoading ? "…" : lowStockCount.toString(),
      sub: "productos bajo mínimo",
      color: "var(--color-warning)",
      icon: "⚠️",
    },
    {
      label: "Sin stock",
      value: isLoading ? "…" : outOfStockCount.toString(),
      sub: "agotados",
      color: "var(--color-danger)",
      icon: "🚨",
    },
  ];

  return (
    <PageTransition>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-fg)]">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
          Resumen del estado del inventario
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} custom={i} initial="hidden" animate="show" variants={cardVariants}>
            <Card className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{s.icon}</span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: s.color }}
                />
              </div>
              <p
                className="text-3xl font-bold tabular-nums"
                style={{ color: s.color }}
              >
                {s.value}
              </p>
              <div>
                <p className="text-sm font-medium text-[var(--color-fg)]">{s.label}</p>
                <p className="text-xs text-[var(--color-fg-subtle)]">{s.sub}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories */}
        <motion.div custom={4} initial="hidden" animate="show" variants={cardVariants}>
          <Card className="h-full">
            <h2 className="text-base font-semibold text-[var(--color-fg)] mb-4">
              Por categoría
            </h2>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-6 rounded bg-[var(--color-border)] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(categories)
                  .sort(([, a], [, b]) => b - a)
                  .map(([prefix, count]) => {
                    const pct = Math.round((count / Math.max(products.length, 1)) * 100);
                    const label: Record<string, string> = {
                      ELEC: "Electrónica",
                      MOB: "Móviles",
                      HOG: "Hogar",
                      OFI: "Oficina",
                      DEP: "Deportes",
                      MISC: "Varios",
                    };
                    return (
                      <div key={prefix}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[var(--color-fg-muted)]">
                            {label[prefix] ?? prefix}
                          </span>
                          <span className="text-[var(--color-fg-subtle)]">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[var(--color-border)]">
                          <div
                            className="h-1.5 rounded-full bg-[var(--color-brand)]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Low stock alert */}
        <motion.div custom={5} initial="hidden" animate="show" variants={cardVariants}>
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[var(--color-fg)]">
                Alertas de stock
              </h2>
              <Link href="/products?status=low">
                <Button variant="ghost" size="sm">Ver todos →</Button>
              </Link>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 rounded bg-[var(--color-border)] animate-pulse" />
                ))}
              </div>
            ) : lowStockProducts.length === 0 ? (
              <p className="text-sm text-[var(--color-success)]">
                ✅ Todo el stock está en niveles aceptables
              </p>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-bg-elevated)] transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--color-fg)] truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-[var(--color-fg-subtle)]">{p.sku}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p
                        className="text-sm font-bold"
                        style={{
                          color: p.stock === 0
                            ? "var(--color-danger)"
                            : "var(--color-warning)",
                        }}
                      >
                        {p.stock}
                      </p>
                      <p className="text-xs text-[var(--color-fg-subtle)]">
                        mín {p.minStock}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Top value */}
        <motion.div custom={6} initial="hidden" animate="show" variants={cardVariants}>
          <Card className="h-full">
            <h2 className="text-base font-semibold text-[var(--color-fg)] mb-4">
              Mayor valor en stock
            </h2>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 rounded bg-[var(--color-border)] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {topByValue.map((p, i) => {
                  const value = parseFloat(p.price) * p.stock;
                  return (
                    <Link
                      key={p.id}
                      href={`/products/${p.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-bg-elevated)] transition-colors"
                    >
                      <span className="text-xs font-bold text-[var(--color-fg-subtle)] w-4">
                        #{i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[var(--color-fg)] truncate">
                          {p.name}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-[var(--color-accent)] shrink-0">
                        ${value.toLocaleString("es", { maximumFractionDigits: 0 })}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}