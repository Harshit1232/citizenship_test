"use client";

import { useEffect, useRef, useState } from "react";
import { WattleMark } from "@/components/brand/wattle-mark";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { IconChevronLeft, IconChevronRight, IconGrid } from "@/components/ui/icons";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cx } from "@/lib/cx";
import type { RunningTest } from "@/lib/exam/session";
import { answeredCount, secondsLeft } from "@/lib/exam/session";
import { AnswerOptions } from "./answer-options";
import { ExamTimer } from "./exam-timer";
import { ListenButton } from "./listen-button";
import { EXAM_PART_LABEL } from "./part-style";
import { QuestionList, StatusLegend } from "./question-map";

interface ExamScreenProps {
  test: RunningTest;
  now: number;
  largeText: boolean;
  onLargeText: (on: boolean) => void;
  onPick: (choice: number) => void;
  onMove: (to: number) => void;
  onToggleFlag: () => void;
  onSubmit: () => void;
  onExit: () => void;
}

/** "4, 9 and 17" */
function listNumbers(ns: number[]): string {
  if (ns.length <= 1) return ns.join("");
  return `${ns.slice(0, -1).join(", ")} and ${ns[ns.length - 1]}`;
}

/** Text the Listen button reads: the question, then each answer. */
export function questionSpeech(question: string, options: readonly string[]): string {
  const words = ["One", "Two", "Three", "Four"];
  return `${question} ${options.map((o, i) => `${words[i]}: ${o}.`).join(" ")}`;
}

/**
 * The test screen, laid out like the official practice test: a list of
 * questions on the left, the part label above each question, plain radio
 * answers, a Review later checkbox, Previous, Next and Submit, and a footer
 * with questions answered and time remaining. Submit only works once every
 * question has an answer, as on the official test.
 */
export function ExamScreen({
  test,
  now,
  largeText,
  onLargeText,
  onPick,
  onMove,
  onToggleFlag,
  onSubmit,
  onExit,
}: ExamScreenProps) {
  const { paper, picks, flags, cur } = test;
  const q = paper[cur];
  const total = paper.length;
  const answered = answeredCount(picks);
  const allAnswered = answered === total;
  const unanswered = picks.flatMap((p, i) => (p === null ? [i + 1] : []));
  const flaggedNumbers = flags.flatMap((f, i) => (f ? [i + 1] : []));
  const [listOpen, setListOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const prevCur = useRef(cur);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  // Start at the top with focus on the first question.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  // Move focus to the new question so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (prevCur.current !== cur) {
      setDirection(cur > prevCur.current ? "forward" : "back");
      prevCur.current = cur;
      headingRef.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [cur]);

  const timed = test.deadline > 0;
  const totalSeconds = timed ? Math.round((test.deadline - test.startedAt) / 1000) : 0;
  const left = timed ? Math.min(totalSeconds, secondsLeft(test, Math.max(now, test.startedAt))) : 0;
  const showBlocked = blocked && !allAnswered;

  function requestSubmit() {
    if (!allAnswered) {
      setBlocked(true);
      return;
    }
    setBlocked(false);
    setListOpen(false);
    setConfirmOpen(true);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-veil backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-3 px-4 sm:px-6">
          <WattleMark size={28} />
          <span className="hidden text-small font-bold text-ink sm:inline">Practice test</span>
          <span aria-hidden="true" className="hidden h-5 w-px bg-line sm:block" />
          <p className="whitespace-nowrap text-small font-bold text-ink">
            <span className="tabular-nums">Question {cur + 1}</span>{" "}
            <span className="font-normal text-muted">of {total}</span>
          </p>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setListOpen(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-sm px-3 text-small font-bold text-ink hover:bg-sunk lg:hidden"
            >
              <IconGrid size={18} />
              Questions
            </button>
            <button
              type="button"
              onClick={onExit}
              className="hidden min-h-11 items-center rounded-sm px-3 text-small font-bold text-muted hover:bg-sunk hover:text-ink sm:inline-flex"
            >
              Save and exit
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1200px] flex-1 gap-10 px-4 pb-12 pt-6 sm:px-6 sm:pt-10 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="hidden lg:block" aria-label="Question list">
          <div className="sticky top-24 rounded-lg border border-line bg-surface py-3 shadow-1">
            <QuestionList
              picks={picks}
              flags={flags}
              current={cur}
              onJump={onMove}
              className="max-h-[calc(100dvh-15rem)] overflow-y-auto"
            />
            <StatusLegend className="mt-3 border-t border-line px-4 pt-3" />
          </div>
        </aside>

        <main id="main" className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line pb-3">
            <p className="text-small font-bold text-copy">{EXAM_PART_LABEL[q.part]}</p>
            <div role="group" aria-label="Reading tools" className="-mr-2 flex items-center gap-1">
              <ListenButton text={questionSpeech(q.question, q.options)} />
              <button
                type="button"
                onClick={() => onLargeText(!largeText)}
                aria-pressed={largeText}
                className={cx(
                  "inline-flex min-h-11 items-center gap-2 rounded-sm px-3 text-small font-bold transition-colors",
                  largeText ? "bg-euc-tint text-euc-deep" : "text-ink hover:bg-sunk",
                )}
              >
                <span aria-hidden="true" className="font-display leading-none">
                  A<span className="text-[1.2em]">A</span>
                </span>
                Larger text
              </button>
              <ThemeToggle />
            </div>
          </div>

          <div key={cur} className={cx("pt-5 sm:pt-8", direction === "forward" ? "anim-q-forward" : "anim-q-back")}>
            <h1
              ref={headingRef}
              id="question-text"
              tabIndex={-1}
              className={cx(
                "max-w-[34ch] font-text font-bold leading-snug tracking-normal text-ink",
                largeText ? "text-[1.75rem] sm:text-[2rem]" : "text-title sm:text-[1.625rem]",
              )}
            >
              <span className="sr-only">
                Question {cur + 1} of {total}.{" "}
              </span>
              {q.question}
            </h1>
            <div className="mt-5 max-w-[60ch] sm:mt-7">
              <AnswerOptions
                name={`q${q.id}`}
                legendId="question-text"
                options={q.options}
                value={picks[cur]}
                onChange={onPick}
                plain
                large={largeText}
              />
            </div>
            <label className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-sm pr-3 text-body font-bold text-ink">
              <input
                type="checkbox"
                checked={flags[cur]}
                onChange={onToggleFlag}
                className="size-5 shrink-0 accent-euc"
              />
              Review later
            </label>
          </div>

          <nav aria-label="Move between questions" className="mt-5 max-w-[60ch] sm:mt-8">
            <div className="flex flex-wrap items-center gap-3">
              {cur > 0 && (
                <Button variant="secondary" size="lg" onClick={() => onMove(cur - 1)} className="flex-1 sm:flex-none">
                  <IconChevronLeft size={18} />
                  Previous
                </Button>
              )}
              {cur < total - 1 && (
                <Button variant="secondary" size="lg" onClick={() => onMove(cur + 1)} className="flex-1 sm:flex-none">
                  Next
                  <IconChevronRight size={18} />
                </Button>
              )}
              <Button
                size="lg"
                onClick={requestSubmit}
                aria-disabled={!allAnswered}
                aria-describedby={!allAnswered ? "submit-rule" : undefined}
                className={cx("w-full sm:ml-auto sm:w-auto", !allAnswered && "opacity-60")}
              >
                Submit
              </Button>
            </div>
            {!allAnswered && (
              <p id="submit-rule" className="mt-3 text-small text-muted sm:text-right">
                You must answer all questions before you can submit.
              </p>
            )}
            <div role="alert" className="mt-3 empty:hidden">
              {showBlocked && (
                <div className="rounded-md border border-fail/40 bg-fail-tint px-4 py-3 text-small text-ink">
                  <p className="font-bold">You must answer all questions.</p>
                  <p className="mt-1">
                    {unanswered.length <= 5
                      ? `Not answered yet: question${unanswered.length === 1 ? "" : "s"} ${listNumbers(unanswered)}.`
                      : `${unanswered.length} questions are not answered yet.`}
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-3"
                    onClick={() => {
                      setBlocked(false);
                      onMove(unanswered[0] - 1);
                    }}
                  >
                    Go to question {unanswered[0]}
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </main>
      </div>

      <footer className="sticky bottom-0 z-20 mt-auto border-t border-line bg-veil backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex min-h-12 max-w-[1200px] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-6">
          <p className="text-small text-copy">
            <span className="font-bold tabular-nums text-ink">
              {answered} of {total}
            </span>{" "}
            <span className="max-sm:hidden">questions </span>answered
          </p>
          {timed ? <ExamTimer secondsLeft={left} /> : <p className="text-small text-muted">Untimed</p>}
        </div>
      </footer>

      <Dialog open={listOpen} onClose={() => setListOpen(false)} title="Questions" sheet>
        <QuestionList
          picks={picks}
          flags={flags}
          current={cur}
          onJump={(i) => {
            onMove(i);
            setListOpen(false);
          }}
          className="-mx-2 grid grid-cols-2"
        />
        <StatusLegend className="mt-4" />
        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onExit}
            className="min-h-11 rounded-sm px-3 text-small font-bold text-muted hover:bg-sunk hover:text-ink"
          >
            Save and exit
          </button>
          <Button variant="secondary" onClick={() => setListOpen(false)}>
            Close
          </Button>
        </div>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Warning">
        <p className="text-body text-ink">Are you ready to submit your test attempt?</p>
        {flaggedNumbers.length > 0 && (
          <p className="mt-2 text-small">
            You marked question{flaggedNumbers.length === 1 ? "" : "s"} {listNumbers(flaggedNumbers)} to review later.
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
            No
          </Button>
          <Button
            onClick={() => {
              setConfirmOpen(false);
              onSubmit();
            }}
          >
            Yes
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
