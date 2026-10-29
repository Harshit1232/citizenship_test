"use client";

import { useEffect, useId, useRef, useState } from "react";
import { formatWhen, type TrendPoint } from "@/lib/progress";
import { cx } from "@/lib/cx";

const H = 240;
const PAD_L = 44;
const PAD_R = 16;
const PAD_T = 14;
const PAD_B = 34;
const TICKS = [0, 25, 50, 75, 100];

/**
 * Score per test, oldest to newest, against the 75% pass mark. One series, so
 * no legend box; the key below explains the two point styles (pass and not a
 * pass), which differ in shape as well as colour. Hover, or focus the chart and
 * use the arrow keys, to read a test. The history table is the table view.
 */
export function TrendChart({ points, now }: { points: readonly TrendPoint[]; now: number }) {
  const [active, setActive] = useState<number | null>(null);
  // Drawn in real pixels at the container's width, so text never scales down on phones.
  const [W, setW] = useState(680);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wrap.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const width = Math.round(entries[0]?.contentRect.width ?? 0);
      if (width > 0) setW(width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const descId = useId();
  const n = points.length;

  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const x = (i: number) => (n < 2 ? PAD_L + plotW / 2 : PAD_L + (i * plotW) / (n - 1));
  const y = (v: number) => PAD_T + (1 - v / 100) * plotH;

  const coords = points.map((p, i) => [x(i), y(p.pct)] as const);
  const line = coords.map(([cx_, cy], i) => `${i ? "L" : "M"}${cx_.toFixed(1)} ${cy.toFixed(1)}`).join(" ");
  const area = n > 1 ? `${line} L${coords[n - 1][0].toFixed(1)} ${y(0)} L${coords[0][0].toFixed(1)} ${y(0)} Z` : "";

  function nearest(clientX: number) {
    const el = wrap.current;
    if (!el || !n) return null;
    const box = el.getBoundingClientRect();
    const sx = ((clientX - box.left) / box.width) * W;
    if (n < 2) return 0;
    const i = Math.round(((sx - PAD_L) / plotW) * (n - 1));
    return Math.max(0, Math.min(n - 1, i));
  }

  function onKey(e: React.KeyboardEvent) {
    if (!n) return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const cur = active ?? n - 1;
      const next =
        e.key === "Home" ? 0 : e.key === "End" ? n - 1 : e.key === "ArrowRight" ? Math.min(n - 1, cur + 1) : Math.max(0, cur - 1);
      setActive(next);
    } else if (e.key === "Escape") {
      setActive(null);
    }
  }

  const a = active !== null ? points[active] : null;
  const tipW = Math.min(224, W - 8);
  const ax = active !== null ? coords[active][0] : 0;
  const ay = active !== null ? coords[active][1] : 0;
  const describe = (p: TrendPoint, i: number) =>
    `Test ${i + 1} of ${n}, ${formatWhen(p.at, now)}: ${p.pct}%, ${p.correct} of ${p.n} correct. ` +
    `${p.vTotal ? `Values ${p.vCorrect} of ${p.vTotal}. ` : ""}${p.passed ? "Pass." : "Not a pass."}`;

  return (
    <div>
      <p id={descId} className="sr-only">
        Line chart of your score in each of your last {n} tests, with the 75% pass mark. Use the left and right arrow keys
        to read each test. The test history table below has the same data.
      </p>
      <div
        ref={wrap}
        role="group"
        tabIndex={0}
        aria-roledescription="chart"
        aria-label="Score trend"
        aria-describedby={descId}
        onKeyDown={onKey}
        onPointerMove={(e) => setActive(nearest(e.clientX))}
        onPointerLeave={() => setActive(null)}
        onBlur={() => setActive(null)}
        className="relative touch-pan-y rounded-md focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus"
      >
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block w-full overflow-visible" aria-hidden="true">
          {TICKS.map((t) => (
            <g key={t}>
              <line x1={PAD_L} x2={W - PAD_R} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth="1" />
              <text x={PAD_L - 10} y={y(t) + 4} textAnchor="end" className="fill-muted text-[12px] tabular-nums">
                {t}%
              </text>
            </g>
          ))}
          {/* Pass mark: a labelled reference line, heavier than the grid. */}
          <line x1={PAD_L} x2={W - PAD_R} y1={y(75)} y2={y(75)} stroke="var(--wattle-edge)" strokeWidth="1.5" />
          <text x={W - PAD_R} y={y(75) - 7} textAnchor="end" className="fill-wattle-text text-[12px] font-bold">
            Pass mark 75%
          </text>

          {area && <path d={area} fill="var(--euc)" opacity="0.1" />}
          {n > 1 && (
            <path
              d={line}
              pathLength={1}
              fill="none"
              stroke="var(--euc)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="anim-draw"
            />
          )}

          {active !== null && (
            <line x1={ax} x2={ax} y1={PAD_T} y2={y(0)} stroke="var(--ink)" strokeOpacity="0.35" strokeWidth="1" />
          )}

          {coords.map(([px, py], i) => {
            const p = points[i];
            const isActive = i === active;
            return (
              <g key={`${p.at}-${i}`} className="anim-pop" style={{ "--delay": `${300 + i * 40}ms` } as React.CSSProperties}>
                <circle
                  cx={px}
                  cy={py}
                  r={isActive ? 7 : 5}
                  fill={p.passed ? "var(--euc)" : "var(--surface)"}
                  stroke={p.passed ? "var(--surface)" : "var(--fail)"}
                  strokeWidth={p.passed ? 2 : 2.5}
                />
              </g>
            );
          })}

          {/* First and last test dates on the x axis. */}
          {n > 0 && (
            <text x={coords[0][0]} y={H - 8} textAnchor={n < 2 ? "middle" : "start"} className="fill-muted text-[12px]">
              {formatWhen(points[0].at, now).split(",")[0]}
            </text>
          )}
          {n > 1 && (
            <text x={coords[n - 1][0]} y={H - 8} textAnchor="end" className="fill-muted text-[12px]">
              {formatWhen(points[n - 1].at, now).split(",")[0]}
            </text>
          )}
        </svg>

        {a && active !== null && (
          <div
            role="presentation"
            className="pointer-events-none absolute z-10 rounded-md border border-line bg-surface px-3.5 py-3 text-small shadow-3"
            style={{
              width: tipW,
              left: ax / W > 0.5 ? Math.max(0, ax - 14 - tipW) : Math.min(W - tipW, ax + 14),
              top: Math.min(H - 130, Math.max(0, ay - 40)),
            }}
          >
            <p className="font-display text-title font-bold leading-none text-ink">{a.pct}%</p>
            <p className="mt-1.5 text-caption text-muted">
              Test {active + 1} of {n}, {formatWhen(a.at, now)}
            </p>
            <p className="mt-2 text-copy">
              {a.correct} of {a.n} correct
              {a.vTotal ? `, values ${a.vCorrect} of ${a.vTotal}` : ""}
            </p>
            <p className={cx("mt-1 font-bold", a.passed ? "text-euc-deep dark:text-euc" : "text-fail")}>
              {a.passed ? "Pass" : "Not a pass"}
            </p>
          </div>
        )}
      </div>
      <p aria-live="polite" className="sr-only">
        {a && active !== null ? describe(a, active) : ""}
      </p>
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-caption text-muted">
        <li className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <circle cx="7" cy="7" r="5" fill="var(--euc)" />
          </svg>
          Pass
        </li>
        <li className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" fill="var(--surface)" stroke="var(--fail)" strokeWidth="2.5" />
          </svg>
          Not a pass (hollow)
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block h-0.5 w-4 bg-wattle-edge" />
          Pass mark, 75%
        </li>
      </ul>
    </div>
  );
}
