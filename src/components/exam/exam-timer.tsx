"use client";

import { cx } from "@/lib/cx";
import { IconClock } from "@/components/ui/icons";

const MILESTONES = [600, 300, 60];

function fmt(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * The visible clock is not announced (a ticking live region would be
 * unusable). Screen readers hear 10, 5 and 1 minute warnings instead.
 */
export function ExamTimer({
  secondsLeft,
  totalSeconds,
  compact,
}: {
  secondsLeft: number;
  totalSeconds: number;
  compact?: boolean;
}) {
  // A warning stays in the live region for 15 seconds after each milestone,
  // so it is announced once when it appears.
  const milestone = MILESTONES.find((m) => secondsLeft <= m && secondsLeft > m - 15);
  const message = milestone ? `${milestone / 60} minute${milestone === 60 ? "" : "s"} remaining.` : "";

  const level = secondsLeft <= 60 ? 3 : secondsLeft <= 300 ? 2 : secondsLeft <= 600 ? 1 : 0;
  const used = totalSeconds ? Math.min(1, Math.max(0, 1 - secondsLeft / totalSeconds)) : 0;

  return (
    <div className="flex items-center gap-2.5">
      <IconClock
        size={18}
        className={cx(level >= 2 ? "text-fail" : level === 1 ? "text-wattle-text" : "text-muted", compact && "hidden sm:block")}
      />
      <div className="text-right">
        <span className={cx("block text-caption font-bold text-muted", compact && "sr-only")}>
          Time left
        </span>
        <span
          className={cx(
            "block font-display text-title font-bold leading-none tabular-nums tracking-[-0.01em]",
            level === 0 && "text-ink",
            level === 1 && "text-wattle-text",
            level >= 2 && "text-fail",
            level === 3 && "motion-pulse animate-[pulse-soft_1.6s_ease-in-out_infinite]",
          )}
        >
          {fmt(secondsLeft)}
        </span>
        <span
          aria-hidden="true"
          className="mt-1.5 block h-1 w-full overflow-hidden rounded-full bg-sunk"
          title="Time used"
        >
          <span
            className={cx(
              "block h-full rounded-full transition-[width] duration-1000 ease-linear",
              level >= 2 ? "bg-fail" : level === 1 ? "bg-wattle" : "bg-euc",
            )}
            style={{ width: `${(used * 100).toFixed(2)}%` }}
          />
        </span>
      </div>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
