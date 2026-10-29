import { describe, expect, it } from "vitest";
import { QUESTIONS, RULES } from "@/lib/bank";
import type { AnswerPick, Question } from "@/lib/types";
import { appendHistory, markPaper, toHistoryEntry, HISTORY_LIMIT } from "./score";

const values = QUESTIONS.filter((q) => q.isValuesQuestion).slice(0, 5);
const others = QUESTIONS.filter((q) => !q.isValuesQuestion).slice(0, 15);
const paper: Question[] = [...others.slice(0, 7), ...values, ...others.slice(7)];

const right = (q: Question) => q.answerIndex;
const wrong = (q: Question) => (q.answerIndex + 1) % q.options.length;
const official = { mode: "official" as const, forceValues: true };

function picksWith(wrongIds: number[]): AnswerPick[] {
  return paper.map((q) => (wrongIds.includes(q.id) ? wrong(q) : right(q)));
}

describe("markPaper", () => {
  it("passes a perfect paper", () => {
    const r = markPaper(paper, picksWith([]), official, RULES);
    expect(r).toMatchObject({ correct: 20, pct: 100, valuesCorrect: 5, passed: true });
  });

  it("fails 19/20 when the wrong answer is a values question", () => {
    const r = markPaper(paper, picksWith([values[2].id]), official, RULES);
    expect(r.pct).toBe(95);
    expect(r.scoreGate).toBe(true);
    expect(r.valuesGate).toBe(false);
    expect(r.passed).toBe(false);
    expect(r.failedOnValuesOnly).toBe(true);
  });

  it("passes exactly 15/20 (75%) when all values questions are right", () => {
    const r = markPaper(paper, picksWith(others.slice(0, 5).map((q) => q.id)), official, RULES);
    expect(r.correct).toBe(15);
    expect(r.passed).toBe(true);
  });

  it("fails 14/20", () => {
    const r = markPaper(paper, picksWith(others.slice(0, 6).map((q) => q.id)), official, RULES);
    expect(r.correct).toBe(14);
    expect(r.scoreGate).toBe(false);
    expect(r.passed).toBe(false);
    expect(r.failedOnValuesOnly).toBe(false);
  });

  it("counts unanswered questions as wrong", () => {
    const picks = picksWith([]);
    picks[0] = null;
    const r = markPaper(paper, picks, official, RULES);
    expect(r.correct).toBe(19);
    expect(r.wrongIndexes).toEqual([0]);
  });

  it("ignores the values rule when it is switched off in a custom test", () => {
    const r = markPaper(
      paper,
      picksWith([values[0].id]),
      { mode: "custom", forceValues: false },
      RULES,
    );
    expect(r.valuesEnforced).toBe(false);
    expect(r.passed).toBe(true);
  });

  it("compares the exact fraction, not the rounded percentage", () => {
    const long = QUESTIONS.filter((q) => !q.isValuesQuestion).slice(0, 67);
    const picks = long.map((q, i) => (i < 50 ? right(q) : wrong(q)));
    const r = markPaper(long, picks, { mode: "custom", forceValues: false }, RULES);
    expect(r.pct).toBe(75); // 74.6% rounds to 75 for display
    expect(r.scoreGate).toBe(false); // but 50/67 is below 75%
  });

  it("tallies by category and by part", () => {
    const r = markPaper(paper, picksWith([values[0].id]), official, RULES);
    const total = Object.values(r.byCategory).reduce((a, c) => a + c.n, 0);
    expect(total).toBe(20);
    const part4 = r.byPart.find((p) => p.part === "part4");
    expect(part4).toMatchObject({ n: 5, c: 4 });
  });
});

describe("history", () => {
  it("records the same fields the original app stored", () => {
    const r = markPaper(paper, picksWith([]), official, RULES);
    const e = toHistoryEntry(r, "official", 1_000, 61_000);
    expect(Object.keys(e).sort()).toEqual(
      ["at", "cats", "correct", "mode", "n", "passed", "pct", "seconds", "vCorrect", "vTotal", "valuesEnforced"].sort(),
    );
    expect(e.seconds).toBe(60);
  });

  it("keeps only the most recent 200 entries", () => {
    const r = markPaper(paper, picksWith([]), official, RULES);
    let h = Array.from({ length: HISTORY_LIMIT }, (_, i) => toHistoryEntry(r, "official", 0, i));
    h = appendHistory(h, toHistoryEntry(r, "official", 0, 9_999));
    expect(h).toHaveLength(HISTORY_LIMIT);
    expect(h[h.length - 1].at).toBe(9_999);
    expect(h[0].at).toBe(1);
  });
});
