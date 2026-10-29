"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { QUESTIONS } from "@/lib/bank";
import { AREA_BY_ID, VALUES_AREAS } from "@/data/values-scenarios";
import { migrateStorage } from "@/lib/storage/migrate";
import {
  GATE,
  buildGateRun,
  gateItemKey,
  loadValues,
  recordGateRun,
  saveValues,
  type GateItem,
  type ValuesState,
} from "@/lib/values-progress";
import { formatWhen } from "@/lib/progress";
import { AnswerOptions } from "@/components/exam/answer-options";
import { Explanation } from "@/components/exam/explanation";
import { ListenButton } from "@/components/exam/listen-button";
import { Button, ButtonLink } from "@/components/ui/button";
import { IconArrowLeft, IconCheck, IconChevronRight, IconCross } from "@/components/ui/icons";
import { cx } from "@/lib/cx";
import { BookletLink, SituationBox, WhyEachOption } from "./scenario-parts";

const LETTERS = ["A", "B", "C"];

type Phase = "intro" | "running" | "failed" | "cleared";

function itemQuestion(item: GateItem): { question: string; options: string[]; answer: number } {
  if (item.kind === "scenario") {
    return { question: item.scenario.question, options: item.scenario.options.map((o) => o.text), answer: item.scenario.answer };
  }
  return { question: item.question.question, options: item.question.options, answer: item.question.answerIndex };
}

/**
 * The values gate: 10 values questions in a row, 2 from each area, mixing
 * scenarios and bank questions. One wrong answer ends the run. Rendered in the
 * browser only (see loaders).
 */
export function GateRun() {
  const [values, setValues] = useState<ValuesState>(() => {
    migrateStorage();
    return loadValues();
  });
  const [phase, setPhase] = useState<Phase>("intro");
  const [run, setRun] = useState<GateItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  const item = run[idx];
  const q = item ? itemQuestion(item) : null;
  const answered = chosen !== null;
  const right = q !== null && chosen === q.answer;

  function start() {
    setRun(buildGateRun(QUESTIONS));
    setIdx(0);
    setChosen(null);
    setPhase("running");
    moved.current = true;
    window.scrollTo({ top: 0 });
  }

  function finishRun(streak: number) {
    const next = recordGateRun(values, streak, Date.now());
    setValues(next);
    saveValues(next);
  }

  function choose(i: number) {
    if (answered || !q) return;
    setChosen(i);
    if (i !== q.answer) finishRun(idx);
    requestAnimationFrame(() => feedbackRef.current?.focus());
  }

  function next() {
    if (!answered) return;
    if (!right) {
      setPhase("failed");
    } else if (idx + 1 >= run.length) {
      finishRun(run.length);
      setPhase("cleared");
    } else {
      setIdx(idx + 1);
      setChosen(null);
    }
    moved.current = true;
    window.scrollTo({ top: 0 });
  }

  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    headingRef.current?.focus({ preventScroll: true });
  }, [idx, phase]);

  useEffect(() => {
    if (phase !== "running") return;
    function onKey(e: KeyboardEvent) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      const k = e.key.toLowerCase();
      if (!answered && ["a", "b", "c"].includes(k)) {
        e.preventDefault();
        choose(["a", "b", "c"].indexOf(k));
      } else if (answered && e.key === "Enter" && !(t && t.closest("button, a"))) {
        e.preventDefault();
        next();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <main id="main" className="mx-auto w-full max-w-[820px] px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      <Link href="/practice/values/" className="inline-flex items-center gap-1.5 text-small font-bold text-copy hover:text-ink">
        <IconArrowLeft size={16} /> Values mastery
      </Link>

      {phase === "intro" && <Intro values={values} onStart={start} headingRef={headingRef} />}

      {phase === "running" && item && q && (
        <div className="mt-6">
          <StreakBar total={run.length} done={idx + (answered && right ? 1 : 0)} failedAt={answered && !right ? idx : -1} />
          <article key={gateItemKey(item)} className="anim-q-forward mt-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <p className="text-small font-bold text-muted">
                Question {idx + 1} of {run.length}
              </p>
              <span className="rounded-full bg-wattle-tint px-2.5 py-0.5 text-caption font-bold text-wattle-text">
                {AREA_BY_ID.get(item.area)?.title}
              </span>
            </div>
            {item.kind === "scenario" && (
              <div className="mt-4">
                <SituationBox text={item.scenario.situation} />
              </div>
            )}
            <h1
              ref={headingRef}
              tabIndex={-1}
              id="gate-q"
              className="mt-5 font-text text-title font-bold leading-snug text-ink sm:text-[1.625rem]"
            >
              {q.question}
            </h1>
            <div className="mt-5">
              <AnswerOptions
                name={`gate-${gateItemKey(item)}`}
                legendId="gate-q"
                options={q.options}
                value={chosen}
                onChange={choose}
                reveal={answered ? { answerIndex: q.answer, chosen } : null}
              />
            </div>
            {!answered && (
              <div className="mt-4">
                <ListenButton
                  text={`${item.kind === "scenario" ? `${item.scenario.situation} ` : ""}${q.question} A: ${q.options[0]}. B: ${q.options[1]}. C: ${q.options[2]}.`}
                />
              </div>
            )}

            <div ref={feedbackRef} tabIndex={-1} aria-live="polite" className="mt-6 outline-none">
              {answered && right && (
                <div className="anim-rise flex flex-wrap items-center justify-between gap-3">
                  <p className="flex items-center gap-2 font-display text-title font-bold text-pass">
                    <IconCheck size={24} strokeWidth={2.6} /> Right. {idx + 1} in a row.
                  </p>
                  <Button size="lg" onClick={next}>
                    {idx + 1 >= run.length ? "Finish" : "Next question"} <IconChevronRight size={18} />
                  </Button>
                </div>
              )}
              {answered && !right && (
                <div className="anim-rise space-y-5">
                  <p className="flex items-center gap-2 font-display text-title font-bold text-fail">
                    <IconCross size={24} strokeWidth={2.6} /> Not quite. The answer is {LETTERS[q.answer]}.
                  </p>
                  {item.kind === "scenario" ? (
                    <>
                      <WhyEachOption scenario={item.scenario} chosen={chosen} headingLevel={2} />
                      <BookletLink page={item.scenario.page} />
                    </>
                  ) : (
                    <Explanation text={item.question.explanation} source={item.question.source} qid={item.question.id} />
                  )}
                  <Button size="lg" onClick={next}>
                    See how the run went <IconChevronRight size={18} />
                  </Button>
                </div>
              )}
            </div>
          </article>
        </div>
      )}

      {phase === "failed" && item && (
        <section className="anim-rise mt-6">
          <StreakBar total={run.length} done={idx} failedAt={idx} />
          <h1 ref={headingRef} tabIndex={-1} className="mt-8 font-display text-heading font-bold tracking-[-0.02em] text-ink sm:text-[2.25rem]">
            {idx === 0 ? "The run ended on the first question" : `${idx} in a row. The run has ended.`}
          </h1>
          <p className="mt-4 max-w-[58ch] text-lead">
            On the real test, one wrong values answer means the test is not a pass. That is why the gate works the same way.
            Read the area you missed, then start a new run with new questions.
          </p>
          <p className="mt-3 text-small text-muted">
            Your best run: {values.gate.best} of {GATE.length}.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={start}>
              Start a new run
            </Button>
            <ButtonLink
              href={`/practice/values/${item.area}/${item.kind === "scenario" ? `#${item.scenario.id}` : ""}`}
              size="lg"
              variant="secondary"
            >
              Study this area
            </ButtonLink>
          </div>
        </section>
      )}

      {phase === "cleared" && (
        <section className="anim-rise mt-6">
          <StreakBar total={run.length} done={run.length} failedAt={-1} />
          <div className="mt-8 flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-wattle text-on-wattle shadow-2">
              <IconCheck size={32} strokeWidth={2.6} />
            </span>
            <h1 ref={headingRef} tabIndex={-1} className="font-display text-heading font-bold tracking-[-0.02em] text-ink sm:text-[2.25rem]">
              Values gate cleared
            </h1>
          </div>
          <p className="mt-5 max-w-[58ch] text-lead">
            {GATE.length} values questions in a row, from all five areas. That is the standard the real test asks for, twice over.
          </p>
          <p className="mt-3 max-w-[58ch] text-copy">
            The gate is one half of the readiness check. The other half is three practice tests in the real format at 85% or
            more, with every values question right.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/practice/test/" size="lg">
              Take a practice test
            </ButtonLink>
            <ButtonLink href="/practice/" size="lg" variant="secondary">
              See your readiness check
            </ButtonLink>
          </div>
        </section>
      )}
    </main>
  );
}

function Intro({
  values,
  onStart,
  headingRef,
}: {
  values: ValuesState;
  onStart: () => void;
  headingRef: React.Ref<HTMLHeadingElement>;
}) {
  const g = values.gate;
  return (
    <section className="anim-rise mt-4">
      <h1 ref={headingRef} tabIndex={-1} className="font-display text-display-sm font-bold tracking-[-0.03em] sm:text-[3.25rem] sm:leading-none">
        Values gate
      </h1>
      <p className="mt-4 max-w-[58ch] text-lead">
        Prove you know the values. Answer <strong className="text-ink">{GATE.length} values questions in a row</strong>,{" "}
        {GATE.perArea} from each of the five areas. One wrong answer ends the run, and you start again with new questions.
      </p>
      <ul className="mt-6 grid gap-2 sm:grid-cols-5" aria-label="Questions come from these areas">
        {VALUES_AREAS.map((a) => (
          <li key={a.id} className="rounded-md border border-wattle-edge/40 bg-wattle-tint px-3 py-2.5 text-caption font-bold text-ink">
            {a.title}
          </li>
        ))}
      </ul>
      <div
        className={cx(
          "mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border px-5 py-4",
          g.cleared ? "border-pass bg-pass-tint" : "border-line bg-surface",
        )}
      >
        <p className="min-w-[12rem] flex-1 text-copy">
          {g.cleared ? (
            <>
              <strong className="text-ink">Cleared</strong>
              {g.clearedAt ? ` on ${formatWhen(g.clearedAt)}` : ""}. You can run it again any time to stay sharp.
            </>
          ) : g.runs ? (
            <>
              Not cleared yet. Your best run so far is <strong className="text-ink">{g.best} of {GATE.length}</strong>.
            </>
          ) : (
            <>Not tried yet. It can take a few runs, so don&apos;t worry if the first one ends early.</>
          )}
        </p>
        <Button size="lg" onClick={onStart}>
          {g.runs ? "Start a new run" : "Start the gate"}
        </Button>
      </div>
      <p className="mt-4 text-small text-muted">
        Not ready yet? Work through the <Link href="/practice/values/" className="font-bold text-euc-deep underline underline-offset-2 dark:text-euc">values scenarios</Link> first.
      </p>
    </section>
  );
}

/** Ten segments: filled for each right answer in the current run, red where it ended. */
function StreakBar({ total, done, failedAt }: { total: number; done: number; failedAt: number }) {
  return (
    <div>
      <div
        role="img"
        aria-label={`${done} of ${total} in a row`}
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cx(
              "h-2.5 rounded-full transition-colors duration-300",
              i === failedAt ? "bg-fail" : i < done ? "bg-wattle" : "bg-line",
            )}
          />
        ))}
      </div>
      <p aria-hidden="true" className="mt-2 text-caption text-muted">
        {done} of {total} in a row
      </p>
    </div>
  );
}
