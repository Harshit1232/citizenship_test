/**
 * Progress aggregates for the dashboard and progress pages. Ported from the
 * original app's agg(), heatmap and drillWeak(), as pure functions so they can
 * be tested without a browser.
 */
import { pct } from "./exam/score";
import type {
  Category,
  HistoryEntry,
  Part,
  PartId,
  Question,
  QuestionStats,
  Settings,
} from "./types";

export interface CategoryRow {
  id: string;
  label: string;
  part: PartId;
  partTitle: string;
  /** Questions answered in this category, across all recorded tests. */
  n: number;
  /** Of those, correct. */
  c: number;
  p: number;
}

/** Every category ever tested, worst first (ties: more answered first). */
export function categoryRows(
  history: readonly HistoryEntry[],
  categories: ReadonlyMap<string, Category>,
): CategoryRow[] {
  const tally = new Map<string, { n: number; c: number }>();
  for (const h of history) {
    for (const [id, v] of Object.entries(h.cats ?? {})) {
      const t = tally.get(id) ?? { n: 0, c: 0 };
      t.n += v.n;
      t.c += v.c;
      tally.set(id, t);
    }
  }
  const rows: CategoryRow[] = [];
  for (const [id, t] of tally) {
    const cat = categories.get(id);
    // A category that no longer exists in the bank can't be studied; skip it.
    if (!cat || t.n <= 0) continue;
    rows.push({ id, label: cat.label, part: cat.part, partTitle: cat.partTitle, n: t.n, c: t.c, p: pct(t.c, t.n) });
  }
  return rows.sort((a, b) => a.p - b.p || b.n - a.n);
}

export interface WeakStrong {
  weak: CategoryRow[];
  strong: CategoryRow[];
  /** False when every category has fewer than `minAnswered` answers, so the picture is noisy. */
  stable: boolean;
}

export function weakAndStrong(rows: readonly CategoryRow[], minAnswered = 3, size = 3): WeakStrong {
  const seen = rows.filter((r) => r.n >= minAnswered);
  const pool = seen.length ? seen : rows.slice();
  // With few categories, split them so the same row is never both weak and strong.
  const weakCount = Math.min(size, Math.ceil(pool.length / 2));
  const weak = pool.slice(0, weakCount);
  const strong = pool.slice(weakCount).reverse().slice(0, size);
  return { weak, strong, stable: seen.length > 0 };
}

export interface PartRow {
  id: PartId;
  title: string;
  n: number;
  c: number;
  p: number;
}

/** Accuracy by booklet part, in booklet order. Parts never tested are left out. */
export function partRows(rows: readonly CategoryRow[], parts: readonly Part[]): PartRow[] {
  return parts
    .map((part) => {
      const inPart = rows.filter((r) => r.part === part.id);
      const n = inPart.reduce((a, r) => a + r.n, 0);
      const c = inPart.reduce((a, r) => a + r.c, 0);
      return { id: part.id, title: part.title, n, c, p: pct(c, n) };
    })
    .filter((r) => r.n > 0);
}

export function valuesAccuracy(history: readonly HistoryEntry[]): { total: number; correct: number; p: number | null } {
  const total = history.reduce((a, h) => a + (h.vTotal || 0), 0);
  const correct = history.reduce((a, h) => a + (h.vCorrect || 0), 0);
  return { total, correct, p: total ? pct(correct, total) : null };
}

/** 0 = never wrong, 4 = wrong more than three times in four. Same bands as the original heatmap. */
export type HeatLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatCell {
  q: Question;
  seen: number;
  wrong: number;
  rate: number;
  level: HeatLevel;
}

export function heatLevel(wrong: number, rate: number): HeatLevel {
  if (wrong === 0) return 0;
  if (rate <= 0.25) return 1;
  if (rate <= 0.5) return 2;
  if (rate <= 0.75) return 3;
  return 4;
}

/** One cell per question answered at least once, most-missed first within each part. */
export function heatCells(stats: QuestionStats, questions: readonly Question[]): HeatCell[] {
  const cells: HeatCell[] = [];
  for (const q of questions) {
    const r = stats[q.id];
    if (!r || !(r.seen > 0)) continue;
    const wrong = Math.min(r.wrong || 0, r.seen);
    const rate = wrong / r.seen;
    cells.push({ q, seen: r.seen, wrong, rate, level: heatLevel(wrong, rate) });
  }
  return cells;
}

export function groupByPart(cells: readonly HeatCell[], parts: readonly Part[]): Array<{ part: Part; cells: HeatCell[] }> {
  return parts
    .map((part) => ({
      part,
      cells: cells
        .filter((c) => c.q.part === part.id)
        .sort((a, b) => b.rate - a.rate || b.wrong - a.wrong || a.q.id - b.q.id),
    }))
    .filter((g) => g.cells.length > 0);
}

/** Questions missed at least `min` times: worth reading in the booklet, not just re-testing. */
export function repeatMisses(cells: readonly HeatCell[], min = 2, limit = 10): HeatCell[] {
  return cells
    .filter((c) => c.wrong >= min)
    .sort((a, b) => b.wrong - a.wrong || b.rate - a.rate || a.q.id - b.q.id)
    .slice(0, limit);
}

/**
 * A custom test aimed at the weakest categories (below the pass mark), or null
 * when nothing is below it. Same rule as the original drillWeak().
 */
export function drillSettings(
  rows: readonly CategoryRow[],
  questions: readonly Question[],
  base: Settings,
  threshold = 75,
  limit = 5,
): Settings | null {
  const weak = rows.filter((r) => r.p < threshold).slice(0, limit);
  if (!weak.length) return null;
  const cats = weak.map((r) => r.id);
  const available = questions.filter((q) => cats.includes(q.category)).length;
  return { ...base, mode: "custom", cats, count: Math.max(1, Math.min(20, available)) };
}

export interface TrendPoint {
  at: number;
  pct: number;
  passed: boolean;
  correct: number;
  n: number;
  vCorrect: number;
  vTotal: number;
}

/** The last `limit` tests, oldest first, for the score trend. */
export function trendSeries(history: readonly HistoryEntry[], limit = 20): TrendPoint[] {
  return history.slice(-limit).map((h) => ({
    at: h.at,
    pct: h.pct,
    passed: h.passed,
    correct: h.correct,
    n: h.n,
    vCorrect: h.vCorrect,
    vTotal: h.vTotal,
  }));
}

/** "12 Oct, 2:05 pm", with the year added when it isn't this year. */
export function formatWhen(at: number, now: number = Date.now()): string {
  const d = new Date(at);
  const sameYear = d.getFullYear() === new Date(now).getFullYear();
  const date = d.toLocaleDateString("en-AU", { day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }) });
  const time = d.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" });
  return `${date}, ${time}`;
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (!m) return `${r} s`;
  return r ? `${m} min ${r} s` : `${m} min`;
}
