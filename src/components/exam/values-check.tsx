"use client";

import { useEffect, useRef, useState } from "react";
import { VALUES_QUESTIONS } from "@/lib/bank";
import { shuffle } from "@/lib/exam/plan";
import { applyResults, loadStats, saveStats } from "@/lib/stats";
import { migrateStorage } from "@/lib/storage/migrate";
import type { Question } from "@/lib/types";
import { Button, ButtonLink } from "@/components/ui/button";
import { IconCheck, IconCross } from "@/components/ui/icons";
import { cx } from "@/lib/cx";
import { AnswerOptions } from "./answer-options";
import { Explanation } from "./explanation";
import { ListenButton } from "./listen-button";

const LENGTH = 10;

/**
 * Ten Australian values questions, one at a time, with the reason straight
 * after each answer. Not a mock test: nothing goes into test history, but
 * results do count towards per-question stats.
 */
function drawSet(): Question[] {
  return shuffle(VALUES_QUESTIONS).slice(0, LENGTH);
}

/** Rendered in the browser only (see exam-app-loader). */
export function ValuesCheck() {
  const [questions, setQuestions] = useState<Question[]>(() => {
    migrateStorage();
    return drawSet();
  });
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<(number | null)[]>(() => new Array(LENGTH).fill(null));
  const [done, setDone] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  function newSet() {
    const qs = drawSet();
    setQuestions(qs);
    setPicks(new Array(qs.length).fill(null));
    setIdx(0);
    setDone(false);
  }

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [idx, done]);

  const q = questions[idx];
  const pick = picks[idx];
  const answered = pick !== null;
  const correctCount = picks.filter((p, i) => p === questions[i].answerIndex).length;

  function choose(i: number) {
    if (answered) return;
    const next = picks.slice();
    next[idx] = i;
    setPicks(next);
    requestAnimationFrame(() => feedbackRef.current?.focus({ preventScroll: false }));
  }

  function nextQuestion() {
    if (idx < questions.length - 1) {
      setIdx(idx + 1);
      window.scrollTo({ top: 0 });
    } else {
      const marks = questions.map((qq, i) => picks[i] === qq.answerIndex);
      saveStats(applyResults(loadStats(), questions, marks, Date.now()));
      setDone(true);
      window.scrollTo({ top: 0 });
    }
  }

  if (done) {
    const missed = questions.map((qq, i) => ({ qq, i })).filter(({ qq, i }) => picks[i] !== qq.answerIndex);
    const all = missed.length === 0;
    return (
      <main id="main" className="mx-auto w-full max-w-[760px] px-4 pb-24 pt-10 sm:px-6 sm:pt-16">
        <p className="text-small font-bold text-muted">Values check</p>
        <h1 ref={headingRef} tabIndex={-1} className="mt-2 font-display text-display-sm font-bold tracking-[-0.03em]">
          {correctCount} of {questions.length} correct
        </h1>
        <p className="mt-4 max-w-[56ch] text-lead">
          {all
            ? "Every values question right. On the real test you need all five of five, so this is the standard to keep."
            : `On the real test, any one of these would fail the test on its own. Read the reasons below, then try another set.`}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" onClick={newSet}>
            Try another 10
          </Button>
          <ButtonLink href="/practice/test/" size="lg" variant="secondary">
            Take a full practice test
          </ButtonLink>
        </div>
        {!all && (
          <section aria-labelledby="missed-title" className="mt-14">
            <h2 id="missed-title" className="font-display text-heading font-bold tracking-[-0.02em]">
              To read again ({missed.length})
            </h2>
            <ol className="mt-6 space-y-5">
              {missed.map(({ qq, i }) => (
                <li key={qq.id} className="rounded-lg border border-line bg-surface p-5 shadow-1 sm:p-6">
                  <h3 className="font-text text-lead font-bold text-ink">{qq.question}</h3>
                  <p className="mt-3 flex items-start gap-2 text-fail">
                    <IconCross size={18} className="mt-1 shrink-0" strokeWidth={2.4} />
                    <span>
                      <span className="font-bold">Your answer: </span>
                      {picks[i] === null ? "not answered" : qq.options[picks[i] as number]}
                    </span>
                  </p>
                  <p className="mt-1.5 flex items-start gap-2 text-euc-deep">
                    <IconCheck size={18} className="mt-1 shrink-0" strokeWidth={2.4} />
                    <span>
                      <span className="font-bold">Correct: </span>
                      {qq.answer}
                    </span>
                  </p>
                  <Explanation className="mt-4" text={qq.explanation} source={qq.source} />
                </li>
              ))}
            </ol>
          </section>
        )}
      </main>
    );
  }

  const right = answered && pick === q.answerIndex;

  return (
    <main id="main" className="mx-auto w-full max-w-[760px] px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      <div className="flex items-center justify-between gap-4">
        <p className="text-small font-bold text-ink">
          Question <span className="tabular-nums">{idx + 1}</span>{" "}
          <span className="font-normal text-muted">of {questions.length}</span>
        </p>
        <ol className="flex gap-1" aria-hidden="true">
          {questions.map((qq, i) => (
            <li
              key={qq.id}
              className={cx(
                "h-1.5 w-4 rounded-full sm:w-6",
                i < idx || (i === idx && answered)
                  ? picks[i] === qq.answerIndex
                    ? "bg-pass"
                    : "bg-fail"
                  : i === idx
                    ? "bg-ink"
                    : "bg-line",
              )}
            />
          ))}
        </ol>
      </div>

      <div key={q.id} className="anim-q-forward">
        <h1
          ref={headingRef}
          id="vc-question"
          tabIndex={-1}
          className="mt-8 max-w-[34ch] font-text text-title font-bold leading-snug tracking-normal text-ink sm:text-[1.625rem]"
        >
          {q.question}
        </h1>
        <div className="mt-7">
          <AnswerOptions
            name={`vc-${q.id}`}
            legendId="vc-question"
            options={q.options}
            value={pick}
            onChange={choose}
            reveal={answered ? { answerIndex: q.answerIndex, chosen: pick } : null}
          />
        </div>
        <div className="mt-4">
          <ListenButton text={`${q.question} A: ${q.options[0]}. B: ${q.options[1]}. C: ${q.options[2]}.`} />
        </div>

        <div ref={feedbackRef} tabIndex={-1} aria-live="polite" className="mt-6">
          {answered && (
            <div className="anim-rise">
              <p className={cx("flex items-center gap-2 font-display text-title font-bold", right ? "text-pass" : "text-fail")}>
                {right ? <IconCheck size={24} strokeWidth={2.6} /> : <IconCross size={24} strokeWidth={2.6} />}
                {right ? "Correct" : "Not quite"}
              </p>
              {!right && (
                <p className="mt-1 text-body text-ink">
                  The answer is: <strong>{q.answer}</strong>
                </p>
              )}
              <Explanation className="mt-4" text={q.explanation} source={q.source} />
              <Button size="lg" className="mt-6" onClick={nextQuestion}>
                {idx < questions.length - 1 ? "Next question" : "See your score"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
