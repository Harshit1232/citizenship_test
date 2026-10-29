"use client";

import { IconFlag } from "@/components/ui/icons";
import type { AnswerPick } from "@/lib/types";
import { cx } from "@/lib/cx";

interface QuestionMapProps {
  picks: readonly AnswerPick[];
  flags: readonly boolean[];
  current: number;
  onJump: (index: number) => void;
}

/** Every question as a numbered square: answered, flagged for review, current. */
export function QuestionMap({ picks, flags, current, onJump }: QuestionMapProps) {
  const answered = picks.filter((p) => p !== null).length;
  const flagged = flags.filter(Boolean).length;
  return (
    <div>
      <ol className="grid grid-cols-5 gap-2" aria-label="Questions">
        {picks.map((p, i) => {
          const isCurrent = i === current;
          const done = p !== null;
          const flag = flags[i];
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => onJump(i)}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Question ${i + 1}: ${done ? "answered" : "not answered"}${flag ? ", flagged for review" : ""}`}
                className={cx(
                  "relative grid aspect-square w-full min-h-11 place-items-center rounded-sm border-2 text-small font-bold tabular-nums",
                  "transition-[background-color,border-color,color,transform] duration-150 active:scale-95",
                  !done && "border-line-strong/60 bg-surface text-muted hover:border-ink",
                  done && "border-euc bg-euc-tint text-euc-deep hover:border-euc-deep",
                  isCurrent && "ring-2 ring-ink ring-offset-2 ring-offset-surface",
                )}
              >
                {i + 1}
                {flag && (
                  <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full border-2 border-surface bg-wattle text-on-wattle">
                    <IconFlag size={11} strokeWidth={2.6} />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-small">
        <div className="rounded-sm bg-sunk px-3 py-2">
          <dt className="text-caption text-muted">Answered</dt>
          <dd className="font-bold text-ink tabular-nums">
            {answered} of {picks.length}
          </dd>
        </div>
        <div className="rounded-sm bg-sunk px-3 py-2">
          <dt className="text-caption text-muted">To review</dt>
          <dd className="font-bold text-ink tabular-nums">{flagged}</dd>
        </div>
      </dl>
    </div>
  );
}
