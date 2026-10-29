import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/lib/bank";
import { SCENARIOS, SCENARIOS_BY_AREA, VALUES_AREAS } from "./values-scenarios";

const valuesIds = QUESTIONS.filter((q) => q.isValuesQuestion).map((q) => q.id);

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function words(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

describe("values scenarios", () => {
  it("has one scenario per rule: 38 in total, split across the five areas", () => {
    expect(SCENARIOS).toHaveLength(38);
    expect(VALUES_AREAS.map((a) => SCENARIOS_BY_AREA[a.id].length)).toEqual([6, 8, 7, 6, 11]);
  });

  it("teaches every values question in the bank", () => {
    const covered = new Set(SCENARIOS.flatMap((s) => s.covers));
    const missing = valuesIds.filter((id) => !covered.has(id));
    expect(missing).toEqual([]);
  });

  it("only points at real values questions", () => {
    for (const s of SCENARIOS) for (const id of s.covers) expect(valuesIds).toContain(id);
  });

  it("uses each area's bank category", () => {
    const cats = new Set(QUESTIONS.filter((q) => q.isValuesQuestion).map((q) => q.category));
    for (const a of VALUES_AREAS) expect(cats.has(a.bankCategory)).toBe(true);
  });

  it("has unique ids, three distinct options, a reason for each, and a valid answer", () => {
    const ids = new Set<string>();
    for (const s of SCENARIOS) {
      expect(ids.has(s.id)).toBe(false);
      ids.add(s.id);
      expect(s.options).toHaveLength(3);
      expect(new Set(s.options.map((o) => o.text.toLowerCase())).size).toBe(3);
      for (const o of s.options) {
        expect(o.text.length).toBeGreaterThan(3);
        expect(o.why.length).toBeGreaterThan(10);
      }
      expect([0, 1, 2]).toContain(s.answer);
    }
  });

  it("cites a page from Part 4 (34 to 39), or page 4 for the pledge", () => {
    for (const s of SCENARIOS) {
      const ok = (s.page >= 34 && s.page <= 39) || (s.id === "the-pledge" && s.page === 4);
      expect(ok, s.id).toBe(true);
    }
  });

  it("spreads the right answer evenly across A, B and C", () => {
    const counts = [0, 0, 0];
    for (const s of SCENARIOS) counts[s.answer]++;
    for (const c of counts) expect(c).toBeGreaterThanOrEqual(11);
  });

  it("keeps sentences short enough for second-language readers", () => {
    const long: string[] = [];
    for (const s of SCENARIOS) {
      for (const text of [s.meaning, s.situation, s.question, s.takeaway, ...s.options.flatMap((o) => [o.text, o.why])]) {
        for (const sentence of sentences(text)) if (words(sentence) > 26) long.push(`${s.id}: ${sentence}`);
      }
    }
    expect(long).toEqual([]);
  });

  it("does not give away the answer by length", () => {
    // If the right option is the longest in most scenarios, people learn to pick the longest.
    const longestIsRight = SCENARIOS.filter((s) => {
      const lengths = s.options.map((o) => o.text.length);
      return lengths[s.answer] === Math.max(...lengths);
    }).length;
    expect(longestIsRight / SCENARIOS.length).toBeLessThan(0.5);
  });
});
