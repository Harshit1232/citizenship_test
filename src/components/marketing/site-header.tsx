"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/wattle-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ButtonLink } from "@/components/ui/button";
import { cx } from "@/lib/cx";

const links = [
  { href: "/#how", label: "How it works" },
  { href: "/#values", label: "The values rule" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "Questions" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={cx(
        "sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-200",
        scrolled || open
          ? "border-b border-line bg-veil backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-5 sm:px-8">
        <Logo />
        <nav aria-label="Main" className="ml-6 hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="rounded-sm px-3 py-2 text-small font-bold text-copy transition-colors hover:text-ink hover:bg-sunk"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          <span className="hidden sm:block">
            <ButtonLink href="/practice/test/">Start free test</ButtonLink>
          </span>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-sm text-ink hover:bg-sunk lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </div>
      <div id={menuId} hidden={!open} className="border-t border-line lg:hidden">
        <nav aria-label="Main" className="mx-auto max-w-[1200px] px-5 py-3 sm:px-8">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-sm px-2 py-3 text-body font-bold text-ink hover:bg-sunk"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <ButtonLink href="/practice/test/" className="mt-3 mb-2 w-full sm:hidden" size="lg">
            Start free test
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}
