"use client";

import dynamic from "next/dynamic";

function Loading() {
  return (
    <main id="main" className="mx-auto w-full max-w-[1100px] px-4 pt-10 sm:px-6 sm:pt-14" aria-busy="true">
      <p className="sr-only">Loading</p>
      <div className="h-12 w-72 max-w-full animate-pulse rounded-sm bg-sunk" />
      <div className="mt-5 h-6 w-[30rem] max-w-full animate-pulse rounded-sm bg-sunk" />
      <div className="mt-10 h-48 w-full animate-pulse rounded-lg bg-sunk" />
    </main>
  );
}

/** These screens read saved progress from this browser, so they render in the browser only. */
export const ValuesHubLoader = dynamic(() => import("./values-hub").then((m) => m.ValuesHub), {
  ssr: false,
  loading: () => <Loading />,
});

export const ScenarioPlayerLoader = dynamic(() => import("./scenario-player").then((m) => m.ScenarioPlayer), {
  ssr: false,
  loading: () => <Loading />,
});

export const GateRunLoader = dynamic(() => import("./gate-run").then((m) => m.GateRun), {
  ssr: false,
  loading: () => <Loading />,
});
