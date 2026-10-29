"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AREA_BY_ID, SCENARIOS_BY_AREA, VALUES_AREAS, type ValuesAreaId } from "@/data/values-scenarios";
import { migrateStorage } from "@/lib/storage/migrate";
import { areaProgress, loadValues, nextScenarioIndex, recordScenario, saveValues, type ValuesState } from "@/lib/values-progress";
import { AnswerOptions } from "@/components/exam/answer-options";
import { ListenButton } from "@/components/exam/listen-button";
import { Button, ButtonLink } from "@/components/ui/button";
import { IconArrowLeft, IconCheck, IconChevronRight, IconCross } from "@/components/ui/icons";
import { cx } from "@/lib/cx";
import { BookletLink, MeaningBox, RememberBox, SituationBox, WhyEachOption, scenarioSpeech } from "./scenario-parts";

const LETTERS = ["A", "B", "C"];

/**
 * Works through the scenarios for one values area, one at a time. Rendered in
 * the browser only (see loaders), so saved progress is read on first render.
 * The URL hash names the current scenario, so a scenario can be linked to.
 */
export function ScenarioPlayer({ area }: { area: ValuesAreaId }) {
  const list = SCENARIOS_BY_AREA[area];
  const meta = AREA_BY_ID.get(area)!;
  const [values, setValues] = useState<ValuesState>(() => {
    migrateStorage();
    return loadValues();
  });
  const [idx, setIdx] = useState(() => {
    const hash = typeof window !== "undefined" ? decodeURIComponent(window.location.hash.slice(1)) : "";
    const fromHash = list.findIndex((s) => s.id === hash);
    return fromHash >= 0 ? fromHash : nextScenarioIndex(values, area);
  });
  const [chosen, setChosen] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const [finished, setFinished] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  const s = list[idx];
  const answered = chosen !== null;
  const right = chosen === s.answer;
  const progress = areaProgress(values, area);
  const areaIndex = VALUES_AREAS.findIndex((a) => a.id === area);
  const nextArea = VALUES_AREAS[areaIndex + 1];

  function go(to: number) {
    moved.current = true;
    setChosen(null);
    setHint(false);
    setFinished(false);
    setIdx(to);
    window.history.replaceState(null, "", `#${list[to].id}`);
    window.scrollTo({ top: 0 });
  }

  function choose(i: number) {
    if (answered) return;
    setChosen(i);
    const next = recordScenario(values, s.id, i === s.answer, Date.now());
    if (next !== values) {
      setValues(next);
      saveValues(next);
    }
    requestAnimationFrame(() => feedbackRef.current?.focus());
  }

  function next() {
    if (idx < list.length - 1) go(idx + 1);
    else {
      moved.current = true;
      setFinished(true);
      window.scrollTo({ top: 0 });
    }
  }

  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    headingRef.current?.focus({ preventScroll: true });
  }, [idx, finished]);

  // A, B or C answers; Enter moves on once answered.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (finished || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && t.closest("input[type=text], textarea, select")) return;
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
    <main id="main" className="mx-auto w-full max-w-[1100px] px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      <Link href="/practice/values/" className="inline-flex items-center gap-1.5 text-small font-bold text-copy hover:text-ink">
        <IconArrowLeft size={16} /> Values mastery
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <p className="text-small font-bold text-muted">
            Area {areaIndex + 1} of {VALUES_AREAS.length}, booklet page {meta.pages}
          </p>
          <p className="mt-1 font-display text-title font-bold tracking-[-0.015em] text-ink sm:text-heading">{meta.title}</p>
        </div>
        <div role="img" className="flex gap-1" aria-label={`${progress.done} of ${progress.total} scenarios done`}>
          {list.map((sc, i) => {
            const rec = values.scenarios[sc.id];
            return (
              <span
                key={sc.id}
                className={cx(
                  "h-1.5 w-5 rounded-full sm:w-7",
                  i === idx && !finished ? "bg-ink" : rec ? (rec.first ? "bg-pass" : "bg-wattle") : "bg-line",
                )}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
        {finished ? (
          <AreaDone
            headingRef={headingRef}
            title={meta.title}
            rule={meta.ruleOfThumb}
            firstTryRight={progress.firstTryRight}
            total={progress.total}
            nextArea={nextArea ? { id: nextArea.id, title: nextArea.title } : null}
            onRestart={() => go(0)}
          />
        ) : (
          <article key={s.id} aria-labelledby="scenario-title" className="anim-q-forward min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <p className="text-small font-bold text-muted">
                Scenario {idx + 1} of {list.length}
              </p>
              <span className="rounded-full bg-euc-tint px-2.5 py-0.5 text-caption font-bold text-euc-deep dark:text-euc">{s.value}</span>
            </div>
            <h1
              id="scenario-title"
              ref={headingRef}
              tabIndex={-1}
              className="mt-1.5 font-display text-heading font-bold tracking-[-0.02em] text-ink sm:text-[2.25rem] sm:leading-tight"
            >
              {s.title}
            </h1>

            <div className="mt-6">
              <SituationBox text={s.situation} />
            </div>

            <h2 id={`q-${s.id}`} className="mt-8 font-text text-title font-bold leading-snug text-ink">
              {s.question}
            </h2>
            <div className="mt-4">
              <AnswerOptions
                name={`sc-${s.id}`}
                legendId={`q-${s.id}`}
                options={s.options.map((o) => o.text)}
                value={chosen}
                onChange={choose}
                reveal={answered ? { answerIndex: s.answer, chosen } : null}
              />
            </div>
            {!answered && (
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <ListenButton text={scenarioSpeech(s)} />
                {!hint && (
                  <Button variant="quiet" onClick={() => setHint(true)} aria-controls={`hint-${s.id}`} aria-expanded={hint}>
                    Show a hint
                  </Button>
                )}
                <p className="hidden text-small text-muted sm:block">Keyboard: press A, B or C.</p>
              </div>
            )}
            {!answered && hint && (
              <div id={`hint-${s.id}`} className="anim-rise mt-4">
                <MeaningBox scenario={s} />
              </div>
            )}

            <div ref={feedbackRef} tabIndex={-1} aria-live="polite" className="mt-6 outline-none">
              {answered && (
                <div className="anim-rise space-y-5">
                  <p className={cx("flex items-center gap-2 font-display text-title font-bold", right ? "text-pass" : "text-fail")}>
                    {right ? <IconCheck size={24} strokeWidth={2.6} /> : <IconCross size={24} strokeWidth={2.6} />}
                    {right ? "Right" : `Not quite. The answer is ${LETTERS[s.answer]}.`}
                  </p>
                  <MeaningBox scenario={s} />
                  <WhyEachOption scenario={s} chosen={chosen} />
                  <RememberBox text={s.takeaway} />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <BookletLink page={s.page} />
                    <Button size="lg" onClick={next}>
                      {idx < list.length - 1 ? "Next scenario" : "Finish this area"} <IconChevronRight size={18} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </article>
        )}

        <aside aria-label="Scenarios in this area" className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-lg border border-line bg-surface p-4 shadow-1">
            <p className="text-small font-bold text-ink">In this area</p>
            <ol className="mt-3 space-y-1">
              {list.map((sc, i) => {
                const rec = values.scenarios[sc.id];
                const current = i === idx && !finished;
                return (
                  <li key={sc.id}>
                    <button
                      type="button"
                      onClick={() => go(i)}
                      aria-current={current ? "step" : undefined}
                      className={cx(
                        "flex w-full items-center gap-2.5 rounded-sm px-2 py-2 text-left text-small transition-colors",
                        current ? "bg-euc-tint font-bold text-ink" : "text-copy hover:bg-sunk hover:text-ink",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cx(
                          "grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                          rec ? (rec.first ? "bg-pass text-on-euc" : "bg-wattle text-on-wattle") : "border border-line-strong text-muted",
                        )}
                      >
                        {rec ? rec.first ? <IconCheck size={12} strokeWidth={3} /> : "!" : i + 1}
                      </span>
                      <span className="min-w-0 flex-1">{sc.title}</span>
                      <span className="sr-only">
                        {rec ? (rec.first ? ", right first time" : ", missed first time") : ", not tried yet"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-caption text-muted" aria-hidden="true">
              <span className="inline-flex items-center gap-1.5">
                <span className="grid size-4 place-items-center rounded-full bg-pass text-on-euc">
                  <IconCheck size={10} strokeWidth={3} />
                </span>
                Right first time
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="grid size-4 place-items-center rounded-full bg-wattle text-[10px] font-bold text-on-wattle">!</span>
                Missed first time
              </span>
            </p>
            <p className="mt-4 border-t border-line pt-3 text-caption text-muted">
              <span className="font-bold text-ink">Rule of thumb: </span>
              {meta.ruleOfThumb}
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function AreaDone({
  headingRef,
  title,
  rule,
  firstTryRight,
  total,
  nextArea,
  onRestart,
}: {
  headingRef: React.Ref<HTMLHeadingElement>;
  title: string;
  rule: string;
  firstTryRight: number;
  total: number;
  nextArea: { id: string; title: string } | null;
  onRestart: () => void;
}) {
  return (
    <section className="anim-rise min-w-0">
      <p className="text-small font-bold text-muted">Area finished</p>
      <h1 ref={headingRef} tabIndex={-1} className="mt-1.5 font-display text-heading font-bold tracking-[-0.02em] text-ink sm:text-[2.25rem]">
        {title}
      </h1>
      <p className="mt-4 text-lead">
        You got <strong className="text-ink">{firstTryRight} of {total}</strong> right the first time.
        {firstTryRight < total ? " The ones marked with ! are worth another read." : " Every one, first time."}
      </p>
      <div className="mt-6">
        <RememberBox text={rule} />
      </div>
      {nextArea && (
        <p className="mt-8 text-small text-muted">
          Next: <span className="font-bold text-ink">{nextArea.title}</span>
        </p>
      )}
      <div className={cx("flex flex-wrap gap-3", nextArea ? "mt-3" : "mt-8")}>
        {nextArea ? (
          <ButtonLink href={`/practice/values/${nextArea.id}/`} size="lg">
            Start the next area
          </ButtonLink>
        ) : (
          <ButtonLink href="/practice/values/gate/" size="lg">
            Try the values gate
          </ButtonLink>
        )}
        <Button variant="secondary" size="lg" onClick={onRestart}>
          Go through this area again
        </Button>
      </div>
    </section>
  );
}
