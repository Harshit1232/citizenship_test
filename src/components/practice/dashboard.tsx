"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORY_BY_ID, QUESTION_BY_ID, QUESTIONS, RULES, VALUES_QUESTIONS } from "@/lib/bank";
import { answeredCount, isExpired, loadActive } from "@/lib/exam/session";
import { categoryRows, formatWhen, weakAndStrong } from "@/lib/progress";
import { loadHistory, summariseHistory } from "@/lib/stats";
import { migrateStorage } from "@/lib/storage/migrate";
import { ButtonLink } from "@/components/ui/button";
import { IconChevronRight, IconClock } from "@/components/ui/icons";
import { cx } from "@/lib/cx";
import { HistoryTable } from "./history-table";
import { Card, CardTitle, EmptyState, MeterRow, PageIntro, PassMarkNote, StatGrid, StatTile } from "./ui";

/** Rendered in the browser only (see loaders), so storage is read during the first render. */
export function Dashboard() {
  const [data] = useState(() => {
    migrateStorage();
    const now = Date.now();
    const history = loadHistory();
    return { now, history, active: loadActive(QUESTION_BY_ID) };
  });
  const { now, history, active } = data;
  const summary = summariseHistory(history);
  const rows = categoryRows(history, CATEGORY_BY_ID);
  const areas = weakAndStrong(rows);
  const last5 = history.slice(-5);
  const lastPasses = last5.filter((h) => h.passed).length;

  return (
    <main id="main" className="mx-auto w-full max-w-[1100px] px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
      <PageIntro title="Your practice">
        {summary.n === 0 ? (
          <p>No tests yet. Take one and this page fills in with your scores, your weakest areas and your pass rate.</p>
        ) : (
          <p>
            You passed <strong className="text-ink">{lastPasses} of your last {last5.length}</strong>{" "}
            {last5.length === 1 ? "test" : "tests"}. Your last test was on {formatWhen(history[history.length - 1].at, now)}.
          </p>
        )}
      </PageIntro>

      {active && <ResumeCard answered={answeredCount(active.picks)} total={active.paper.length} deadline={active.deadline} now={now} />}

      <section aria-labelledby="start-title" className="mt-12">
        <h2 id="start-title" className="sr-only">
          Start practising
        </h2>
        <ul className="grid gap-4 md:grid-cols-[1.35fr_1fr_1fr]">
          <StartCard
            href="/practice/test/"
            title="Practice test"
            body={`${RULES.questionsPerTest} questions in ${RULES.timeLimitMinutes} minutes, marked the way the real test is marked.`}
            meta={`${RULES.timeLimitMinutes} min`}
            primary
          />
          <StartCard
            href="/practice/values-check/"
            title="Values check"
            body="10 Australian values questions, with the reason after each answer."
            meta={`${VALUES_QUESTIONS.length} in the bank`}
          />
          <StartCard
            href="/practice/study/"
            title="Study"
            body="Read the questions with their answers. Nothing is scored."
            meta={`${QUESTIONS.length} questions`}
          />
        </ul>
      </section>

      {summary.n === 0 ? (
        <Card className="mt-10">
          <EmptyState
            title="Nothing to measure yet"
            action={
              <ButtonLink href="/practice/test/" size="lg">
                Take your first test
              </ButtonLink>
            }
          >
            After one test, this page shows your average score, your pass rate, and the areas of the booklet to
            read again.
          </EmptyState>
        </Card>
      ) : (
        <>
          <section aria-labelledby="doing-title" className="mt-14">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="doing-title" className="font-display text-heading font-bold tracking-[-0.02em]">
                How you&apos;re doing
              </h2>
              <Link href="/practice/progress/" className="inline-flex items-center gap-1 font-bold text-euc-deep underline-offset-4 hover:underline dark:text-euc">
                All your progress <IconChevronRight size={18} />
              </Link>
            </div>
            <div className="mt-6">
              <StatGrid label="Your results so far">
                <StatTile label="Tests taken" value={String(summary.n)} />
                <StatTile label="Average score" value={`${summary.avg}%`} />
                <StatTile label="Best score" value={`${summary.best}%`} />
                <StatTile
                  label="Passed"
                  value={`${summary.passRate}%`}
                  note={`${history.filter((h) => h.passed).length} of ${summary.n} tests`}
                  accent
                />
              </StatGrid>
            </div>
          </section>

          {rows.length > 0 && (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <Card aria-labelledby="weak-title">
                <CardTitle id="weak-title">Weakest areas</CardTitle>
                <p className="mt-1 text-small text-muted">Read these parts of the booklet again.</p>
                <ul className="mt-3 divide-y divide-line">
                  {areas.weak.map((r, i) => (
                    <MeterRow key={r.id} label={r.label} sub={`${r.c} of ${r.n} correct`} value={r.p} part={r.part} delay={i * 90} />
                  ))}
                </ul>
                {!areas.stable && (
                  <p className="mt-3 text-caption text-muted">Based on only a few answers so far. More tests give a steadier picture.</p>
                )}
                <PassMarkNote />
              </Card>
              <Card aria-labelledby="strong-title">
                <CardTitle id="strong-title">Strongest areas</CardTitle>
                <p className="mt-1 text-small text-muted">Keep these fresh with the odd study session.</p>
                {areas.strong.length ? (
                  <ul className="mt-3 divide-y divide-line">
                    {areas.strong.map((r, i) => (
                      <MeterRow key={r.id} label={r.label} sub={`${r.c} of ${r.n} correct`} value={r.p} part={r.part} delay={i * 90} />
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-copy">Take another test to see these.</p>
                )}
                <PassMarkNote />
              </Card>
            </div>
          )}

          <Card className="mt-6" aria-labelledby="recent-title">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <CardTitle id="recent-title">Recent tests</CardTitle>
              {history.length > 5 && (
                <Link href="/practice/progress/#history" className="text-small font-bold text-euc-deep underline-offset-4 hover:underline dark:text-euc">
                  All {history.length} tests
                </Link>
              )}
            </div>
            <div className="mt-4">
              <HistoryTable entries={last5.slice().reverse()} caption="Your last five tests, newest first" now={now} />
            </div>
          </Card>
        </>
      )}
    </main>
  );
}

function ResumeCard({ answered, total, deadline, now }: { answered: number; total: number; deadline: number; now: number }) {
  const expired = isExpired({ deadline }, now);
  const minutes = deadline ? Math.max(0, Math.round((deadline - now) / 60000)) : null;
  return (
    <div className="anim-rise mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 rounded-lg border border-wattle-edge/50 bg-wattle-tint px-5 py-5 sm:px-7">
      <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-surface text-wattle-text">
        <IconClock size={22} />
      </span>
      <div className="min-w-[12rem] flex-1">
        <p className="font-bold text-ink">{expired ? "Time ran out on your saved test" : "You have a test in progress"}</p>
        <p className="text-small text-copy">
          {answered} of {total} answered.{" "}
          {expired ? "Open it to see the result." : minutes !== null ? `About ${minutes} minutes left.` : "Untimed."}
        </p>
      </div>
      <ButtonLink href="/practice/test/">{expired ? "See the result" : "Resume test"}</ButtonLink>
    </div>
  );
}

function StartCard({
  href,
  title,
  body,
  meta,
  primary,
}: {
  href: string;
  title: string;
  body: string;
  meta: string;
  primary?: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className={cx(
          "group relative flex h-full min-h-44 flex-col overflow-hidden rounded-lg border p-6 shadow-1 transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-2",
          primary ? "border-transparent bg-band text-band-body" : "border-line bg-surface text-copy hover:border-line-strong",
        )}
      >
        {primary && <MiniPaper />}
        <span className={cx("relative text-caption font-bold", primary ? "text-band-gold" : "text-muted")}>{meta}</span>
        <span className={cx("relative mt-2 font-display text-title font-bold", primary ? "text-band-ink" : "text-ink")}>{title}</span>
        <span className="relative mt-2 max-w-[34ch] text-small">{body}</span>
        <span
          className={cx(
            "relative mt-auto inline-flex items-center gap-1 pt-5 text-small font-bold",
            primary ? "text-band-gold" : "text-euc-deep dark:text-euc",
          )}
        >
          {primary ? "Start a test" : "Open"}
          <IconChevronRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </Link>
    </li>
  );
}

/** A faint 20-tile paper behind the primary card, five tiles picked out in gold. */
function MiniPaper() {
  const values = new Set([2, 6, 10, 14, 17]);
  return (
    <span aria-hidden="true" className="pointer-events-none absolute -right-6 -top-4 grid grid-cols-5 gap-1.5 opacity-35 transition-transform duration-500 ease-out group-hover:-translate-x-1 group-hover:translate-y-1">
      {Array.from({ length: 20 }, (_, i) => (
        <span key={i} className={cx("size-5 rounded-[5px] border", values.has(i) ? "border-band-gold bg-band-gold/40" : "border-band-muted/60")} />
      ))}
    </span>
  );
}

