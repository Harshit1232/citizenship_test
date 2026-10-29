"use client";

import dynamic from "next/dynamic";

function Loading({ wide }: { wide?: boolean }) {
  return (
    <main id="main" className={`mx-auto w-full ${wide ? "max-w-[1100px]" : "max-w-[880px]"} px-4 pt-10 sm:px-6 sm:pt-14`} aria-busy="true">
      <p className="sr-only">Loading</p>
      <div className="h-12 w-72 max-w-full animate-pulse rounded-sm bg-sunk" />
      <div className="mt-5 h-6 w-[30rem] max-w-full animate-pulse rounded-sm bg-sunk" />
      <div className="mt-10 h-40 w-full animate-pulse rounded-lg bg-sunk" />
    </main>
  );
}

/**
 * These screens read what is saved in this browser, so they render in the
 * browser only. The static HTML carries the header and a light placeholder.
 */
export const DashboardLoader = dynamic(() => import("./dashboard").then((m) => m.Dashboard), {
  ssr: false,
  loading: () => <Loading wide />,
});

export const StudyLoader = dynamic(() => import("./study").then((m) => m.Study), {
  ssr: false,
  loading: () => <Loading />,
});

export const ProgressLoader = dynamic(() => import("./progress").then((m) => m.Progress), {
  ssr: false,
  loading: () => <Loading wide />,
});

export const SettingsLoader = dynamic(() => import("./settings").then((m) => m.SettingsScreen), {
  ssr: false,
  loading: () => <Loading />,
});
