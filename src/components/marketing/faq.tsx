import { IconPlus } from "@/components/ui/icons";
import { officialLinks } from "@/lib/site";

const ITEMS: Array<{ q: string; a: React.ReactNode }> = [
  {
    q: "Is this the official citizenship test?",
    a: (
      <>
        No. We are independent and not affiliated with or endorsed by the Department of Home
        Affairs. Home Affairs runs a free{" "}
        <A href={officialLinks.officialPracticeTest}>sample practice test</A> and publishes the{" "}
        <A href={officialLinks.ourCommonBond}>Our Common Bond booklet</A> for free.
      </>
    ),
  },
  {
    q: "Are these the real test questions?",
    a: "No. Home Affairs does not publish its test questions. We write ours from the testable section of the booklet, and each explanation shows the page it comes from.",
  },
  {
    q: "What is the real test like?",
    a: (
      <>
        It is a computer-based test with 20 multiple-choice questions, and you have 45 minutes. To
        pass, you need at least 75% overall and all five Australian values questions correct.{" "}
        <A href={officialLinks.aboutTheTest}>Read about the test on the Home Affairs website</A>.
      </>
    ),
  },
  {
    q: "Is the real test in English?",
    a: (
      <>
        Yes, the test is in English only. The booklet is available in English and many community
        languages, so you can read it in your own language too. We suggest practising in English.{" "}
        <A href={officialLinks.prepareForTest}>How Home Affairs suggests you prepare</A>.
      </>
    ),
  },
  {
    q: "What happens if I fail?",
    a: (
      <>
        You can sit the test again. Home Affairs allows up to three test appointments, and after
        three unsuccessful appointments your application may be refused. Check the current rules on
        the <A href={officialLinks.aboutTheTest}>Home Affairs website</A>.
      </>
    ),
  },
  {
    q: "Where is my progress saved?",
    a: "In this browser, on this device. Nothing is sent anywhere, and you don't need an account. Clearing your browser data deletes it.",
  },
];

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="font-bold text-euc-deep underline underline-offset-2 hover:text-ink">
      {children}
    </a>
  );
}

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="border-t border-line">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-24 sm:px-8 lg:grid-cols-12 lg:py-32">
        <h2 id="faq-title" className="font-display text-display-sm font-bold tracking-[-0.03em] lg:col-span-4">
          Questions people ask first
        </h2>
        <div className="divide-y divide-line border-y border-line lg:col-span-8">
          {ITEMS.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-title font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line-strong/50 text-ink transition-transform duration-200 group-open:rotate-45">
                  <IconPlus size={18} />
                </span>
              </summary>
              <div className="max-w-[62ch] pb-6 text-body">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
