import type { Metadata } from "next";
import { PracticeHeader } from "@/components/practice/practice-header";
import { ProgressLoader } from "@/components/practice/loaders";

export const metadata: Metadata = {
  title: "Your progress",
  robots: { index: false },
};

export default function ProgressPage() {
  return (
    <>
      <PracticeHeader />
      <ProgressLoader />
    </>
  );
}
