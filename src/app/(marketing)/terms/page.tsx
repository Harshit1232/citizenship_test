import type { Metadata } from "next";
import Link from "next/link";
import { ContactLine, ContentPage } from "@/components/marketing/content-page";
import { officialLinks, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of use",
  description: `The terms for using ${site.name}.`,
};

export default function TermsPage() {
  return (
    <ContentPage title="Terms of use" updated={site.legalUpdated} draft>
      <h2>What {site.name} is</h2>
      <p>
        {site.name} is a practice tool for the Australian citizenship test. It is not the citizenship test, and it is not
        connected to, or endorsed by, the Department of Home Affairs.
      </p>
      <p>
        A pass on a practice test here does not guarantee a pass on the real test. The real test is set and marked by
        Home Affairs, and the questions are different.
      </p>

      <h2>Accuracy</h2>
      <p>
        We work hard to keep every question, answer and page reference accurate to the booklet. If anything here
        disagrees with{" "}
        <a href={officialLinks.ourCommonBond}>
          <cite className="not-italic">Australian Citizenship: Our Common Bond</cite>
        </a>
        , the booklet is right. Please <Link href="/corrections/">report it</Link> so we can fix it.
      </p>

      <h2>Using the site</h2>
      <ul>
        <li>The practice material is for your own study. Please don&apos;t copy the question bank to publish or sell.</li>
        <li>Don&apos;t try to disrupt the site, get around its limits, or access it in ways it isn&apos;t designed for.</li>
      </ul>

      <h2>Paid access</h2>
      <p>
        Paid access is not on sale yet. Before it is, these terms will be updated with the price, what you get, and how
        refunds work. Nothing in these terms limits the rights you have under the Australian Consumer Law.
      </p>

      <h2>Licence</h2>
      <p>
        Our practice questions are written from the booklet&apos;s testable section, © Commonwealth of Australia, used
        under the <a href={officialLinks.ccBy}>Creative Commons Attribution 4.0 licence</a>.
      </p>

      <h2>Contact</h2>
      <ContactLine subject="Terms question" />
    </ContentPage>
  );
}
