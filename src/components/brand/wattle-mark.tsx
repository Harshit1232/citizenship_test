import { cx } from "@/lib/cx";
import { site } from "@/lib/site";
import Link from "next/link";

/** The golden wattle sprig. Deliberately not a government symbol. */
export function WattleMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect width="32" height="32" rx="9" fill="var(--euc)" />
      <path d="M16 27V11.5" stroke="var(--euc-tint)" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M16 21c-4 0-6.2-2-7.2-5.2 3.1-.6 6.2.9 7.2 5.2zM16 21c4 0 6.2-2 7.2-5.2-3.1-.6-6.2.9-7.2 5.2z"
        fill="var(--euc-deep)"
        opacity=".9"
      />
      <circle cx="16" cy="8" r="3.2" fill="var(--wattle)" />
      <circle cx="10.4" cy="11.6" r="2.5" fill="var(--wattle)" />
      <circle cx="21.6" cy="11.6" r="2.5" fill="var(--wattle)" />
      <circle cx="16" cy="13.2" r="2.1" fill="#f2ce6a" />
    </svg>
  );
}

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cx("inline-flex items-center gap-2.5 rounded-sm text-ink", className)}
    >
      <WattleMark size={32} />
      <span className="font-display text-title font-bold leading-none tracking-[-0.02em]">
        {site.name}
      </span>
    </Link>
  );
}
