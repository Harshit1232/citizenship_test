import type { Settings } from "./types";
import { KEYS, load, save } from "./storage/store";

/** Same defaults as the original app: the official test format. */
export function defaultSettings(allCategoryIds: readonly string[]): Settings {
  return {
    mode: "official",
    cats: allCategoryIds.slice(),
    count: 20,
    timerOn: true,
    minutes: 45,
    forceValues: true,
    showValuesTag: false,
  };
}

export function loadSettings(allCategoryIds: readonly string[]): Settings {
  const stored = load<Partial<Settings>>(KEYS.settings, {});
  const merged = { ...defaultSettings(allCategoryIds), ...stored };
  // Guard against hand-edited or partial values.
  if (merged.mode !== "official" && merged.mode !== "custom") merged.mode = "official";
  if (!Array.isArray(merged.cats)) merged.cats = allCategoryIds.slice();
  merged.count = Math.max(1, Math.floor(Number(merged.count) || 20));
  merged.minutes = Math.max(1, Math.floor(Number(merged.minutes) || 45));
  merged.timerOn = merged.timerOn !== false;
  merged.forceValues = merged.forceValues !== false;
  merged.showValuesTag = merged.showValuesTag === true;
  return merged;
}

export function saveSettings(settings: Settings): void {
  save(KEYS.settings, settings);
}
