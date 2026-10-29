import { ButtonLink } from "@/components/ui/button";
import { Landscape, Pollen } from "./landscape";
import { ValuesExplainer } from "./values-explainer";

export function Hero() {
  return (
    <section className="grain relative overflow-hidden" aria-labelledby="hero-title">
      <Pollen count={12} seed={11} topRange={[58, 100]} className="opacity-70" />
      <div className="relative mx-auto max-w-[1200px] px-5 pt-10 sm:px-8 sm:pt-16 lg:pt-20">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h1
            id="hero-title"
            className="anim-rise font-display text-display font-bold tracking-[-0.035em] text-ink lg:col-span-8 [font-variation-settings:'opsz'_96]"
          >
            Pass your Australian citizenship test the first time, including all five values
            questions.
          </h1>
          <div className="anim-rise lg:col-span-4 lg:pb-2" style={{ animationDelay: "120ms" }}>
            <p className="text-lead text-copy">
              Practise with a test that works like the real one: 20 questions, 45 minutes, and the
              same pass rules. Every answer is checked against the official booklet, with the page
              number.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/practice/test/" size="lg">
                Take a free practice test
              </ButtonLink>
              <ButtonLink href="/#how" size="lg" variant="secondary">
                See how it works
              </ButtonLink>
            </div>
            <p className="mt-4 text-small text-muted">No sign-up. Works on your phone.</p>
          </div>
        </div>

        <div className="anim-rise relative z-10 mt-12 lg:mt-16" style={{ animationDelay: "240ms" }}>
          <ValuesExplainer />
        </div>
      </div>
      <Landscape seed={7} className="-mt-24 h-56 sm:-mt-28 sm:h-72 lg:-mt-36 lg:h-96" />
    </section>
  );
}
