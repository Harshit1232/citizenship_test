import Link from "next/link";
import { READINESS, readiness, testMeetsBar } from "@/lib/readiness";
import { GATE } from "@/lib/values-progress";
import type { HistoryEntry } from "@/lib/types";
import type { GateState } from "@/lib/values-progress";
import { IconCheck } from "@/components/ui/icons";
import { cx } from "@/lib/cx";

/**
 * The honest readiness check: a written rule with each part ticked off,
 * instead of a "pass probability" that no one has the data for.
 */
export function ReadinessCard({ history, gate, className }: { history: readonly HistoryEntry[]; gate: GateState; className?: string }) {
  const r = readiness(history, gate.cleared);
  const slots = Array.from({ length: READINESS.tests }, (_, i) => r.recent[i] ?? null);

  return (
    <section
      aria-labelledby="readiness-title"
      className={cx(
        "rounded-lg border p-5 shadow-1 sm:p-7",
        r.ready ? "border-pass bg-pass-tint" : "border-line bg-surface",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="readiness-title" className="font-display text-title font-bold tracking-[-0.015em] text-ink">
          Readiness check
        </h2>
        <span
          className={cx(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-small font-bold",
            r.ready ? "bg-pass text-on-euc" : "bg-sunk text-ink",
          )}
        >
          {r.ready && <IconCheck size={16} strokeWidth={2.8} />}
          {r.ready ? "Ready by our rule" : "Not yet"}
        </span>
      </div>
      <p className="mt-2 max-w-[62ch] text-small text-copy">
        Our rule for being ready to book: both of these must be true.
      </p>

      <ol className="mt-5 space-y-4">
        <li className="flex gap-3.5">
          <Tick done={r.testsMet} n={1} />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-ink">
              Your last {READINESS.tests} practice tests in the real format all score {READINESS.minPct}% or more, with every
              values question right
            </p>
            <ul className="mt-2.5 flex flex-wrap gap-2" aria-label={`Your last ${READINESS.tests} real-format tests`}>
              {slots.map((h, i) => (
                <li
                  key={i}
                  className={cx(
                    "rounded-sm border px-2.5 py-1.5 text-caption tabular-nums",
                    !h && "border-dashed border-line-strong text-muted",
                    h && testMeetsBar(h) && "border-pass bg-surface text-ink",
                    h && !testMeetsBar(h) && "border-fail bg-surface text-ink",
                  )}
                >
                  {h ? (
                    <>
                      <span className="font-bold">{h.pct}%</span>, values {h.vCorrect} of {h.vTotal}
                      <span className="sr-only">{testMeetsBar(h) ? ", meets the bar" : ", below the bar"}</span>
                    </>
                  ) : (
                    "No test yet"
                  )}
                </li>
              ))}
            </ul>
            {!r.testsMet && (
              <Link href="/practice/test/" className="mt-2.5 inline-block text-small font-bold text-euc-deep underline underline-offset-2 dark:text-euc">
                Take a practice test
              </Link>
            )}
          </div>
        </li>
        <li className="flex gap-3.5">
          <Tick done={r.gateMet} n={2} />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-ink">You have cleared the values gate</p>
            <p className="mt-1 text-small text-copy">
              {gate.cleared
                ? "Cleared."
                : gate.runs
                  ? `Not yet. Your best run is ${gate.best} of ${GATE.length} in a row.`
                  : `${GATE.length} values questions in a row, from all five areas.`}
            </p>
            {!gate.cleared && (
              <Link href="/practice/values/gate/" className="mt-1.5 inline-block text-small font-bold text-euc-deep underline underline-offset-2 dark:text-euc">
                Go to the values gate
              </Link>
            )}
          </div>
        </li>
      </ol>

      <p className="mt-5 border-t border-line pt-4 text-caption text-muted">
        This is a rule of thumb we have written down so you can judge it for yourself. It is not a prediction, and nobody
        can promise a pass.
      </p>
    </section>
  );
}

function Tick({ done, n }: { done: boolean; n: number }) {
  return (
    <span
      className={cx(
        "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-caption font-bold",
        done ? "bg-pass text-on-euc" : "border-2 border-line-strong text-muted",
      )}
    >
      {done ? <IconCheck size={15} strokeWidth={2.8} /> : n}
      <span className="sr-only">{done ? " (done)" : " (not yet)"}</span>
    </span>
  );
}
