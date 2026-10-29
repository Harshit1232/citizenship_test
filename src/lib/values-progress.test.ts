import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { QUESTIONS } from "@/lib/bank";
import { seededRng } from "@/lib/exam/plan";
import { setStoreForTesting, type KeyValueStore } from "@/lib/storage/store";
import { SCENARIOS, VALUES_AREAS } from "@/data/values-scenarios";
import type { HistoryEntry } from "@/lib/types";
import {
  GATE,
  areaProgress,
  buildGateRun,
  emptyValues,
  gateItemKey,
  loadValues,
  nextScenarioIndex,
  recordGateRun,
  recordScenario,
  saveValues,
} from "./values-progress";
import { readiness } from "./readiness";

function memStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}

describe("values progress", () => {
  let store: ReturnType<typeof memStore>;
  beforeEach(() => {
    store = memStore();
    setStoreForTesting(store);
  });
  afterEach(() => setStoreForTesting(null));

  it("records only the first attempt at a scenario", () => {
    let s = emptyValues();
    s = recordScenario(s, SCENARIOS[0].id, false, 1);
    s = recordScenario(s, SCENARIOS[0].id, true, 2);
    expect(s.scenarios[SCENARIOS[0].id]).toEqual({ first: false, at: 1 });
    expect(areaProgress(s, "law")).toEqual({ done: 1, total: 6, firstTryRight: 0 });
    expect(nextScenarioIndex(s, "law")).toBe(1);
  });

  it("round-trips through storage and drops malformed entries", () => {
    saveValues(recordScenario(emptyValues(), SCENARIOS[1].id, true, 5));
    expect(loadValues().scenarios[SCENARIOS[1].id]).toEqual({ first: true, at: 5 });
    store.data.set(
      "ocb.values",
      JSON.stringify({ scenarios: { "not-a-scenario": { first: true, at: 1 }, [SCENARIOS[2].id]: { first: "yes" } }, gate: { best: 99, cleared: "no" } }),
    );
    const v = loadValues();
    expect(v.scenarios).toEqual({});
    expect(v.gate).toEqual({ best: GATE.length, runs: 0, cleared: false });
  });

  it("clears the gate only on a full run, and keeps the first clear date", () => {
    let s = recordGateRun(emptyValues(), 4, 10);
    expect(s.gate).toEqual({ best: 4, runs: 1, cleared: false });
    s = recordGateRun(s, GATE.length, 20);
    expect(s.gate).toMatchObject({ best: GATE.length, runs: 2, cleared: true, clearedAt: 20 });
    s = recordGateRun(s, 2, 30);
    expect(s.gate).toMatchObject({ best: GATE.length, cleared: true, clearedAt: 20 });
  });

  it("builds a gate run with 2 different items from every area", () => {
    for (let seed = 1; seed < 30; seed++) {
      const run = buildGateRun(QUESTIONS, seededRng(seed));
      expect(run).toHaveLength(GATE.length);
      expect(new Set(run.map(gateItemKey)).size).toBe(GATE.length);
      for (const a of VALUES_AREAS) expect(run.filter((i) => i.area === a.id)).toHaveLength(2);
    }
  });
});

describe("readiness", () => {
  const t = (over: Partial<HistoryEntry>): HistoryEntry => ({
    at: 0, mode: "official", n: 20, correct: 18, pct: 90, vTotal: 5, vCorrect: 5,
    valuesEnforced: true, passed: true, seconds: 900, cats: {}, ...over,
  });

  it("needs the last three real-format tests at 85% or more with no values errors, and the gate", () => {
    const good = [t({}), t({}), t({ pct: 85, correct: 17 })];
    expect(readiness(good, true).ready).toBe(true);
    expect(readiness(good, false)).toMatchObject({ testsMet: true, gateMet: false, ready: false });
    expect(readiness([...good.slice(0, 2), t({ vCorrect: 4, passed: false })], true).testsMet).toBe(false);
    expect(readiness([...good.slice(0, 2), t({ pct: 80, correct: 16 })], true).testsMet).toBe(false);
    expect(readiness(good.slice(0, 2), true).testsMet).toBe(false);
  });

  it("ignores custom tests when looking at the last three", () => {
    const history = [t({}), t({}), t({}), t({ mode: "custom", n: 10, pct: 40, correct: 4 })];
    const r = readiness(history, true);
    expect(r.recent).toHaveLength(3);
    expect(r.ready).toBe(true);
  });
});
