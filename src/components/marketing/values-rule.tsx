import { ButtonLink } from "@/components/ui/button";
import { officialLinks } from "@/lib/site";
import { PASS_RATE_CHANGE, VALUES_AREAS } from "@/lib/marketing-data";

export function ValuesRule() {
  return (
    <section id="values" aria-labelledby="values-title" className="bg-band text-band-body">
      <div className="mx-auto grid max-w-[1200px] gap-14 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:gap-12 lg:py-28">
        <div className="lg:col-span-5">
          <h2
            id="values-title"
            className="font-display text-display-sm font-bold tracking-[-0.03em] text-band-ink"
          >
            Five questions you cannot get wrong
          </h2>
          <p className="mt-5 max-w-[46ch] text-lead">
            Every test includes five questions about Australian values. You must answer all five
            correctly. Miss one and the test is not a pass, even with 19 out of 20.
          </p>

          <figure className="mt-10 max-w-md">
            <figcaption className="text-small font-bold text-band-ink">
              Test attempts that passed, 12 months either side of the change in November 2020
            </figcaption>
            <div className="mt-4 space-y-3">
              <Bar label="Before the values questions" value={PASS_RATE_CHANGE.before} />
              <Bar label="After" value={PASS_RATE_CHANGE.after} accent />
            </div>
            <p className="mt-4 text-caption text-band-muted">
              Source:{" "}
              <a
                href={officialLinks.aapFactCheck}
                className="underline decoration-band-muted/60 underline-offset-2 hover:text-band-ink"
              >
                AAP FactCheck analysis of Home Affairs data
              </a>
              , {PASS_RATE_CHANGE.publishedOn}. These figures count attempts, not people. Most
              people who fail pass on a later attempt.
            </p>
          </figure>
        </div>

        <div className="lg:col-span-7 lg:pl-6">
          <p className="text-small text-band-muted">
            What the values questions cover, from Part 4 of the booklet
          </p>
          <ol className="mt-4 divide-y divide-band-line border-y border-band-line">
            {VALUES_AREAS.map((a) => (
              <li key={a.category} className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 py-5 sm:grid-cols-[auto_1fr_auto]">
                <span aria-hidden="true" className="mt-1.5 grid size-6 place-items-center">
                  <span className="block size-3.5 rounded-full bg-band-gold shadow-[0_0_0_5px_rgb(242_206_106_/_0.16)]" />
                </span>
                <div>
                  <h3 className="font-display text-title font-semibold tracking-[-0.01em] text-band-ink">
                    {a.name}
                  </h3>
                  <p className="mt-1 text-body">{a.line}</p>
                </div>
                <p className="col-start-2 text-small text-band-muted sm:col-start-3 sm:mt-1.5 sm:text-right">
                  {a.count} practice questions
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ButtonLink
              href="/practice/values-check/"
              size="lg"
              variant="gold"
            >
              Try the free values check
            </ButtonLink>
            <p className="text-small text-band-muted">10 questions, with the reason after each one.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Bar({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 text-small">
        <span>{label}</span>
        <span className="font-bold tabular-nums text-band-ink">{value}%</span>
      </div>
      <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-band-line" aria-hidden="true">
        <div
          className={accent ? "h-full rounded-full bg-band-gold" : "h-full rounded-full bg-band-body/70"}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
