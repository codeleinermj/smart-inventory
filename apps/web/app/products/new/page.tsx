"use client";

import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/product-form";
import { PageTransition } from "@/components/page-transition";
import { useCreateProduct } from "@/lib/client/hooks/use-products";

export default function NewProductPage() {
  const router = useRouter();
  const create = useCreateProduct();

  return (
    <PageTransition>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-fg)]">
          Nuevo producto
        </h1>
        <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
          Completa los datos y guarda para registrarlo en el inventario.
        </p>
      </div>

      <div className="max-w-3xl">
        <ProductForm
          submitLabel="Crear producto"
          submitting={create.isPending}
          submitError={create.error}
          onCancel={() => router.push("/products")}
          onSubmit={async (values) => {
            const created = await create.mutateAsync(values);
            router.push(`/products/${created.id}`);
          }}
        />
      </div>
    </PageTransition>
  );
}
