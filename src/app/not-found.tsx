import { ButtonLink } from "@/components/ui/button";
import { PracticeHeader } from "@/components/practice/practice-header";

export default function NotFound() {
  return (
    <>
      <PracticeHeader />
      <main id="main" className="mx-auto max-w-[760px] px-5 py-24 sm:px-8">
        <h1 className="font-display text-display-sm font-bold tracking-[-0.03em]">This page doesn&apos;t exist</h1>
        <p className="mt-4 text-lead">The link may be old or mistyped. Your saved practice is not affected.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/">Go to the home page</ButtonLink>
          <ButtonLink href="/practice/test/" variant="secondary">
            Take a practice test
          </ButtonLink>
        </div>
      </main>
    </>
  );
}
