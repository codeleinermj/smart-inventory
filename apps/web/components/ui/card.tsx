"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, interactive, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]",
        "shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]",
        "p-6 transition-colors duration-200",
        interactive && "cursor-pointer hover:border-[var(--color-border-hover)]",
        className
      )}
      {...rest}
    />
  );
});
