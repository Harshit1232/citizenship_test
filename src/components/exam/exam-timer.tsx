"use client";

import { cx } from "@/lib/cx";

const MILESTONES = [600, 300, 60];

/** hh:mm:ss, as the official test shows it. */
export function formatClock(total: number): string {
  const t = Math.max(0, Math.floor(total));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/**
 * "Time remaining: 00:44:59". The visible clock is not announced (a ticking
 * live region would be unusable). Screen readers hear 10, 5 and 1 minute
 * warnings instead.
 */
export function ExamTimer({ secondsLeft, className }: { secondsLeft: number; className?: string }) {
  // A warning stays in the live region for 15 seconds after each milestone,
  // so it is announced once when it appears.
  const milestone = MILESTONES.find((m) => secondsLeft <= m && secondsLeft > m - 15);
  const message = milestone ? `${milestone / 60} minute${milestone === 60 ? "" : "s"} remaining.` : "";
  const level = secondsLeft <= 60 ? 3 : secondsLeft <= 300 ? 2 : secondsLeft <= 600 ? 1 : 0;

  return (
    <p className={cx("text-small text-copy", className)}>
      <span>Time remaining: </span>
      <span
        className={cx(
          "font-bold tabular-nums",
          level === 0 && "text-ink",
          level === 1 && "text-wattle-text",
          // No pulsing in the last minute: fading text fails contrast just
          // when the clock matters most. Colour and the spoken warnings do the job.
          level >= 2 && "text-fail",
        )}
      >
        {formatClock(secondsLeft)}
      </span>
      <span className="sr-only" aria-live="polite">
        {message}
      </span>
    </p>
  );
}
