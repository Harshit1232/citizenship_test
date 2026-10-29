"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, CATEGORY_BY_ID, PARTS, QUESTIONS } from "@/lib/bank";
import { shuffle } from "@/lib/exam/plan";
import { loadStats } from "@/lib/stats";
import { migrateStorage } from "@/lib/storage/migrate";
import { applyOrder, loadStudy, parseFilter, saveStudy, studyPool, type StudyFilter } from "@/lib/study";
import type { Question, StudyState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { IconCheck, IconChevronLeft, IconChevronRight } from "@/components/ui/icons";
import { Explanation } from "@/components/exam/explanation";
import { ListenButton } from "@/components/exam/listen-button";
import { cx } from "@/lib/cx";
import { Card, EmptyState, PageIntro, PartDot } from "./ui";

const LETTERS = ["A", "B", "C", "D"];

/** Rendered in the browser only (see loaders). */
export function Study() {
  const [stats] = useState(() => {
    migrateStorage();
    return loadStats();
  });
  const [state, setState] = useState<StudyState>(() => {
    const s = loadStudy();
    return { ...s, filter: parseFilter(s.filter, PARTS, CATEGORY_BY_ID) };
  });
  const [missedOnly, setMissedOnly] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1);
  const [announcement, setAnnouncement] = useState("");
  const cardHeading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  const filter = state.filter as StudyFilter;
  const basePool = useMemo(() => studyPool(QUESTIONS, filter, missedOnly, stats), [filter, missedOnly, stats]);
  const pool = useMemo(() => applyOrder(basePool, state.order) ?? basePool, [basePool, state.order]);
  const idx = state.idx < pool.length ? state.idx : 0;
  const q: Question | undefined = pool[idx];
  const missedTotal = useMemo(() => QUESTIONS.filter((x) => (stats[x.id]?.wrong ?? 0) > 0).length, [stats]);

  function update(next: StudyState) {
    setState(next);
    saveStudy(next);
  }

  function go(delta: 1 | -1) {
    if (!pool.length) return;
    const nextIdx = (idx + delta + pool.length) % pool.length;
    setDir(delta);
    setRevealed(false);
    moved.current = true;
    update({ ...state, idx: nextIdx });
    setAnnouncement(`Card ${nextIdx + 1} of ${pool.length}.`);
  }

  function reveal() {
    setRevealed(true);
    if (q) setAnnouncement(`Answer: ${q.answer}. ${q.explanation}`);
  }

  function reshuffle() {
    const order = shuffle(basePool).map((x) => x.id);
    setDir(1);
    setRevealed(false);
    moved.current = true;
    update({ ...state, idx: 0, order });
    setAnnouncement(`Shuffled. Card 1 of ${basePool.length}.`);
  }

  function setFilter(value: string) {
    setRevealed(false);
    update({ ...state, filter: parseFilter(value, PARTS, CATEGORY_BY_ID), idx: 0, order: null });
  }

  // Move focus to the new card's question so screen readers read it next.
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    cardHeading.current?.focus({ preventScroll: true });
  }, [idx, state.order]);

  // Space reveals then moves on; arrows move. Ignored while typing in a control.
  useEffect(() => {
    if (state.view !== "flash") return;
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.closest("input, select, textarea, button, a, [role=radio]") || t.isContentEditable)) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === " ") {
        e.preventDefault();
        if (revealed) go(1);
        else reveal();
      } else if (e.key === "ArrowRight") {
        go(1);
      } else if (e.key === "ArrowLeft") {
        go(-1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const s = q ? stats[q.id] : undefined;

  return (
    <main id="main" className="mx-auto w-full max-w-[880px] px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
      <PageIntro title="Study">
        <p>Read the questions with their answers and reasons. Nothing here is scored or recorded.</p>
      </PageIntro>

      <div className="anim-rise mt-8 flex flex-wrap items-end gap-x-5 gap-y-4" style={{ animationDelay: "60ms" }}>
        <div className="min-w-0 flex-1 basis-64">
          <label htmlFor="study-filter" className="block text-small font-bold text-ink">
            Questions from
          </label>
          <div className="relative mt-1.5">
            <select
              id="study-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="min-h-12 w-full appearance-none rounded-sm border border-line-strong bg-surface py-2 pl-3.5 pr-10 text-body text-ink hover:border-ink"
            >
              <option value="all">All {QUESTIONS.length} questions</option>
              {PARTS.map((p) => (
                <optgroup key={p.id} label={p.title}>
                  <option value={`part:${p.id}`}>
                    All of {p.title} ({QUESTIONS.filter((x) => x.part === p.id).length})
                  </option>
                  {CATEGORIES.filter((c) => c.part === p.id).map((c) => (
                    <option key={c.id} value={`cat:${c.id}`}>
                      {c.label} ({c.count})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        <div role="group" aria-label="View" className="inline-flex rounded-sm border border-line-strong bg-surface p-1">
          {(["flash", "list"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={state.view === v}
              onClick={() => {
                setRevealed(false);
                update({ ...state, view: v });
              }}
              className={cx(
                "min-h-10 rounded-[6px] px-4 text-small font-bold transition-colors",
                state.view === v ? "bg-euc text-on-euc" : "text-copy hover:bg-sunk hover:text-ink",
              )}
            >
              {v === "flash" ? "Flashcards" : "List"}
            </button>
          ))}
        </div>

        <label className="flex min-h-12 cursor-pointer items-center gap-2.5 text-small font-bold text-ink">
          <input
            type="checkbox"
            checked={missedOnly}
            onChange={(e) => {
              setMissedOnly(e.target.checked);
              setRevealed(false);
              update({ ...state, idx: 0, order: null });
            }}
            className="size-5 accent-[var(--euc)]"
          />
          Only ones I&apos;ve missed ({missedTotal})
        </label>
      </div>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <div className="mt-8">
        {!q ? (
          <Card>
            <EmptyState title="Nothing matches">
              {missedOnly
                ? "You haven't missed anything here yet. Untick the filter to browse every question."
                : "There are no questions in this selection."}
            </EmptyState>
          </Card>
        ) : state.view === "list" ? (
          <StudyList questions={pool} />
        ) : (
          <>
            <article
              key={`${q.id}-${state.order ? "s" : "o"}`}
              aria-labelledby="study-q"
              className={cx(
                "rounded-lg border border-line bg-surface p-5 shadow-2 sm:p-8",
                dir === 1 ? "anim-q-forward" : "anim-q-back",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <p className="flex items-center gap-2 text-small font-bold text-copy">
                  <PartDot part={q.part} />
                  {q.categoryLabel}
                </p>
                <p className="text-caption text-muted">
                  {s ? `Answered ${s.seen} ${s.seen === 1 ? "time" : "times"}, missed ${s.wrong}` : "Not in a test yet"}
                </p>
              </div>
              <h2
                id="study-q"
                ref={cardHeading}
                tabIndex={-1}
                className="mt-5 font-text text-title font-bold leading-snug text-ink sm:text-[1.625rem]"
              >
                {q.question}
              </h2>

              {revealed ? (
                <div className="anim-rise mt-6">
                  <ul className="space-y-2.5">
                    {q.options.map((o, i) => {
                      const right = i === q.answerIndex;
                      return (
                        <li
                          key={o}
                          className={cx(
                            "flex items-start gap-3.5 rounded-md border-2 px-4 py-3",
                            right ? "border-pass bg-pass-tint text-ink" : "border-line text-copy",
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cx(
                              "grid size-8 shrink-0 place-items-center rounded-sm border-2 text-caption font-bold",
                              right ? "border-pass bg-pass text-on-euc" : "border-line text-muted",
                            )}
                          >
                            {right ? <IconCheck size={16} strokeWidth={2.6} /> : LETTERS[i]}
                          </span>
                          <span className="pt-0.5 text-lead leading-snug">
                            {o}
                            {right && <span className="sr-only"> (correct answer)</span>}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <Explanation className="mt-5" text={q.explanation} source={q.source} qid={q.id} />
                </div>
              ) : (
                <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3">
                  <Button size="lg" onClick={reveal}>
                    Show answer
                  </Button>
                  <ListenButton text={`${q.question} A: ${q.options[0]}. B: ${q.options[1]}. C: ${q.options[2]}.`} />
                  <span className="hidden text-small text-muted sm:inline">
                    or press <kbd className="rounded-[5px] border border-line-strong bg-sunk px-1.5 py-0.5 font-text text-caption font-bold text-ink">Space</kbd>
                  </span>
                </div>
              )}
            </article>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button variant="secondary" onClick={() => go(-1)} aria-label="Previous card">
                <IconChevronLeft size={18} /> Previous
              </Button>
              <Button onClick={() => go(1)} aria-label="Next card">
                Next <IconChevronRight size={18} />
              </Button>
              <Button variant="quiet" onClick={reshuffle}>
                Shuffle
              </Button>
              <p className="ml-auto text-small font-bold tabular-nums text-ink">
                {idx + 1} <span className="font-normal text-muted">of {pool.length}</span>
              </p>
            </div>
            <p className="mt-4 hidden text-caption text-muted sm:block">
              Keyboard: Space shows the answer, then moves on. Left and right arrows move between cards.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

function StudyList({ questions }: { questions: readonly Question[] }) {
  return (
    <section aria-labelledby="list-title">
      <h2 id="list-title" className="text-small font-bold text-muted">
        {questions.length} {questions.length === 1 ? "question" : "questions"}
      </h2>
      <ol className="mt-4 space-y-4">
        {questions.map((q) => (
          <li key={q.id} className="rounded-lg border border-line bg-surface p-5 shadow-1 sm:p-6">
            <p className="flex items-center gap-2 text-caption font-bold text-muted">
              <PartDot part={q.part} />
              {q.categoryLabel}
            </p>
            <h3 className="mt-2 font-text text-lead font-bold leading-snug text-ink">{q.question}</h3>
            <p className="mt-3 flex items-start gap-2 text-euc-deep dark:text-euc">
              <IconCheck size={18} className="mt-1 shrink-0" strokeWidth={2.4} />
              <span>
                <span className="sr-only">Answer: </span>
                <span className="font-bold">{q.answer}</span>
              </span>
            </p>
            <Explanation className="mt-4" text={q.explanation} source={q.source} qid={q.id} />
          </li>
        ))}
      </ol>
    </section>
  );
}
