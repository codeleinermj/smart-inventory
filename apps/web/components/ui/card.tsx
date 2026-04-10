"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";

type CardProps = HTMLMotionProps<"div"> & {
  interactive?: boolean;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, interactive, ...rest },
  ref
) {
  return (
    <motion.div
      ref={ref}
      whileHover={interactive ? { y: -2, borderColor: "var(--color-border-hover)" } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]",
        "shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]",
        "p-6",
        interactive && "cursor-pointer",
        className
      )}
      {...rest}
    />
  );
});
