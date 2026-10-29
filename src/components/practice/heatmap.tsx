"use client";

import { useRef, useState } from "react";
import type { HeatCell, HeatLevel } from "@/lib/progress";
import type { Part } from "@/lib/types";
import { Explanation } from "@/components/exam/explanation";
import { IconCheck } from "@/components/ui/icons";
import { cx } from "@/lib/cx";
import { PartDot } from "./ui";

/**
 * One square per question answered at least once. Level 0 (never missed) is a
 * green wash; levels 1 to 4 step up one red ramp. Every missed square also
 * prints how many times it was missed, so colour is never the only signal.
 * The whole map is one tab stop: arrow keys move between squares.
 */
const LEVEL_CLASS: Record<HeatLevel, string> = {
  0: "bg-pass-tint border-pass/40 text-euc-deep",
  1: "bg-[color-mix(in_oklab,var(--fail)_18%,var(--surface))] border-transparent text-ink",
  2: "bg-[color-mix(in_oklab,var(--fail)_38%,var(--surface))] border-transparent text-ink",
  3: "bg-[color-mix(in_oklab,var(--fail)_62%,var(--surface))] border-transparent text-ink",
  4: "bg-fail border-transparent text-surface",
};

export const LEVEL_LABEL: Record<HeatLevel, string> = {
  0: "Never missed",
  1: "Missed up to a quarter of the time",
  2: "Missed up to half the time",
  3: "Missed up to three quarters of the time",
  4: "Missed most times",
};

export function Heatmap({ groups }: { groups: Array<{ part: Part; cells: HeatCell[] }> }) {
  const flat = groups.flatMap((g) => g.cells);
  const [focus, setFocus] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function move(to: number) {
    const i = Math.max(0, Math.min(flat.length - 1, to));
    setFocus(i);
    refs.current[i]?.focus();
  }

  function onKey(e: React.KeyboardEvent, i: number) {
    const map: Record<string, number> = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: flat.length - 1 };
    if (e.key in map) {
      e.preventDefault();
      move(map[e.key]);
    }
  }

  const selected = open !== null ? flat[open] : null;
  // Position of each group's first square in the flat list (for roving focus).
  const offsets = groups.map((_, gi) => groups.slice(0, gi).reduce((a, g) => a + g.cells.length, 0));

  return (
    <div>
      <div className="space-y-6">
        {groups.map((g, gi) => (
          <div key={g.part.id}>
            <h3 className="flex items-center gap-2 text-small font-bold text-ink">
              <PartDot part={g.part.id} />
              {g.part.title}
              <span className="font-normal text-muted">({g.cells.length})</span>
            </h3>
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {g.cells.map((c, ci) => {
                const i = offsets[gi] + ci;
                const label = `${c.q.question} Missed ${c.wrong} of ${c.seen} ${c.seen === 1 ? "time" : "times"}.`;
                return (
                  <li key={c.q.id}>
                    <button
                      ref={(el) => {
                        refs.current[i] = el;
                      }}
                      type="button"
                      tabIndex={i === focus ? 0 : -1}
                      aria-label={label}
                      aria-pressed={open === i}
                      title={label}
                      onFocus={() => setFocus(i)}
                      onKeyDown={(e) => onKey(e, i)}
                      onClick={() => setOpen(open === i ? null : i)}
                      className={cx(
                        "grid size-9 place-items-center rounded-[6px] border text-caption font-bold tabular-nums transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-1",
                        LEVEL_CLASS[c.level],
                        open === i && "outline-2 outline-offset-2 outline-ink",
                      )}
                    >
                      {c.wrong > 0 ? c.wrong : <IconCheck size={14} strokeWidth={2.6} />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-caption text-muted" aria-label="Key">
        {([0, 1, 2, 3, 4] as HeatLevel[]).map((l) => (
          <li key={l} className="flex items-center gap-2">
            <span aria-hidden="true" className={cx("inline-block size-3.5 rounded-[4px] border", LEVEL_CLASS[l])} />
            {LEVEL_LABEL[l]}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-caption text-muted">The number in a square is how many times you missed that question.</p>

      <div aria-live="polite">
        {selected && (
          <div key={selected.q.id} className="anim-rise mt-6 rounded-md border border-line bg-paper p-5">
            <p className="flex items-center gap-2 text-caption font-bold text-muted">
              <PartDot part={selected.q.part} />
              {selected.q.categoryLabel}, missed {selected.wrong} of {selected.seen}
            </p>
            <p className="mt-2 font-bold text-ink">{selected.q.question}</p>
            <p className="mt-2 flex items-start gap-2 text-euc-deep dark:text-euc">
              <IconCheck size={18} className="mt-1 shrink-0" strokeWidth={2.4} />
              <span>
                <span className="font-bold">Correct: </span>
                {selected.q.answer}
              </span>
            </p>
            <Explanation className="mt-3" text={selected.q.explanation} source={selected.q.source} qid={selected.q.id} />
          </div>
        )}
      </div>
    </div>
  );
}
