/**
 * Values mastery progress and the values gate.
 *
 * The gate: answer 10 values questions in a row correctly, 2 from each of the
 * five values areas, drawn from both the scenarios and the question bank.
 * One wrong answer ends the run. The rule is shown to the learner as is.
 */
import {
  SCENARIOS,
  SCENARIOS_BY_AREA,
  VALUES_AREAS,
  type Scenario,
  type ValuesAreaId,
} from "@/data/values-scenarios";
import { shuffle, type Rng } from "./exam/plan";
import { KEYS, load, save } from "./storage/store";
import type { Question } from "./types";

export const GATE = { perArea: 2, length: 2 * VALUES_AREAS.length } as const;

export interface ScenarioRecord {
  /** Was the first attempt right? Later attempts don't change it. */
  first: boolean;
  at: number;
}

export interface GateState {
  best: number;
  runs: number;
  cleared: boolean;
  clearedAt?: number;
}

export interface ValuesState {
  v: 1;
  scenarios: Record<string, ScenarioRecord>;
  gate: GateState;
}

export function emptyValues(): ValuesState {
  return { v: 1, scenarios: {}, gate: { best: 0, runs: 0, cleared: false } };
}

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

/** Reads `ocb.values`, keeping valid entries and dropping anything malformed. */
export function loadValues(): ValuesState {
  const raw = load<unknown>(KEYS.values, null);
  const out = emptyValues();
  if (!isObj(raw)) return out;
  const known = new Set(SCENARIOS.map((s) => s.id));
  if (isObj(raw.scenarios)) {
    for (const [id, rec] of Object.entries(raw.scenarios)) {
      if (known.has(id) && isObj(rec) && typeof rec.first === "boolean" && typeof rec.at === "number") {
        out.scenarios[id] = { first: rec.first, at: rec.at };
      }
    }
  }
  if (isObj(raw.gate)) {
    const g = raw.gate;
    const best = typeof g.best === "number" && g.best >= 0 ? Math.min(Math.floor(g.best), GATE.length) : 0;
    out.gate = {
      best,
      runs: typeof g.runs === "number" && g.runs >= 0 ? Math.floor(g.runs) : 0,
      cleared: g.cleared === true,
      ...(typeof g.clearedAt === "number" ? { clearedAt: g.clearedAt } : {}),
    };
  }
  return out;
}

export function saveValues(state: ValuesState): void {
  save(KEYS.values, state);
}

/** Records the first attempt at a scenario. Repeat attempts are not recorded. */
export function recordScenario(state: ValuesState, id: string, correct: boolean, now: number): ValuesState {
  if (state.scenarios[id]) return state;
  return { ...state, scenarios: { ...state.scenarios, [id]: { first: correct, at: now } } };
}

export function recordGateRun(state: ValuesState, streak: number, now: number): ValuesState {
  const cleared = streak >= GATE.length;
  return {
    ...state,
    gate: {
      best: Math.max(state.gate.best, Math.min(streak, GATE.length)),
      runs: state.gate.runs + 1,
      cleared: state.gate.cleared || cleared,
      ...(state.gate.clearedAt !== undefined
        ? { clearedAt: state.gate.clearedAt }
        : cleared
          ? { clearedAt: now }
          : {}),
    },
  };
}

export interface AreaProgress {
  done: number;
  total: number;
  firstTryRight: number;
}

export function areaProgress(state: ValuesState, area: ValuesAreaId): AreaProgress {
  const list = SCENARIOS_BY_AREA[area];
  const recs = list.map((s) => state.scenarios[s.id]).filter(Boolean);
  return { done: recs.length, total: list.length, firstTryRight: recs.filter((r) => r.first).length };
}

export function overallProgress(state: ValuesState): AreaProgress {
  const recs = SCENARIOS.map((s) => state.scenarios[s.id]).filter(Boolean);
  return { done: recs.length, total: SCENARIOS.length, firstTryRight: recs.filter((r) => r.first).length };
}

/** The first scenario in an area not yet tried, or the first one if all are done. */
export function nextScenarioIndex(state: ValuesState, area: ValuesAreaId): number {
  const list = SCENARIOS_BY_AREA[area];
  const i = list.findIndex((s) => !state.scenarios[s.id]);
  return i === -1 ? 0 : i;
}

export type GateItem =
  | { kind: "scenario"; area: ValuesAreaId; scenario: Scenario }
  | { kind: "bank"; area: ValuesAreaId; question: Question };

/**
 * A gate run: `perArea` items from each area, mixing scenarios and bank
 * questions, in random order. No item appears twice.
 */
export function buildGateRun(bank: readonly Question[], rng: Rng = Math.random): GateItem[] {
  const items: GateItem[] = [];
  for (const area of VALUES_AREAS) {
    const pool: GateItem[] = [
      ...SCENARIOS_BY_AREA[area.id].map((scenario) => ({ kind: "scenario" as const, area: area.id, scenario })),
      ...bank
        .filter((q) => q.isValuesQuestion && q.category === area.bankCategory)
        .map((question) => ({ kind: "bank" as const, area: area.id, question })),
    ];
    items.push(...shuffle(pool, rng).slice(0, GATE.perArea));
  }
  return shuffle(items, rng);
}

export function gateItemKey(item: GateItem): string {
  return item.kind === "scenario" ? `s:${item.scenario.id}` : `q:${item.question.id}`;
}
