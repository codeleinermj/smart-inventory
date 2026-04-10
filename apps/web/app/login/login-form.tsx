"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { loginRequestSchema, type LoginRequest } from "@smart-inv/shared-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { useLogin } from "@/lib/client/hooks/use-auth";
import { ApiErrorResponse } from "@/lib/client/api";

export function LoginForm() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values);
  });

  // If the server rejected the credentials, surface a single inline message.
  const serverError =
    login.error instanceof ApiErrorResponse ? login.error.error.message : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-fg)]">
          Bienvenido
        </h1>
        <p className="mt-2 text-[var(--color-fg-muted)]">
          Inicia sesión para gestionar tu inventario.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <Field
          label="Email"
          htmlFor="email"
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="tu@empresa.com"
            invalid={!!errors.email}
            {...register("email")}
          />
        </Field>

        <Field
          label="Contraseña"
          htmlFor="password"
          error={errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            invalid={!!errors.password}
            {...register("password")}
          />
        </Field>

        {serverError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="rounded-lg border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 px-4 py-2 text-sm text-[var(--color-danger)]"
          >
            {serverError}
          </motion.p>
        )}

        <Button
          type="submit"
          size="lg"
          loading={isSubmitting || login.isPending}
          disabled={!isValid && !login.isError}
        >
          Entrar
        </Button>
      </form>
    </motion.div>
  );
}
