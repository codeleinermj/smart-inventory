"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProductForm } from "@/components/product-form";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useProduct,
  useUpdateProduct,
} from "@/lib/client/hooks/use-products";
import { ApiErrorResponse } from "@/lib/client/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  // Next 15: params is a Promise in Client Components — unwrap with React.use.
  const { id } = use(params);
  const router = useRouter();

  const { data: product, isLoading, isError, error } = useProduct(id);
  const update = useUpdateProduct(id);

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

  return (
    <PageTransition>
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

      <div className="max-w-3xl">
        <ProductForm
          initial={product}
          submitLabel="Guardar cambios"
          submitting={update.isPending}
          submitError={update.error}
          onCancel={() => router.push("/products")}
          onSubmit={async (values) => {
            // `sku` is disabled in edit mode; strip it so we send a real PATCH.
            const { sku: _omit, ...patch } = values;
            await update.mutateAsync(patch);
            router.push("/products");
          }}
        />
      </div>
    </PageTransition>
  );
}
