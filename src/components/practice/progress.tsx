"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, CATEGORY_BY_ID, PARTS, QUESTIONS } from "@/lib/bank";
import {
  categoryRows,
  drillSettings,
  groupByPart,
  heatCells,
  partRows,
  repeatMisses,
  trendSeries,
  valuesAccuracy,
} from "@/lib/progress";
import { loadSettings, saveSettings } from "@/lib/settings";
import { loadHistory, loadStats, summariseHistory } from "@/lib/stats";
import { migrateStorage } from "@/lib/storage/migrate";
import { clearProgress } from "@/lib/user-data";
import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { IconCheck } from "@/components/ui/icons";
import { Explanation } from "@/components/exam/explanation";
import { Heatmap } from "./heatmap";
import { HistoryTable } from "./history-table";
import { TrendChart } from "./trend-chart";
import { Card, CardTitle, EmptyState, MeterRow, PageIntro, PartDot, PassMarkNote, StatGrid, StatTile } from "./ui";

const ALL_CATS = CATEGORIES.map((c) => c.id);
const TOPICS_SHOWN = 8;

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "areas", label: "By topic" },
  { id: "questions", label: "By question" },
  { id: "history", label: "Test history" },
];

/** Rendered in the browser only (see loaders). */
export function Progress() {
  const router = useRouter();
  const [data, setData] = useState(() => {
    migrateStorage();
    return { now: Date.now(), history: loadHistory(), stats: loadStats() };
  });
  const [confirmClear, setConfirmClear] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const { now, history, stats } = data;

  const summary = summariseHistory(history);
  const rows = categoryRows(history, CATEGORY_BY_ID);
  const parts = partRows(rows, PARTS);
  const values = valuesAccuracy(history);
  const cells = heatCells(stats, QUESTIONS);
  const groups = groupByPart(cells, PARTS);
  const misses = repeatMisses(cells);
  const weakRows = rows.filter((r) => r.p < 75).slice(0, 5);
  const passes = history.filter((h) => h.passed).length;

  function startDrill() {
    const s = drillSettings(rows, QUESTIONS, loadSettings(ALL_CATS));
    if (!s) return;
    saveSettings(s);
    router.push("/practice/test/");
  }

  if (!summary.n) {
    return (
      <main id="main" className="mx-auto w-full max-w-[1100px] px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
        <PageIntro title="Your progress" />
        <Card className="mt-10">
          <EmptyState
            title="No results yet"
            action={
              <ButtonLink href="/practice/test/" size="lg">
                Take a practice test
              </ButtonLink>
            }
          >
            After a test or two, this page shows your score trend, how you do in each part of the booklet, and the
            questions that keep catching you out.
          </EmptyState>
        </Card>
      </main>
    );
  }

  return (
    <main id="main" className="mx-auto w-full max-w-[1100px] px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
      <PageIntro title="Your progress">
        <p>Every test you have taken on this device, pooled together.</p>
      </PageIntro>

      <nav aria-label="On this page" className="mt-8">
        <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {SECTIONS.map((s) => (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                className="inline-flex min-h-10 items-center rounded-full border border-line-strong bg-surface px-4 text-small font-bold text-ink hover:border-ink"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="overview" aria-labelledby="overview-title" className="mt-10 scroll-mt-6">
        <h2 id="overview-title" className="sr-only">
          Overview
        </h2>
        <StatGrid label="Your results">
          <StatTile label="Average score" value={`${summary.avg}%`} />
          <StatTile label="Best score" value={`${summary.best}%`} />
          <StatTile label="Passed" value={`${summary.passRate}%`} note={`${passes} of ${summary.n} tests`} />
          <StatTile
            label="Values questions right"
            value={values.p === null ? "None yet" : `${values.p}%`}
            note={values.total ? `${values.correct} of ${values.total}` : undefined}
            accent
          />
        </StatGrid>

        <Card className="mt-6" aria-labelledby="trend-title">
          <CardTitle id="trend-title">Score in each test</CardTitle>
          <p className="mt-1 text-small text-muted">
            Your last {Math.min(20, history.length)} {history.length === 1 ? "test" : "tests"}, oldest on the left.
          </p>
          <div className="mt-6">
            <TrendChart points={trendSeries(history)} now={now} />
          </div>
        </Card>
      </section>

      <section id="areas" aria-labelledby="areas-title" className="mt-14 scroll-mt-6">
        <h2 id="areas-title" className="font-display text-heading font-bold tracking-[-0.02em]">
          By topic
        </h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card aria-labelledby="parts-title">
            <CardTitle id="parts-title">Each part of the booklet</CardTitle>
            <ul className="mt-3 divide-y divide-line">
              {parts.map((p, i) => (
                <MeterRow key={p.id} label={p.title} sub={`${p.c} of ${p.n} correct`} value={p.p} part={p.id} delay={i * 90} />
              ))}
            </ul>
            <PassMarkNote />
          </Card>

          <Card aria-labelledby="next-title" className="flex flex-col">
            <CardTitle id="next-title">Suggested next test</CardTitle>
            {weakRows.length ? (
              <>
                <p className="mt-2 text-copy">
                  You are under 75% in {weakRows.length} {weakRows.length === 1 ? "topic" : "topics"}. A short test on
                  {weakRows.length === 1 ? " it" : " them"} is the quickest way to close the gap.
                </p>
                <ul className="mt-4 space-y-2">
                  {weakRows.map((r) => (
                    <li key={r.id} className="flex items-center gap-2 text-small font-bold text-ink">
                      <PartDot part={r.part} />
                      {r.label}
                      <span className="ml-auto font-normal tabular-nums text-muted">{r.p}%</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  <Button onClick={startDrill}>Set up a test on these</Button>
                  <p className="mt-2 text-caption text-muted">This changes your test settings. You can switch back at any time.</p>
                </div>
              </>
            ) : (
              <p className="mt-2 text-copy">
                Every topic you have been tested on is at 75% or above. Keep taking full practice tests in the real
                format.
              </p>
            )}
          </Card>
        </div>

        <Card className="mt-6" aria-labelledby="cats-title">
          <CardTitle id="cats-title">Every topic, weakest first</CardTitle>
          <ul id="all-topics" className="mt-3 divide-y divide-line">
            {(showAllTopics ? rows : rows.slice(0, TOPICS_SHOWN)).map((r, i) => (
              <MeterRow
                key={r.id}
                label={r.label}
                sub={`${r.partTitle}, ${r.c} of ${r.n} correct`}
                value={r.p}
                part={r.part}
                delay={Math.min(i, 10) * 50}
              />
            ))}
          </ul>
          {rows.length > TOPICS_SHOWN && (
            <Button
              variant="secondary"
              className="mt-4"
              aria-expanded={showAllTopics}
              aria-controls="all-topics"
              onClick={() => setShowAllTopics((v) => !v)}
            >
              {showAllTopics ? "Show fewer topics" : `Show all ${rows.length} topics`}
            </Button>
          )}
          <PassMarkNote />
        </Card>
      </section>

      <section id="questions" aria-labelledby="questions-title" className="mt-14 scroll-mt-6">
        <h2 id="questions-title" className="font-display text-heading font-bold tracking-[-0.02em]">
          By question
        </h2>
        <Card className="mt-6" aria-labelledby="heat-title">
          <CardTitle id="heat-title">Every question you have answered</CardTitle>
          <p className="mt-1 max-w-[62ch] text-small text-muted">
            {cells.length} of {QUESTIONS.length} questions so far. Select a square to read the question and its answer.
          </p>
          <div className="mt-6">
            <Heatmap groups={groups} />
          </div>
        </Card>

        {misses.length > 0 && (
          <Card className="mt-6" aria-labelledby="misses-title">
            <CardTitle id="misses-title">Keeps catching you out</CardTitle>
            <p className="mt-1 text-small text-muted">Missed at least twice. Read these in the booklet, not just in tests.</p>
            <ol className="mt-5 space-y-5">
              {misses.map((m) => (
                <li key={m.q.id} className="border-t border-line pt-5 first:border-t-0 first:pt-0">
                  <p className="flex flex-wrap items-center gap-x-2 text-caption font-bold text-muted">
                    <PartDot part={m.q.part} />
                    {m.q.categoryLabel}
                    <span className="rounded-sm bg-fail-tint px-1.5 py-0.5 text-fail">
                      Missed {m.wrong} of {m.seen}
                    </span>
                  </p>
                  <p className="mt-2 font-bold text-ink">{m.q.question}</p>
                  <p className="mt-2 flex items-start gap-2 text-euc-deep dark:text-euc">
                    <IconCheck size={18} className="mt-1 shrink-0" strokeWidth={2.4} />
                    <span>
                      <span className="font-bold">Correct: </span>
                      {m.q.answer}
                    </span>
                  </p>
                  <Explanation className="mt-3" text={m.q.explanation} source={m.q.source} qid={m.q.id} />
                </li>
              ))}
            </ol>
          </Card>
        )}
      </section>

      <section id="history" aria-labelledby="history-title" className="mt-14 scroll-mt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="history-title" className="font-display text-heading font-bold tracking-[-0.02em]">
            Test history
          </h2>
          <Button variant="danger" onClick={() => setConfirmClear(true)}>
            Delete history
          </Button>
        </div>
        <p className="mt-2 text-small text-muted">Stored in this browser only. Clearing your browser&apos;s site data deletes it.</p>
        <Card className="mt-5">
          <HistoryTable entries={history.slice().reverse()} caption="All your tests, newest first" now={now} />
        </Card>
      </section>

      <Dialog open={confirmClear} onClose={() => setConfirmClear(false)} title={`Delete all ${history.length} tests?`}>
        <p>
          This deletes your test history and the record of which questions you have missed, from this browser. It
          can&apos;t be undone. Your settings stay as they are.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setConfirmClear(false)}>
            Keep my history
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              clearProgress();
              setConfirmClear(false);
              setData({ now: Date.now(), history: [], stats: {} });
            }}
          >
            Delete history
          </Button>
        </div>
      </Dialog>
    </main>
  );
}
