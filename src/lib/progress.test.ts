import { describe, expect, it } from "vitest";
import { CATEGORIES, CATEGORY_BY_ID, PARTS, QUESTIONS } from "@/lib/bank";
import { defaultSettings } from "@/lib/settings";
import type { HistoryEntry } from "@/lib/types";
import {
  categoryRows,
  drillSettings,
  formatDuration,
  groupByPart,
  heatCells,
  heatLevel,
  partRows,
  repeatMisses,
  trendSeries,
  valuesAccuracy,
  weakAndStrong,
} from "./progress";

const [catA, catB, catC] = CATEGORIES;

function entry(over: Partial<HistoryEntry>): HistoryEntry {
  return {
    at: 1_700_000_000_000,
    mode: "official",
    n: 20,
    correct: 15,
    pct: 75,
    vTotal: 5,
    vCorrect: 5,
    valuesEnforced: true,
    passed: true,
    seconds: 900,
    cats: {},
    ...over,
  };
}

describe("categoryRows", () => {
  it("pools categories across tests and sorts worst first", () => {
    const history = [
      entry({ cats: { [catA.id]: { n: 4, c: 1 }, [catB.id]: { n: 2, c: 2 } } }),
      entry({ cats: { [catA.id]: { n: 4, c: 3 }, [catC.id]: { n: 5, c: 3 } } }),
    ];
    const rows = categoryRows(history, CATEGORY_BY_ID);
    expect(rows.map((r) => [r.id, r.n, r.c, r.p])).toEqual([
      [catA.id, 8, 4, 50],
      [catC.id, 5, 3, 60],
      [catB.id, 2, 2, 100],
    ]);
  });

  it("drops categories that no longer exist in the bank", () => {
    const rows = categoryRows([entry({ cats: { "gone-category": { n: 3, c: 0 } } })], CATEGORY_BY_ID);
    expect(rows).toEqual([]);
  });
});

describe("weakAndStrong", () => {
  it("ignores thinly answered categories when there is enough data", () => {
    const rows = categoryRows(
      [entry({ cats: { [catA.id]: { n: 1, c: 0 }, [catB.id]: { n: 6, c: 3 }, [catC.id]: { n: 6, c: 6 } } })],
      CATEGORY_BY_ID,
    );
    const ws = weakAndStrong(rows);
    expect(ws.stable).toBe(true);
    expect(ws.weak.map((r) => r.id)).toEqual([catB.id]);
    expect(ws.strong.map((r) => r.id)).toEqual([catC.id]);
  });

  it("falls back to everything and says so when nothing has 3 answers", () => {
    const rows = categoryRows([entry({ cats: { [catA.id]: { n: 1, c: 0 }, [catB.id]: { n: 2, c: 2 } } })], CATEGORY_BY_ID);
    const ws = weakAndStrong(rows);
    expect(ws.stable).toBe(false);
    expect(ws.weak.length).toBeGreaterThan(0);
  });
});

describe("partRows and valuesAccuracy", () => {
  it("adds categories up into their booklet parts, in booklet order", () => {
    const rows = categoryRows([entry({ cats: { [catA.id]: { n: 4, c: 2 }, [catB.id]: { n: 4, c: 4 } } })], CATEGORY_BY_ID);
    const parts = partRows(rows, PARTS);
    expect(parts[0]).toMatchObject({ id: catA.part, n: 8, c: 6, p: 75 });
  });

  it("returns null accuracy with no values questions answered", () => {
    expect(valuesAccuracy([entry({ vTotal: 0, vCorrect: 0 })]).p).toBeNull();
    expect(valuesAccuracy([entry({ vTotal: 5, vCorrect: 4 }), entry({ vTotal: 5, vCorrect: 5 })])).toEqual({
      total: 10,
      correct: 9,
      p: 90,
    });
  });
});

describe("heatmap", () => {
  it("uses the original bands", () => {
    expect(heatLevel(0, 0)).toBe(0);
    expect(heatLevel(1, 0.25)).toBe(1);
    expect(heatLevel(1, 0.5)).toBe(2);
    expect(heatLevel(3, 0.75)).toBe(3);
    expect(heatLevel(4, 0.8)).toBe(4);
  });

  it("only includes seen questions, and caps wrong at seen", () => {
    const [q1, q2, q3] = QUESTIONS;
    const cells = heatCells(
      { [q1.id]: { seen: 2, wrong: 5, streak: 0 }, [q2.id]: { seen: 0, wrong: 0, streak: 0 }, [q3.id]: { seen: 4, wrong: 0, streak: 4 } },
      QUESTIONS,
    );
    expect(cells.map((c) => [c.q.id, c.wrong, c.level])).toEqual([
      [q1.id, 2, 4],
      [q3.id, 0, 0],
    ]);
    expect(groupByPart(cells, PARTS)[0].cells[0].q.id).toBe(q1.id);
  });

  it("lists repeat misses, most missed first", () => {
    const [q1, q2, q3] = QUESTIONS;
    const cells = heatCells(
      { [q1.id]: { seen: 3, wrong: 2, streak: 0 }, [q2.id]: { seen: 5, wrong: 4, streak: 0 }, [q3.id]: { seen: 3, wrong: 1, streak: 0 } },
      QUESTIONS,
    );
    expect(repeatMisses(cells).map((c) => c.q.id)).toEqual([q2.id, q1.id]);
  });
});

describe("drillSettings", () => {
  const base = defaultSettings(CATEGORIES.map((c) => c.id));

  it("builds a custom test from categories under 75%", () => {
    const rows = categoryRows([entry({ cats: { [catA.id]: { n: 4, c: 1 }, [catB.id]: { n: 4, c: 4 } } })], CATEGORY_BY_ID);
    const s = drillSettings(rows, QUESTIONS, base);
    expect(s).not.toBeNull();
    expect(s?.mode).toBe("custom");
    expect(s?.cats).toEqual([catA.id]);
    expect(s?.count).toBe(Math.min(20, catA.count));
    expect(s?.timerOn).toBe(base.timerOn);
  });

  it("returns null when nothing is below the pass mark", () => {
    const rows = categoryRows([entry({ cats: { [catB.id]: { n: 4, c: 4 } } })], CATEGORY_BY_ID);
    expect(drillSettings(rows, QUESTIONS, base)).toBeNull();
  });
});

describe("trendSeries and formatDuration", () => {
  it("keeps the last 20 tests, oldest first", () => {
    const history = Array.from({ length: 25 }, (_, i) => entry({ at: i, pct: i }));
    const t = trendSeries(history);
    expect(t).toHaveLength(20);
    expect(t[0].at).toBe(5);
    expect(t[19].at).toBe(24);
  });

  it("formats durations", () => {
    expect(formatDuration(42)).toBe("42 s");
    expect(formatDuration(600)).toBe("10 min");
    expect(formatDuration(754)).toBe("12 min 34 s");
  });
});
