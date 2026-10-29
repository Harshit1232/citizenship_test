/**
 * Everything the owner still has to decide lives here, so changing it is a
 * one-file edit. See OPEN_QUESTIONS.md.
 */
export const site = {
  /** WORKING NAME — not final. Must not imply government affiliation. */
  name: "Wattle",
  tagline: "Australian citizenship test practice",
  description:
    "Practise for the Australian citizenship test with a mock test that works like the real one: 20 questions, 45 minutes, the same pass rules, and every answer traced to its page in the official booklet.",
  /** Placeholder: the launch price is still being tested (A$19 vs A$29). */
  price: { amount: 29, currency: "AUD", label: "A$29" },
  refundDays: 14,
  /** The paid version is not built yet; the button stays disabled until a waitlist handler exists. */
  waitlistEnabled: false,
  /** Where people report mistakes and contact us. MUST be set before launch (see OPEN_QUESTIONS.md). */
  contactEmail: null as string | null,
  /** Privacy and terms pages show a draft notice until a lawyer has reviewed them. */
  legalReviewed: false,
  /** Date the privacy and terms text last changed, shown on those pages. */
  legalUpdated: "29 October 2026",
} as const;

/** Official sources. Link to these; never paraphrase them as our own claims. */
export const officialLinks = {
  ourCommonBond: "https://immi.homeaffairs.gov.au/citizenship/test-and-interview/our-common-bond",
  ourCommonBondPdf: "https://immi.homeaffairs.gov.au/citizenship-subsite/files/our-common-bond-testable.pdf",
  aboutTheTest:
    "https://immi.homeaffairs.gov.au/citizenship/test-and-interview/learn-about-citizenship-interview-and-test/learn-about-citizenship-test",
  prepareForTest: "https://immi.homeaffairs.gov.au/citizenship/test-and-interview/prepare-for-test",
  officialPracticeTest: "https://citizenshippracticetest.homeaffairs.gov.au/",
  testOverview: "https://immi.homeaffairs.gov.au/citizenship/test-and-interview/overview",
  ccBy: "https://creativecommons.org/licenses/by/4.0/",
  aapFactCheck: "https://www.aap.com.au/factcheck/coalitions-citizenship-test-claim-misleads/",
} as const;
