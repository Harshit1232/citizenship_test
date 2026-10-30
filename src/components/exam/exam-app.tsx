"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, QUESTION_BY_ID, QUESTIONS, RULES } from "@/lib/bank";
import { buildPaper, plan as planPaper } from "@/lib/exam/plan";
import { appendHistory, markPaper, toHistoryEntry, type TestResult } from "@/lib/exam/score";
import {
  answeredCount,
  clearActive,
  isExpired,
  loadActive,
  saveActive,
  type RunningTest,
} from "@/lib/exam/session";
import { defaultSettings, loadSettings, saveSettings } from "@/lib/settings";
import { applyResults, loadHistory, loadStats, saveHistory, saveStats } from "@/lib/stats";
import { migrateStorage } from "@/lib/storage/migrate";
import type { AnswerPick, Question, Settings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { PracticeHeader } from "@/components/practice/practice-header";
import { ExamScreen } from "./exam-screen";
import { Results } from "./results";
import { StartScreen } from "./start-screen";
import { useNow } from "./use-now";

const ALL_CATS = CATEGORIES.map((c) => c.id);

type View =
  | { kind: "start" }
  | { kind: "running"; test: RunningTest }
  | {
      kind: "results";
      paper: Question[];
      picks: AnswerPick[];
      result: TestResult;
      timedOut: boolean;
      seconds: number;
    };

/**
 * Rendered in the browser only (see exam-app-loader), so storage can be read
 * while initialising state.
 */
export function ExamApp() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>(() => {
    migrateStorage();
    return loadSettings(ALL_CATS);
  });
  const [view, setView] = useState<View>({ kind: "start" });
  const [saved, setSaved] = useState<RunningTest | null>(() => loadActive(QUESTION_BY_ID));
  const [confirmNew, setConfirmNew] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [openedAt] = useState(() => Date.now());

  const plan = useMemo(() => planPaper(settings, QUESTIONS, RULES), [settings]);
  const running = view.kind === "running" ? view.test : null;
  const now = useNow(!!running && running.deadline > 0);

  const update = useCallback((fn: (t: RunningTest) => RunningTest) => {
    setView((v) => {
      if (v.kind !== "running") return v;
      const next = fn(v.test);
      saveActive(next);
      return { kind: "running", test: next };
    });
  }, []);

  const finish = useCallback((test: RunningTest, timedOut: boolean) => {
    const at = Date.now();
    const result = markPaper(test.paper, test.picks, { mode: test.mode, forceValues: settings.forceValues }, RULES);
    saveHistory(appendHistory(loadHistory(), toHistoryEntry(result, test.mode, test.startedAt, at)));
    saveStats(applyResults(loadStats(), test.paper, result.marks, at));
    clearActive();
    setSaved(null);
    setView({
      kind: "results",
      paper: test.paper,
      picks: test.picks,
      result,
      timedOut,
      seconds: Math.round((at - test.startedAt) / 1000),
    });
  }, [settings.forceValues]);

  // Time is up: mark the paper as it stands, like the real test.
  const latest = useRef<RunningTest | null>(null);
  useEffect(() => {
    latest.current = running;
  }, [running]);
  const deadline = running?.deadline ?? 0;
  useEffect(() => {
    if (!deadline) return;
    const id = window.setTimeout(() => {
      if (latest.current) finish(latest.current, true);
    }, Math.max(0, deadline - Date.now()));
    return () => window.clearTimeout(id);
  }, [deadline, finish]);

  function begin() {
    const paper = buildPaper(settings, QUESTIONS, RULES);
    if (!paper.length) return;
    const startedAt = Date.now();
    const test: RunningTest = {
      paper,
      picks: new Array(paper.length).fill(null),
      flags: new Array(paper.length).fill(false),
      cur: 0,
      startedAt,
      deadline: settings.timerOn ? startedAt + settings.minutes * 60_000 : 0,
      mode: settings.mode,
    };
    clearActive();
    saveActive(test);
    setSaved(null);
    setView({ kind: "running", test });
  }

  function requestStart() {
    if (saved) setConfirmNew(true);
    else begin();
  }

  function resume() {
    if (!saved) return;
    if (isExpired(saved, Date.now())) {
      finish(saved, true);
      return;
    }
    setView({ kind: "running", test: saved });
  }

  if (view.kind === "running") {
    return (
      <ExamScreen
        test={view.test}
        now={now}
        largeText={settings.largeText}
        onLargeText={(on) => {
          const next = { ...settings, largeText: on };
          saveSettings(next);
          setSettings(next);
        }}
        onPick={(choice) => update((t) => ({ ...t, picks: t.picks.map((p, i) => (i === t.cur ? choice : p)) }))}
        onMove={(to) => update((t) => ({ ...t, cur: Math.min(t.paper.length - 1, Math.max(0, to)) }))}
        onToggleFlag={() => update((t) => ({ ...t, flags: t.flags.map((f, i) => (i === t.cur ? !f : f)) }))}
        onSubmit={() => finish(view.test, false)}
        onExit={() => {
          saveActive(view.test);
          router.push("/practice/");
        }}
      />
    );
  }

  if (view.kind === "results") {
    return (
      <>
        <PracticeHeader title="Practice test" />
        <Results
          paper={view.paper}
          picks={view.picks}
          result={view.result}
          timedOut={view.timedOut}
          seconds={view.seconds}
          onAgain={() => setView({ kind: "start" })}
        />
      </>
    );
  }

  const savedAnswered = saved ? answeredCount(saved.picks) : 0;
  const savedExpired = saved ? isExpired(saved, openedAt) : false;
  const savedMinutes = saved && saved.deadline ? Math.max(0, Math.round((saved.deadline - openedAt) / 60000)) : null;

  return (
    <>
      <PracticeHeader title="Practice test" />
      {saved && (
        <div className="border-b border-wattle-edge/40 bg-wattle-tint">
          <div className="mx-auto flex max-w-[880px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
            <div className="min-w-0 flex-1">
              <p className="font-bold text-ink">
                {savedExpired ? "Time ran out on your saved test" : "You have a test in progress"}
              </p>
              <p className="text-small text-copy">
                {savedAnswered} of {saved.paper.length} answered.{" "}
                {savedExpired
                  ? "Resuming marks it now."
                  : savedMinutes !== null
                    ? `About ${savedMinutes} minutes left.`
                    : "Untimed."}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={resume}>{savedExpired ? "See the result" : "Resume test"}</Button>
              <Button variant="secondary" onClick={() => setConfirmDiscard(true)}>
                Discard
              </Button>
            </div>
          </div>
        </div>
      )}
      <StartScreen
        settings={settings}
        plan={plan}
        onStart={requestStart}
        onUseOfficial={() => {
          const s = defaultSettings(ALL_CATS);
          saveSettings(s);
          setSettings(s);
        }}
      />

      <Dialog open={confirmNew} onClose={() => setConfirmNew(false)} title="Start a new test?">
        <p>
          You have a test in progress with {savedAnswered} of {saved?.paper.length ?? 0} answered.
          Starting a new test deletes it.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={() => {
              setConfirmNew(false);
              resume();
            }}
          >
            Resume that test
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setConfirmNew(false);
              begin();
            }}
          >
            Delete it and start new
          </Button>
        </div>
      </Dialog>

      <Dialog open={confirmDiscard} onClose={() => setConfirmDiscard(false)} title="Discard the test in progress?">
        <p>The answers you have given so far will be deleted. This cannot be undone.</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setConfirmDiscard(false)}>
            Keep it
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              clearActive();
              setSaved(null);
              setConfirmDiscard(false);
            }}
          >
            Discard test
          </Button>
        </div>
      </Dialog>
    </>
  );
}
