"use client";

import { Button } from "@/components/ui/button";
import { IconBook, IconClock, IconFlag, IconSpeaker } from "@/components/ui/icons";
import type { PaperPlan } from "@/lib/exam/plan";
import type { Settings } from "@/lib/types";

interface StartScreenProps {
  settings: Settings;
  plan: PaperPlan;
  onStart: () => void;
  onUseOfficial: () => void;
}

export function StartScreen({ settings, plan, onStart, onUseOfficial }: StartScreenProps) {
  const custom = settings.mode === "custom" || settings.count !== 20 || !settings.timerOn || settings.minutes !== 45 || !settings.forceValues;
  const passCount = Math.ceil(plan.want * 0.75);
  return (
    <main id="main" className="mx-auto w-full max-w-[880px] px-4 pb-24 pt-10 sm:px-6 sm:pt-16">
      <div className="anim-rise">
        <h1 className="font-display text-display-sm font-bold tracking-[-0.03em] sm:text-[3.25rem] sm:leading-none">
          Practice test
        </h1>
        <p className="mt-4 max-w-[52ch] text-lead">
          This test works like the real one. Find a quiet place and take it in one sitting if you
          can.
        </p>
      </div>

      <dl className="anim-rise mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4" style={{ animationDelay: "80ms" }}>
        <Fact term="Questions" value={String(plan.want)} />
        <Fact term="Time" value={settings.timerOn ? `${settings.minutes} min` : "No limit"} />
        <Fact term="Pass mark" value={`${passCount} of ${plan.want}`} />
        <Fact term="Values questions" value={plan.vCount ? `All ${plan.vCount} correct` : "Not included"} accent />
      </dl>

      {custom && (
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-wattle-edge/50 bg-wattle-tint px-4 py-3 text-small text-ink">
          <span>This test uses the custom settings you saved earlier.</span>
          <button type="button" onClick={onUseOfficial} className="font-bold text-euc-deep underline underline-offset-2">
            Use the real test&apos;s format instead
          </button>
        </div>
      )}

      <h2 className="mt-12 font-display text-title font-bold">During the test</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        <Tip icon={<IconClock size={20} />} title="Your answers save as you go">
          If you close the page, you can carry on later. The clock keeps running.
        </Tip>
        <Tip icon={<IconFlag size={20} />} title="Mark questions to review">
          Use Review later, then come back from the question list before you finish.
        </Tip>
        <Tip icon={<IconSpeaker size={20} />} title="Listen to any question">
          Listen reads the question and its answers aloud.
        </Tip>
        <Tip icon={<IconBook size={20} />} title="Learn why afterwards">
          Every question you miss shows the reason and its page in the booklet.
        </Tip>
      </ul>

      <div className="mt-12 flex flex-wrap items-center gap-4">
        <Button size="lg" onClick={onStart} disabled={plan.want < 1}>
          Start the test
        </Button>
        <p className="text-small text-muted">Keyboard: press A, B or C to choose an answer.</p>
      </div>
    </main>
  );
}

function Fact({ term, value, accent }: { term: string; value: string; accent?: boolean }) {
  return (
    <div className={accent ? "bg-wattle-tint px-5 py-5" : "bg-surface px-5 py-5"}>
      <dt className="text-small text-muted">{term}</dt>
      <dd className={accent ? "mt-1 font-display text-title font-bold text-wattle-text" : "mt-1 font-display text-title font-bold text-ink"}>
        {value}
      </dd>
    </div>
  );
}

function Tip({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3.5">
      <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-sm bg-euc-tint text-euc-deep" aria-hidden="true">
        {icon}
      </span>
      <div>
        <p className="font-bold text-ink">{title}</p>
        <p className="mt-0.5 text-small text-copy">{children}</p>
      </div>
    </li>
  );
}
