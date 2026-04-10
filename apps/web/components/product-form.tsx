"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import type { z } from "zod";
import {
  createProductSchema,
  type CreateProductInput,
  type Product,
} from "@smart-inv/shared-types";

// RHF needs the *input* type (pre-default) because `stock` and `minStock`
// are optional before Zod applies their defaults. The output type (after
// parse) is what we emit to the server.
type ProductFormValues = z.input<typeof createProductSchema>;
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Field } from "./ui/field";
import { ApiErrorResponse } from "@/lib/client/api";

interface ProductFormProps {
  /** If set, the form is in edit mode and prefills values. */
  initial?: Product;
  submitLabel?: string;
  onCancel?: () => void;
  onSubmit: (values: CreateProductInput) => Promise<unknown>;
  submitting?: boolean;
  submitError?: unknown;
}

/**
 * Shared form used by both "Nuevo producto" and the edit page.
 * Validation uses the shared Zod schema so client and API stay in sync.
 */
export function ProductForm({
  initial,
  submitLabel = "Guardar",
  onCancel,
  onSubmit,
  submitting,
  submitError,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(createProductSchema) as Resolver<ProductFormValues>,
    mode: "onBlur",
    defaultValues: initial
      ? {
          sku: initial.sku,
          name: initial.name,
          description: initial.description ?? "",
          price: initial.price,
          stock: initial.stock,
          minStock: initial.minStock,
        }
      : {
          sku: "",
          name: "",
          description: "",
          price: "0.00",
          stock: 0,
          minStock: 0,
        },
  });

  const handleFormSubmit = handleSubmit(async (values) => {
    // Normalize optional description — empty string → null on the wire.
    const description =
      typeof values.description === "string" && values.description.trim()
        ? values.description.trim()
        : null;

    const payload: CreateProductInput = {
      sku: values.sku,
      name: values.name,
      price: values.price,
      stock: values.stock ?? 0,
      minStock: values.minStock ?? 0,
      description,
    };
    await onSubmit(payload);
  });

  const serverMessage =
    submitError instanceof ApiErrorResponse
      ? submitError.error.message
      : submitError
        ? "No pudimos guardar el producto."
        : null;

  return (
    <motion.form
      onSubmit={handleFormSubmit}
      noValidate
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-5"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="SKU" htmlFor="sku" error={errors.sku?.message}>
          <Input
            id="sku"
            placeholder="PROD-001"
            disabled={!!initial}
            invalid={!!errors.sku}
            {...register("sku")}
          />
        </Field>

        <Field label="Nombre" htmlFor="name" error={errors.name?.message}>
          <Input
            id="name"
            placeholder="Camiseta básica"
            invalid={!!errors.name}
            {...register("name")}
          />
        </Field>
      </div>

      <Field
        label="Descripción"
        htmlFor="description"
        error={errors.description?.message}
        hint="Opcional — hasta 2000 caracteres."
      >
        <textarea
          id="description"
          rows={3}
          placeholder="Opcional"
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-3 text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-glow)]"
          {...register("description")}
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Field
          label="Precio"
          htmlFor="price"
          error={errors.price?.message}
          hint="Hasta 2 decimales."
        >
          <Input
            id="price"
            inputMode="decimal"
            placeholder="0.00"
            invalid={!!errors.price}
            {...register("price")}
          />
        </Field>

        <Field label="Stock" htmlFor="stock" error={errors.stock?.message}>
          <Input
            id="stock"
            type="number"
            min={0}
            step={1}
            invalid={!!errors.stock}
            {...register("stock", { valueAsNumber: true })}
          />
        </Field>

        <Field
          label="Stock mínimo"
          htmlFor="minStock"
          error={errors.minStock?.message}
          hint="Umbral para alerta."
        >
          <Input
            id="minStock"
            type="number"
            min={0}
            step={1}
            invalid={!!errors.minStock}
            {...register("minStock", { valueAsNumber: true })}
          />
        </Field>
      </div>

      {serverMessage && (
        <p
          role="alert"
          className="rounded-lg border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 px-4 py-2 text-sm text-[var(--color-danger)]"
        >
          {serverMessage}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={submitting} disabled={!isValid && !submitError}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </motion.form>
  );
}
