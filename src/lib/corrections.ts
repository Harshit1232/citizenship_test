/**
 * Public log of fixes to the question bank, newest first. Add an entry
 * whenever a question, answer, explanation or page reference changes.
 */
export interface Correction {
  /** e.g. "12 November 2026" */
  date: string;
  /** Question reference (its id in the bank). */
  ref: number;
  change: string;
}

export const CORRECTIONS: readonly Correction[] = [];
