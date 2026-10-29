/**
 * Storage schema versioning. The original app wrote no version marker; that is
 * treated as version 0. Version 1 keeps every key and shape unchanged and only
 * drops entries that would crash the app (corrupt or wrong-typed values).
 */
import { KEYS, load, remove, save } from "./store";

export const SCHEMA_VERSION = 1;

interface SchemaMarker {
  v: number;
  migratedAt: number;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isValidHistoryEntry(v: unknown): boolean {
  return (
    isObject(v) &&
    typeof v.at === "number" &&
    typeof v.n === "number" &&
    typeof v.correct === "number" &&
    typeof v.pct === "number" &&
    typeof v.passed === "boolean"
  );
}

/** Run once per page load before anything reads storage. Idempotent. */
export function migrateStorage(now: number = Date.now()): { from: number; to: number } {
  const marker = load<SchemaMarker | null>(KEYS.schema, null);
  const from = marker && typeof marker.v === "number" ? marker.v : 0;
  if (from >= SCHEMA_VERSION) return { from, to: from };

  // v0 -> v1: validate shapes, keep everything that is well-formed.
  const history = load<unknown>(KEYS.history, []);
  if (!Array.isArray(history)) {
    remove(KEYS.history);
  } else {
    const clean = history.filter(isValidHistoryEntry);
    if (clean.length !== history.length) save(KEYS.history, clean);
  }

  const qstats = load<unknown>(KEYS.qstats, {});
  if (!isObject(qstats)) remove(KEYS.qstats);

  const settings = load<unknown>(KEYS.settings, {});
  if (!isObject(settings)) remove(KEYS.settings);

  const theme = load<unknown>(KEYS.theme, "system");
  if (theme !== "system" && theme !== "light" && theme !== "dark") remove(KEYS.theme);

  save<SchemaMarker>(KEYS.schema, { v: SCHEMA_VERSION, migratedAt: now });
  return { from, to: SCHEMA_VERSION };
}
