import { describe, expect, it } from "vitest";
import { SCENARIOS } from "@/data/values-scenarios";
import { CATEGORY_BY_ID, QUESTION_BY_ID, QUESTIONS } from "./bank";
import { BANK_FACTS, SAMPLE_QUESTION, VALUES_AREAS } from "./marketing-data";

describe("marketing facts match the question bank", () => {
  it("values area counts", () => {
    for (const a of VALUES_AREAS) {
      const c = CATEGORY_BY_ID.get(a.category);
      expect(c?.isValues).toBe(true);
      expect(a.count).toBe(c?.count);
    }
    expect(VALUES_AREAS.reduce((s, a) => s + a.count, 0)).toBe(BANK_FACTS.valuesQuestions);
  });

  it("bank totals", () => {
    expect(QUESTIONS).toHaveLength(BANK_FACTS.totalQuestions);
    expect(QUESTIONS.filter((q) => q.isValuesQuestion)).toHaveLength(BANK_FACTS.valuesQuestions);
  });

  it("sample question is verbatim", () => {
    const q = QUESTION_BY_ID.get(SAMPLE_QUESTION.id);
    expect(q?.question).toBe(SAMPLE_QUESTION.question);
    expect(q?.options).toEqual(SAMPLE_QUESTION.options);
    expect(q?.answerIndex).toBe(SAMPLE_QUESTION.answerIndex);
    expect(q?.explanation).toBe(SAMPLE_QUESTION.explanation);
    expect(q?.source).toBe(SAMPLE_QUESTION.source);
  });
});

describe("values scenario count used in marketing copy", () => {
  it("matches the scenarios that exist", () => {
    expect(BANK_FACTS.valuesScenarios).toBe(SCENARIOS.length);
  });
});
