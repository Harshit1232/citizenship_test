"use client";

import { AnswerOptions } from "@/components/exam/answer-options";
import { ExamTimer } from "@/components/exam/exam-timer";
import { Explanation } from "@/components/exam/explanation";
import { QuestionList, StatusLegend } from "@/components/exam/question-map";
import { Button } from "@/components/ui/button";
import { WattleMark } from "@/components/brand/wattle-mark";
import { SAMPLE_QUESTION } from "@/lib/marketing-data";

const COLOURS: Array<[string, string, string]> = [
  ["paper", "--paper", "Page background"],
  ["surface", "--surface", "Cards, answer options"],
  ["sunk", "--sunk", "Wells and tracks"],
  ["ink", "--ink", "Headings, questions"],
  ["body", "--body", "Body copy (class: text-copy)"],
  ["muted", "--muted", "Secondary text"],
  ["line", "--line", "Dividers"],
  ["line-strong", "--line-strong", "Control borders (3:1)"],
  ["euc", "--euc", "Primary action, pass"],
  ["euc-deep", "--euc-deep", "Hover, emphasis"],
  ["euc-tint", "--euc-tint", "Selected, correct background"],
  ["wattle", "--wattle", "Values accent (fill only)"],
  ["wattle-text", "--wattle-text", "Values text"],
  ["fail", "--fail", "Wrong, not a pass"],
  ["fail-tint", "--fail-tint", "Wrong background"],
  ["band", "--band", "Dark green band"],
];

const PARTS: Array<[string, string]> = [
  ["--part1", "Part 1: Australia and its people (ochre)"],
  ["--part2", "Part 2: Democratic beliefs (ocean)"],
  ["--part3", "Part 3: Government and the law (gum)"],
  ["--part4", "Part 4: Australian values (wattle)"],
  ["--glossary", "Glossary (slate)"],
];

const TYPE: Array<[string, string, string]> = [
  ["text-display", "Display", "Bricolage Grotesque, fluid 42–84px"],
  ["text-display-sm", "Display small", "40px"],
  ["text-heading", "Heading", "30px"],
  ["text-title", "Title", "24px, also question text"],
  ["text-lead", "Lead", "20px, answer options"],
  ["text-body", "Body", "17px, Atkinson Hyperlegible Next"],
  ["text-small", "Small", "15px"],
  ["text-caption", "Caption", "13px, labels only"],
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-12">
      <h2 className="font-display text-heading font-bold tracking-[-0.02em]">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function DesignShowcase() {
  return (
    <main id="main" className="mx-auto max-w-[1100px] px-5 pb-24 pt-12 sm:px-8">
      <div className="flex items-center gap-4">
        <WattleMark size={56} />
        <div>
          <h1 className="font-display text-display-sm font-bold tracking-[-0.03em]">Design system</h1>
          <p className="text-copy">Tokens and components. Switch the theme in the header to see dark mode.</p>
        </div>
      </div>

      <Section title="Colour">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {COLOURS.map(([name, v, use]) => (
            <li key={name} className="overflow-hidden rounded-md border border-line bg-surface">
              <div className="h-16 border-b border-line" style={{ background: `var(${v})` }} />
              <div className="px-3 py-2.5">
                <p className="text-small font-bold text-ink">{name}</p>
                <p className="text-caption text-muted">{use}</p>
              </div>
            </li>
          ))}
        </ul>
        <h3 className="mt-10 font-display text-title font-bold">Booklet parts</h3>
        <ul className="mt-4 space-y-2">
          {PARTS.map(([v, label]) => (
            <li key={v} className="flex items-center gap-3">
              <span className="h-3 w-24 rounded-full" style={{ background: `var(${v})` }} />
              <span className="text-small font-bold" style={{ color: `var(${v})` }}>
                {label}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Type scale">
        <ul className="space-y-5">
          {TYPE.map(([cls, name, spec]) => (
            <li key={cls} className="grid gap-1 sm:grid-cols-[12rem_1fr] sm:items-baseline">
              <span className="text-caption text-muted">
                {name}: {spec}
              </span>
              <span
                className={`${cls} ${cls.startsWith("text-display") || cls === "text-heading" ? "font-display font-bold tracking-[-0.03em] text-ink" : "text-ink"}`}
              >
                Pass the test first time
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Radius and elevation">
        <div className="flex flex-wrap gap-5">
          {[
            ["rounded-sm shadow-1", "8px, level 1"],
            ["rounded-md shadow-2", "14px, level 2"],
            ["rounded-lg shadow-3", "28px, level 3"],
          ].map(([cls, label]) => (
            <div key={label} className={`grid h-28 w-48 place-items-center border border-line bg-surface text-small text-copy ${cls}`}>
              {label}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg">Primary</Button>
          <Button size="lg" variant="secondary">
            Secondary
          </Button>
          <Button size="lg" variant="quiet">
            Quiet
          </Button>
          <Button size="lg" variant="danger">
            Danger
          </Button>
          <Button size="lg" disabled>
            Disabled
          </Button>
        </div>
        <div className="mt-5 inline-flex rounded-lg bg-band p-5">
          <Button size="lg" variant="gold">
            Gold, on the green band
          </Button>
        </div>
      </Section>

      <Section title="Answer options">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p id="ds-q1" className="mb-3 text-small font-bold text-muted">
              Selected (during the test)
            </p>
            <AnswerOptions name="ds-a" legendId="ds-q1" options={SAMPLE_QUESTION.options} value={2} onChange={() => {}} />
          </div>
          <div>
            <p id="ds-q2" className="mb-3 text-small font-bold text-muted">
              Revealed (values check feedback)
            </p>
            <AnswerOptions
              name="ds-b"
              legendId="ds-q2"
              options={SAMPLE_QUESTION.options}
              value={1}
              reveal={{ answerIndex: 2, chosen: 1 }}
            />
          </div>
        </div>
        <Explanation className="mt-8 max-w-[60ch]" text={SAMPLE_QUESTION.explanation} source={SAMPLE_QUESTION.source} qid={SAMPLE_QUESTION.id} />
      </Section>

      <Section title="Exam controls">
        <div className="grid gap-10 sm:grid-cols-2">
          <div className="max-w-[260px] rounded-lg border border-line bg-surface py-3">
            <QuestionList
              picks={[0, 1, null, 2, 0, null, null, 1, 0, null, 2, 2, null, null, 0, 1, null, null, null, null]}
              flags={[false, false, true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false]}
              current={3}
              onJump={() => {}}
            />
            <StatusLegend className="mt-3 border-t border-line px-4 pt-3" />
          </div>
          <div className="space-y-5">
            <p className="text-small text-muted">Timer: normal, 10 minutes, 5 minutes, last minute</p>
            {[1800, 540, 240, 45].map((s) => (
              <div key={s}>
                <ExamTimer secondsLeft={s} />
              </div>
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}
