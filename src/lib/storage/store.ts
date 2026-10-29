/**
 * localStorage access with an in-memory fallback (private windows, blocked
 * storage). Keys and JSON encoding match the original app exactly.
 */

export const KEYS = {
  settings: "ocb.settings",
  history: "ocb.history",
  qstats: "ocb.qstats",
  theme: "ocb.theme",
  active: "ocb.active",
  study: "ocb.study",
  /** New: values mastery progress and the values gate. */
  values: "ocb.values",
  /** New: marks which storage schema version the data is in. */
  schema: "ocb.schema",
} as const;

export type StorageKey = (typeof KEYS)[keyof typeof KEYS];

/** Minimal Storage interface so tests can inject a fake. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const memory = new Map<string, string>();

const memoryStore: KeyValueStore = {
  getItem: (k) => (memory.has(k) ? (memory.get(k) as string) : null),
  setItem: (k, v) => void memory.set(k, v),
  removeItem: (k) => void memory.delete(k),
};

let override: KeyValueStore | null = null;

/** Tests use this to point the store at a fake. */
export function setStoreForTesting(store: KeyValueStore | null): void {
  override = store;
  memory.clear();
}

function backing(): KeyValueStore {
  if (override) return override;
  try {
    if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  } catch {
    // Access can throw (Safari private mode, blocked cookies).
  }
  return memoryStore;
}

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = backing().getItem(key);
    if (raw !== null) return JSON.parse(raw) as T;
  } catch {
    // Corrupt JSON or storage error: fall through to memory, then default.
  }
  const mem = memory.get(key);
  if (mem !== undefined) {
    try {
      return JSON.parse(mem) as T;
    } catch {
      /* ignore */
    }
  }
  return fallback;
}

export function save<T>(key: string, value: T): void {
  const json = JSON.stringify(value);
  memory.set(key, json);
  try {
    backing().setItem(key, json);
  } catch {
    // Quota exceeded or blocked: the memory copy keeps this session working.
  }
}

export function remove(key: string): void {
  memory.delete(key);
  try {
    backing().removeItem(key);
  } catch {
    /* ignore */
  }
}
