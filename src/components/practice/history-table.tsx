import { IconCheck, IconCross } from "@/components/ui/icons";
import { formatDuration, formatWhen } from "@/lib/progress";
import type { HistoryEntry } from "@/lib/types";
import { cx } from "@/lib/cx";

function ResultBadge({ passed }: { passed: boolean }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm px-2 py-1 text-caption font-bold",
        passed ? "bg-pass-tint text-euc-deep" : "bg-fail-tint text-fail",
      )}
    >
      {passed ? <IconCheck size={14} strokeWidth={2.6} /> : <IconCross size={14} strokeWidth={2.6} />}
      {passed ? "Pass" : "Not a pass"}
    </span>
  );
}

function detail(h: HistoryEntry): string {
  return `${h.mode === "official" ? "Real test format" : "Custom"}${h.seconds ? `, ${formatDuration(h.seconds)}` : ""}`;
}

/**
 * Newest first. A table from the small breakpoint up, a stacked list on
 * phones. It is also the table view for the score trend chart.
 */
export function HistoryTable({
  entries,
  caption,
  now,
}: {
  entries: readonly HistoryEntry[];
  caption: string;
  now: number;
}) {
  return (
    <>
      <ul aria-label={caption} className="divide-y divide-line sm:hidden">
        {entries.map((h) => (
          <li key={`${h.at}-${h.correct}-${h.n}`} className="py-3.5 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-ink">{formatWhen(h.at, now)}</p>
                <p className="text-caption text-muted">{detail(h)}</p>
              </div>
              <ResultBadge passed={h.passed} />
            </div>
            <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-small">
              <div className="flex gap-1.5">
                <dt className="text-muted">Score</dt>
                <dd className="font-bold tabular-nums text-ink">
                  {h.correct} of {h.n} ({h.pct}%)
                </dd>
              </div>
              <div className="flex gap-1.5">
                <dt className="text-muted">Values</dt>
                <dd className={cx("font-bold tabular-nums", h.vTotal && h.vCorrect < h.vTotal ? "text-fail" : "text-ink")}>
                  {h.vTotal ? `${h.vCorrect} of ${h.vTotal}` : "None"}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <table className="hidden w-full border-collapse text-left text-small sm:table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line text-caption text-muted">
            <th scope="col" className="py-2.5 pr-3 font-bold">
              Date
            </th>
            <th scope="col" className="px-3 py-2.5 font-bold">
              Score
            </th>
            <th scope="col" className="px-3 py-2.5 font-bold">
              Values
            </th>
            <th scope="col" className="py-2.5 pl-3 font-bold">
              Result
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((h) => (
            <tr key={`${h.at}-${h.correct}-${h.n}`} className="border-b border-line last:border-b-0">
              <td className="py-3 pr-3 align-top">
                <span className="block font-bold text-ink">{formatWhen(h.at, now)}</span>
                <span className="block text-caption text-muted">{detail(h)}</span>
              </td>
              <td className="px-3 py-3 align-top tabular-nums">
                <span className="block font-bold text-ink">
                  {h.correct} of {h.n}
                </span>
                <span className="block text-caption text-muted">{h.pct}%</span>
              </td>
              <td className="px-3 py-3 align-top tabular-nums">
                {h.vTotal ? (
                  <span className={cx("font-bold", h.vCorrect === h.vTotal ? "text-ink" : "text-fail")}>
                    {h.vCorrect} of {h.vTotal}
                  </span>
                ) : (
                  <span className="text-muted">None</span>
                )}
              </td>
              <td className="py-3 pl-3 align-top">
                <ResultBadge passed={h.passed} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
