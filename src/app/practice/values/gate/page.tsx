import type { Metadata } from "next";
import { PracticeHeader } from "@/components/practice/practice-header";
import { GateRunLoader } from "@/components/values/loaders";

export const metadata: Metadata = {
  title: "Values gate",
  description: "Answer 10 Australian values questions in a row, 2 from each values area.",
  robots: { index: false },
};

export default function ValuesGatePage() {
  return (
    <>
      <PracticeHeader />
      <GateRunLoader />
    </>
  );
}
