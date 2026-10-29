/**
 * The readiness check: a published rule, not a prediction.
 *
 * You are "ready by our rule" when both are true:
 *  1. your last 3 practice tests in the real format each scored 85% or more,
 *     with every values question right, and
 *  2. you have cleared the values gate.
 *
 * The thresholds are a judgement call, written down so people can see and
 * argue with them. Nobody, including us, can predict a pass.
 */
import type { HistoryEntry } from "./types";

export const READINESS = { tests: 3, minPct: 85, questions: 20 } as const;

export interface ReadinessResult {
  /** The tests the rule looks at: the last 3 in the real format, oldest first. */
  recent: HistoryEntry[];
  testsMet: boolean;
  gateMet: boolean;
  ready: boolean;
}

/** A test counts if it used the real format: official mode, 20 questions, values rule on. */
export function isRealFormat(h: HistoryEntry): boolean {
  return h.mode === "official" && h.n === READINESS.questions && h.valuesEnforced && h.vTotal > 0;
}

export function testMeetsBar(h: HistoryEntry): boolean {
  return h.pct >= READINESS.minPct && h.vCorrect === h.vTotal;
}

export function readiness(history: readonly HistoryEntry[], gateCleared: boolean): ReadinessResult {
  const recent = history.filter(isRealFormat).slice(-READINESS.tests);
  const testsMet = recent.length === READINESS.tests && recent.every(testMeetsBar);
  return { recent, testsMet, gateMet: gateCleared, ready: testsMet && gateCleared };
}
