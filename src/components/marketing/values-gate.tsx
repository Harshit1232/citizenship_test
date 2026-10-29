"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useInViewOnce, usePrefersReducedMotion } from "@/lib/hooks";
import { IconCheck, IconChevronRight, IconCross } from "@/components/ui/icons";
import { cx } from "@/lib/cx";

/**
 * Explains the values rule by comparing two people's tests side by side.
 * Jordan gets 19 of 20 and does not pass; Alex gets 16 of 20 and passes.
 * The values questions sit on their own row so the reader never has to
 * decode a colour, and each pass condition is checked off in plain words.
 *
 * The papers are illustrations: a screen reader gets the same story from the
 * text summary in each card instead.
 */

type Mark = "right" | "wrong";

interface Paper {
  name: string;
  general: Mark[]; // 15 general questions
  values: Mark[]; // 5 values questions
}

const JORDAN: Paper = {
  name: "Jordan",
  general: Array(15).fill("right"),
  values: ["right", "right", "wrong", "right", "right"],
};

const ALEX: Paper = {
  name: "Alex",
  general: ["right", "wrong", "right", "right", "right", "right", "wrong", "right", "right", "right", "wrong", "right", "right", "wrong", "right"],
  values: Array(5).fill("right"),
};

function tally(p: Paper) {
  const general = p.general.filter((m) => m === "right").length;
  const values = p.values.filter((m) => m === "right").length;
  const total = general + values;
  const scoreOk = total >= 15;
  const valuesOk = values === 5;
  return { general, values, total, scoreOk, valuesOk, passed: scoreOk && valuesOk };
}

/** Steps of the reveal: 0 blank, 1 papers marked, 2 rule one, 3 rule two, 4 results, 5 takeaway. */
const STEP_AT = [0, 1150, 1650, 2150, 2700];
const LAST = 5;

export function ValuesGate() {
  const ref = useRef<HTMLDivElement>(null);
  // Low threshold: on phones the card is taller than the screen, so a high one might never be reached.
  const inView = useInViewOnce(ref, 0.15);
  const reduce = usePrefersReducedMotion();
  const [step, setStep] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const timers = STEP_AT.map((ms, i) => window.setTimeout(() => setStep(i + 1), ms));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [inView, reduce, run]);

  // Reduced motion: everything is shown at once.
  const shown = reduce ? LAST : step;

  function replay() {
    setStep(0);
    setRun((r) => r + 1);
  }

  return (
    <div ref={ref} className="rounded-lg border border-line bg-surface/90 p-5 shadow-2 backdrop-blur-sm sm:p-7 lg:p-9">
      <div className="grid gap-x-10 gap-y-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h2 className="font-display text-heading font-bold tracking-[-0.02em] text-ink">Why 19 out of 20 can still fail</h2>
          <p className="mt-2 max-w-[60ch] text-copy">
            Every test has 20 questions, and 5 of them are about Australian values. To pass, you need{" "}
            <strong className="text-ink">both</strong> of these:
          </p>
        </div>
        <ol className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Rule n={1}>At least 15 of the 20 right</Rule>
          <Rule n={2} values>
            All 5 values questions right
          </Rule>
        </ol>
      </div>

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        <PaperCard paper={JORDAN} step={shown} run={run} />
        <PaperCard paper={ALEX} step={shown} run={run} />
      </div>

      <div
        className={cx(
          "mt-6 flex flex-col gap-4 rounded-md border-l-4 border-wattle bg-wattle-tint px-5 py-4 transition-opacity duration-500 sm:flex-row sm:items-center sm:justify-between",
          shown >= LAST ? "opacity-100" : "opacity-0",
        )}
      >
        <p className="max-w-[64ch] text-body text-ink">
          <strong>Jordan got 3 more questions right than Alex, but doesn&apos;t pass.</strong> One wrong values answer is
          enough to fail the test, however well you do on the rest.
        </p>
        <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            href="/practice/values-check/"
            tabIndex={shown >= LAST ? undefined : -1}
            className="font-bold text-wattle-text underline-offset-4 hover:underline"
          >
            Practise the values questions
            <IconChevronRight size={18} className="ml-0.5 inline-block align-[-4px]" />
          </Link>
          {!reduce && (
            <button
              type="button"
              onClick={replay}
              tabIndex={shown >= LAST ? undefined : -1}
              className="text-small font-bold text-copy underline underline-offset-4 hover:text-ink"
            >
              Play again
            </button>
          )}
        </div>
      </div>
      <p className="mt-3 text-caption text-muted">
        These two tests are examples. The values questions are shown on their own row here to make the rule easy to see.
      </p>
    </div>
  );
}

function Rule({ n, values, children }: { n: number; values?: boolean; children: React.ReactNode }) {
  return (
    <li
      className={cx(
        "flex items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-4 text-small font-bold text-ink",
        values ? "border-wattle-edge/60 bg-wattle-tint" : "border-line-strong bg-surface",
      )}
    >
      <span
        aria-hidden="true"
        className={cx(
          "grid size-7 shrink-0 place-items-center rounded-full text-caption font-bold",
          values ? "bg-wattle text-on-wattle" : "bg-ink text-paper",
        )}
      >
        {n}
      </span>
      {children}
    </li>
  );
}

function PaperCard({ paper, step, run }: { paper: Paper; step: number; run: number }) {
  const t = tally(paper);
  const marked = step >= 1;
  const summary =
    `${paper.name} got ${t.total} of 20 right. ` +
    `${t.scoreOk ? "That is at least 15" : "That is under 15"}. ` +
    `${paper.name} got ${t.values} of 5 values questions right. ` +
    `${t.passed ? `${paper.name} passes.` : `${paper.name} does not pass.`}`;

  return (
    <article className="flex flex-col rounded-md border border-line bg-paper/70 p-4 sm:p-5">
      <p className="sr-only">{summary}</p>
      <div aria-hidden="true" className="flex flex-1 flex-col">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <h3 className="font-display text-title font-bold text-ink">{paper.name}&apos;s test</h3>
          <p
            className={cx(
              "font-display text-lead font-bold tabular-nums text-ink transition-opacity duration-300 sm:text-title",
              marked ? "opacity-100" : "opacity-0",
            )}
          >
            {t.total} of 20 right
          </p>
        </div>

        <Row label="15 general questions" marks={paper.general} count={t.general} marked={marked} run={run} offset={0} />
        <Row label="5 values questions" marks={paper.values} count={t.values} marked={marked} run={run} offset={15} values />

        <ul className="mt-5 space-y-2 border-t border-line pt-4">
          <Check shown={step >= 2} ok={t.scoreOk} rule="At least 15 right" detail={`${t.total} right`} />
          <Check shown={step >= 3} ok={t.valuesOk} rule="All 5 values questions right" detail={`${t.values} of 5`} />
        </ul>

        <div
          className={cx(
            "mt-5 flex items-center gap-3 rounded-md px-4 py-3 transition-[opacity,transform] duration-500 ease-out",
            t.passed ? "bg-pass text-on-euc" : "bg-fail text-white dark:text-paper",
            step >= 4 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
          )}
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/20">
            {t.passed ? <IconCheck size={18} strokeWidth={2.8} /> : <IconCross size={18} strokeWidth={2.8} />}
          </span>
          <span className="font-display text-[1.125rem] font-bold sm:text-title">{t.passed ? "Passes" : "Doesn’t pass"}</span>
        </div>
      </div>
    </article>
  );
}

function Row({
  label,
  marks,
  count,
  marked,
  run,
  offset,
  values,
}: {
  label: string;
  marks: Mark[];
  count: number;
  marked: boolean;
  run: number;
  offset: number;
  values?: boolean;
}) {
  return (
    <div className={cx("mt-4 rounded-md px-3 py-3", values ? "bg-wattle-tint ring-1 ring-wattle-edge/40" : "bg-surface ring-1 ring-line")}>
      <div className="flex items-baseline justify-between gap-3 text-small">
        <span className={cx("font-bold", values ? "text-wattle-text" : "text-copy")}>{label}</span>
        <span className={cx("tabular-nums transition-opacity duration-300", marked ? "opacity-100" : "opacity-0", values && count < marks.length ? "font-bold text-fail" : "text-muted")}>
          {count} right
        </span>
      </div>
      <div className="mt-2 grid grid-cols-8 gap-1.5 md:grid-cols-15">
        {marks.map((m, i) => {
          const wrongValues = values && m === "wrong";
          return (
            <span key={`${run}-${i}`} className="relative aspect-square">
              {marked ? (
                <span
                  className={cx(
                    "anim-pop grid size-full place-items-center rounded-[6px] border-2",
                    m === "right" && !values && "border-line-strong/60 bg-surface text-euc",
                    m === "right" && values && "border-wattle-edge bg-surface text-wattle-text",
                    m === "wrong" && "border-fail bg-fail text-white dark:text-paper",
                  )}
                  style={{ "--delay": `${(offset + i) * 45}ms` } as React.CSSProperties}
                >
                  {m === "right" ? <IconCheck size={14} strokeWidth={2.8} /> : <IconCross size={14} strokeWidth={2.8} />}
                </span>
              ) : (
                <span className="block size-full rounded-[6px] border-2 border-dashed border-line" />
              )}
              {wrongValues && marked && (
                <span className="motion-pulse pointer-events-none absolute -inset-1 animate-[pulse-soft_1.6s_ease-in-out_infinite] rounded-[9px] border-2 border-fail" />
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function Check({ shown, ok, rule, detail }: { shown: boolean; ok: boolean; rule: string; detail: string }) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={cx(
          "grid size-6 shrink-0 place-items-center rounded-full transition-colors duration-300",
          !shown && "bg-sunk text-transparent",
          shown && ok && "bg-pass-tint text-euc-deep",
          shown && !ok && "bg-fail-tint text-fail",
        )}
      >
        {ok ? <IconCheck size={14} strokeWidth={2.8} /> : <IconCross size={14} strokeWidth={2.8} />}
      </span>
      <span className="min-w-0 flex-1 text-small text-ink">{rule}</span>
      <span
        className={cx(
          "text-small font-bold tabular-nums transition-opacity duration-300",
          shown ? "opacity-100" : "opacity-0",
          ok ? "text-euc-deep dark:text-euc" : "text-fail",
        )}
      >
        {shown ? (ok ? `Yes, ${detail}` : `No, ${detail}`) : detail}
      </span>
    </li>
  );
}
