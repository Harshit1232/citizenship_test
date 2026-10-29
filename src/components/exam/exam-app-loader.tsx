"use client";

import dynamic from "next/dynamic";
import { PracticeHeader } from "@/components/practice/practice-header";

function Loading({ title }: { title: string }) {
  return (
    <>
      <PracticeHeader title={title} />
      <main id="main" className="mx-auto max-w-[880px] px-4 pt-16 sm:px-6" aria-busy="true">
        <p className="sr-only">Loading</p>
        <div className="h-12 w-64 max-w-full animate-pulse rounded-sm bg-sunk" />
        <div className="mt-6 h-6 w-96 max-w-full animate-pulse rounded-sm bg-sunk" />
        <div className="mt-3 h-6 w-80 max-w-full animate-pulse rounded-sm bg-sunk" />
      </main>
    </>
  );
}

/**
 * The practice screens depend on what is saved in this browser, so they render
 * in the browser only. The static HTML carries a light placeholder.
 */
export const ExamAppLoader = dynamic(() => import("./exam-app").then((m) => m.ExamApp), {
  ssr: false,
  loading: () => <Loading title="Practice test" />,
});

export const ValuesCheckLoader = dynamic(() => import("./values-check").then((m) => m.ValuesCheck), {
  ssr: false,
  loading: () => (
    <main id="main" className="mx-auto max-w-[760px] px-4 pt-16 sm:px-6" aria-busy="true">
      <p className="sr-only">Loading</p>
      <div className="h-10 w-full max-w-md animate-pulse rounded-sm bg-sunk" />
    </main>
  ),
});
