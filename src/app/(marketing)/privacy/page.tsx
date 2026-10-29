import type { Metadata } from "next";
import Link from "next/link";
import { ContactLine, ContentPage } from "@/components/marketing/content-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `What ${site.name} stores, where, and how to delete it.`,
};

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy"
      updated={site.legalUpdated}
      draft
      intro={<p>The short version: your practice results stay in your own browser. We don&apos;t receive them.</p>}
    >
      <h2>What is stored, and where</h2>
      <p>
        When you practise, {site.name} saves your test results, which questions you have missed, a test you have paused,
        your settings and your colour theme. All of it is saved in your browser&apos;s local storage, on your device.
        None of it is sent to us.
      </p>
      <p>
        That also means it doesn&apos;t follow you to another device or browser, and it is gone if you clear your
        browser&apos;s data for this site.
      </p>

      <h2>What we don&apos;t do</h2>
      <ul>
        <li>We don&apos;t have accounts, so we don&apos;t ask for your name, email or phone number.</li>
        <li>We don&apos;t use cookies, analytics or advertising trackers.</li>
        <li>We don&apos;t take payments. Nothing on the site asks for card details.</li>
      </ul>

      <h2>Things outside our control</h2>
      <ul>
        <li>
          <strong>Hosting.</strong> Like any website, the company that hosts the site may keep standard request logs, such
          as your IP address, the page requested and your browser type. We will name the host here at launch.
        </li>
        <li>
          <strong>The Listen button.</strong> It uses your browser&apos;s built-in speech feature. Some browsers use an
          online voice service run by the browser maker, which means the question text is sent to them to be read
          aloud. No information about you is added to it by us.
        </li>
        <li>
          <strong>Links to other sites.</strong> Links to Home Affairs and other sites are covered by their own privacy
          policies.
        </li>
      </ul>

      <h2>Deleting your data</h2>
      <p>
        Go to <Link href="/practice/settings/">Settings</Link> and choose <strong>Delete my test history</strong>, or
        clear this site&apos;s data in your browser settings. You can also download a copy of your data from the same
        page first.
      </p>

      <h2>If this changes</h2>
      <p>
        If we add accounts, payments or analytics, this page will be updated before any of it goes live, and the change
        will be dated at the top of this page.
      </p>

      <h2>Contact</h2>
      <ContactLine subject="Privacy question" />
    </ContentPage>
  );
}
