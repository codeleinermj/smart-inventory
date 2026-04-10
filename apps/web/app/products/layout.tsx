import { type ReactNode } from "react";
import { Navbar } from "@/components/navbar";

/**
 * Shell for all /products/* pages — adds the authenticated navbar.
 * Middleware already ensures the user has a session cookie before we
 * render any children.
 */
export default function ProductsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
