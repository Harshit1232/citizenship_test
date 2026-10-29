import type { Metadata } from "next";
import { ContactLine, ContentPage } from "@/components/marketing/content-page";
import { officialLinks, site } from "@/lib/site";
import { CORRECTIONS } from "@/lib/corrections";

export const metadata: Metadata = {
  title: "Corrections",
  description: `How to report a mistake in ${site.name}, and every correction we have made.`,
};

export default function CorrectionsPage() {
  return (
    <ContentPage
      title="Corrections"
      intro={
        <p>
          If a question, an answer or a page reference is wrong, we want to know. Every fix is listed below, so you can
          see what changed and when.
        </p>
      }
    >
      <h2>How to report a mistake</h2>
      <p>Tell us:</p>
      <ul>
        <li>
          the question&apos;s reference number, shown as <strong>Ref</strong> next to the booklet link under each
          explanation
        </li>
        <li>what you think is wrong</li>
        <li>
          if you can, the page of <a href={officialLinks.ourCommonBondPdf}>Our Common Bond</a> that shows it
        </li>
      </ul>
      <ContactLine subject="Correction" />

      <h2>Corrections made</h2>
      {CORRECTIONS.length === 0 ? (
        <p>No corrections yet. When we fix a question, it will be listed here with the date and what changed.</p>
      ) : (
        <ol>
          {CORRECTIONS.map((c) => (
            <li key={`${c.date}-${c.ref}`}>
              <strong>
                {c.date}, ref {c.ref}:
              </strong>{" "}
              {c.change}
            </li>
          ))}
        </ol>
      )}
    </ContentPage>
  );
}
