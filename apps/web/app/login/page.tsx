import type { Metadata } from "next";
import { LoginHero } from "@/components/login-hero";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión · Smart Inventory",
};

/**
 * Split-screen login layout: decorative GSAP hero on the left,
 * form on the right. On small screens only the form shows.
 */
export default function LoginPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      <LoginHero />
      <section className="flex items-center justify-center px-6 py-16">
        <LoginForm />
      </section>
    </main>
  );
}
