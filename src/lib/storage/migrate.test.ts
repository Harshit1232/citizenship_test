import { beforeEach, describe, expect, it } from "vitest";
import { CATEGORIES, QUESTIONS } from "@/lib/bank";
import { loadSettings } from "@/lib/settings";
import { applyResults, loadHistory, loadStats } from "@/lib/stats";
import { SCHEMA_VERSION, migrateStorage } from "./migrate";
import { setStoreForTesting, type KeyValueStore } from "./store";

function fakeStore(seed: Record<string, unknown>): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>(
    Object.entries(seed).map(([k, v]) => [k, typeof v === "string" && v.startsWith("RAW:") ? v.slice(4) : JSON.stringify(v)]),
  );
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

const legacyEntry = {
  at: 1_700_000_000_000,
  mode: "official",
  n: 20,
  correct: 18,
  pct: 90,
  vTotal: 5,
  vCorrect: 5,
  valuesEnforced: true,
  passed: true,
  seconds: 600,
  cats: { "indigenous-heritage": { n: 2, c: 2 } },
};

describe("migrateStorage", () => {
  let store: ReturnType<typeof fakeStore>;

  beforeEach(() => {
    store = fakeStore({
      "ocb.settings": { mode: "custom", cats: ["glossary"], count: 12, timerOn: false, minutes: 30, forceValues: false, showValuesTag: true },
      "ocb.history": [legacyEntry, { broken: true }, legacyEntry],
      "ocb.qstats": { "5": { seen: 3, wrong: 2, streak: 0, lastWrongAt: 1 } },
      "ocb.theme": "dark",
    });
    setStoreForTesting(store);
  });

  it("upgrades unversioned data to the current schema", () => {
    expect(migrateStorage(42)).toEqual({ from: 0, to: SCHEMA_VERSION });
    expect(JSON.parse(store.data.get("ocb.schema") as string)).toEqual({ v: SCHEMA_VERSION, migratedAt: 42 });
  });

  it("keeps every well-formed history entry and drops only corrupt ones", () => {
    migrateStorage();
    const h = loadHistory();
    expect(h).toHaveLength(2);
    expect(h[0]).toEqual(legacyEntry);
  });

  it("leaves settings, question stats and theme untouched", () => {
    migrateStorage();
    const s = loadSettings(CATEGORIES.map((c) => c.id));
    expect(s).toMatchObject({ mode: "custom", cats: ["glossary"], count: 12, timerOn: false, minutes: 30, showValuesTag: true });
    expect(loadStats()["5"]).toEqual({ seen: 3, wrong: 2, streak: 0, lastWrongAt: 1 });
    expect(JSON.parse(store.data.get("ocb.theme") as string)).toBe("dark");
  });

  it("is idempotent", () => {
    migrateStorage(1);
    expect(migrateStorage(2)).toEqual({ from: SCHEMA_VERSION, to: SCHEMA_VERSION });
  });

  it("removes values that would crash the app", () => {
    store = fakeStore({ "ocb.history": "RAW:{not json", "ocb.qstats": [1, 2], "ocb.theme": "purple" });
    setStoreForTesting(store);
    migrateStorage();
    expect(loadHistory()).toEqual([]);
    expect(store.data.has("ocb.qstats")).toBe(false);
    expect(store.data.has("ocb.theme")).toBe(false);
  });
});

describe("applyResults", () => {
  it("updates seen, wrong and streak like the original app", () => {
    const paper = QUESTIONS.slice(0, 2);
    const s1 = applyResults({}, paper, [true, false], 100);
    expect(s1["1"]).toEqual({ seen: 1, wrong: 0, streak: 1 });
    expect(s1["2"]).toEqual({ seen: 1, wrong: 1, streak: 0, lastWrongAt: 100 });
    const s2 = applyResults(s1, paper, [true, true], 200);
    expect(s2["1"]).toMatchObject({ seen: 2, wrong: 0, streak: 2 });
    expect(s2["2"]).toMatchObject({ seen: 2, wrong: 1, streak: 1, lastWrongAt: 100 });
  });
});
