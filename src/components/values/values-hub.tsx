"use client";

import Link from "next/link";
import { useState } from "react";
import { SCENARIOS, VALUES_AREAS } from "@/data/values-scenarios";
import { BANK_FACTS } from "@/lib/marketing-data";
import { formatWhen } from "@/lib/progress";
import { migrateStorage } from "@/lib/storage/migrate";
import { GATE, areaProgress, loadValues, overallProgress } from "@/lib/values-progress";
import { ButtonLink } from "@/components/ui/button";
import { IconCheck, IconChevronRight } from "@/components/ui/icons";
import { PageIntro } from "@/components/practice/ui";
import { cx } from "@/lib/cx";

/** The values mastery hub. Rendered in the browser only (see loaders). */
export function ValuesHub() {
  const [values] = useState(() => {
    migrateStorage();
    return loadValues();
  });
  const overall = overallProgress(values);
  const g = values.gate;
  const pct = Math.round((overall.done / overall.total) * 100);

  return (
    <main id="main" className="mx-auto w-full max-w-[1100px] px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
      <PageIntro title="Values mastery">
        <p>
          Every test has 5 values questions, and one wrong answer means the test is not a pass. Learn each rule with a short
          scenario, then prove it at the values gate.
        </p>
      </PageIntro>

      <ol className="anim-rise mt-8 grid gap-3 sm:grid-cols-3" style={{ animationDelay: "60ms" }}>
        <Step n={1} title="Learn" body={`${SCENARIOS.length} scenarios, one for each rule in Part 4 of the booklet.`} />
        <Step n={2} title="Practise" body="The values check: 10 quick questions with the reason after each." />
        <Step n={3} title="Prove it" body={`The values gate: ${GATE.length} in a row, from all five areas.`} />
      </ol>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <section aria-labelledby="learn-progress" className="rounded-lg border border-line bg-surface p-5 shadow-1 sm:p-6">
          <h2 id="learn-progress" className="text-small font-bold text-muted">
            Scenarios done
          </h2>
          <p className="mt-1 font-display text-heading font-bold text-ink">
            {overall.done} of {overall.total}
          </p>
          <div className="mt-3 h-2.5 rounded-[4px] bg-sunk" aria-hidden="true">
            <div className="anim-grow-x h-full rounded-r-[4px] bg-euc" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-small text-copy">
            {overall.done === 0
              ? "Start with the first area below. Each scenario is short."
              : `${overall.firstTryRight} right the first time.`}
          </p>
        </section>

        <section
          aria-labelledby="gate-status"
          className={cx(
            "flex flex-col rounded-lg border p-5 shadow-1 sm:p-6",
            g.cleared ? "border-pass bg-pass-tint" : "border-wattle-edge/50 bg-wattle-tint",
          )}
        >
          <h2 id="gate-status" className="text-small font-bold text-muted">
            Values gate
          </h2>
          <p className="mt-1 flex items-center gap-2 font-display text-heading font-bold text-ink">
            {g.cleared && <IconCheck size={26} strokeWidth={2.6} className="text-pass" />}
            {g.cleared ? "Cleared" : g.runs ? `Best run: ${g.best} of ${GATE.length}` : "Not tried yet"}
          </p>
          <p className="mt-1 text-small text-copy">
            {g.cleared && g.clearedAt ? `Cleared on ${formatWhen(g.clearedAt)}.` : `Answer ${GATE.length} values questions in a row.`}
          </p>
          <div className="mt-auto pt-4">
            <ButtonLink href="/practice/values/gate/" variant={g.cleared ? "secondary" : "primary"}>
              {g.cleared ? "Run the gate again" : "Go to the values gate"}
            </ButtonLink>
          </div>
        </section>
      </div>

      <section aria-labelledby="areas-title" className="mt-14">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="areas-title" className="font-display text-heading font-bold tracking-[-0.02em]">
            The five values areas
          </h2>
          <Link href="/practice/values-check/" className="inline-flex items-center gap-1 font-bold text-euc-deep underline-offset-4 hover:underline dark:text-euc">
            Quick values check <IconChevronRight size={18} />
          </Link>
        </div>
        <ol className="mt-6 space-y-4">
          {VALUES_AREAS.map((a, i) => {
            const p = areaProgress(values, a.id);
            const done = p.done === p.total;
            return (
              <li key={a.id}>
                <Link
                  href={`/practice/values/${a.id}/`}
                  className="group grid gap-4 rounded-lg border border-line bg-surface p-5 shadow-1 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-2 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:p-6"
                >
                  <span
                    aria-hidden="true"
                    className={cx(
                      "grid size-11 place-items-center rounded-full font-display text-lead font-bold",
                      done ? "bg-pass text-on-euc" : "bg-wattle-tint text-wattle-text",
                    )}
                  >
                    {done ? <IconCheck size={22} strokeWidth={2.6} /> : i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-title font-bold text-ink">{a.title}</span>
                    <span className="mt-1 block text-small text-copy">{a.summary}</span>
                    <span className="mt-2 block text-caption text-muted">
                      Booklet page {a.pages}. {p.total} scenarios.
                      {p.done > 0 && ` ${p.done} done, ${p.firstTryRight} right first time.`}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-small font-bold text-euc-deep dark:text-euc">
                    {done ? "Review" : p.done ? "Continue" : "Start"}
                    <IconChevronRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <p className="mt-10 max-w-[70ch] text-small text-muted">
        Every scenario is written from Part 4 of the official booklet and links to its page. Together they cover all{" "}
        {BANK_FACTS.valuesQuestions} values questions in our practice bank. Free while the site is in early access.
      </p>
    </main>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="flex gap-3 rounded-md border border-line bg-surface px-4 py-3.5">
      <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-caption font-bold text-paper">
        {n}
      </span>
      <span>
        <span className="block font-bold text-ink">{title}</span>
        <span className="block text-small text-copy">{body}</span>
      </span>
    </li>
  );
}
