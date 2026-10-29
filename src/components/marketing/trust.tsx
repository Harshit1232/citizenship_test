import { IconExternal } from "@/components/ui/icons";
import { officialLinks } from "@/lib/site";

export function Trust() {
  return (
    <section aria-labelledby="trust-title" className="border-y border-line bg-surface">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:py-28">
        <div className="lg:col-span-5">
          <h2 id="trust-title" className="font-display text-display-sm font-bold tracking-[-0.03em]">
            We don&apos;t have the real test questions. Nobody outside Home Affairs does.
          </h2>
          <p className="mt-6 max-w-[44ch] text-lead">
            So we don&apos;t pretend to. Every question here is written from the booklet the test is
            based on, and every answer points back to its page.
          </p>
        </div>
        <dl className="divide-y divide-line border-y border-line lg:col-span-7 lg:self-center">
          <Item term="Where the questions come from">
            336 questions written from the testable section of{" "}
            <cite className="not-italic font-bold text-ink">Australian Citizenship: Our Common Bond</cite>.
            Each explanation names the page it comes from, so you can check it.
          </Item>
          <Item term="Who we are not">
            We are independent. We are not part of, or endorsed by, the Department of Home Affairs.
          </Item>
          <Item term="The booklet is free">
            Home Affairs publishes the booklet free, in English and 40 other languages. Read it
            alongside your practice.{" "}
            <a
              href={officialLinks.ourCommonBond}
              className="inline-flex items-center gap-1 font-bold text-euc-deep underline underline-offset-2 hover:text-ink"
            >
              Get the booklet
              <IconExternal size={15} />
            </a>
          </Item>
        </dl>
      </div>
    </section>
  );
}

function Item({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 py-6 sm:grid-cols-[13rem_1fr] sm:gap-8">
      <dt className="font-display text-body font-bold text-ink">{term}</dt>
      <dd className="text-body">{children}</dd>
    </div>
  );
}
