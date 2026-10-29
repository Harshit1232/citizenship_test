"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ButtonLink, Button } from "@/components/ui/button";
import { IconCheck, IconCross } from "@/components/ui/icons";
import { cx } from "@/lib/cx";
import type { TestResult } from "@/lib/exam/score";
import type { AnswerPick, Question } from "@/lib/types";
import { Explanation } from "./explanation";
import { partBgClass, PART_SHORT } from "./part-style";
import { ScoreRing } from "./score-ring";

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

  let summary: string;
  if (passed) summary = "Both rules met: at least 75% overall and every values question correct. That is the bar the real test sets.";
  else if (result.failedOnValuesOnly)
    summary = "Your score was high enough, but one or more values questions were wrong. On the real test, that alone means you do not pass.";
  else if (result.valuesEnforced && !result.valuesGate)
    summary = "The score was below 75% and at least one values question was wrong. Start with the values questions below.";
  else summary = "The score was below 75%. The questions below show where to look in the booklet.";

  return (
    <main id="main" className="mx-auto w-full max-w-[880px] px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
      <section
        aria-labelledby="result-title"
        className={cx(
          "anim-rise overflow-hidden rounded-lg border-2 p-6 shadow-2 sm:p-8",
          passed ? "border-pass bg-surface" : "border-fail/60 bg-surface",
        )}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <ScoreRing pct={result.pct} passed={passed} />
          <div className="min-w-0">
            <p className="text-small font-bold text-muted">
              Practice test result{timedOut ? ". Time ran out." : ""}
            </p>
            <h1
              id="result-title"
              ref={headingRef}
              tabIndex={-1}
              className={cx(
                "mt-1 font-display text-display-sm font-extrabold tracking-[-0.03em]",
                passed ? "text-pass" : "text-fail",
              )}
            >
              {passed ? "Pass" : "Not a pass"}
            </h1>
            <p className="mt-2 text-lead font-bold text-ink tabular-nums">
              {result.correct} of {result.n} correct ({result.pct}%)
            </p>
            <p className="mt-1 text-small text-muted">Time taken: {duration(seconds)}</p>
          </div>
        </div>

        <p className="mt-6 max-w-[60ch] text-body text-ink">{summary}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Gate
            title="Overall score"
            value={`${result.pct}%`}
            rule="Needs at least 75%."
            met={result.scoreGate}
          />
          <Gate
            title="Values questions"
            value={result.valuesTotal ? `${result.valuesCorrect} of ${result.valuesTotal}` : "None in this test"}
            rule={
              result.valuesEnforced
                ? "All must be correct. One wrong answer fails the test."
                : result.valuesTotal
                  ? "The values rule is switched off in your settings."
                  : "This test had no values questions."
            }
            met={result.valuesEnforced ? result.valuesGate : null}
          />
        </div>
      </section>

      <section aria-labelledby="parts-title" className="mt-12">
        <h2 id="parts-title" className="font-display text-heading font-bold tracking-[-0.02em]">
          By part of the booklet
        </h2>
        <ul className="mt-5 space-y-4">
          {result.byPart.map((p) => {
            const share = p.n ? p.c / p.n : 0;
            return (
              <li key={p.part} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5">
                <span className="text-body text-ink">{PART_SHORT[p.part]}</span>
                <span className="text-small font-bold tabular-nums text-ink">
                  {p.c} of {p.n}
                </span>
                <span className="col-span-2 block h-2.5 overflow-hidden rounded-full bg-sunk" aria-hidden="true">
                  <span
                    className={cx("block h-full rounded-full transition-[width] duration-700 ease-out", partBgClass(p.part))}
                    style={{ width: `${share * 100}%` }}
                  />
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="review-title" className="mt-14">
        <h2 id="review-title" className="font-display text-heading font-bold tracking-[-0.02em]">
          {wrong.length ? `Questions to review (${wrong.length})` : "Every question correct"}
        </h2>
        {wrong.length > 0 ? (
          <ol className="mt-6 space-y-5">
            {wrong.map((i) => {
              const q = paper[i];
              const pick = picks[i];
              return (
                <li key={q.id} className="rounded-lg border border-line bg-surface p-5 shadow-1 sm:p-6">
                  <p className="text-caption font-bold text-muted">
                    Question {i + 1}
                    {q.isValuesQuestion && (
                      <span className="ml-2 rounded-sm bg-wattle-tint px-1.5 py-0.5 text-wattle-text">
                        Values question
                      </span>
                    )}
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
                  <Explanation className="mt-4" text={q.explanation} source={q.source} />
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
          {result.valuesEnforced && !result.valuesGate
            ? "The values check gives you 10 values questions with the reason after each one."
            : "Each test draws a different 20 from 336 questions. Take another to cover more of the booklet."}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {result.valuesEnforced && !result.valuesGate ? (
            <>
              <ButtonLink href="/practice/values-check/">Try the values check</ButtonLink>
              <Button variant="secondary" onClick={onAgain}>
                Take another test
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onAgain}>Take another test</Button>
              <ButtonLink href="/practice/values-check/" variant="secondary">
                Try the values check
              </ButtonLink>
            </>
          )}
          <ButtonLink href="/" variant="quiet">
            Home
          </ButtonLink>
        </div>
        <p className="mt-6 border-t border-line pt-5 text-small text-muted">
          Coming in the full version: a values mastery track, practice by booklet part, and a
          readiness check before you book.{" "}
          <Link href="/#pricing" className="font-bold text-euc-deep underline underline-offset-2">
            See what&apos;s planned
          </Link>
        </p>
      </section>
    </main>
  );
}

function Gate({
  title,
  value,
  rule,
  met,
}: {
  title: string;
  value: string;
  rule: string;
  met: boolean | null;
}) {
  return (
    <div
      className={cx(
        "flex items-start gap-3 rounded-md border px-4 py-4",
        met === true && "border-pass/40 bg-pass-tint",
        met === false && "border-fail/40 bg-fail-tint",
        met === null && "border-line bg-sunk",
      )}
    >
      <span
        aria-hidden="true"
        className={cx(
          "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full",
          met === true && "bg-pass text-on-euc",
          met === false && "bg-fail text-white dark:text-paper",
          met === null && "bg-line text-muted",
        )}
      >
        {met === true ? <IconCheck size={18} strokeWidth={2.6} /> : met === false ? <IconCross size={18} strokeWidth={2.6} /> : null}
      </span>
      <div>
        <p className="text-small font-bold text-muted">{title}</p>
        <p className="font-display text-title font-bold text-ink tabular-nums">
          {value}
          <span className="sr-only">{met === true ? ", met" : met === false ? ", not met" : ""}</span>
        </p>
        <p className="mt-0.5 text-small text-copy">{rule}</p>
      </div>
    </div>
  );
}
