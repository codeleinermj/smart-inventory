"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Form field wrapper: label + control + optional error/hint.
 * Error messages use `role="alert"` so screen readers announce validation
 * failures as they appear.
 */
export function Field({ label, htmlFor, error, hint, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-[var(--color-fg-muted)]"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-[var(--color-danger)]">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-[var(--color-fg-subtle)]">{hint}</p>
      ) : null}
    </div>
  );
}
