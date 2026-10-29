import type { Metadata } from "next";
import { Pricing } from "@/components/marketing/pricing";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description: `Practise free, or pay once for full access. No subscription, and a ${site.refundDays}-day refund.`,
};

const QA: Array<[string, string]> = [
  [
    "Is the free version really free?",
    "Yes. Practice tests, the values check, study mode and your progress on this device are free, with no sign-up.",
  ],
  [
    "Why pay once instead of a subscription?",
    "Most people study for a few weeks and then sit the test. A subscription would keep charging you after you no longer need it.",
  ],
  [
    "Can I buy full access now?",
    "Not yet. Full access is still being built, so nothing is on sale and we do not take payment details anywhere on the site.",
  ],
  [
    "What about refunds?",
    `Full access will come with a ${site.refundDays}-day refund. That is on top of your rights under the Australian Consumer Law, which no business can take away.`,
  ],
];

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Pricing />
        <section aria-labelledby="pay-qa" className="mx-auto max-w-[1200px] px-5 pb-28 sm:px-8">
          <h2 id="pay-qa" className="font-display text-heading font-bold tracking-[-0.02em]">
            About paying
          </h2>
          <dl className="mt-8 grid max-w-[60rem] gap-x-12 gap-y-8 md:grid-cols-2">
            {QA.map(([q, a]) => (
              <div key={q}>
                <dt className="text-lead font-bold text-ink">{q}</dt>
                <dd className="mt-2 text-copy">{a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
