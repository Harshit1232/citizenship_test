import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { partBgClass } from "@/components/exam/part-style";
import type { PartId } from "@/lib/types";

/** Page heading block shared by the practice screens. */
export function PageIntro({
  title,
  children,
  actions,
  headingRef,
}: {
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  headingRef?: React.Ref<HTMLHeadingElement>;
}) {
  return (
    <div className="anim-rise flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
      <div className="min-w-0">
        <h1
          ref={headingRef}
          tabIndex={headingRef ? -1 : undefined}
          className="font-display text-display-sm font-bold tracking-[-0.03em] sm:text-[3.25rem] sm:leading-none"
        >
          {title}
        </h1>
        {children && <div className="mt-4 max-w-[60ch] text-lead">{children}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

export function Card({
  children,
  className,
  as: Tag = "section",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={cx("rounded-lg border border-line bg-surface p-5 shadow-1 sm:p-7", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function CardTitle({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <h2 id={id} className={cx("font-display text-title font-bold tracking-[-0.015em] text-ink", className)}>
      {children}
    </h2>
  );
}

export function StatTile({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: string;
  note?: string;
  accent?: boolean;
}) {
  return (
    <div className={cx("px-5 py-5", accent ? "bg-wattle-tint" : "bg-surface")}>
      <dt className="text-small text-muted">{label}</dt>
      <dd className={cx("mt-1 font-display text-heading font-bold leading-none", accent ? "text-wattle-text" : "text-ink")}>
        {value}
      </dd>
      {note && <dd className="mt-2 text-caption text-muted">{note}</dd>}
    </div>
  );
}

export function StatGrid({ children, label }: { children: ReactNode; label: string }) {
  return (
    <dl
      aria-label={label}
      className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line shadow-1 sm:grid-cols-4"
    >
      {children}
    </dl>
  );
}

export function PartDot({ part, className }: { part: PartId; className?: string }) {
  return <span aria-hidden="true" className={cx("inline-block size-2.5 shrink-0 rounded-full", partBgClass(part), className)} />;
}

/**
 * One horizontal bar: label, a bar on a 0–100 scale with a hairline at the
 * 75% pass mark, and the value. Values are always printed, so nothing depends
 * on reading the bar length or its colour.
 */
export function MeterRow({
  label,
  sub,
  value,
  part,
  delay = 0,
}: {
  label: string;
  sub?: string;
  value: number;
  part?: PartId;
  delay?: number;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_3.5rem] items-center gap-x-4 gap-y-2 py-3 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_3.5rem]">
      <div className="min-w-0">
        <p className="flex items-center gap-2 font-bold leading-snug text-ink">
          {part && <PartDot part={part} />}
          <span className="min-w-0">{label}</span>
        </p>
        {sub && <p className="mt-0.5 text-caption text-muted">{sub}</p>}
      </div>
      <p className="text-right font-display text-lead font-bold tabular-nums text-ink sm:order-last">{v}%</p>
      <div className="relative col-span-2 h-2.5 rounded-[4px] bg-sunk sm:col-span-1" aria-hidden="true">
        <div
          className="anim-grow-x h-full rounded-r-[4px] bg-euc"
          style={{ width: `${v}%`, "--delay": `${delay}ms` } as React.CSSProperties}
        />
        <span className="absolute -inset-y-1 left-3/4 w-px bg-ink/60" />
      </div>
    </li>
  );
}

export function PassMarkNote() {
  return (
    <p className="mt-4 flex items-center gap-2 text-caption text-muted">
      <span aria-hidden="true" className="inline-block h-3.5 w-px bg-ink/60" />
      The line on each bar marks 75%, the pass mark.
    </p>
  );
}

/** A small wattle sprig on a ground line, for empty states. */
export function SprigArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 132 100" aria-hidden="true" className={cx("h-20 w-auto", className)}>
      <g fill="var(--wattle)" opacity=".55">
        <path d="M96 12l2.2 5.6L104 20l-5.8 2.4L96 28l-2.2-5.6L88 20l5.8-2.4z" />
        <path d="M118 34l1.9 4.8 4.8 1.9-4.8 1.9-1.9 4.8-1.9-4.8-4.8-1.9 4.8-1.9z" />
        <path d="M78 40l1.7 4.3 4.3 1.7-4.3 1.7L78 52l-1.7-4.3L72 46l4.3-1.7z" />
      </g>
      <path d="M40 88V44" stroke="var(--euc)" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path
        d="M40 70c-12 0-19-6-22-16 9.6-1.8 19 2.6 22 16zM40 70c12 0 19-6 22-16-9.6-1.8-19 2.6-22 16z"
        fill="var(--euc)"
        opacity=".55"
      />
      <circle cx="40" cy="36" r="9" fill="var(--wattle)" />
      <circle cx="24" cy="47" r="6.6" fill="var(--wattle)" opacity=".85" />
      <circle cx="56" cy="47" r="6.6" fill="var(--wattle)" opacity=".85" />
      <path d="M6 92h120" stroke="var(--line-strong)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      <SprigArt />
      <h2 className="mt-5 font-display text-title font-bold text-ink">{title}</h2>
      <p className="mt-2 max-w-[46ch] text-copy">{children}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
