"use client";

import { useEffect, useRef, useState } from "react";
import { WattleMark } from "@/components/brand/wattle-mark";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { IconChevronLeft, IconChevronRight, IconFlag, IconGrid } from "@/components/ui/icons";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cx } from "@/lib/cx";
import type { RunningTest } from "@/lib/exam/session";
import { answeredCount, secondsLeft } from "@/lib/exam/session";
import { AnswerOptions } from "./answer-options";
import { ExamTimer } from "./exam-timer";
import { ListenButton } from "./listen-button";
import { QuestionMap } from "./question-map";

interface ExamScreenProps {
  test: RunningTest;
  now: number;
  onPick: (choice: number) => void;
  onMove: (to: number) => void;
  onToggleFlag: () => void;
  onFinish: () => void;
  onExit: () => void;
}

export function ExamScreen({ test, now, onPick, onMove, onToggleFlag, onFinish, onExit }: ExamScreenProps) {
  const { paper, picks, flags, cur } = test;
  const q = paper[cur];
  const total = paper.length;
  const answered = answeredCount(picks);
  const isLast = cur === total - 1;
  const [mapOpen, setMapOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const prevCur = useRef(cur);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  // Start at the top with focus on the first question.
  useEffect(() => {
    window.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  // Move focus to the new question so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (prevCur.current !== cur) {
      setDirection(cur > prevCur.current ? "forward" : "back");
      prevCur.current = cur;
      headingRef.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0 });
    }
  }, [cur]);

  // A, B and C choose an answer, unless the person is typing somewhere.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "TEXTAREA" || (t.tagName === "INPUT" && (t as HTMLInputElement).type === "text"))) return;
      if (document.querySelector("dialog[open]")) return;
      const k = e.key.toLowerCase();
      const i = ["a", "b", "c", "d"].indexOf(k);
      if (i >= 0 && i < q.options.length) {
        e.preventDefault();
        onPick(i);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [q, onPick]);

  const listenText = `${q.question} A: ${q.options[0]}. B: ${q.options[1]}. C: ${q.options[2]}.`;
  const timed = test.deadline > 0;
  const totalSeconds = timed ? Math.round((test.deadline - test.startedAt) / 1000) : 0;
  const flagged = flags[cur];

  function requestFinish() {
    setMapOpen(false);
    setFinishOpen(true);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-veil backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-3 px-4 sm:px-6">
          <WattleMark size={28} />
          <span className="hidden text-small font-bold text-ink sm:inline">Practice test</span>
          <span aria-hidden="true" className="hidden h-5 w-px bg-line sm:block" />
          <p className="text-small font-bold text-ink">
            <span className="tabular-nums">Question {cur + 1}</span>{" "}
            <span className="font-normal text-muted">of {total}</span>
          </p>
          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-sm px-3 text-small font-bold text-ink hover:bg-sunk lg:hidden"
            >
              <IconGrid size={18} />
              <span className="sr-only sm:not-sr-only">Questions</span>
            </button>
            {timed ? (
              <ExamTimer
                secondsLeft={Math.min(totalSeconds, secondsLeft(test, Math.max(now, test.startedAt)))}
                totalSeconds={totalSeconds}
                compact
              />
            ) : (
              <span className="text-small text-muted">Untimed</span>
            )}
          </div>
        </div>
        <div
          className="h-1 bg-sunk"
          role="progressbar"
          aria-label="Questions answered"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={answered}
        >
          <div
            className="h-full bg-euc transition-[width] duration-300 ease-out"
            style={{ width: `${(answered / total) * 100}%` }}
          />
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1200px] flex-1 gap-10 px-4 pb-36 pt-8 sm:px-6 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:pb-16">
        <main id="main">
          <div key={cur} className={direction === "forward" ? "anim-q-forward" : "anim-q-back"}>
            {/* The real test never says which questions are values questions or
                which part they come from, so neither is shown unless the person
                turned the values label on in their settings. */}
            <div className="flex min-h-7 flex-wrap items-center gap-2">
              <span className="text-small font-bold text-muted">Question {cur + 1}</span>
              {test.showValuesTag && q.isValuesQuestion && (
                <span className="rounded-sm border border-wattle-edge bg-wattle-tint px-2 py-0.5 text-caption font-bold text-wattle-text">
                  Australian values question: must be correct
                </span>
              )}
            </div>
            <h1
              ref={headingRef}
              id="question-text"
              tabIndex={-1}
              className="mt-4 max-w-[34ch] font-text text-title font-bold leading-snug tracking-normal text-ink sm:text-[1.625rem]"
            >
              <span className="sr-only">
                Question {cur + 1} of {total}.{" "}
              </span>
              {q.question}
            </h1>
            <div className="mt-7 max-w-[60ch]">
              <AnswerOptions
                name={`q${q.id}`}
                legendId="question-text"
                options={q.options}
                value={picks[cur]}
                onChange={onPick}
              />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <ListenButton text={listenText} />
              <button
                type="button"
                onClick={onToggleFlag}
                aria-pressed={flagged}
                className={cx(
                  "inline-flex min-h-11 items-center gap-2 rounded-sm px-3 text-small font-bold transition-colors",
                  flagged ? "bg-wattle-tint text-wattle-text" : "text-ink hover:bg-sunk",
                )}
              >
                <IconFlag size={18} />
                {flagged ? "Marked to review" : "Review later"}
              </button>
            </div>
          </div>

          <nav
            aria-label="Move between questions"
            className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-veil px-4 py-3 backdrop-blur-xl sm:px-6 lg:static lg:mt-12 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
          >
            <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-3 lg:mx-0 lg:flex lg:max-w-[60ch] lg:justify-between">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => onMove(cur - 1)}
                disabled={cur === 0}
                className="px-3 sm:px-5"
              >
                <IconChevronLeft size={18} />
                Previous
              </Button>
              {isLast ? (
                <Button size="lg" onClick={requestFinish} className="px-3 sm:px-6">
                  Review and finish
                </Button>
              ) : (
                <Button size="lg" onClick={() => onMove(cur + 1)} className="px-3 sm:px-6">
                  Next
                  <IconChevronRight size={18} />
                </Button>
              )}
            </div>
          </nav>
        </main>

        <aside className="hidden lg:block" aria-label="Question overview">
          <div className="sticky top-24 rounded-lg border border-line bg-surface p-5 shadow-1">
            <h2 className="font-display text-body font-bold text-ink">Questions</h2>
            <div className="mt-4">
              <QuestionMap picks={picks} flags={flags} current={cur} onJump={onMove} />
            </div>
            <Button className="mt-5 w-full" variant="secondary" onClick={requestFinish}>
              Finish test
            </Button>
            <button
              type="button"
              onClick={onExit}
              className="mt-2 w-full rounded-sm px-3 py-2.5 text-small font-bold text-muted hover:bg-sunk hover:text-ink"
            >
              Save and exit
            </button>
          </div>
        </aside>
      </div>

      <Dialog open={mapOpen} onClose={() => setMapOpen(false)} title="Questions" sheet>
        <QuestionMap
          picks={picks}
          flags={flags}
          current={cur}
          onJump={(i) => {
            onMove(i);
            setMapOpen(false);
          }}
        />
        <div className="mt-5 flex flex-col gap-2">
          <Button onClick={requestFinish} variant="secondary">
            Finish test
          </Button>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onExit}
              className="rounded-sm px-3 py-2.5 text-small font-bold text-muted hover:bg-sunk hover:text-ink"
            >
              Save and exit
            </button>
            <ThemeToggle />
            <Button variant="quiet" onClick={() => setMapOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog open={finishOpen} onClose={() => setFinishOpen(false)} title="Finish the test?">
        <p>
          You have answered <strong className="text-ink">{answered} of {total}</strong> questions.
          {flags.filter(Boolean).length > 0 && (
            <> {flags.filter(Boolean).length} marked to review.</>
          )}
        </p>
        {answered < total && (
          <p className="mt-2">Questions you have not answered count as wrong.</p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setFinishOpen(false)}>
            Keep going
          </Button>
          <Button
            onClick={() => {
              setFinishOpen(false);
              onFinish();
            }}
          >
            Finish and see result
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
