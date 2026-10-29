import type { ReactNode } from "react";
import { site } from "@/lib/site";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

/** Shell for long-form pages: about, privacy, terms, corrections. */
export function ContentPage({
  title,
  intro,
  updated,
  draft,
  children,
}: {
  title: string;
  intro?: ReactNode;
  updated?: string;
  /** Shows the "not reviewed by a lawyer" notice. */
  draft?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-[1200px] px-5 pb-28 pt-14 sm:px-8 lg:pt-20">
        <div className="anim-rise max-w-[52rem]">
          <h1 className="font-display text-display-sm font-bold tracking-[-0.035em] sm:text-[3.5rem] sm:leading-[1.02]">{title}</h1>
          {intro && <div className="mt-5 max-w-[60ch] text-lead">{intro}</div>}
          {updated && <p className="mt-4 text-small text-muted">Last updated {updated}</p>}
        </div>
        {draft && !site.legalReviewed && (
          <div role="note" className="mt-8 max-w-[68ch] rounded-md border border-wattle-edge/50 bg-wattle-tint px-4 py-3.5 text-small text-ink">
            <strong>Draft.</strong> This page describes how the site works today. It has not been reviewed by a lawyer yet
            and will be updated before paid access or accounts launch.
          </div>
        )}
        <div className="prose-site mt-12">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}

/** The contact line used across content pages. */
export function ContactLine({ subject }: { subject?: string }) {
  if (!site.contactEmail) {
    return (
      <p>
        <strong>Contact details are being set up.</strong> Until then, you can still check any answer against the
        booklet page shown with it.
      </p>
    );
  }
  const href = `mailto:${site.contactEmail}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
  return (
    <p>
      Email <a href={href}>{site.contactEmail}</a>.
    </p>
  );
}
