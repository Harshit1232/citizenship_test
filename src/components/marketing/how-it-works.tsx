"use client";

import { useEffect, useId, useRef, useState } from "react";
import { WattleMark } from "@/components/brand/wattle-mark";
import { AnswerOptions } from "@/components/exam/answer-options";
import { Explanation } from "@/components/exam/explanation";
import { IconCheck, IconClock, IconCross, IconFlag, IconSpeaker } from "@/components/ui/icons";
import { SAMPLE_QUESTION } from "@/lib/marketing-data";
import { cx } from "@/lib/cx";

const STEPS = [
  {
    title: "Sit a test that works like the real one",
    body: "20 questions in 45 minutes, five of them about Australian values. Mark questions to review later, and use Listen to hear any question read aloud.",
  },
  {
    title: "See your result the way the test marks it",
    body: "Your overall score and the values rule are shown separately, so you know exactly why a result is a pass or not.",
  },
  {
    title: "Learn why, from the booklet",
    body: "Every question you miss comes with the reason and its page in Australian Citizenship: Our Common Bond, so you can read that section yourself.",
  },
] as const;

/**
 * A sticky phone on the right shows the product; the steps scroll past on the
 * left and the screen changes to match. On small screens each step carries its
 * own screen instead.
 */
export function HowItWorks() {
  const [active, setActive] = useState(0);

  return (
    <section id="how" aria-labelledby="how-title" className="relative">
      <div className="mx-auto max-w-[1200px] px-5 pt-24 sm:px-8 lg:pt-32">
        <h2 id="how-title" className="max-w-[18ch] font-display text-display-sm font-bold tracking-[-0.03em]">
          Practice that feels like test day
        </h2>
        <p className="mt-5 max-w-[52ch] text-lead">
          Three things happen every time you practise. Each one is built around how the real test
          is run and marked.
        </p>
      </div>

      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 pb-24 sm:px-8 lg:grid-cols-12 lg:pb-32">
        <ol className="lg:col-span-6">
          {STEPS.map((s, i) => (
            <Step key={s.title} index={i} active={active === i} onActive={setActive} title={s.title} body={s.body} />
          ))}
        </ol>
        <div className="hidden lg:col-span-6 lg:block">
          <div className="sticky top-[12vh] flex h-[76vh] items-center justify-center">
            <Phone>
              {STEPS.map((s, i) => (
                <div
                  key={s.title}
                  data-active={active === i}
                  className={cx(
                    "screen-slide absolute inset-0",
                    active === i
                      ? "visible translate-y-0 opacity-100"
                      : cx("invisible opacity-0", i < active ? "-translate-y-3" : "translate-y-4"),
                  )}
                >
                  <Screen step={i} />
                </div>
              ))}
            </Phone>
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({
  index,
  active,
  onActive,
  title,
  body,
}: {
  index: number;
  active: boolean;
  onActive: (i: number) => void;
  title: string;
  body: string;
}) {
  const ref = useRef<HTMLLIElement>(null);
  // The step whose middle crosses the centre band of the viewport is active.
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onActive(index);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [index, onActive]);

  return (
    <li ref={ref} className="flex flex-col justify-center py-10 lg:min-h-[72vh] lg:py-0">
      <div className="flex gap-5">
        <span
          aria-hidden="true"
          className={cx(
            "grid size-11 shrink-0 place-items-center rounded-full border-2 font-display text-body font-bold transition-colors duration-300",
            active ? "border-euc bg-euc text-on-euc" : "border-line-strong/60 text-muted",
          )}
        >
          {index + 1}
        </span>
        <div>
          <h3
            className={cx(
              "font-display text-heading font-bold tracking-[-0.02em] transition-colors duration-300",
              active ? "text-ink" : "text-ink lg:text-muted",
            )}
          >
            {title}
          </h3>
          <p className="mt-3 max-w-[44ch] text-lead">{body}</p>
        </div>
      </div>
      <div className="mt-8 flex justify-center lg:hidden">
        <Phone small>
          <Screen step={index} />
        </Phone>
      </div>
    </li>
  );
}

function Phone({ children, small }: { children: React.ReactNode; small?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        "relative overflow-hidden rounded-lg border-[6px] border-ink/90 bg-paper shadow-3 dark:border-line",
        small ? "h-[560px] w-[min(320px,100%)]" : "h-[620px] w-[340px]",
      )}
      // The phone is a picture of the product; its contents are not interactive.
      inert
    >
      {children}
    </div>
  );
}

function MiniHeader({ label }: { label: string }) {
  return (
    <div className="border-b border-line bg-veil">
      <div className="flex h-12 items-center gap-2 px-3.5">
        <WattleMark size={22} />
        <span className="text-caption font-bold text-ink">{label}</span>
        <span className="ml-auto flex items-center gap-1.5 font-display text-small font-bold tabular-nums text-ink">
          <IconClock size={15} className="text-muted" /> 38:12
        </span>
      </div>
      <div className="h-1 bg-sunk">
        <div className="h-full w-[35%] bg-euc" />
      </div>
    </div>
  );
}

function Screen({ step }: { step: number }) {
  const uid = useId();
  const qid = `demo-q-${uid}`;
  if (step === 0) {
    return (
      <div className="flex h-full flex-col">
        <MiniHeader label="Question 7 of 20" />
        <div className="px-4 pt-5">
          <p className="text-caption font-bold text-muted">Question 7</p>
          <p id={qid} className="mt-2.5 font-text text-lead font-bold leading-snug text-ink">
            {SAMPLE_QUESTION.question}
          </p>
          <div className="mt-4">
            <AnswerOptions name={qid} legendId={qid} options={SAMPLE_QUESTION.options} value={2} compact />
          </div>
          <div className="mt-3 flex gap-1.5 text-caption font-bold text-ink">
            <span className="inline-flex items-center gap-1.5 rounded-sm px-2 py-2">
              <IconSpeaker size={15} /> Listen
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-wattle-tint px-2 py-2 text-wattle-text">
              <IconFlag size={15} /> Marked to review
            </span>
          </div>
        </div>
        <div className="mt-auto flex gap-2 border-t border-line bg-veil px-4 py-3">
          <span className="grid h-10 flex-1 place-items-center rounded-sm border border-line-strong/60 bg-surface text-caption font-bold text-ink">
            Previous
          </span>
          <span className="grid h-10 flex-1 place-items-center rounded-sm bg-euc text-caption font-bold text-on-euc">
            Next
          </span>
        </div>
      </div>
    );
  }
  if (step === 1) {
    return (
      <div className="flex h-full flex-col">
        <MiniHeader label="Your result" />
        <div className="px-4 pt-6">
          <p className="text-caption font-bold text-muted">Practice test result</p>
          <p className="mt-1 font-display text-heading font-extrabold tracking-[-0.03em] text-fail">Not a pass</p>
          <p className="mt-1 text-body font-bold tabular-nums text-ink">19 of 20 correct (95%)</p>
          <div className="mt-5 space-y-2.5">
            <MiniGate title="Overall score" value="95%" rule="Needs at least 75%." met />
            <MiniGate title="Values questions" value="4 of 5" rule="All must be correct." met={false} />
          </div>
          <p className="mt-5 text-small text-ink">
            Your score was high enough, but a values question was wrong. On the real test, that
            alone means you do not pass.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col">
      <MiniHeader label="Questions to review" />
      <div className="px-4 pt-5">
        <p className="text-caption font-bold text-muted">
          Question 15 <span className="ml-1 rounded-sm bg-wattle-tint px-1.5 py-0.5 text-wattle-text">Values question</span>
        </p>
        <p className="mt-2 font-text text-body font-bold leading-snug text-ink">{SAMPLE_QUESTION.question}</p>
        <p className="mt-3 flex items-start gap-2 rounded-sm bg-fail-tint px-2.5 py-2 text-small text-fail">
          <IconCross size={16} className="mt-0.5 shrink-0" strokeWidth={2.4} />
          <span>
            <b>Your answer:</b> {SAMPLE_QUESTION.options[1]}
          </span>
        </p>
        <p className="mt-1.5 flex items-start gap-2 rounded-sm bg-pass-tint px-2.5 py-2 text-small text-euc-deep">
          <IconCheck size={16} className="mt-0.5 shrink-0" strokeWidth={2.4} />
          <span>
            <b>Correct:</b> {SAMPLE_QUESTION.options[2]}
          </span>
        </p>
        <Explanation className="mt-3 [&_p]:text-small" text={SAMPLE_QUESTION.explanation} source={SAMPLE_QUESTION.source} />
      </div>
    </div>
  );
}

function MiniGate({ title, value, rule, met }: { title: string; value: string; rule: string; met: boolean }) {
  return (
    <div className={cx("flex items-start gap-2.5 rounded-sm border px-3 py-2.5", met ? "border-pass/40 bg-pass-tint" : "border-fail/40 bg-fail-tint")}>
      <span className={cx("grid size-6 shrink-0 place-items-center rounded-full", met ? "bg-pass text-on-euc" : "bg-fail text-white dark:text-paper")}>
        {met ? <IconCheck size={14} strokeWidth={2.8} /> : <IconCross size={14} strokeWidth={2.8} />}
      </span>
      <div>
        <p className="text-caption font-bold text-muted">{title}</p>
        <p className="font-display text-body font-bold text-ink">{value}</p>
        <p className="text-caption text-copy">{rule}</p>
      </div>
    </div>
  );
}
