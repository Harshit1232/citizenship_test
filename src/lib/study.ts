/**
 * Study mode: browse the bank with answers showing. Nothing here is scored.
 * The saved position uses the original app's `ocb.study` shape, so a returning
 * user lands on the same card, in the same shuffled order.
 */
import { KEYS, load, save } from "./storage/store";
import type { Category, Part, PartId, Question, QuestionStats, StudyState } from "./types";

export type StudyFilter = "all" | `part:${PartId}` | `cat:${string}`;

export const DEFAULT_STUDY: StudyState = { view: "flash", filter: "all", idx: 0, order: null };

/** Accepts only filters that still match a part or category in the bank. */
export function parseFilter(
  raw: unknown,
  parts: readonly Part[],
  categories: ReadonlyMap<string, Category>,
): StudyFilter {
  if (typeof raw !== "string") return "all";
  if (raw.startsWith("part:")) {
    const id = raw.slice(5);
    return parts.some((p) => p.id === id) ? (raw as StudyFilter) : "all";
  }
  if (raw.startsWith("cat:")) {
    return categories.has(raw.slice(4)) ? (raw as StudyFilter) : "all";
  }
  return "all";
}

export function studyPool(
  questions: readonly Question[],
  filter: StudyFilter,
  missedOnly: boolean,
  stats: QuestionStats,
): Question[] {
  let list = questions.slice();
  if (filter.startsWith("part:")) {
    const part = filter.slice(5);
    list = list.filter((q) => q.part === part);
  } else if (filter.startsWith("cat:")) {
    const cat = filter.slice(4);
    list = list.filter((q) => q.category === cat);
  }
  if (missedOnly) list = list.filter((q) => (stats[q.id]?.wrong ?? 0) > 0);
  return list;
}

/**
 * Reapply a saved shuffle only if it is an exact permutation of the pool.
 * A length check alone isn't enough: a repeat plus a dead id would pass it and
 * silently drop a card.
 */
export function applyOrder(pool: readonly Question[], order: readonly number[] | null): Question[] | null {
  if (!order || order.length !== pool.length) return null;
  const byId = new Map(pool.map((q) => [q.id, q]));
  const seen = new Set<number>();
  const out: Question[] = [];
  for (const id of order) {
    const q = byId.get(id);
    if (!q || seen.has(id)) return null;
    seen.add(id);
    out.push(q);
  }
  return out;
}

export function loadStudy(): StudyState {
  const raw = load<Partial<StudyState> | null>(KEYS.study, null);
  if (!raw || typeof raw !== "object") return { ...DEFAULT_STUDY };
  return {
    view: raw.view === "list" ? "list" : "flash",
    filter: typeof raw.filter === "string" ? raw.filter : "all",
    idx: typeof raw.idx === "number" && Number.isInteger(raw.idx) && raw.idx >= 0 ? raw.idx : 0,
    order: Array.isArray(raw.order) && raw.order.every((n) => Number.isInteger(n)) ? raw.order.slice(0, 400) : null,
  };
}

export function saveStudy(state: StudyState): void {
  save(KEYS.study, { ...state, order: state.order ? state.order.slice(0, 400) : null });
}
