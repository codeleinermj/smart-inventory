"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMe, useLogout } from "@/lib/client/hooks/use-auth";
import { Button } from "./ui/button";

/**
 * Top bar used on authenticated pages. Shows the current user + a logout
 * button. Slides in from above on mount.
 */
export function Navbar() {
  const { data: user } = useMe();
  const logout = useLogout();

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link
          href="/products"
          className="flex items-center gap-2 text-[var(--color-fg)]"
        >
          <span
            aria-hidden="true"
            className="h-7 w-7 rounded-lg bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-accent)] shadow-[0_0_20px_var(--color-brand-glow)]"
          />
          <span className="font-semibold tracking-tight">Smart Inventory</span>
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-sm text-[var(--color-fg)]">{user.email}</span>
              <span className="text-xs uppercase tracking-wider text-[var(--color-fg-muted)]">
                {user.role}
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout.mutate()}
            loading={logout.isPending}
          >
            Salir
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
