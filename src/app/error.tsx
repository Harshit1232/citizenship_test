"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

/**
 * Error boundary for every route. The original app showed a blank page when a
 * render failed; this keeps the shell and offers a way forward. Saved answers
 * live in browser storage and are not touched.
 */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="mx-auto max-w-[760px] px-5 py-24 sm:px-8">
      <h1 className="font-display text-display-sm font-bold tracking-[-0.03em]">Something went wrong on this page</h1>
      <p className="mt-4 text-lead">
        Your saved answers are still on this device. Try again, or go back to the home page.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="secondary">
          Go to the home page
        </ButtonLink>
      </div>
    </main>
  );
}
