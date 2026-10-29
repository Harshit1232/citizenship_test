"use client";

import { IconCheck, IconCross } from "@/components/ui/icons";
import { cx } from "@/lib/cx";

const LETTERS = ["A", "B", "C", "D"];

export interface Reveal {
  answerIndex: number;
  chosen: number | null;
}

interface AnswerOptionsProps {
  /** Unique per question so the browser treats each as its own radio group. */
  name: string;
  legendId: string;
  options: readonly string[];
  value: number | null;
  onChange?: (index: number) => void;
  /** After answering in feedback mode: show right and wrong. */
  reveal?: Reveal | null;
  disabled?: boolean;
  /** Compact sizing for previews. */
  compact?: boolean;
}

/**
 * Native radio inputs styled as answer cards. Native radios give arrow-key
 * movement, screen-reader semantics and form behaviour for free; the visual
 * card is the <label>.
 */
export function AnswerOptions({
  name,
  legendId,
  options,
  value,
  onChange,
  reveal,
  disabled,
  compact,
}: AnswerOptionsProps) {
  return (
    <div role="radiogroup" aria-labelledby={legendId} className={cx("flex flex-col", compact ? "gap-2" : "gap-3")}>
      {options.map((opt, i) => {
        const id = `${name}-${i}`;
        const checked = value === i;
        const isAnswer = reveal ? reveal.answerIndex === i : false;
        const isWrongPick = reveal ? reveal.chosen === i && reveal.answerIndex !== i : false;
        const dim = reveal ? !isAnswer && !isWrongPick : false;
        return (
          <label
            key={id}
            htmlFor={id}
            className={cx(
              "group relative flex items-start gap-4 rounded-md border-2 bg-surface text-left",
              "transition-[border-color,background-color,box-shadow,opacity] duration-150 ease-out",
              compact ? "px-3.5 py-3 text-small" : "px-4 py-4 text-lead sm:px-5",
              !reveal && !disabled && "cursor-pointer hover:border-ink",
              !reveal && (checked ? "border-euc bg-euc-tint shadow-1" : "border-line-strong"),
              reveal && isAnswer && "border-pass bg-pass-tint",
              reveal && isWrongPick && "border-fail bg-fail-tint",
              reveal && dim && "border-line text-muted",
              "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
            )}
          >
            <input
              id={id}
              type="radio"
              name={name}
              value={i}
              checked={checked}
              disabled={disabled || !!reveal}
              onChange={() => onChange?.(i)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className={cx(
                "grid shrink-0 place-items-center rounded-sm border-2 font-display font-bold",
                compact ? "size-7 text-caption" : "size-9 text-small",
                "transition-colors duration-150",
                !reveal && (checked ? "border-euc bg-euc text-on-euc" : "border-line-strong text-muted"),
                reveal && isAnswer && "border-pass bg-pass text-on-euc",
                reveal && isWrongPick && "border-fail bg-fail text-white dark:text-paper",
                reveal && dim && "border-line text-muted",
              )}
            >
              {reveal && isAnswer ? (
                <IconCheck size={compact ? 15 : 18} strokeWidth={2.6} />
              ) : reveal && isWrongPick ? (
                <IconCross size={compact ? 15 : 18} strokeWidth={2.6} />
              ) : (
                LETTERS[i]
              )}
            </span>
            <span className={cx("min-w-0 pt-0.5", dim ? "text-copy" : "text-ink", compact ? "leading-snug" : "leading-normal")}>
              <span className="sr-only">{LETTERS[i]}. </span>
              {opt}
              {reveal && isAnswer && <span className="sr-only"> (correct answer)</span>}
              {reveal && isWrongPick && <span className="sr-only"> (your answer, wrong)</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}
