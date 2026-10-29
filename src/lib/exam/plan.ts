/**
 * Paper planning and generation. Ported from the original app's plan() and
 * buildPaper(): one planner feeds both the start-screen preview and the paper
 * builder, so the number of questions promised is the number delivered.
 */
import type { Question, Settings, TestRules } from "../types";

export type Rng = () => number;

export interface PaperPlan {
  /** Every question the current settings allow. */
  pool: readonly Question[];
  nonValues: readonly Question[];
  /** Where the values questions come from. */
  vPool: readonly Question[];
  /** Questions the paper will contain. */
  want: number;
  /** Values questions the paper will contain. */
  vCount: number;
  /** Most questions these settings could ever produce. */
  cap: number;
}

export function testPool(settings: Settings, all: readonly Question[]): readonly Question[] {
  if (settings.mode === "official") return all;
  const chosen = new Set(settings.cats);
  return all.filter((q) => chosen.has(q.category));
}

export function plan(
  settings: Settings,
  all: readonly Question[],
  rules: TestRules,
): PaperPlan {
  const pool = testPool(settings, all);
  const wantValues = settings.mode === "official" || settings.forceValues;
  const nonValues = pool.filter((q) => !q.isValuesQuestion);

  if (!wantValues) {
    const want = Math.min(settings.count, pool.length);
    return { pool, nonValues: pool, vPool: [], want, vCount: 0, cap: pool.length };
  }

  // A values-only selection becomes an all-must-be-correct drill.
  if (!nonValues.length) {
    const want = Math.min(settings.count, pool.length);
    return { pool, nonValues: [], vPool: pool, want, vCount: want, cap: pool.length };
  }

  const inSelection = pool.filter((q) => q.isValuesQuestion);
  const vPool =
    settings.mode === "official" || inSelection.length < rules.valuesQuestionsPerTest
      ? all.filter((q) => q.isValuesQuestion)
      : inSelection;
  const cap = nonValues.length + Math.min(rules.valuesQuestionsPerTest, vPool.length);
  const want = Math.min(settings.count, cap);
  const vCount = Math.min(rules.valuesQuestionsPerTest, vPool.length, want);
  return { pool, nonValues, vPool, want, vCount, cap };
}

/** Fisher–Yates on a copy. */
export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildPaper(
  settings: Settings,
  all: readonly Question[],
  rules: TestRules,
  rng: Rng = Math.random,
): Question[] {
  const p = plan(settings, all, rules);
  if (!p.vCount) return shuffle(p.pool, rng).slice(0, p.want);
  const values = shuffle(p.vPool, rng).slice(0, p.vCount);
  const rest = shuffle(p.nonValues, rng).slice(0, Math.max(0, p.want - p.vCount));
  return shuffle(values.concat(rest), rng);
}

/** Small deterministic generator for tests and repeatable demos. */
export function seededRng(seed: number): Rng {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
