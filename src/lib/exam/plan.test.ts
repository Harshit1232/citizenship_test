import { describe, expect, it } from "vitest";
import { CATEGORIES, QUESTIONS, RULES } from "@/lib/bank";
import { defaultSettings } from "@/lib/settings";
import type { Settings } from "@/lib/types";
import { buildPaper, plan, seededRng, shuffle } from "./plan";

const ALL_CATS = CATEGORIES.map((c) => c.id);
const official = (): Settings => defaultSettings(ALL_CATS);

describe("question bank", () => {
  it("has 336 questions with stable ids 1..336 and 54 values questions", () => {
    expect(QUESTIONS).toHaveLength(336);
    expect(QUESTIONS.map((q) => q.id)).toEqual(Array.from({ length: 336 }, (_, i) => i + 1));
    expect(QUESTIONS.filter((q) => q.isValuesQuestion)).toHaveLength(54);
  });

  it("every answerIndex points at the stated answer", () => {
    for (const q of QUESTIONS) expect(q.options[q.answerIndex]).toBe(q.answer);
  });

  it("matches the official rules", () => {
    expect(RULES).toMatchObject({
      questionsPerTest: 20,
      valuesQuestionsPerTest: 5,
      timeLimitMinutes: 45,
      passMarkPercent: 75,
      allValuesQuestionsMustBeCorrect: true,
    });
  });
});

describe("plan", () => {
  it("official mode promises 20 questions with 5 values questions", () => {
    const p = plan(official(), QUESTIONS, RULES);
    expect(p.want).toBe(20);
    expect(p.vCount).toBe(5);
    expect(p.pool).toHaveLength(336);
  });

  it("custom mode with no values categories still draws 5 values questions when forced", () => {
    const s: Settings = { ...official(), mode: "custom", cats: ["states-and-territories"], count: 20 };
    const p = plan(s, QUESTIONS, RULES);
    expect(p.nonValues).toHaveLength(26);
    expect(p.vPool).toHaveLength(54);
    expect(p.want).toBe(20);
    expect(p.vCount).toBe(5);
  });

  it("custom mode without forced values uses only the chosen categories", () => {
    const s: Settings = {
      ...official(),
      mode: "custom",
      cats: ["states-and-territories"],
      forceValues: false,
      count: 40,
    };
    const p = plan(s, QUESTIONS, RULES);
    expect(p.vCount).toBe(0);
    expect(p.want).toBe(26); // capped at the pool size
  });

  it("a values-only selection becomes an all-must-be-correct drill", () => {
    const s: Settings = { ...official(), mode: "custom", cats: ["values-equality"], count: 20 };
    const p = plan(s, QUESTIONS, RULES);
    expect(p.nonValues).toHaveLength(0);
    expect(p.want).toBe(11);
    expect(p.vCount).toBe(11);
  });

  it("uses values questions from the selection when it has at least 5", () => {
    const s: Settings = {
      ...official(),
      mode: "custom",
      cats: ["voting-and-elections", "values-freedoms"],
      count: 20,
    };
    const p = plan(s, QUESTIONS, RULES);
    expect(p.vPool.every((q) => q.category === "values-freedoms")).toBe(true);
    expect(p.cap).toBe(7 + 5);
    expect(p.want).toBe(12);
  });
});

describe("buildPaper", () => {
  it("builds an official paper of 20 distinct questions with exactly 5 values questions", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const paper = buildPaper(official(), QUESTIONS, RULES, seededRng(seed));
      expect(paper).toHaveLength(20);
      expect(new Set(paper.map((q) => q.id)).size).toBe(20);
      expect(paper.filter((q) => q.isValuesQuestion)).toHaveLength(5);
    }
  });

  it("is repeatable for the same seed", () => {
    const a = buildPaper(official(), QUESTIONS, RULES, seededRng(7)).map((q) => q.id);
    const b = buildPaper(official(), QUESTIONS, RULES, seededRng(7)).map((q) => q.id);
    expect(a).toEqual(b);
  });

  it("delivers the number of questions the plan promised", () => {
    const s: Settings = { ...official(), mode: "custom", cats: ["glossary"], count: 50 };
    const p = plan(s, QUESTIONS, RULES);
    const paper = buildPaper(s, QUESTIONS, RULES, seededRng(3));
    expect(paper).toHaveLength(p.want);
  });
});

describe("shuffle", () => {
  it("returns a permutation and leaves the input untouched", () => {
    const input = [1, 2, 3, 4, 5, 6];
    const out = shuffle(input, seededRng(42));
    expect(out.slice().sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
