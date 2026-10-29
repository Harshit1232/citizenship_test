"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cx } from "@/lib/cx";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Bottom sheet on small screens. */
  sheet?: boolean;
  className?: string;
}

/**
 * Native <dialog> with showModal(): focus trapping, Escape to close and the
 * inert background come from the browser.
 */
export function Dialog({ open, onClose, title, children, sheet, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="dialog-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cx(
        "m-auto max-h-[85dvh] w-[min(34rem,calc(100vw-2rem))] overflow-auto rounded-lg border border-line bg-surface p-0 text-body text-copy shadow-3",
        "backdrop:bg-ink/40 backdrop:backdrop-blur-[2px]",
        "open:animate-[rise-in_220ms_var(--motion-out)]",
        sheet &&
          "max-sm:mb-0 max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none max-sm:rounded-t-lg",
        className,
      )}
    >
      <div className="p-6 sm:p-7">
        <h2 id="dialog-title" className="font-display text-title font-bold text-ink">
          {title}
        </h2>
        <div className="mt-3">{children}</div>
      </div>
    </dialog>
  );
}
