"use client";

import { useEffect, useState } from "react";
import { cx } from "@/lib/cx";
import { usePrefersReducedMotion } from "@/lib/hooks";

/** Animated score ring. Draws once from empty to the score. */
export function ScoreRing({ pct, passed, size = 148 }: { pct: number; passed: boolean; size?: number }) {
  const r = 58;
  const c = 2 * Math.PI * r;
  const reduce = usePrefersReducedMotion();
  const [animated, setAnimated] = useState(0);
  const shown = reduce ? pct : animated;

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1100;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / dur);
      setAnimated(Math.round(pct * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [pct, reduce]);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 132 132" width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx="66" cy="66" r={r} fill="none" strokeWidth="11" className="stroke-sunk" />
        <circle
          cx="66"
          cy="66"
          r={r}
          fill="none"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown / 100)}
          className={cx(passed ? "stroke-pass" : "stroke-fail")}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-display text-heading font-extrabold tabular-nums text-ink">
        {shown}%
      </span>
    </div>
  );
}
