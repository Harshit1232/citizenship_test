"use client";

import { useEffect, useRef, useState } from "react";
import { useInViewOnce, usePrefersReducedMotion } from "@/lib/hooks";
import { IconCheck, IconCross } from "@/components/ui/icons";
import { cx } from "@/lib/cx";

/**
 * A practice paper of 20 questions, marked live with the real test's two
 * rules. On first view it fills in answer by answer and lands on 19/20 with
 * one wrong values answer: 95%, and still not a pass. After that, every square
 * is a button the visitor can flip to see how the result changes.
 */

const TOTAL = 20;
const VALUES = new Set([2, 6, 10, 14, 17]);
const STARTING_WRONG = 14; // question 15, a values question
const PASS_MARK = 0.75;

type Answer = "right" | "wrong" | null;

function finalPaper(): Answer[] {
  return Array.from({ length: TOTAL }, (_, i) => (i === STARTING_WRONG ? "wrong" : "right"));
}

const FINAL = finalPaper();

export function ValuesGate() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInViewOnce(ref, 0.4);
  const reduce = usePrefersReducedMotion();
  const [answers, setAnswers] = useState<Answer[]>(() => Array(TOTAL).fill(null));
  const [phase, setPhase] = useState<"idle" | "done">("idle");
  const [announce, setAnnounce] = useState("");

  const started = useRef(false);
  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    // With reduced motion the finished paper is shown straight away (see `view` below).
    if (reduce) return;
    const target = finalPaper();
    let i = 0;
    let doneTimer = 0;
    const id = window.setInterval(() => {
      const n = i;
      setAnswers((prev) => {
        const next = prev.slice();
        next[n] = target[n];
        return next;
      });
      i++;
      if (i >= TOTAL) {
        window.clearInterval(id);
        doneTimer = window.setTimeout(() => setPhase("done"), 260);
      }
    }, 85);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(doneTimer);
      // Strict mode and fast remounts: let the next mount start again.
      started.current = false;
    };
  }, [inView, reduce]);

  // Reduced motion: skip the marking sequence and show the finished paper.
  const showFinal = reduce && phase === "idle";
  const shownAnswers = showFinal ? FINAL : answers;
  const answered = shownAnswers.filter(Boolean).length;
  const correct = shownAnswers.filter((a) => a === "right").length;
  const valuesRight = [...VALUES].filter((i) => shownAnswers[i] === "right").length;
  const pct = Math.round((correct / TOTAL) * 100);
  const scoreMet = correct >= TOTAL * PASS_MARK;
  const valuesMet = valuesRight === VALUES.size;
  const passed = scoreMet && valuesMet;
  const done = phase === "done" || showFinal;

  function flip(i: number) {
    if (!done) return;
    const next = shownAnswers.slice();
    next[i] = shownAnswers[i] === "right" ? "wrong" : "right";
    const c = next.filter((a) => a === "right").length;
    const v = [...VALUES].filter((k) => next[k] === "right").length;
    const ok = c >= TOTAL * PASS_MARK && v === VALUES.size;
    setAnswers(next);
    setPhase("done");
    setAnnounce(
      `Question ${i + 1} marked ${next[i] === "right" ? "right" : "wrong"}. ${c} of 20 correct, ${v} of 5 values questions correct. ${ok ? "Pass." : "Not a pass."}`,
    );
  }

  return (
    <div
      ref={ref}
      className="rounded-lg border border-line bg-surface/90 p-4 shadow-2 backdrop-blur-sm sm:p-6 lg:p-8"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 className="font-display text-title font-bold tracking-[-0.01em]">
          How the real test marks a paper
        </h2>
        <p className="flex items-center gap-2 text-small text-muted">
          <span className="inline-block size-3.5 rounded-[4px] border-2 border-wattle-edge bg-wattle" aria-hidden="true" />
          Australian values question
        </p>
      </div>

      <ol
        className="mt-5 grid grid-cols-10 gap-1.5 sm:gap-2 lg:grid-cols-20"
        aria-label="Practice paper, 20 questions"
      >
        {shownAnswers.map((a, i) => {
          const isValues = VALUES.has(i);
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => flip(i)}
                disabled={!done}
                aria-label={`Question ${i + 1}${isValues ? ", values question" : ""}: ${
                  a === null ? "not marked yet" : a === "right" ? "right" : "wrong"
                }. ${done ? "Press to change." : ""}`}
                className={cx(
                  "group relative grid aspect-square w-full place-items-center rounded-sm border-2 text-caption font-bold tabular-nums",
                  "transition-[background-color,border-color,transform,color] duration-200 ease-out disabled:cursor-default",
                  done && "hover:-translate-y-0.5 active:translate-y-0",
                  a === null && "border-dashed border-line bg-sunk text-muted",
                  a === "right" && !isValues && "border-line-strong/50 bg-surface text-euc",
                  a === "right" && isValues && "border-wattle-edge bg-wattle-tint text-wattle-text",
                  a === "wrong" && "border-fail bg-fail-tint text-fail",
                )}
              >
                <span className="absolute left-1 top-0.5 hidden text-[10px] font-bold leading-none sm:block">
                  {i + 1}
                </span>
                {a === "right" && <IconCheck size={18} className="anim-fade" strokeWidth={2.4} />}
                {a === "wrong" && <IconCross size={18} className="anim-fade" strokeWidth={2.4} />}
                {a === null && <span className="sm:hidden">{i + 1}</span>}
                {isValues && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-1/2 h-1 w-1/2 -translate-x-1/2 rounded-full bg-wattle"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-stretch">
        <Readout
          label="Overall score"
          value={answered ? `${correct} of 20 correct (${pct}%)` : "Marking…"}
          rule="Needs 75% or more"
          state={!answered ? "pending" : scoreMet ? "met" : "unmet"}
        />
        <Readout
          label="Values questions"
          value={answered ? `${valuesRight} of 5 correct` : "Marking…"}
          rule="Needs all 5"
          state={!done ? "pending" : valuesMet ? "met" : "unmet"}
        />
        <div
          className={cx(
            "flex min-w-[11rem] flex-col justify-center rounded-md px-5 py-4 transition-colors duration-300",
            !done && "bg-sunk text-muted",
            done && passed && "bg-pass text-on-euc",
            done && !passed && "bg-fail text-white dark:text-paper",
          )}
        >
          <span className="text-caption font-bold opacity-85">Result</span>
          <span className="font-display text-heading font-extrabold leading-tight tracking-[-0.02em]">
            {!done ? "…" : passed ? "Pass" : "Not a pass"}
          </span>
        </div>
      </div>

      <p className="mt-5 max-w-[62ch] text-small text-copy">
        {done && !passed && scoreMet && !valuesMet ? (
          <>One wrong values answer fails the test, whatever your total. </>
        ) : null}
        {done && passed ? <>Both rules met. </> : null}
        {done && !scoreMet ? <>Below 75% fails the test on its own. </> : null}
        <span className="text-muted">
          {done ? "Tap any square to change its answer." : "Marking a sample paper…"}
        </span>
      </p>
      <p className="sr-only" aria-live="polite">
        {announce || (done ? "19 of 20 correct, 95%. 4 of 5 values questions correct. Not a pass." : "")}
      </p>
    </div>
  );
}

function Readout({
  label,
  value,
  rule,
  state,
}: {
  label: string;
  value: string;
  rule: string;
  state: "pending" | "met" | "unmet";
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-line bg-paper/60 px-4 py-3.5">
      <span
        aria-hidden="true"
        className={cx(
          "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full transition-colors duration-300",
          state === "pending" && "bg-sunk text-muted",
          state === "met" && "bg-pass-tint text-pass",
          state === "unmet" && "bg-fail-tint text-fail",
        )}
      >
        {state === "met" && <IconCheck size={16} strokeWidth={2.6} />}
        {state === "unmet" && <IconCross size={16} strokeWidth={2.6} />}
      </span>
      <div className="min-w-0">
        <p className="text-caption font-bold text-muted">{label}</p>
        <p className="text-body font-bold text-ink tabular-nums">{value}</p>
        <p className="text-caption text-muted">
          {rule}.
          {state !== "pending" && (
            <span className={cx("font-bold", state === "met" ? "text-pass" : "text-fail")}>
              {state === "met" ? " Met." : " Not met."}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
