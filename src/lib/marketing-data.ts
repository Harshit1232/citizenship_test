/**
 * Small, static facts the marketing pages show. Kept here (not read from the
 * question bank) so marketing pages don't ship 250 KB of questions.
 * marketing-data.test.ts checks every number against the bank.
 */

export const VALUES_AREAS = [
  {
    category: "values-rule-of-law-and-democracy",
    name: "Rule of law and parliamentary democracy",
    line: "Everyone follows the same laws, and laws are made by parliaments the people elect.",
    count: 6,
  },
  {
    category: "values-freedoms",
    name: "Freedom of speech, association and religion",
    line: "You can speak, meet and worship freely, as long as you stay within the law.",
    count: 11,
  },
  {
    category: "values-equality",
    name: "Equality under the law and a fair go",
    line: "Equal rights for everyone, whatever their gender, religion, age or background.",
    count: 11,
  },
  {
    category: "values-respect-and-tolerance",
    name: "Mutual respect and tolerance",
    line: "Respect other people's freedom and dignity, and their views when they differ from yours.",
    count: 7,
  },
  {
    category: "values-community-and-loyalty",
    name: "Community, contribution and loyalty",
    line: "Take part in your community and stay loyal to Australia and its people.",
    count: 19,
  },
] as const;

export const BANK_FACTS = {
  totalQuestions: 336,
  valuesQuestions: 54,
  /** Values mastery scenarios (src/data/values-scenarios.ts). Checked by test. */
  valuesScenarios: 38,
} as const;

/** Copied verbatim from question 264 in the bank (checked by test). */
export const SAMPLE_QUESTION = {
  id: 264,
  question: "What does commitment to the Rule of Law require of you?",
  options: [
    "That you follow only the laws you agree with",
    "That you follow the law only in public",
    "That you follow the law even if no one is watching",
  ],
  answerIndex: 2,
  explanation: "Commitment to the Rule of Law means following the law even if no one is watching.",
  source: "p.34",
} as const;

/**
 * Pass rates for test attempts in the 12 months either side of the values
 * questions being added (15 November 2020). AAP FactCheck analysis of Home
 * Affairs data, published 7 February 2024. These are attempts, not people:
 * about 95% of applicants pass eventually.
 */
export const PASS_RATE_CHANGE = {
  before: 80.5,
  after: 68.8,
  publishedOn: "7 February 2024",
} as const;
