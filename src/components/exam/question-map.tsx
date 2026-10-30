"use client";

import { useEffect, useRef } from "react";
import type { AnswerPick } from "@/lib/types";
import { cx } from "@/lib/cx";

interface QuestionListProps {
  picks: readonly AnswerPick[];
  flags: readonly boolean[];
  current: number;
  onJump: (index: number) => void;
  className?: string;
}

export type QuestionStatus = "unanswered" | "answered" | "review";

export function questionStatus(pick: AnswerPick, flag: boolean): QuestionStatus {
  if (flag) return "review";
  return pick === null ? "unanswered" : "answered";
}

const STATUS_TEXT: Record<QuestionStatus, string> = {
  unanswered: "Not answered",
  answered: "Answered",
  review: "Review later",
};

/** The status marks the official test uses: dashed ring, filled circle, question mark. */
export function StatusIcon({ status, className }: { status: QuestionStatus; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "grid size-5 shrink-0 place-items-center rounded-full text-[0.7rem] font-extrabold leading-none",
        status === "unanswered" && "border-2 border-dashed border-line-strong",
        status === "answered" && "bg-euc",
        status === "review" && "bg-wattle-text text-paper",
        className,
      )}
    >
      {status === "review" ? "?" : null}
    </span>
  );
}

/**
 * Every question as a row, like the official test's left-hand list:
 * "Question 1" to "Question 20", each with its status.
 */
export function QuestionList({ picks, flags, current, onJump, className }: QuestionListProps) {
  const listRef = useRef<HTMLOListElement>(null);

  // Keep the current question in view when the list scrolls.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[aria-current="step"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [current]);

  return (
    <ol ref={listRef} aria-label="Questions" className={cx("flex flex-col", className)}>
      {picks.map((p, i) => {
        const isCurrent = i === current;
        const status = questionStatus(p, flags[i]);
        const answered = p !== null;
        const label =
          status === "review"
            ? `${answered ? "answered" : "not answered"}, marked review later`
            : STATUS_TEXT[status].toLowerCase();
        return (
          <li key={i}>
            <button
              type="button"
              onClick={() => onJump(i)}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`Question ${i + 1}, ${label}`}
              className={cx(
                "flex min-h-9 w-full items-center gap-3 border-l-4 py-1 pl-3 pr-2 text-left text-small transition-colors duration-150",
                isCurrent ? "border-euc bg-euc-tint font-bold text-ink" : "border-transparent text-copy hover:bg-sunk hover:text-ink",
              )}
            >
              <StatusIcon status={status} />
              <span className="tabular-nums">Question {i + 1}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function StatusLegend({ className }: { className?: string }) {
  return (
    <ul className={cx("flex flex-wrap gap-x-4 gap-y-2 text-caption text-muted", className)} aria-label="Key">
      {(Object.keys(STATUS_TEXT) as QuestionStatus[]).map((s) => (
        <li key={s} className="flex items-center gap-1.5">
          <StatusIcon status={s} className="size-4 text-[0.6rem]" />
          {STATUS_TEXT[s]}
        </li>
      ))}
    </ul>
  );
}
