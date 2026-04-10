"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "w-full h-11 px-4 rounded-xl",
        "bg-[var(--color-bg-elevated)] text-[var(--color-fg)]",
        "border border-[var(--color-border)]",
        "placeholder:text-[var(--color-fg-subtle)]",
        "transition-colors",
        "hover:border-[var(--color-border-hover)]",
        "focus:outline-none focus:border-[var(--color-brand)]",
        "focus:ring-2 focus:ring-[var(--color-brand-glow)]",
        invalid && "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/30",
        className
      )}
      {...rest}
    />
  );
});
