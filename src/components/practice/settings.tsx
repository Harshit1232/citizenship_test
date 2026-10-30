"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, PARTS, QUESTIONS, RULES } from "@/lib/bank";
import { plan as planPaper } from "@/lib/exam/plan";
import { defaultSettings, loadSettings, saveSettings } from "@/lib/settings";
import { migrateStorage } from "@/lib/storage/migrate";
import { KEYS, load } from "@/lib/storage/store";
import { clearProgress, downloadExport } from "@/lib/user-data";
import type { Settings, ThemePreference } from "@/lib/types";
import { setThemePreference } from "@/components/theme/theme-toggle";
import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { IconCheck } from "@/components/ui/icons";
import { cx } from "@/lib/cx";
import { Card, CardTitle, PageIntro, PartDot } from "./ui";

const ALL_CATS = CATEGORIES.map((c) => c.id);

/** Rendered in the browser only (see loaders). Every change saves straight away. */
export function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>(() => {
    migrateStorage();
    return loadSettings(ALL_CATS);
  });
  const [countText, setCountText] = useState(() => String(settings.count));
  const [minutesText, setMinutesText] = useState(() => String(settings.minutes));
  const [theme, setTheme] = useState<ThemePreference>(() => {
    const t = load<ThemePreference>(KEYS.theme, "system");
    return t === "light" || t === "dark" ? t : "system";
  });
  const [savedAt, setSavedAt] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);
  const [cleared, setCleared] = useState(false);

  // The most questions the current choice of categories can produce.
  const cap = useMemo(() => planPaper({ ...settings, count: 1e9 }, QUESTIONS, RULES).cap, [settings]);
  const official = settings.mode === "official";

  function apply(next: Settings) {
    setSettings(next);
    saveSettings(next);
    setSavedAt((n) => n + 1);
  }

  function commitCount(text: string) {
    const n = Math.floor(Number(text));
    if (!Number.isFinite(n) || n < 1) {
      setCountText(String(settings.count));
      return;
    }
    apply({ ...settings, count: Math.min(n, QUESTIONS.length) });
    setCountText(String(Math.min(n, QUESTIONS.length)));
  }

  function commitMinutes(text: string) {
    const n = Math.floor(Number(text));
    if (!Number.isFinite(n) || n < 1) {
      setMinutesText(String(settings.minutes));
      return;
    }
    const m = Math.min(n, 180);
    apply({ ...settings, minutes: m });
    setMinutesText(String(m));
  }

  function toggleCat(id: string, on: boolean) {
    const set = new Set(settings.cats);
    if (on) set.add(id);
    else set.delete(id);
    apply({ ...settings, cats: ALL_CATS.filter((c) => set.has(c)) });
  }

  function resetAll() {
    // Resets the test format only; the text size is a display choice.
    const d = { ...defaultSettings(ALL_CATS), largeText: settings.largeText };
    apply(d);
    setCountText(String(d.count));
    setMinutesText(String(d.minutes));
  }

  return (
    <main id="main" className="mx-auto w-full max-w-[880px] px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
      <PageIntro title="Settings">
        <p>These apply to every practice test you start. Changes save as you make them.</p>
      </PageIntro>
      <p aria-live="polite" className="mt-4 h-6 text-small font-bold text-euc-deep dark:text-euc">
        {savedAt ? (
          <span key={savedAt} className="anim-fade inline-flex items-center gap-1.5">
            <IconCheck size={16} strokeWidth={2.6} /> Saved
          </span>
        ) : null}
      </p>

      <Card className="mt-4" aria-labelledby="format-title">
        <CardTitle id="format-title">Test format</CardTitle>
        <fieldset className="mt-5">
          <legend className="sr-only">Which questions to use</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <ModeOption
              checked={official}
              onChange={() => apply({ ...settings, mode: "official" })}
              title="Same as the real test"
              body="Questions from Parts 1 to 4 in order, as on the official practice test. The last part is the 5 values questions."
            />
            <ModeOption
              checked={!official}
              onChange={() => apply({ ...settings, mode: "custom" })}
              title="Custom"
              body="Choose the topics yourself. Good for drilling the parts you find hard."
            />
          </div>
        </fieldset>

        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="count" className="block font-bold text-ink">
              Number of questions
            </label>
            <input
              id="count"
              type="number"
              inputMode="numeric"
              min={1}
              max={QUESTIONS.length}
              value={countText}
              onChange={(e) => setCountText(e.target.value)}
              onBlur={(e) => commitCount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && commitCount((e.target as HTMLInputElement).value)}
              aria-describedby="count-hint"
              className="mt-1.5 min-h-12 w-32 rounded-sm border border-line-strong bg-surface px-3.5 text-body tabular-nums text-ink hover:border-ink"
            />
            <p id="count-hint" className={cx("mt-1.5 text-small", settings.count > cap ? "font-bold text-fail" : "text-muted")}>
              {settings.count > cap
                ? `Only ${cap} available with these topics, so tests will have ${cap}.`
                : `The real test has ${RULES.questionsPerTest}. ${cap} available with these settings.`}
            </p>
          </div>

          <div>
            <p id="timer-label" className="font-bold text-ink">
              Time limit
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <Switch
                labelledBy="timer-label"
                checked={settings.timerOn}
                onChange={(on) => apply({ ...settings, timerOn: on })}
                onLabel="On"
                offLabel="Off"
              />
              {settings.timerOn && (
                <label className="flex items-center gap-2 text-ink">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={180}
                    value={minutesText}
                    onChange={(e) => setMinutesText(e.target.value)}
                    onBlur={(e) => commitMinutes(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && commitMinutes((e.target as HTMLInputElement).value)}
                    className="min-h-12 w-24 rounded-sm border border-line-strong bg-surface px-3.5 text-body tabular-nums text-ink hover:border-ink"
                  />
                  minutes
                </label>
              )}
            </div>
            <p className="mt-1.5 text-small text-muted">
              {settings.timerOn ? `The real test allows ${RULES.timeLimitMinutes} minutes.` : "Untimed practice. The real test is timed."}
            </p>
          </div>
        </div>
      </Card>

      <Card className="mt-6" aria-labelledby="values-title">
        <CardTitle id="values-title">Australian values questions</CardTitle>
        <div className="mt-5 space-y-5">
          {official ? (
            <p className="text-small text-copy">
              Every test in the real format has {RULES.valuesQuestionsPerTest} values questions, shown last as Part 4, as
              on the official practice test. One wrong values answer fails the test.
            </p>
          ) : (
            <Check
              checked={settings.forceValues}
              onChange={(on) => apply({ ...settings, forceValues: on })}
              title="Always include 5 values questions, and fail the test if any is wrong"
              hint="On by default. The real test fails you for one wrong values answer, whatever your total."
            />
          )}
        </div>
      </Card>

      {!official && (
        <Card className="mt-6" aria-labelledby="topics-title">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle id="topics-title">Topics</CardTitle>
            <div className="flex gap-2">
              <Button variant="quiet" onClick={() => apply({ ...settings, cats: ALL_CATS.slice() })}>
                Select all
              </Button>
              <Button variant="quiet" onClick={() => apply({ ...settings, cats: [] })}>
                Clear
              </Button>
            </div>
          </div>
          <p className="mt-1 text-small text-muted">
            {settings.cats.length} of {CATEGORIES.length} topics selected.
          </p>
          {settings.cats.length === 0 && (
            <p className="mt-3 rounded-sm bg-fail-tint px-3 py-2 text-small font-bold text-fail">
              Select at least one topic to start a test.
            </p>
          )}
          <div className="mt-6 space-y-8">
            {PARTS.map((p) => {
              const cats = CATEGORIES.filter((c) => c.part === p.id);
              return (
                <fieldset key={p.id}>
                  <legend className="sr-only">{p.title}</legend>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p aria-hidden="true" className="flex items-center gap-2 font-bold text-ink">
                      <PartDot part={p.id} />
                      {p.title}
                    </p>
                    <button
                      type="button"
                      onClick={() => apply({ ...settings, cats: cats.map((c) => c.id) })}
                      className="min-h-9 rounded-sm px-2 text-small font-bold text-euc-deep underline-offset-4 hover:underline dark:text-euc"
                    >
                      Only this part<span className="sr-only">: {p.title}</span>
                    </button>
                  </div>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {cats.map((c) => {
                      const on = settings.cats.includes(c.id);
                      return (
                        <li key={c.id}>
                          <label
                            className={cx(
                              "flex min-h-12 cursor-pointer items-center gap-3 rounded-md border px-3.5 py-2 transition-colors",
                              on ? "border-euc bg-euc-tint" : "border-line-strong bg-surface hover:border-ink",
                              "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={(e) => toggleCat(c.id, e.target.checked)}
                              className="size-5 shrink-0 accent-[var(--euc)]"
                            />
                            <span className="min-w-0 flex-1 text-small font-bold text-ink">{c.label}</span>
                            <span className="text-caption tabular-nums text-muted">{c.count}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </fieldset>
              );
            })}
          </div>
        </Card>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <ButtonLink href="/practice/test/" size="lg">
          Start a test with these settings
        </ButtonLink>
        <Button variant="secondary" size="lg" onClick={resetAll}>
          Reset to the real test&apos;s format
        </Button>
      </div>

      <Card className="mt-12" aria-labelledby="look-title">
        <CardTitle id="look-title">Appearance</CardTitle>
        <fieldset className="mt-4">
          <legend className="sr-only">Colour theme</legend>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["system", "Match my device"],
                ["light", "Light"],
                ["dark", "Dark"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className={cx(
                  "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-sm border px-4 text-small font-bold transition-colors",
                  theme === value ? "border-euc bg-euc-tint text-ink" : "border-line-strong bg-surface text-copy hover:border-ink",
                  "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                )}
              >
                <input
                  type="radio"
                  name="theme"
                  value={value}
                  checked={theme === value}
                  onChange={() => {
                    setTheme(value);
                    setThemePreference(value);
                  }}
                  className="size-4 accent-[var(--euc)]"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-5">
          <Check
            checked={settings.largeText}
            onChange={(on) => apply({ ...settings, largeText: on })}
            title="Larger text during tests"
            hint="Makes questions and answers bigger. You can also switch it on or off during a test."
          />
        </div>
      </Card>

      <Card className="mt-6" aria-labelledby="data-title">
        <CardTitle id="data-title">Your data</CardTitle>
        <p className="mt-2 max-w-[60ch] text-copy">
          Your results and settings are stored in this browser only. Nothing is sent to us. Clearing your browser&apos;s
          site data deletes them, so download a copy if you want to keep them.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => downloadExport()}>
            Download my data
          </Button>
          <Button variant="danger" onClick={() => setConfirmClear(true)}>
            Delete my test history
          </Button>
        </div>
        <p aria-live="polite" className="mt-3 text-small font-bold text-euc-deep dark:text-euc">
          {cleared ? "Your test history has been deleted." : ""}
        </p>
      </Card>

      <Dialog open={confirmClear} onClose={() => setConfirmClear(false)} title="Delete your test history?">
        <p>
          This deletes every recorded test and the record of which questions you have missed, from this browser. It
          can&apos;t be undone. Your settings stay as they are.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setConfirmClear(false)}>
            Keep my history
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              clearProgress();
              setCleared(true);
              setConfirmClear(false);
            }}
          >
            Delete history
          </Button>
        </div>
      </Dialog>
    </main>
  );
}

function ModeOption({ checked, onChange, title, body }: { checked: boolean; onChange: () => void; title: string; body: string }) {
  return (
    <label
      className={cx(
        "relative flex cursor-pointer gap-3.5 rounded-md border-2 p-4 transition-colors",
        checked ? "border-euc bg-euc-tint" : "border-line-strong bg-surface hover:border-ink",
        "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
      )}
    >
      <input type="radio" name="mode" checked={checked} onChange={onChange} className="mt-1 size-5 shrink-0 accent-[var(--euc)]" />
      <span>
        <span className="block font-bold text-ink">{title}</span>
        <span className="mt-1 block text-small text-copy">{body}</span>
      </span>
    </label>
  );
}

function Check({ checked, onChange, title, hint }: { checked: boolean; onChange: (on: boolean) => void; title: string; hint: string }) {
  return (
    <label className="flex cursor-pointer gap-3.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-5 shrink-0 accent-[var(--euc)]"
      />
      <span>
        <span className="block font-bold text-ink">{title}</span>
        <span className="mt-1 block text-small text-muted">{hint}</span>
      </span>
    </label>
  );
}

function Switch({
  checked,
  onChange,
  labelledBy,
  onLabel,
  offLabel,
}: {
  checked: boolean;
  onChange: (on: boolean) => void;
  labelledBy: string;
  onLabel: string;
  offLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      onClick={() => onChange(!checked)}
      className="inline-flex min-h-12 items-center gap-3 rounded-sm pr-2 text-small font-bold text-ink"
    >
      <span
        aria-hidden="true"
        className={cx(
          "relative inline-block h-7 w-12 rounded-full border-2 transition-colors duration-200",
          checked ? "border-euc bg-euc" : "border-line-strong bg-sunk",
        )}
      >
        <span
          className={cx(
            "absolute top-0.5 size-5 rounded-full bg-surface shadow-1 transition-[left] duration-200 ease-out",
            checked ? "left-[calc(100%-1.375rem)]" : "left-0.5",
          )}
        />
      </span>
      {checked ? onLabel : offLabel}
    </button>
  );
}
