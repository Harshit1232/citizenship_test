/**
 * Everything a person has stored on this device, for export and for clearing.
 * Same export shape as the original app ({settings, history, questionStats,
 * theme}), plus when it was exported.
 */
import { KEYS, load, save } from "./storage/store";
import type { HistoryEntry, QuestionStats, Settings, ThemePreference } from "./types";

export interface ExportFile {
  exportedAt: string;
  settings: Settings | null;
  history: HistoryEntry[];
  questionStats: QuestionStats;
  theme: ThemePreference;
}

export function buildExport(now: number = Date.now()): ExportFile {
  return {
    exportedAt: new Date(now).toISOString(),
    settings: load<Settings | null>(KEYS.settings, null),
    history: load<HistoryEntry[]>(KEYS.history, []),
    questionStats: load<QuestionStats>(KEYS.qstats, {}),
    theme: load<ThemePreference>(KEYS.theme, "system"),
  };
}

/** Triggers a download of the export. Browser only. */
export function downloadExport(now: number = Date.now()): void {
  const blob = new Blob([JSON.stringify(buildExport(now), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "citizenship-practice-results.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give the browser a moment to start the download before revoking.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Deletes test history and per-question stats, as the original "Clear all history" did. */
export function clearProgress(): void {
  save(KEYS.history, []);
  save(KEYS.qstats, {});
}
