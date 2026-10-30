/**
 * Shared types. Shapes for stored data (Settings, HistoryEntry, QuestionStat,
 * ActiveSession, StudyState) match what the original single-file app wrote to
 * localStorage, so existing users keep their data.
 */

export type PartId = "part1" | "part2" | "part3" | "part4" | "glossary";

export interface Question {
  id: number;
  part: PartId;
  partLabel: string;
  partTitle: string;
  category: string;
  categoryLabel: string;
  isValuesQuestion: boolean;
  question: string;
  options: string[];
  answerIndex: number;
  answerLetter: string;
  answer: string;
  explanation: string;
  /** Booklet page reference, e.g. "p.35". */
  source: string;
}

export interface Category {
  id: string;
  label: string;
  part: PartId;
  partTitle: string;
  isValues: boolean;
  count: number;
}

export interface TestRules {
  questionsPerTest: number;
  valuesQuestionsPerTest: number;
  timeLimitMinutes: number;
  passMarkPercent: number;
  passMarkCorrect: number;
  allValuesQuestionsMustBeCorrect: boolean;
}

export interface Part {
  id: PartId;
  title: string;
  isValues: boolean;
}

export type TestMode = "official" | "custom";

export interface Settings {
  mode: TestMode;
  cats: string[];
  count: number;
  timerOn: boolean;
  minutes: number;
  forceValues: boolean;
  /**
   * No longer used: part labels are always shown, as on the official
   * practice test, and Part 4 is the values part. Kept so stored settings
   * from the original app keep their shape.
   */
  showValuesTag: boolean;
  /** Larger question and answer text during a test. */
  largeText: boolean;
}

export interface CategoryTally {
  n: number;
  c: number;
}

export interface HistoryEntry {
  at: number;
  mode: TestMode;
  n: number;
  correct: number;
  pct: number;
  vTotal: number;
  vCorrect: number;
  valuesEnforced: boolean;
  passed: boolean;
  seconds: number;
  cats: Record<string, CategoryTally>;
}

export interface QuestionStat {
  seen: number;
  wrong: number;
  streak: number;
  lastWrongAt?: number;
}

export type QuestionStats = Record<string, QuestionStat>;

export type AnswerPick = number | null;

export interface ActiveSession {
  v: 1;
  at: number;
  ids: number[];
  picks: AnswerPick[];
  flags: boolean[];
  cur: number;
  startedAt: number;
  /** Deadline as epoch ms; 0 when untimed. */
  endsAt: number;
  timed: boolean;
  mode: TestMode;
  /** Written as true; not read. See Settings.showValuesTag. */
  showValuesTag: boolean;
}

export type ThemePreference = "system" | "light" | "dark";

export interface StudyState {
  view: "flash" | "list";
  filter: string;
  idx: number;
  order: number[] | null;
}
