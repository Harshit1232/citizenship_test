import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { WattleMark } from "@/components/brand/wattle-mark";
import { officialLinks, site } from "@/lib/site";
import { Landscape } from "./landscape";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="relative overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-5 pt-24 text-center sm:px-8 lg:pt-32">
        <h2 id="cta-title" className="mx-auto max-w-[16ch] font-display text-display font-bold tracking-[-0.035em]">
          Start with one practice test.
        </h2>
        <p className="mx-auto mt-6 max-w-[44ch] text-lead">
          20 questions, 45 minutes, marked the way the real test is marked. No sign-up.
        </p>
        <ButtonLink href="/practice/test/" size="lg" className="mt-9">
          Take a free practice test
        </ButtonLink>
      </div>
      <Landscape seed={23} className="mt-16 h-48 sm:h-64 lg:h-80" />
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-band text-band-body">
      <div className="mx-auto max-w-[1200px] px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-3">
            <p className="flex items-center gap-2.5 font-display text-title font-bold text-band-ink">
              <WattleMark size={30} />
              {site.name}
            </p>
            <p className="mt-4 max-w-[40ch] text-small">
              Independent practice for the Australian citizenship test. Not affiliated with or
              endorsed by the Department of Home Affairs.
            </p>
          </div>
          <FooterCol title="Practise">
            <FooterLink href="/practice/">Your practice</FooterLink>
            <FooterLink href="/practice/test/">Practice test</FooterLink>
            <FooterLink href="/practice/values-check/">Values check</FooterLink>
            <FooterLink href="/practice/study/">Study</FooterLink>
            <FooterLink href="/pricing/">Pricing</FooterLink>
          </FooterCol>
          <FooterCol title={site.name}>
            <FooterLink href="/about/">About</FooterLink>
            <FooterLink href="/corrections/">Corrections</FooterLink>
            <FooterLink href="/privacy/">Privacy</FooterLink>
            <FooterLink href="/terms/">Terms of use</FooterLink>
          </FooterCol>
          <FooterCol title="Official sources">
            <FooterLink href={officialLinks.ourCommonBond} external>
              Our Common Bond booklet
            </FooterLink>
            <FooterLink href={officialLinks.aboutTheTest} external>
              About the citizenship test
            </FooterLink>
            <FooterLink href={officialLinks.officialPracticeTest} external>
              Home Affairs sample test
            </FooterLink>
          </FooterCol>
        </div>
        <div className="mt-12 border-t border-band-line pt-6 text-caption text-band-muted">
          <p className="max-w-[90ch]">
            Practice questions are written from{" "}
            <a href={officialLinks.ourCommonBond} className="underline underline-offset-2 hover:text-band-ink">
              <cite className="not-italic">Australian Citizenship: Our Common Bond</cite>
            </a>{" "}
            (testable section), © Commonwealth of Australia, used under the{" "}
            <a href={officialLinks.ccBy} className="underline underline-offset-2 hover:text-band-ink">
              Creative Commons Attribution 4.0 licence
            </a>
            . The Commonwealth does not endorse this site.
          </p>
          <p className="mt-3">© 2026 {site.name}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="md:col-span-3">
      <p className="text-small font-bold text-band-ink">{title}</p>
      <ul className="mt-3 space-y-1">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const cls = "inline-block py-1.5 text-small hover:text-band-ink hover:underline underline-offset-2";
  return (
    <li>
      {external ? (
        <a href={href} className={cls}>
          {children}
        </a>
      ) : (
        <Link href={href} className={cls}>
          {children}
        </Link>
      )}
    </li>
  );
}
