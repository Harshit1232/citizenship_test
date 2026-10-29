/**
 * Crash-safe in-progress test. Written on every answer, flag and move, so a
 * refresh, a phone call or a flat battery costs nothing but clock time.
 * Shape and key are the same as the original app's `ocb.active`.
 */
import type { ActiveSession, AnswerPick, Question, Settings } from "../types";
import { KEYS, load, remove, save } from "../storage/store";

export interface RunningTest {
  paper: Question[];
  picks: AnswerPick[];
  flags: boolean[];
  cur: number;
  startedAt: number;
  /** Epoch ms; 0 when untimed. */
  deadline: number;
  mode: Settings["mode"];
  showValuesTag: boolean;
}

export function toActiveSession(t: RunningTest, now: number): ActiveSession {
  return {
    v: 1,
    at: now,
    ids: t.paper.map((q) => q.id),
    picks: t.picks.slice(),
    flags: t.flags.slice(),
    cur: t.cur,
    startedAt: t.startedAt,
    endsAt: t.deadline || 0,
    timed: !!t.deadline,
    mode: t.mode,
    showValuesTag: t.showValuesTag,
  };
}

/**
 * Rebuild a running test from storage. Returns null when the saved session is
 * missing, malformed, or refers to questions that no longer exist.
 */
export function restoreSession(
  raw: unknown,
  byId: ReadonlyMap<number, Question>,
): RunningTest | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as Partial<ActiveSession>;
  if (!Array.isArray(a.ids) || a.ids.length === 0) return null;
  const paper: Question[] = [];
  for (const id of a.ids) {
    const q = byId.get(id);
    if (!q) return null; // the bank changed underneath it
    paper.push(q);
  }
  if (!Array.isArray(a.picks) || a.picks.length !== paper.length) return null;
  const picks: AnswerPick[] = a.picks.map((p, i) =>
    typeof p === "number" && p >= 0 && p < paper[i].options.length ? p : null,
  );
  const flags = (Array.isArray(a.flags) ? a.flags : []).map(Boolean).slice(0, paper.length);
  while (flags.length < paper.length) flags.push(false);
  const cur = Math.min(Math.max(0, Math.floor(Number(a.cur) || 0)), paper.length - 1);
  return {
    paper,
    picks,
    flags,
    cur,
    startedAt: typeof a.startedAt === "number" ? a.startedAt : Date.now(),
    deadline: a.timed && typeof a.endsAt === "number" ? a.endsAt : 0,
    mode: a.mode === "custom" ? "custom" : "official",
    showValuesTag: a.showValuesTag === true,
  };
}

export function saveActive(t: RunningTest, now: number = Date.now()): void {
  if (!t.paper.length) return;
  save(KEYS.active, toActiveSession(t, now));
}

export function loadActive(byId: ReadonlyMap<number, Question>): RunningTest | null {
  return restoreSession(load<unknown>(KEYS.active, null), byId);
}

export function clearActive(): void {
  remove(KEYS.active);
}

export function answeredCount(picks: readonly AnswerPick[]): number {
  return picks.filter((p) => p !== null).length;
}

export function isExpired(t: Pick<RunningTest, "deadline">, now: number): boolean {
  return t.deadline > 0 && t.deadline <= now;
}

export function secondsLeft(t: Pick<RunningTest, "deadline">, now: number): number {
  return t.deadline ? Math.max(0, Math.round((t.deadline - now) / 1000)) : 0;
}
