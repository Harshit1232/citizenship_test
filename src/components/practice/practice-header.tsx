import Link from "next/link";
import { Logo } from "@/components/brand/wattle-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function PracticeHeader({ title }: { title?: string }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-4 sm:px-6">
        <Logo />
        {title && (
          <>
            <span aria-hidden="true" className="hidden h-5 w-px bg-line sm:block" />
            <span className="hidden text-small font-bold text-copy sm:inline">{title}</span>
          </>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Link href="/" className="rounded-sm px-3 py-2.5 text-small font-bold text-copy hover:bg-sunk hover:text-ink">
            Home
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
