import type { Scenario } from "@/data/values-scenarios";
import { IconBook, IconCheck, IconCross } from "@/components/ui/icons";
import { ListenButton } from "@/components/exam/listen-button";
import { officialLinks } from "@/lib/site";
import { cx } from "@/lib/cx";

const LETTERS = ["A", "B", "C"];

/** "What it means" box: the value in plain words, plus the booklet's own example if there is one. */
export function MeaningBox({ scenario }: { scenario: Scenario }) {
  return (
    <section aria-label="What it means" className="rounded-md border-l-4 border-euc bg-euc-tint/70 px-4 py-4 sm:px-5">
      <p className="text-caption font-bold text-euc-deep dark:text-euc">What it means</p>
      <p className="mt-1.5 text-body text-ink">{scenario.meaning}</p>
      {scenario.example && (
        <p className="mt-2.5 text-small text-copy">
          <span className="font-bold text-ink">Example from the booklet: </span>
          {scenario.example}
        </p>
      )}
    </section>
  );
}

/** The everyday situation the question is about. */
export function SituationBox({ text }: { text: string }) {
  return (
    <section aria-label="The situation" className="rounded-md border border-line bg-paper px-4 py-4 sm:px-5">
      <p className="text-caption font-bold text-muted">The situation</p>
      <p className="mt-1.5 text-lead leading-relaxed text-ink">{text}</p>
    </section>
  );
}

/**
 * After answering: every option with its reason. The right one is marked,
 * the one you chose (if wrong) is marked, and the rest are neutral.
 */
export function WhyEachOption({
  scenario,
  chosen,
  headingLevel = 3,
}: {
  scenario: Scenario;
  chosen: number | null;
  /** Keeps the heading order valid wherever this is used. */
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <section aria-labelledby={`why-${scenario.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Heading id={`why-${scenario.id}`} className="text-small font-bold text-ink">
          Why each answer is right or wrong
        </Heading>
        <ListenButton text={feedbackSpeech(scenario, chosen)} label="Listen to why" compact />
      </div>
      <ul className="mt-3 space-y-2.5">
        {scenario.options.map((o, i) => {
          const right = i === scenario.answer;
          const picked = i === chosen;
          return (
            <li
              key={o.text}
              className={cx(
                "flex gap-3 rounded-md border px-3.5 py-3",
                right ? "border-pass bg-pass-tint" : picked ? "border-fail bg-fail-tint" : "border-line bg-surface",
              )}
            >
              <span
                aria-hidden="true"
                className={cx(
                  "mt-0.5 grid size-7 shrink-0 place-items-center rounded-sm text-caption font-bold",
                  right ? "bg-pass text-on-euc" : picked ? "bg-fail text-white dark:text-paper" : "border border-line-strong text-muted",
                )}
              >
                {right ? <IconCheck size={15} strokeWidth={2.8} /> : picked ? <IconCross size={15} strokeWidth={2.8} /> : LETTERS[i]}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-ink">
                  <span className="sr-only">
                    {LETTERS[i]}. {right ? "Right answer. " : picked ? "Your answer, wrong. " : "Wrong. "}
                  </span>
                  {o.text}
                </p>
                <p className="mt-0.5 text-small text-copy">{o.why}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function RememberBox({ text }: { text: string }) {
  return (
    <p className="rounded-md bg-wattle-tint px-4 py-3 text-body text-ink">
      <span className="font-bold text-wattle-text">Remember: </span>
      {text}
    </p>
  );
}

export function BookletLink({ page }: { page: number }) {
  return (
    <a
      href={officialLinks.ourCommonBondPdf}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-9 items-center gap-1.5 rounded-sm border border-line-strong bg-surface px-3 text-caption font-bold text-euc-deep hover:border-euc dark:text-euc"
    >
      <IconBook size={15} />
      Our Common Bond, page {page}
      <span className="sr-only"> (opens the official booklet in a new tab)</span>
    </a>
  );
}

/** What the Listen button reads after answering: the right answer first, then your pick if it was wrong. */
export function feedbackSpeech(s: Scenario, chosen: number | null): string {
  const right = s.options[s.answer];
  const parts = [`The right answer is: ${right.text}. ${right.why}`];
  if (chosen !== null && chosen !== s.answer) parts.push(`You chose: ${s.options[chosen].text}. ${s.options[chosen].why}`);
  parts.push(`Remember: ${s.takeaway}`);
  return parts.join(" ");
}

/** Text for the Listen button. */
export function scenarioSpeech(s: Scenario): string {
  return `${s.situation} ${s.question} A: ${s.options[0].text}. B: ${s.options[1].text}. C: ${s.options[2].text}.`;
}
