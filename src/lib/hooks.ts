"use client";

import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";

function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** True when the person has asked their device for reduced motion. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/** True once the element has been at least `amount` visible. */
export function useInViewOnce(ref: RefObject<Element | null>, amount = 0.3): boolean {
  // Without IntersectionObserver (very old browsers), treat it as visible.
  const [seen, setSeen] = useState(() => typeof window !== "undefined" && !("IntersectionObserver" in window));
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: amount },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, amount, seen]);
  return seen;
}
