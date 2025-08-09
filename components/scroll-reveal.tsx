"use client";

import { useEffect } from "react";

/**
 * ScrollReveal
 * Adds a simple intersection-observer powered reveal animation to elements with the class `reveal-up`.
 * Optimized to avoid jank and reflows.
 */
export function ScrollReveal() {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal-up")
    );
    if (els.length === 0) return;

    for (const el of els) {
      el.style.opacity = "0";
      el.style.transform = "translateY(12px)";
      el.style.transition =
        "opacity 600ms cubic-bezier(0.22, 1, 0.36, 1), transform 600ms cubic-bezier(0.22, 1, 0.36, 1)";
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            io.unobserve(el);
          }
        }
      },
      { rootMargin: "-40px 0px", threshold: 0.1 }
    );

    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, []);

  return null;
}
