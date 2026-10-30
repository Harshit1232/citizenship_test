/**
 * Paper planning and generation. Ported from the original app's plan() and
 * buildPaper(): one planner feeds both the start-screen preview and the paper
 * builder, so the number of questions promised is the number delivered.
 */
import type { PartId, Question, Settings, TestRules } from "../types";

export type Rng = () => number;

/** Booklet order. Papers are sorted this way, so values questions come last. */
export const PART_ORDER: readonly PartId[] = ["part1", "part2", "part3", "part4", "glossary"];

/** The parts the real test draws from. The glossary is study material only. */
export const EXAM_PARTS: readonly PartId[] = ["part1", "part2", "part3", "part4"];

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
  if (settings.mode === "official") return all.filter((q) => EXAM_PARTS.includes(q.part));
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

/**
 * Shares `total` across groups as evenly as possible, one at a time, without
 * giving any group more than it has. E.g. 15 across [101, 49, 112] is 5/5/5.
 */
export function allocate(total: number, sizes: readonly number[]): number[] {
  const out = sizes.map(() => 0);
  let left = Math.min(Math.max(0, total), sizes.reduce((a, b) => a + b, 0));
  while (left > 0) {
    for (let i = 0; i < sizes.length && left > 0; i++) {
      if (out[i] < sizes[i]) {
        out[i]++;
        left--;
      }
    }
  }
  return out;
}

/** Stable sort into booklet order; keeps the shuffled order within each part. */
export function byPartOrder(paper: readonly Question[]): Question[] {
  const rank = (q: Question) => {
    const i = PART_ORDER.indexOf(q.part);
    return i === -1 ? PART_ORDER.length : i;
  };
  return paper
    .map((q, i) => ({ q, i }))
    .sort((a, b) => rank(a.q) - rank(b.q) || a.i - b.i)
    .map((x) => x.q);
}

/**
 * Real-test format: the non-values questions are shared evenly across Parts
 * 1 to 3 and the values questions come from Part 4, then the paper is put in
 * part order. For 20 questions that is 5 from each part, values last, which is
 * how the official practice test lays its paper out.
 */
function buildOfficial(p: PaperPlan, rng: Rng): Question[] {
  const nonValueParts = EXAM_PARTS.filter((id) => id !== "part4");
  const groups = nonValueParts.map((id) => shuffle(p.nonValues.filter((q) => q.part === id), rng));
  const counts = allocate(p.want - p.vCount, groups.map((g) => g.length));
  const rest = groups.flatMap((g, i) => g.slice(0, counts[i]));
  const values = shuffle(p.vPool, rng).slice(0, p.vCount);
  return byPartOrder(rest.concat(values));
}

export function buildPaper(
  settings: Settings,
  all: readonly Question[],
  rules: TestRules,
  rng: Rng = Math.random,
): Question[] {
  const p = plan(settings, all, rules);
  if (settings.mode === "official" && p.vCount) return buildOfficial(p, rng);
  if (!p.vCount) return byPartOrder(shuffle(p.pool, rng).slice(0, p.want));
  const values = shuffle(p.vPool, rng).slice(0, p.vCount);
  const rest = shuffle(p.nonValues, rng).slice(0, Math.max(0, p.want - p.vCount));
  return byPartOrder(shuffle(values.concat(rest), rng));
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
