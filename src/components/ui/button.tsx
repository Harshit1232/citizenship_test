import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "quiet" | "danger" | "gold";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-text font-bold select-none whitespace-nowrap " +
  "transition-[background-color,border-color,color,transform,box-shadow] duration-150 ease-out " +
  "active:translate-y-px disabled:opacity-50 disabled:active:translate-y-0 rounded-sm";

const sizes: Record<Size, string> = {
  md: "min-h-11 px-4 text-small",
  lg: "min-h-13 px-6 text-body",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-euc text-on-euc shadow-1 hover:bg-euc-deep dark:hover:bg-euc-deep disabled:hover:bg-euc",
  secondary:
    "bg-surface text-ink border border-line-strong hover:border-ink hover:bg-surface",
  quiet: "text-ink hover:bg-sunk",
  danger: "bg-surface text-fail border border-fail hover:bg-fail-tint",
  /** For dark green bands. */
  gold: "bg-band-gold text-on-wattle hover:bg-wattle",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  ...rest
}: CommonProps & Omit<ComponentProps<"button">, "children" | "className">) {
  return (
    <button type={type} className={cx(base, sizes[size], variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & Omit<ComponentProps<typeof Link>, "children" | "className">) {
  return (
    <Link className={cx(base, sizes[size], variants[variant], className)} {...rest}>
      {children}
    </Link>
  );
}
