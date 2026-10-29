import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CATEGORIES, CATEGORY_BY_ID, PARTS, QUESTIONS } from "@/lib/bank";
import { setStoreForTesting, type KeyValueStore } from "@/lib/storage/store";
import { applyOrder, loadStudy, parseFilter, saveStudy, studyPool } from "./study";
import { buildExport, clearProgress } from "./user-data";

function memStore(seed: Record<string, string> = {}): KeyValueStore & { data: Map<string, string> } {
  const data = new Map(Object.entries(seed));
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}

describe("parseFilter", () => {
  it("accepts parts and categories that exist", () => {
    expect(parseFilter("part:part4", PARTS, CATEGORY_BY_ID)).toBe("part:part4");
    expect(parseFilter(`cat:${CATEGORIES[0].id}`, PARTS, CATEGORY_BY_ID)).toBe(`cat:${CATEGORIES[0].id}`);
  });

  it("falls back to all for anything else", () => {
    for (const bad of ["part:part9", "cat:nope", "everything", 42, null]) {
      expect(parseFilter(bad, PARTS, CATEGORY_BY_ID)).toBe("all");
    }
  });
});

describe("studyPool", () => {
  it("filters by part, category and missed", () => {
    expect(studyPool(QUESTIONS, "all", false, {})).toHaveLength(QUESTIONS.length);
    expect(studyPool(QUESTIONS, "part:part4", false, {}).every((q) => q.part === "part4")).toBe(true);
    const cat = CATEGORIES[0];
    expect(studyPool(QUESTIONS, `cat:${cat.id}`, false, {})).toHaveLength(cat.count);
    const missed = QUESTIONS[3];
    expect(studyPool(QUESTIONS, "all", true, { [missed.id]: { seen: 2, wrong: 1, streak: 0 } }).map((q) => q.id)).toEqual([missed.id]);
  });
});

describe("applyOrder", () => {
  const pool = QUESTIONS.slice(0, 4);
  it("reapplies an exact permutation", () => {
    const order = [pool[2].id, pool[0].id, pool[3].id, pool[1].id];
    expect(applyOrder(pool, order)?.map((q) => q.id)).toEqual(order);
  });

  it("rejects a repeat plus a dead id even when the length matches", () => {
    expect(applyOrder(pool, [pool[0].id, pool[0].id, pool[1].id, 99999])).toBeNull();
    expect(applyOrder(pool, [pool[0].id])).toBeNull();
    expect(applyOrder(pool, null)).toBeNull();
  });
});

describe("study and user data storage", () => {
  let store: ReturnType<typeof memStore>;
  beforeEach(() => {
    store = memStore();
    setStoreForTesting(store);
  });
  afterEach(() => setStoreForTesting(null));

  it("reads the original app's saved study position", () => {
    store.data.set("ocb.study", JSON.stringify({ view: "list", filter: "part:part2", idx: 7, order: [3, 1, 2] }));
    expect(loadStudy()).toEqual({ view: "list", filter: "part:part2", idx: 7, order: [3, 1, 2] });
  });

  it("repairs a corrupt study entry", () => {
    store.data.set("ocb.study", JSON.stringify({ view: "grid", filter: 5, idx: -3, order: ["x"] }));
    expect(loadStudy()).toEqual({ view: "flash", filter: "all", idx: 0, order: null });
    saveStudy({ view: "flash", filter: "all", idx: 2, order: null });
    expect(JSON.parse(store.data.get("ocb.study") as string).idx).toBe(2);
  });

  it("exports everything and clears only progress", () => {
    store.data.set("ocb.history", JSON.stringify([{ at: 1 }]));
    store.data.set("ocb.qstats", JSON.stringify({ 1: { seen: 1, wrong: 0, streak: 1 } }));
    store.data.set("ocb.theme", JSON.stringify("dark"));
    const out = buildExport(0);
    expect(out.history).toHaveLength(1);
    expect(out.theme).toBe("dark");
    expect(out.exportedAt).toBe("1970-01-01T00:00:00.000Z");
    clearProgress();
    expect(JSON.parse(store.data.get("ocb.history") as string)).toEqual([]);
    expect(JSON.parse(store.data.get("ocb.qstats") as string)).toEqual({});
    expect(JSON.parse(store.data.get("ocb.theme") as string)).toBe("dark");
  });
});
