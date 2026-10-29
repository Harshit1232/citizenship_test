import type { Metadata } from "next";
import { PracticeHeader } from "@/components/practice/practice-header";
import { ValuesCheckLoader } from "@/components/exam/exam-app-loader";

export const metadata: Metadata = {
  title: "Values check",
  description: "Ten Australian values questions with the reason after each answer.",
};

export default function ValuesCheckPage() {
  return (
    <>
      <PracticeHeader />
      <ValuesCheckLoader />
    </>
  );
}
