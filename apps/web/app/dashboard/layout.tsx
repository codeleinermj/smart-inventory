import { type ReactNode } from "react";
import { Navbar } from "@/components/navbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 pt-20 pb-10">{children}</main>
    </div>
  );
}