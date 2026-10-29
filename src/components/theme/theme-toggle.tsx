"use client";

import { useSyncExternalStore } from "react";
import { IconMoon, IconSun } from "@/components/ui/icons";
import { KEYS, save } from "@/lib/storage/store";
import type { ThemePreference } from "@/lib/types";
import { cx } from "@/lib/cx";

function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}

function getTheme(): "light" | "dark" {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

export function setThemePreference(pref: ThemePreference) {
  save(KEYS.theme, pref);
  const dark =
    pref === "dark" ||
    (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function useResolvedTheme(): "light" | "dark" {
  return useSyncExternalStore(subscribe, getTheme, () => "light");
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useResolvedTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => setThemePreference(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={cx(
        "grid size-11 place-items-center rounded-sm text-ink transition-colors duration-150 hover:bg-sunk",
        className,
      )}
    >
      {theme === "dark" ? <IconSun /> : <IconMoon />}
    </button>
  );
}
