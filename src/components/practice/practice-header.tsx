"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/wattle-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cx } from "@/lib/cx";

export const PRACTICE_NAV = [
  { href: "/practice/", label: "Overview" },
  { href: "/practice/test/", label: "Practice test" },
  { href: "/practice/values-check/", label: "Values check" },
  { href: "/practice/study/", label: "Study" },
  { href: "/practice/progress/", label: "Progress" },
  { href: "/practice/settings/", label: "Settings" },
] as const;

function normalise(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

function isActive(current: string, href: string): boolean {
  const here = normalise(current);
  return href === "/practice/" ? here === href : here.startsWith(href);
}

/**
 * Header for the practice area. The section nav sits inline on wide screens
 * and in its own scrollable row below the bar on narrow ones.
 * `title` is shown only where there is no nav (the design page).
 */
export function PracticeHeader({ title, nav = true }: { title?: string; nav?: boolean }) {
  const pathname = usePathname() ?? "/";
  const links = (
    <ul className="flex items-center gap-1">
      {PRACTICE_NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "relative inline-flex min-h-11 items-center rounded-sm px-3 text-small font-bold transition-colors",
                active ? "text-ink" : "text-copy hover:bg-sunk hover:text-ink",
              )}
            >
              {item.label}
              <span
                aria-hidden="true"
                className={cx(
                  "absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-euc transition-opacity",
                  active ? "opacity-100" : "opacity-0",
                )}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-4 sm:px-6">
        <Logo />
        {nav ? (
          <nav aria-label="Practice" className="ml-6 hidden self-stretch lg:flex lg:items-end lg:pb-2.5">
            {links}
          </nav>
        ) : (
          title && (
            <>
              <span aria-hidden="true" className="hidden h-5 w-px bg-line sm:block" />
              <span className="hidden text-small font-bold text-copy sm:inline">{title}</span>
            </>
          )
        )}
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
        </div>
      </div>
      {nav && (
        <nav aria-label="Practice" className="relative border-t border-line lg:hidden">
          <div className="no-scrollbar mx-auto max-w-[1200px] overflow-x-auto px-2 sm:px-4">{links}</div>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-paper to-transparent"
          />
        </nav>
      )}
    </header>
  );
}
