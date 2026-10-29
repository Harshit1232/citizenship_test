import type { Metadata } from "next";
import { PracticeHeader } from "@/components/practice/practice-header";
import { StudyLoader } from "@/components/practice/loaders";

export const metadata: Metadata = {
  title: "Study",
  description: "Read all 336 practice questions with their answers and the booklet page each one comes from.",
};

export default function StudyPage() {
  return (
    <>
      <PracticeHeader />
      <StudyLoader />
    </>
  );
}
