import { ButtonLink, Button } from "@/components/ui/button";
import { IconCheck } from "@/components/ui/icons";
import { site } from "@/lib/site";
import { BANK_FACTS } from "@/lib/marketing-data";

const FREE = [
  "Full practice tests, timed and marked like the real one",
  "The 10-question values check",
  `Study all ${BANK_FACTS.totalQuestions} questions, or test yourself on chosen topics`,
  "The reason and booklet page for every question you miss",
  "Progress saved on this device",
];

const FULL = [
  "Values mastery track, built around the five values areas",
  "A readiness check before you book your test",
  "Your progress on all your devices",
];

export function Pricing() {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8 lg:py-32">
      <div className="max-w-[46rem]">
        <h2 id="pricing-title" className="font-display text-display-sm font-bold tracking-[-0.03em]">
          Free to practise. One payment for the rest.
        </h2>
        <p className="mt-5 text-lead">
          You need this for a few weeks, not forever. So there is no subscription: pay once, keep
          access, and get a refund within {site.refundDays} days if it isn&apos;t for you.
        </p>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        <article className="flex flex-col rounded-lg border-2 border-euc bg-surface p-7 shadow-2 sm:p-9">
          <h3 className="font-display text-title font-bold">Free</h3>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-display-sm font-bold tracking-[-0.03em] text-ink">A$0</span>
            <span className="text-small text-muted">no sign-up</span>
          </p>
          <ul className="mt-7 space-y-3.5">
            {FREE.map((f) => (
              <Feature key={f}>{f}</Feature>
            ))}
          </ul>
          <ButtonLink href="/practice/test/" size="lg" className="mt-9 w-full sm:w-auto sm:self-start">
            Take a free practice test
          </ButtonLink>
        </article>

        <article className="flex flex-col rounded-lg border border-line bg-surface/70 p-7 sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-title font-bold">Full access</h3>
            <span className="rounded-sm bg-wattle-tint px-2.5 py-1 text-caption font-bold text-wattle-text">
              In development
            </span>
          </div>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-display-sm font-bold tracking-[-0.03em] text-ink">
              {site.price.label}
            </span>
            <span className="text-small text-muted">one payment</span>
          </p>
          <p className="mt-4 text-small font-bold text-ink">Everything in Free, plus:</p>
          <ul className="mt-3 space-y-3.5">
            {FULL.map((f) => (
              <Feature key={f}>{f}</Feature>
            ))}
          </ul>
          <div className="mt-auto pt-9">
            <Button size="lg" variant="secondary" disabled={!site.waitlistEnabled} className="w-full sm:w-auto">
              {site.waitlistEnabled ? "Join the waitlist" : "Coming soon"}
            </Button>
            <p className="mt-3 text-small text-muted">
              Pay once. No subscription. {site.refundDays}-day refund.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-euc-tint text-euc-deep" aria-hidden="true">
        <IconCheck size={14} strokeWidth={2.8} />
      </span>
      <span className="text-body text-ink">{children}</span>
    </li>
  );
}
