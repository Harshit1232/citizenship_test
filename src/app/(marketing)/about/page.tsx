import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/marketing/content-page";
import { BANK_FACTS } from "@/lib/marketing-data";
import { officialLinks, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `How ${site.name} writes its practice questions, and who it is not.`,
};

export default function AboutPage() {
  return (
    <ContentPage
      title={`About ${site.name}`}
      intro={
        <p>
          {site.name} is an independent practice site for the Australian citizenship test. Everything in it is built
          from the official booklet, <cite className="not-italic">Australian Citizenship: Our Common Bond</cite>.
        </p>
      }
    >
      <h2>How the questions are written</h2>
      <p>
        The citizenship test is based on the testable section of the booklet. We wrote {BANK_FACTS.totalQuestions}{" "}
        practice questions from that section, {BANK_FACTS.valuesQuestions} of them about Australian values. Each question
        has three answers to choose from, one correct answer, a short reason, and the page of the booklet the reason
        comes from.
      </p>
      <p>
        We do not have the real test questions. The Department of Home Affairs does not publish them, and anyone who
        says they have them should be treated with caution. What we can do is make sure every question here is answerable from
        the booklet, and show you where.
      </p>

      <h2>Why the values questions get their own section</h2>
      <p>
        Since November 2020, every test includes five questions about Australian values, and you must answer all five
        correctly to pass. One wrong values answer means the test is not a pass, even with 19 out of 20. Our practice
        test marks papers the same way, and the <Link href="/practice/values-check/">values check</Link> lets you
        practise those questions on their own.
      </p>

      <h2>Who we are not</h2>
      <p>
        {site.name} is not part of, or endorsed by, the Department of Home Affairs or any other government agency. The
        official sources are free, and we link to them throughout:
      </p>
      <ul>
        <li>
          <a href={officialLinks.ourCommonBond}>Our Common Bond</a>, the booklet, in English and other languages
        </li>
        <li>
          <a href={officialLinks.aboutTheTest}>About the citizenship test</a>, from Home Affairs
        </li>
        <li>
          <a href={officialLinks.officialPracticeTest}>The Home Affairs practice test</a>
        </li>
      </ul>

      <h2>Keeping it accurate</h2>
      <p>
        If a question, an answer or a page reference looks wrong, please tell us. Every fix is listed on the{" "}
        <Link href="/corrections/">corrections page</Link> with the date and what changed.
      </p>

      <h2>Licence</h2>
      <p>
        Our practice questions are written from <cite className="not-italic">Australian Citizenship: Our Common Bond</cite>{" "}
        (testable section), © Commonwealth of Australia, used under the{" "}
        <a href={officialLinks.ccBy}>Creative Commons Attribution 4.0 licence</a>. The Commonwealth does not endorse this
        site.
      </p>
    </ContentPage>
  );
}
