import { IconBook } from "@/components/ui/icons";
import { officialLinks } from "@/lib/site";
import { cx } from "@/lib/cx";

/** "Why" text plus a link to the booklet page it comes from. */
export function Explanation({
  text,
  source,
  className,
}: {
  text: string;
  source: string;
  className?: string;
}) {
  const page = source.replace(/^p\.?\s*/i, "");
  return (
    <div className={cx("rounded-md border-l-4 border-euc bg-euc-tint/70 px-4 py-3.5", className)}>
      <p className="text-body text-ink">
        <span className="font-bold">Why: </span>
        {text}
      </p>
      <a
        href={officialLinks.ourCommonBondPdf}
        target="_blank"
        rel="noreferrer"
        className="mt-2.5 inline-flex min-h-8 items-center gap-1.5 rounded-sm border border-line-strong/60 bg-surface px-2.5 text-caption font-bold text-euc-deep hover:border-euc"
      >
        <IconBook size={15} />
        Our Common Bond, page {page}
        <span className="sr-only"> (opens the official booklet in a new tab)</span>
      </a>
    </div>
  );
}
