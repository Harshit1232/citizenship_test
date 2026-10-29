/**
 * Per-question statistics and history aggregates. Same shapes as the original
 * app, so the heatmap and "keeps catching you out" lists carry over.
 */
import type { HistoryEntry, Question, QuestionStats } from "./types";
import { KEYS, load, save } from "./storage/store";
import { pct } from "./exam/score";

export function applyResults(
  stats: QuestionStats,
  paper: readonly Question[],
  marks: readonly boolean[],
  now: number,
): QuestionStats {
  const next: QuestionStats = { ...stats };
  paper.forEach((q, i) => {
    const prev = next[q.id] ?? { seen: 0, wrong: 0, streak: 0 };
    const r = { ...prev };
    r.seen++;
    if (marks[i]) {
      r.streak = (r.streak || 0) + 1;
    } else {
      r.wrong++;
      r.streak = 0;
      r.lastWrongAt = now;
    }
    next[q.id] = r;
  });
  return next;
}

export function loadStats(): QuestionStats {
  return load<QuestionStats>(KEYS.qstats, {});
}

export function saveStats(stats: QuestionStats): void {
  save(KEYS.qstats, stats);
}

export function loadHistory(): HistoryEntry[] {
  const h = load<HistoryEntry[]>(KEYS.history, []);
  return Array.isArray(h) ? h : [];
}

export function saveHistory(history: readonly HistoryEntry[]): void {
  save(KEYS.history, history);
}

export interface HistorySummary {
  n: number;
  avg: number;
  best: number;
  passRate: number;
}

export function summariseHistory(history: readonly HistoryEntry[]): HistorySummary {
  const n = history.length;
  if (!n) return { n: 0, avg: 0, best: 0, passRate: 0 };
  const avg = Math.round(history.reduce((a, h) => a + h.pct, 0) / n);
  const best = Math.max(...history.map((h) => h.pct));
  const passes = history.filter((h) => h.passed).length;
  return { n, avg, best, passRate: pct(passes, n) };
}
