/**
 * The question bank. Import this ONLY from practice routes: it is ~250 KB of
 * JSON, and marketing pages must not ship it.
 */
import raw from "@/data/question-bank.json";
import type { Category, Part, Question, TestRules } from "./types";

interface BankFile {
  meta: {
    name: string;
    source: string;
    totalQuestions: number;
    valuesQuestions: number;
    officialTestRules: TestRules;
  };
  categories: Category[];
  questions: Question[];
}

const bank = raw as unknown as BankFile;

export const QUESTIONS: readonly Question[] = bank.questions;
export const CATEGORIES: readonly Category[] = bank.categories;
export const RULES: TestRules = bank.meta.officialTestRules;
export const BANK_META = bank.meta;

export const QUESTION_BY_ID: ReadonlyMap<number, Question> = new Map(
  QUESTIONS.map((q) => [q.id, q]),
);

export const CATEGORY_BY_ID: ReadonlyMap<string, Category> = new Map(
  CATEGORIES.map((c) => [c.id, c]),
);

/** Parts in booklet order, derived from the categories (same as the original app). */
export const PARTS: readonly Part[] = CATEGORIES.reduce<Part[]>((acc, c) => {
  if (!acc.some((p) => p.id === c.part)) {
    acc.push({ id: c.part, title: c.partTitle, isValues: c.isValues });
  }
  return acc;
}, []);

export const VALUES_QUESTIONS: readonly Question[] = QUESTIONS.filter(
  (q) => q.isValuesQuestion,
);
