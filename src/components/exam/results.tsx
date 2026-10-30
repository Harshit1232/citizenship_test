"use client";

import { useEffect, useRef } from "react";
import { ButtonLink, Button } from "@/components/ui/button";
import { IconCheck, IconCross } from "@/components/ui/icons";
import { cx } from "@/lib/cx";
import { RULES } from "@/lib/bank";
import { pct, type TestResult } from "@/lib/exam/score";
import type { AnswerPick, Question } from "@/lib/types";
import { Explanation } from "./explanation";
import { EXAM_PART_LABEL, partBgClass } from "./part-style";

interface ResultsProps {
  paper: readonly Question[];
  picks: readonly AnswerPick[];
  result: TestResult;
  timedOut: boolean;
  seconds: number;
  onAgain: () => void;
}

function duration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m ? `${m} min ${s} s` : `${s} s`;
}

export function Results({ paper, picks, result, timedOut, seconds, onAgain }: ResultsProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, []);

  const { passed } = result;
  const wrong = result.wrongIndexes;
  const passCount = Math.ceil((result.n * RULES.passMarkPercent) / 100);
  const vPct = pct(result.valuesCorrect, result.valuesTotal);
  const valuesFailed = result.valuesEnforced && !result.valuesGate;

  let summary: string;
  if (passed) summary = "You met both rules. That is the bar the real test sets.";
  else if (result.failedOnValuesOnly)
    summary = "Your overall mark was high enough, but at least one values question was wrong. That alone is a fail.";
  else if (valuesFailed)
    summary = "The overall mark was too low, and at least one values question was wrong. Start with the values questions below.";
  else summary = "The overall mark was too low. The questions below show where to look in the booklet.";

  return (
    <main id="main" className="mx-auto w-full max-w-[880px] px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
      {/* Laid out like the official practice test's result page. */}
      <section
        aria-labelledby="result-title"
        className={cx(
          "anim-rise overflow-hidden rounded-lg border-2 bg-surface p-6 shadow-2 sm:p-8",
          passed ? "border-pass" : "border-fail/60",
        )}
      >
        <p className="text-small font-bold text-muted">
          Practice test{timedOut ? ". Time ran out, so the test was submitted as it stood." : ""}
        </p>
        <h1
          id="result-title"
          ref={headingRef}
          tabIndex={-1}
          className="mt-1 font-display text-display-sm font-extrabold tracking-[-0.02em] text-ink"
        >
          Test result: <span className={passed ? "text-pass" : "text-fail"}>{passed ? "PASS" : "FAIL"}</span>
        </h1>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {result.valuesTotal > 0 && (
            <Gate
              title="Correct Australian values questions"
              value={`${result.valuesCorrect}/${result.valuesTotal} (${vPct}%)`}
              met={result.valuesEnforced ? result.valuesGate : null}
            />
          )}
          <Gate
            title="Overall mark"
            value={`${result.correct}/${result.n} (${result.pct}%)`}
            met={result.scoreGate}
          />
        </dl>

        <ul className="mt-6 divide-y divide-line border-y border-line">
          {result.byPart.map((p) => (
            <li key={p.part} className="flex items-center justify-between gap-4 py-2.5">
              <span className="flex min-w-0 items-center gap-2.5 text-body text-ink">
                <span aria-hidden="true" className={cx("size-2.5 shrink-0 rounded-full", partBgClass(p.part))} />
                {EXAM_PART_LABEL[p.part]}
              </span>
              <span className="shrink-0 font-bold tabular-nums text-ink">
                {p.c}/{p.n}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-5 max-w-[64ch] text-small text-copy">
          {result.valuesEnforced
            ? `To pass the test, you must get ${result.valuesTotal}/${result.valuesTotal} (100%) in the Australian values questions and at least ${passCount}/${result.n} (${RULES.passMarkPercent}%) correct in the overall mark.`
            : `To pass, you need at least ${passCount}/${result.n} (${RULES.passMarkPercent}%) correct. ${
                result.valuesTotal ? "The values rule is switched off in your settings." : "This test had no values questions."
              }`}
        </p>
        <p className="mt-4 max-w-[64ch] font-bold text-ink">{summary}</p>
        <p className="mt-1 text-small text-muted">Time taken: {duration(seconds)}</p>
      </section>

      <section aria-labelledby="review-title" className="mt-14">
        <h2 id="review-title" className="font-display text-heading font-bold tracking-[-0.02em]">
          {wrong.length ? `Questions to review (${wrong.length})` : "Every question correct"}
        </h2>
        <p className="mt-2 max-w-[60ch] text-small text-muted">
          The official practice test only shows your marks. Here you also see what you got wrong, and why.
        </p>
        {wrong.length > 0 ? (
          <ol className="mt-6 space-y-5">
            {wrong.map((i) => {
              const q = paper[i];
              const pick = picks[i];
              return (
                <li key={q.id} className="rounded-lg border border-line bg-surface p-5 shadow-1 sm:p-6">
                  <p className="text-caption font-bold text-muted">
                    Question {i + 1}
                    <span className="font-normal"> · {EXAM_PART_LABEL[q.part]}</span>
                  </p>
                  <h3 className="mt-2 font-text text-lead font-bold text-ink">{q.question}</h3>
                  <div className="mt-4 space-y-2">
                    <p className="flex items-start gap-2.5 rounded-sm bg-fail-tint px-3 py-2 text-fail">
                      <IconCross size={18} className="mt-0.5 shrink-0" strokeWidth={2.4} />
                      <span>
                        <span className="font-bold">Your answer: </span>
                        {pick === null ? "not answered" : q.options[pick]}
                      </span>
                    </p>
                    <p className="flex items-start gap-2.5 rounded-sm bg-pass-tint px-3 py-2 text-euc-deep">
                      <IconCheck size={18} className="mt-0.5 shrink-0" strokeWidth={2.4} />
                      <span>
                        <span className="font-bold">Correct: </span>
                        {q.answer}
                      </span>
                    </p>
                  </div>
                  <Explanation className="mt-4" text={q.explanation} source={q.source} qid={q.id} />
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="mt-4 text-body">Nothing to review from this test. Try another to see a different mix.</p>
        )}
      </section>

      <section className="mt-14 rounded-lg border border-line bg-sunk/60 p-6 sm:p-8">
        <h2 className="font-display text-title font-bold">Next step</h2>
        <p className="mt-2 max-w-[60ch]">
          {valuesFailed
            ? "Work through the values scenarios. Each one explains why every answer is right or wrong."
            : "Each test draws a different 20 questions. Take another to cover more of the booklet."}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {valuesFailed ? (
            <>
              <ButtonLink href="/practice/values/">Learn the values</ButtonLink>
              <Button variant="secondary" onClick={onAgain}>
                Take another test
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onAgain}>Take another test</Button>
              <ButtonLink href="/practice/values/" variant="secondary">
                Learn the values
              </ButtonLink>
            </>
          )}
          <ButtonLink href="/practice/progress/" variant="quiet">
            Check your readiness
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}

/** One row of the result, as a dt/dd pair directly inside the parent <dl>. */
function Gate({ title, value, met }: { title: string; value: string; met: boolean | null }) {
  return (
    <div
      className={cx(
        "rounded-md border px-4 py-4",
        met === true && "border-pass/40 bg-pass-tint",
        met === false && "border-fail/40 bg-fail-tint",
        met === null && "border-line bg-sunk",
      )}
    >
      <dt className="flex items-center gap-2.5 text-small font-bold text-copy">
        <span
          aria-hidden="true"
          className={cx(
            "grid size-6 shrink-0 place-items-center rounded-full",
            met === true && "bg-pass text-on-euc",
            met === false && "bg-fail text-white dark:text-paper",
            met === null && "bg-line text-muted",
          )}
        >
          {met === true ? <IconCheck size={15} strokeWidth={2.8} /> : met === false ? <IconCross size={15} strokeWidth={2.8} /> : null}
        </span>
        {title}
      </dt>
      <dd className="mt-1.5 pl-[2.125rem] font-display text-title font-bold text-ink tabular-nums">
        {value}
        <span className="sr-only">{met === true ? ", rule met" : met === false ? ", rule not met" : ""}</span>
      </dd>
    </div>
  );
}
