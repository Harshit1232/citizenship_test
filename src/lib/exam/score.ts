/**
 * Marking. Mirrors the official rule: at least 75% overall AND every
 * Australian values question correct.
 */
import type {
  CategoryTally,
  HistoryEntry,
  PartId,
  AnswerPick,
  Question,
  Settings,
  TestRules,
} from "../types";

export function pct(correct: number, total: number): number {
  return total ? Math.round((correct / total) * 100) : 0;
}

export interface PartResult {
  part: PartId;
  title: string;
  n: number;
  c: number;
}

export interface TestResult {
  n: number;
  correct: number;
  /** Rounded percentage, for display. */
  pct: number;
  marks: boolean[];
  valuesTotal: number;
  valuesCorrect: number;
  valuesEnforced: boolean;
  scoreGate: boolean;
  valuesGate: boolean;
  passed: boolean;
  /** True when the score alone was enough but the values rule failed the test. */
  failedOnValuesOnly: boolean;
  byCategory: Record<string, CategoryTally>;
  byPart: PartResult[];
  wrongIndexes: number[];
}

export function markPaper(
  paper: readonly Question[],
  picks: readonly AnswerPick[],
  settings: Pick<Settings, "mode" | "forceValues">,
  rules: TestRules,
): TestResult {
  const marks = paper.map((q, i) => picks[i] === q.answerIndex);
  const correct = marks.filter(Boolean).length;
  const n = paper.length;

  const valueIdx = paper.flatMap((q, i) => (q.isValuesQuestion ? [i] : []));
  const valuesCorrect = valueIdx.filter((i) => marks[i]).length;
  const valuesEnforced =
    (settings.mode === "official" || settings.forceValues) && valueIdx.length > 0;

  // Compare the exact fraction, not the rounded percentage. The original app
  // compared the rounded figure, which could pass e.g. 50/67 (74.6%) on a
  // custom-length test. For 20-question tests the two agree.
  const scoreGate = n > 0 && correct * 100 >= rules.passMarkPercent * n;
  const valuesGate = valuesEnforced ? valuesCorrect === valueIdx.length : true;

  const byCategory: Record<string, CategoryTally> = {};
  const partMap = new Map<PartId, PartResult>();
  paper.forEach((q, i) => {
    const cat = (byCategory[q.category] ??= { n: 0, c: 0 });
    cat.n++;
    if (marks[i]) cat.c++;
    let part = partMap.get(q.part);
    if (!part) {
      part = { part: q.part, title: q.partTitle, n: 0, c: 0 };
      partMap.set(q.part, part);
    }
    part.n++;
    if (marks[i]) part.c++;
  });

  const order: PartId[] = ["part1", "part2", "part3", "part4", "glossary"];
  const byPart = order.flatMap((id) => {
    const p = partMap.get(id);
    return p ? [p] : [];
  });

  return {
    n,
    correct,
    pct: pct(correct, n),
    marks,
    valuesTotal: valueIdx.length,
    valuesCorrect,
    valuesEnforced,
    scoreGate,
    valuesGate,
    passed: scoreGate && valuesGate,
    failedOnValuesOnly: scoreGate && !valuesGate,
    byCategory,
    byPart,
    wrongIndexes: marks.flatMap((m, i) => (m ? [] : [i])),
  };
}

export function toHistoryEntry(
  result: TestResult,
  mode: Settings["mode"],
  startedAt: number,
  now: number,
): HistoryEntry {
  return {
    at: now,
    mode,
    n: result.n,
    correct: result.correct,
    pct: result.pct,
    vTotal: result.valuesTotal,
    vCorrect: result.valuesCorrect,
    valuesEnforced: result.valuesEnforced,
    passed: result.passed,
    seconds: Math.round((now - startedAt) / 1000),
    cats: result.byCategory,
  };
}

/** The original app kept the most recent 200 tests. */
export const HISTORY_LIMIT = 200;

export function appendHistory(
  history: readonly HistoryEntry[],
  entry: HistoryEntry,
): HistoryEntry[] {
  return history.concat(entry).slice(-HISTORY_LIMIT);
}
