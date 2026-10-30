import { describe, expect, it } from "vitest";
import { CATEGORIES, QUESTIONS, RULES } from "@/lib/bank";
import { defaultSettings } from "@/lib/settings";
import type { Settings } from "@/lib/types";
import { allocate, buildPaper, byPartOrder, PART_ORDER, plan, seededRng, shuffle } from "./plan";

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
  it("official mode promises 20 questions with 5 values questions, from Parts 1 to 4 only", () => {
    const p = plan(official(), QUESTIONS, RULES);
    expect(p.want).toBe(20);
    expect(p.vCount).toBe(5);
    // 336 minus the 20 glossary questions: the real test covers Parts 1 to 4.
    expect(p.pool).toHaveLength(316);
    expect(p.pool.some((q) => q.part === "glossary")).toBe(false);
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

  it("lays an official paper out like the official practice test: 5 per part, in part order, values last", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const paper = buildPaper(official(), QUESTIONS, RULES, seededRng(seed));
      const parts = paper.map((q) => q.part);
      expect(parts).toEqual([
        ...Array(5).fill("part1"),
        ...Array(5).fill("part2"),
        ...Array(5).fill("part3"),
        ...Array(5).fill("part4"),
      ]);
      expect(paper.slice(15).every((q) => q.isValuesQuestion)).toBe(true);
    }
  });

  it("varies which questions come from each part", () => {
    const firsts = new Set<number>();
    for (let seed = 1; seed <= 20; seed++) firsts.add(buildPaper(official(), QUESTIONS, RULES, seededRng(seed))[0].id);
    expect(firsts.size).toBeGreaterThan(10);
  });

  it("keeps a longer official-format paper balanced across Parts 1 to 3", () => {
    const paper = buildPaper({ ...official(), count: 40 }, QUESTIONS, RULES, seededRng(5));
    const count = (part: string) => paper.filter((q) => q.part === part).length;
    expect([count("part1"), count("part2"), count("part3"), count("part4")]).toEqual([12, 12, 11, 5]);
  });

  it("puts custom papers in part order too", () => {
    const s: Settings = { ...official(), mode: "custom", cats: ALL_CATS, count: 30 };
    for (let seed = 1; seed <= 20; seed++) {
      const ranks = buildPaper(s, QUESTIONS, RULES, seededRng(seed)).map((q) => PART_ORDER.indexOf(q.part));
      expect(ranks).toEqual(ranks.slice().sort((a, b) => a - b));
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

describe("allocate", () => {
  it("shares evenly, one at a time, without overfilling a group", () => {
    expect(allocate(15, [101, 49, 112])).toEqual([5, 5, 5]);
    expect(allocate(16, [101, 49, 112])).toEqual([6, 5, 5]);
    expect(allocate(10, [2, 100, 100])).toEqual([2, 4, 4]);
    expect(allocate(500, [2, 3])).toEqual([2, 3]);
    expect(allocate(0, [5, 5])).toEqual([0, 0]);
  });
});

describe("byPartOrder", () => {
  it("sorts by part and keeps the order within a part", () => {
    const values = QUESTIONS.filter((q) => q.isValuesQuestion).slice(0, 2);
    const p1 = QUESTIONS.filter((q) => q.part === "part1").slice(0, 2);
    const mixed = [values[1], p1[1], values[0], p1[0]];
    expect(byPartOrder(mixed).map((q) => q.id)).toEqual([p1[1].id, p1[0].id, values[1].id, values[0].id]);
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
