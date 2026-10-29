import type { Metadata } from "next";
import { PracticeHeader } from "@/components/practice/practice-header";
import { DashboardLoader } from "@/components/practice/loaders";

export const metadata: Metadata = {
  title: "Your practice",
  description: "Your practice tests, scores and weakest areas for the Australian citizenship test.",
  robots: { index: false },
};

export default function PracticeHomePage() {
  return (
    <>
      <PracticeHeader />
      <DashboardLoader />
    </>
  );
}
