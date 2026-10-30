import Link from "next/link";
import { IconBook } from "@/components/ui/icons";
import { ListenButton } from "./listen-button";
import { officialLinks } from "@/lib/site";
import { cx } from "@/lib/cx";

/** "Why" text plus a link to the booklet page it comes from. */
export function Explanation({
  text,
  source,
  qid,
  className,
  listen = true,
}: {
  text: string;
  source: string;
  /** The question's id in the bank, shown so people can report mistakes. */
  qid?: number;
  className?: string;
  /** Show a Listen button that reads the explanation aloud. */
  listen?: boolean;
}) {
  const page = source.replace(/^p\.?\s*/i, "");
  return (
    <div className={cx("rounded-md border-l-4 border-euc bg-euc-tint/70 px-4 py-3.5", className)}>
      <p className="text-body text-ink">
        <span className="font-bold">Why: </span>
        {text}
      </p>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <a
          href={officialLinks.ourCommonBondPdf}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-8 items-center gap-1.5 rounded-sm border border-line-strong/60 bg-surface px-2.5 text-caption font-bold text-euc-deep hover:border-euc"
        >
          <IconBook size={15} />
          Our Common Bond, page {page}
          <span className="sr-only"> (opens the official booklet in a new tab)</span>
        </a>
        {listen && <ListenButton text={`Why: ${text}`} label="Listen to why" compact />}
      </div>
      {qid !== undefined && (
        <p className="mt-2 flex flex-wrap items-center gap-x-3 text-caption text-muted">
          <span>Ref {qid}</span>
          <Link href="/corrections/" className="font-bold underline underline-offset-2 hover:text-ink">
            Report a mistake
          </Link>
        </p>
      )}
    </div>
  );
}
