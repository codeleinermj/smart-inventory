"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Decorative animated background for the login page.
 *
 * Renders three blurred gradient "orbs" that drift and pulse using GSAP.
 * The whole effect is wrapped in a `gsap.matchMedia()` context so that:
 *   1. Animations revert cleanly on unmount / HMR.
 *   2. Users with `prefers-reduced-motion: reduce` get a static composition.
 *
 * The orbs use `autoAlpha` (instead of `opacity`) so they don't block clicks
 * while transitioning, and `xPercent`/`yPercent` plus the transform aliases
 * so GSAP can apply transforms in the performant order.
 */
export function LoginHero() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        animate: "(prefers-reduced-motion: no-preference)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { animate, reduceMotion } = context.conditions ?? {};
        const orbs = root.querySelectorAll<HTMLElement>("[data-orb]");
        const title = root.querySelectorAll<HTMLElement>("[data-hero-title] > span");

        if (reduceMotion) {
          // Static, accessible composition.
          gsap.set(orbs, { autoAlpha: 0.6, scale: 1 });
          gsap.set(title, { autoAlpha: 1, y: 0 });
          return;
        }

        if (!animate) return;

        // Entrance: fade orbs in, slide + stagger the title words.
        gsap.fromTo(
          orbs,
          { autoAlpha: 0, scale: 0.8 },
          {
            autoAlpha: 0.55,
            scale: 1,
            duration: 1.4,
            ease: "power3.out",
            stagger: 0.15,
          }
        );

        gsap.fromTo(
          title,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "back.out(1.4)",
            stagger: 0.08,
            delay: 0.2,
          }
        );

        // Ambient drift — different speeds per orb, yoyoed infinitely.
        gsap.to(orbs[0], {
          xPercent: 10,
          yPercent: -8,
          duration: 7,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
        gsap.to(orbs[1], {
          xPercent: -12,
          yPercent: 10,
          duration: 9,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
        gsap.to(orbs[2], {
          xPercent: 8,
          yPercent: 12,
          duration: 11,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      },
      root
    );

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 min-h-full"
      aria-hidden="true"
    >
      {/* Orbs */}
      <div
        data-orb
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-brand) 0%, transparent 65%)" }}
      />
      <div
        data-orb
        className="pointer-events-none absolute top-1/3 -right-20 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)" }}
      />
      <div
        data-orb
        className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, #ff4d9d 0%, transparent 65%)" }}
      />

      {/* Copy */}
      <div className="relative z-10">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-fg-muted)]">
          Smart Inventory
        </p>
      </div>

      <div className="relative z-10">
        <h2
          data-hero-title
          className="text-5xl font-semibold leading-tight text-[var(--color-fg)]"
        >
          <span className="inline-block">Inventario</span>{" "}
          <span className="inline-block">que</span>{" "}
          <span className="inline-block bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-accent)] bg-clip-text text-transparent">
            piensa
          </span>{" "}
          <span className="inline-block">por</span>{" "}
          <span className="inline-block">ti.</span>
        </h2>
        <p className="mt-4 max-w-md text-[var(--color-fg-muted)]">
          Controla productos, stock y movimientos desde una interfaz rápida,
          minimalista y con atajos de teclado.
        </p>
      </div>

      <div className="relative z-10 text-xs text-[var(--color-fg-subtle)]">
        v1.0 · Phase 3 — Web
      </div>
    </div>
  );
}
