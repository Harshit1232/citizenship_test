import { beforeEach, describe, expect, it } from "vitest";
import { QUESTION_BY_ID, QUESTIONS, RULES } from "@/lib/bank";
import { defaultSettings } from "@/lib/settings";
import { setStoreForTesting, type KeyValueStore } from "@/lib/storage/store";
import { buildPaper, seededRng } from "./plan";
import {
  clearActive,
  isExpired,
  loadActive,
  restoreSession,
  saveActive,
  secondsLeft,
  toActiveSession,
  type RunningTest,
} from "./session";

function fakeStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

function running(): RunningTest {
  const paper = buildPaper(defaultSettings([]), QUESTIONS, RULES, seededRng(11));
  return {
    paper,
    picks: paper.map((_, i) => (i < 12 ? 0 : null)),
    flags: paper.map((_, i) => i === 3),
    cur: 12,
    startedAt: 1_000,
    deadline: 1_000 + 45 * 60_000,
    mode: "official",
  };
}

describe("session persistence", () => {
  let store: ReturnType<typeof fakeStore>;
  beforeEach(() => {
    store = fakeStore();
    setStoreForTesting(store);
  });

  it("round-trips through storage under the original key", () => {
    const t = running();
    saveActive(t, 5_000);
    expect(store.data.has("ocb.active")).toBe(true);
    const back = loadActive(QUESTION_BY_ID);
    expect(back?.paper.map((q) => q.id)).toEqual(t.paper.map((q) => q.id));
    expect(back?.picks).toEqual(t.picks);
    expect(back?.flags).toEqual(t.flags);
    expect(back?.cur).toBe(12);
    expect(back?.deadline).toBe(t.deadline);
  });

  it("reads a session written by the original app", () => {
    const legacy = {
      v: 1,
      at: 1,
      ids: [263, 1, 2],
      picks: [2, null, 0],
      flags: [false, true],
      cur: 1,
      startedAt: 10,
      endsAt: 0,
      timed: false,
      mode: "official",
      showValuesTag: false,
    };
    store.data.set("ocb.active", JSON.stringify(legacy));
    const t = loadActive(QUESTION_BY_ID);
    expect(t?.paper.map((q) => q.id)).toEqual([263, 1, 2]);
    expect(t?.flags).toEqual([false, true, false]); // padded
    expect(t?.deadline).toBe(0);
  });

  it("rejects a session that refers to a question no longer in the bank", () => {
    const s = toActiveSession(running(), 0);
    s.ids[0] = 99_999;
    expect(restoreSession(s, QUESTION_BY_ID)).toBeNull();
  });

  it("rejects a session whose answers do not line up with its questions", () => {
    const s = toActiveSession(running(), 0);
    s.picks = s.picks.slice(1);
    expect(restoreSession(s, QUESTION_BY_ID)).toBeNull();
  });

  it("drops out-of-range answers and clamps the position", () => {
    const s = toActiveSession(running(), 0);
    s.picks[0] = 7;
    s.cur = 400;
    const t = restoreSession(s, QUESTION_BY_ID);
    expect(t?.picks[0]).toBeNull();
    expect(t?.cur).toBe(19);
  });

  it("clears", () => {
    saveActive(running(), 0);
    clearActive();
    expect(loadActive(QUESTION_BY_ID)).toBeNull();
  });

  it("tracks time left and expiry", () => {
    const t = running();
    expect(secondsLeft(t, t.startedAt)).toBe(45 * 60);
    expect(isExpired(t, t.deadline - 1)).toBe(false);
    expect(isExpired(t, t.deadline)).toBe(true);
    expect(isExpired({ deadline: 0 }, Number.MAX_SAFE_INTEGER)).toBe(false);
  });
});
