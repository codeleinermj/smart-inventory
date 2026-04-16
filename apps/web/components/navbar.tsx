"use client";

import Link from "next/link";
import { useMe, useLogout } from "@/lib/client/hooks/use-auth";
import { Button } from "./ui/button";

export function Navbar() {
  const { data: user } = useMe();
  const logout = useLogout();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg)]"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
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

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-lg text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-elevated)] transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/products"
              className="px-3 py-1.5 rounded-lg text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-elevated)] transition-colors"
            >
              Productos
            </Link>
          </nav>
        </div>

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
    </header>
  );
}
